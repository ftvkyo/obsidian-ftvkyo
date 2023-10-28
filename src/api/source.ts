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

        const unique = mdfs.filter((v) => v.path.startsWith(ftvkyo.deps.unique.options.folder))

        const periodic = mdfs.filter((v) => {
            for (const p of Object.values(ftvkyo.deps.periodic.settings)) {
                if (p.enabled && v.path.startsWith(p.folder)) {
                    return true;
                }
            }
            return false;
        });

        this.cache = {
            unique: ApiNoteUniqueList.from(unique),
            periodic: ApiNoteUniqueList.from(periodic),
        };

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(e: "updated", cb: () => void) {
        this.#et.addEventListener("updated", cb);
    }
}
