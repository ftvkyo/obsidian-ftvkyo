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
        const mdfs = ftvkyo.app.vault.getMarkdownFiles();

        const unique = mdfs.filter((v) => v.path.startsWith(ftvkyo.deps.unique.options.folder))

        const periodic = mdfs.filter((v) => {
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
