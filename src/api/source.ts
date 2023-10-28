import { TFile } from "obsidian";
import { ApiNote, ApiNotePeriodic, ApiNoteUnique } from "./note";
import { ApiNotePeriodicList, ApiNoteUniqueList } from "./note-list";

export default class ApiSource {

    #et = new EventTarget();

    cache: {
        unique: ApiNoteUniqueList,
        periodic: ApiNotePeriodicList,
    };

    constructor() {
        this.update();

        ftvkyo.on("metadata", () => this.update());
    }

    update() {
        // TODO: Also check that the filename pattern matches?
        // TODO: Make sure the paths are handled correctly (`abc-def/` should not be included when looking for `abc/`)

        const mdfs = ftvkyo.app.vault.getMarkdownFiles();

        const unique = mdfs.filter((v) => v.path.startsWith(ftvkyo.deps.unique.options.folder));

        const periodic = mdfs.filter((v) => {
            for (const p of Object.values(ftvkyo.deps.periodic.settings)) {
                if (p.enabled && v.path.startsWith(p.folder)) {
                    return true;
                }
            }
            return false;
        });

        this.cache = {
            unique: new ApiNoteUniqueList(unique.map(tf => new ApiNoteUnique(tf))),
            periodic: new ApiNotePeriodicList(periodic.map(tf => new ApiNotePeriodic(tf))),
        };

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(e: "updated", cb: () => void) {
        this.#et.addEventListener("updated", cb);
    }

    /* ================ *
     * Search the cache *
     * ================ */

    byTf(
        tf: TFile,
    ): ApiNote | null {
        const unique = this.cache.unique.find(note => note.tf.path === tf.path);
        const periodic = this.cache.periodic.find(note => note.tf.path === tf.path);

        return unique ?? periodic;
    }

    // Try to get a note from a path.
    // Returns null if the note is not found in cache.
    // If `from` is specified, the path is resolved relative to `from`.
    byPath(
        path: string,
        from: string = "",
    ): ApiNote | null {
        // Use the builtin method to find the note.
        const tf = app.metadataCache.getFirstLinkpathDest(path, from);

        if (!tf) {
            return null;
        }

        return this.byTf(tf);
    }
}
