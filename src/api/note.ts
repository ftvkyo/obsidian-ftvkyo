import { ListItemCache, TFile, moment } from "obsidian";


// A note in the vault.
//
// Identified by its TFile.
// The getters provide up to date information.
//
// Contracts:
// - TFile must be valid when the object is accessed.
export abstract class ApiNote {

    constructor(
        // Note identification
        public readonly tf: TFile,
        // Note moment (creation or what it's related to)
        public readonly date: moment.Moment,
    ) {}

    /* ================ *
     * Filesystem stuff *
     * ================ */

    // Vault-relative path to the note without the extension.
    get path() {
        return this.tf.path;
    }

    // Filename without the extension.
    get base() {
        return this.tf.basename;
    }

    // File cache of the note.
    get fc() {
        return app.metadataCache.getFileCache(this.tf);
    }

    /* ======= *
     * Actions *
     * ======= */

    // Reveal the note.
    async reveal({
        // What mode to open the note in.
        mode = "preview",
        // Whether to replace the current workspace leaf.
        replace = false,
    }: {
        mode?: "preview" | "source",
        replace?: boolean,
    } = {}) {
        const current = app.workspace.getActiveFile();
        const shouldReplace = replace || current === null;

        const leaf = app.workspace.getLeaf(!shouldReplace);
        await leaf.openFile(this.tf, {
            state: { mode },
        });

        return leaf;
    }
}


export class ApiNoteUnique extends ApiNote {

    static RE_TITLE_ROOT = /^#[\w-][\w-/]*$/;

    /* ================= *
     * Title information *
     * ================= */

    // Title of the note.
    // Returns the H1 heading if there is only one of them.
    // Returns null otherwise.
    get title(): string | null {
        const hs = this.fc?.headings ?? [];
        const h1s = hs.filter(h => h.level === 1);
        if (h1s.length >= 2) {
            return null;
        }
        return h1s.shift()?.heading.trim() ?? null;
    }

    /* =============== *
     * Tag information *
     * =============== */

    // Tags of the note, without the leading `#` and without "special" tags.
    get tags() {
        return this.fc?.tags
            // Remove leading "#".
            ?.map(tag => tag.tag.substring(1))
            // Remove "special" tags.
            .filter(tag => !tag.startsWith("-")) ?? [];
    }

    /* ================ *
     * Task information *
     * ================ */

    get tasks(): ListItemCache[] {
        return this.fc?.listItems?.filter((val) => val.task !== undefined) ?? [];
    }

    get tasksUndone(): ListItemCache[] {
        return this.tasks.filter((val) => val.task === " ");
    }

    get tasksDone(): ListItemCache[] {
        return this.tasks.filter((val) => val.task !== " ");
    }

    /* ================ *
     * Date information *
     * ================ */

    // Get pretty date info about the note
    get dateInfo(): string | null {
        // Don't output time:
        // - Some notes don't have a meaningful time
        // - It creates extra visual clutter
        const outputFormat = "ddd, ll";
        return this.date.format(outputFormat);
    }

    /* ============ *
     * State checks *
     * ============ */

    get isStatic(): boolean {
        return this.fc?.frontmatter?.static ?? false;
    }

    // Whether the note is work in progress.
    get hasTodos() {
        return this.tasksUndone.length > 0;
    }

    // Whether the note is a root note.
    // Those notes have a tag as their title.
    get isRoot() {
        return ApiNoteUnique.RE_TITLE_ROOT.test(this.title ?? "");
    }

    // Check if the note is invalid.
    // If invalid, reason is provided.
    get invalid(): false | string {
        const hs = this.fc?.headings ?? [];
        const h1s = hs.filter(h => h.level === 1);
        if (h1s.length >= 2) {
            return "Note has more than one top-level title.";
        }

        // A note title can contain a tag or some text, but not both.
        // This simply checks that the title does not have the "#" symbol when
        // the note is not root, and this is good enough.
        if (!this.isRoot && this.title && this.title.search("#") !== -1) {
            return "Note title has a '#' when the note is not a root note.";
        }

        // If a note is a root note, it can't have other tags.
        if (this.isRoot && this.tags.length > 1) {
            return "Root notes can't have extra tags.";
        }

        // If the filename can't be parsed into a date.
        if (!this.dateInfo) {
            return "The note's date can't be parsed.";
        }

        return false;
    }
}


export class ApiNotePeriodic extends ApiNote {

    constructor(
        public readonly tf: TFile,
        public readonly date: moment.Moment,
        public readonly period: string,
    ) {
        super(tf, date);

        date.hour(0).minute(0).second(0);
    }
}
