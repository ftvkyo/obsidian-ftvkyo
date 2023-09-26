import { TFile } from "obsidian";


// A note in the vault.
//
// Identified by its TFile.
// The getters provide up to date information.
//
// Contracts:
// - TFile must be valid when the object is accessed.
export default class ApiNote {

    constructor(
        // Note identification
        public readonly tf: TFile,
    ) {}

    // Convenience factory.
    static from(tf: TFile) {
        return new ApiNote(tf);
    }

    // Convenience factory to take Dataview page objects.
    static fromDv(page: { file: { path: string } }) {
        return ApiNote.fromPath(page.file.path);
    }

    // Try to get a note from a path.
    // Returns null if the path is not found or is not a note.
    // If `from` is specified, the path is resolved relative to `from`.
    static fromPath(
        path: string,
        from: string = "",
    ) {
        const tf = app.metadataCache.getFirstLinkpathDest(path, from);
        return tf ? ApiNote.from(tf) : null;
    }

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

    /* ================= *
     * Title information *
     * ================= */

    // H1 heading of the note.
    // Returns "?" if there are multiple H1 headings.
    // Returns the heading if there is a single H1 heading.
    // Returns null if the note has no H1 heading.
    get h1(): string | null {
        const hs = this.fc?.headings ?? [];
        const h1s = hs.filter(h => h.level === 1);
        if (h1s.length >= 2) {
            return "?";
        }
        return h1s.shift()?.heading ?? null;
    }

    // Memoization for `dateInfo`.
    // Does not need recalculating as it only depends on the basename.
    #dateInfo: string | null = null;

    // Pretty information about the date that identifies the note.
    // Returns null if the date cannot be determined.
    // Returns a pretty string for displaying.
    get dateInfo() {
        //
        if (this.#dateInfo !== null) {
            return this.#dateInfo;
        }

        // Date info is encoded in the basename.
        // The basemanes are expected to be in the format:
        // - YYYYMMDD
        // - YYYYMMDD-HHmmss

        const parts = this.base.split(/[-.]/);
        const date = parts[0];
        const time: string | undefined = parts[1];

        if (!date || date.length !== 8) {
            // Invalid date in basename
            return null;
        }

        const Y = date.substring(0, 4);
        const M = date.substring(4, 6);
        const D = date.substring(6, 8);

        if (!time) {
            this.#dateInfo = `${Y}.${M}.${D}`;
            return this.#dateInfo;
        }

        if (time.length !== 6) {
            // Invalid time in basename
            return null;
        }

        const h = time.substring(0, 2);
        const m = time.substring(2, 4);
        const s = time.substring(4, 6);

        this.#dateInfo = `${Y}.${M}.${D} ${h}:${m}:${s}`;
        return this.#dateInfo;
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

    /* =========== *
     * Frontmatter *
     * =========== */

    // Get the type of the note, if set.
    get type(): string | null {
        return this.fc?.frontmatter?.type ?? null;
    }

    get status(): string | null {
        return this.fc?.frontmatter?.status ?? null;
    }

    /* ============ *
     * State checks *
     * ============ */

    // Whether the note is work in progress.
    get wip() {
        return this.status === "wip";
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
