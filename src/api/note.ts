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


const DATE_TODO_MARKERS = ["to-do", "todo", "future"];

const DATE_AUTO_MARKER = "auto";


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

        const h1 = h1s.first()?.heading.trim() ?? null;

        if (h1 && this.isDated) {
            return `${h1} (${this.dateInfo})`;
        }

        return h1;
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

    // Return `date` from the frontmatter.
    //
    // Accepted fronmatter `date` values:
    // - string with a date in the format `YYYYMMDD-HHmmss`
    // - string with a date in the format `YYYYMMDD`
    // - string "auto"
    // - not set
    get dateMatter(): string | null {
        return this.fc?.frontmatter?.date ?? null;
    }

    // Get pretty date info about the note.
    get dateInfo(): string | null {
        // Don't output time:
        // - Some notes don't have a meaningful time
        // - It creates extra visual clutter

        // const outputFormat = "ddd, ll";
        // "\xa0" = nbsp
        const outputFormat = "ddd,[\xa0]DD[\xa0]MMM[\xa0]YYYY";

        const matter = this.dateMatter;

        if (matter && DATE_TODO_MARKERS.includes(matter)) {
            return "to-do";
        }

        if (matter === DATE_AUTO_MARKER || matter === null) {
            return this.date.format(outputFormat);
        }

        // Try parsing the frontmatter
        return ftvkyo.momentParse(matter, ["YYYYMMDD-HHmmss", "YYYYMMDD"]).format(outputFormat);
    }

    /* ============ *
     * State checks *
     * ============ */

    get isDated(): boolean {
        return this.dateMatter !== null;
    }

    // Whether the note is work in progress.
    get hasTasks() {
        return this.tasksUndone.length > 0 || (this.dateMatter && DATE_TODO_MARKERS.includes(this.dateMatter));
    }

    // Whether the note is a root note.
    // Those notes have a tag as their title.
    get rootFor() {
        return ApiNoteUnique.RE_TITLE_ROOT.test(this.title ?? "") && this.title?.slice(1) /* remove # */ || null;
    }

    // Check if the note is invalid.
    // If invalid, reason is provided.
    get broken(): false | string {
        const hs = this.fc?.headings ?? [];
        const h1s = hs.filter(h => h.level === 1);
        if (h1s.length >= 2) {
            return "Note has more than one top-level title.";
        }

        // A note title can contain a tag or some text, but not both.
        // This simply checks that the title does not have the "#" symbol when
        // the note is not root, and this is good enough.
        if (!this.rootFor && this.title && this.title.search("#") !== -1) {
            return "Note title has a '#' when the note is not a root note.";
        }

        // If a note is a root note, it can't have other tags.
        if (this.rootFor && this.tags.length > 1) {
            return "Root notes can't have extra tags.";
        }

        // If the filename can't be parsed into a date.
        if (!this.dateInfo) {
            return "The note's date can't be parsed.";
        }

        return false;
    }

    get isSensitive(): boolean {
        return !!this.tags.find(tag => {
            for (const sensitive of ftvkyo.settings.sensitiveTags) {
                if (tag === sensitive || tag.startsWith(sensitive + "/")) {
                    return true;
                }
            }
            return false;
        });
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
