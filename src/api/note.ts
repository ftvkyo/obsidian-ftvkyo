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
    ) {}

    /* ================ *
     * Filesystem stuff *
     * ================ */

    // Vault-relative path to the note without the extension.
    get path() {
        return this.tf.path;
    }

    get pathparts() {
        return this.tf.path.split("/");
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

    /* ============ *
     * State checks *
     * ============ */

    get isIndex() {
        const fm = this.fc?.frontmatter;
        return !!(fm?.["index"] || fm?.["root"]);
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
        // Note period
        public readonly period: string,
    ) {
        super(tf);

        date.hour(0).minute(0).second(0);
    }
}
