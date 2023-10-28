import { NoteType } from "@/util/dependencies";
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

        const notesWithInfo = mdfs
            .map(tf => [tf, ftvkyo.deps.determineNote(tf.path)] as const)
            .filter(([, info]) => !!info) as [TFile, [NoteType, moment.Moment]][];

        const notes = notesWithInfo
            .map(([tf, [type, date]]) =>
                type === "unique"
                    ? new ApiNoteUnique(tf, date)
                    : new ApiNotePeriodic(tf, date, type)
            );

        this.cache = {
            unique: new ApiNoteUniqueList(notes.filter(n => n instanceof ApiNoteUnique) as ApiNoteUnique[]),
            periodic: new ApiNotePeriodicList(notes.filter(n => n instanceof ApiNotePeriodic) as ApiNotePeriodic[]),
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
