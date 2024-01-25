import { TFile, moment } from "obsidian";


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


export async function revealNote(
    note: TFile,
    {
        mode,
        replace = false,
        rename,
    }: {
        // What mode to open the note in.
        mode?: "preview" | "source",
        // Whether to replace the current workspace leaf.
        replace?: boolean,
        // Whether to put the cursor to note title for renaming.
        rename?: "end",
    } = {},
) {
    const current = app.workspace.getActiveFile();
    const shouldReplace = replace || current === null;

    const leaf = app.workspace.getLeaf(!shouldReplace);
    await leaf.openFile(note, {
        state: { mode },
        eState: { rename },
    });

    return leaf;
}
