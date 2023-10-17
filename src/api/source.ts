import ApiNoteList from "./note-list";

export default class ApiSource {

    #et = new EventTarget();

    cache: {
        unique: ApiNoteList,
        periodic: ApiNoteList,
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
            unique: ApiNoteList.from(unique),
            periodic: ApiNoteList.from(periodic),
        };

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(e: "updated", cb: () => void) {
        this.#et.addEventListener("updated", cb);
    }
}
