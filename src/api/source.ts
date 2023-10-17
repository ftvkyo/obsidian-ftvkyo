import ApiNoteList from "./note-list";

export default class ApiSource {

    #et = new EventTarget();

    cacheUnique: ApiNoteList;

    constructor() {
        this.update();

        const event = ftvkyo.app.metadataCache.on("resolved", () => {
            this.update();
        });
        ftvkyo.registerEvent(event);
    }

    update() {
        const mdfs = ftvkyo.app.vault.getMarkdownFiles();

        const unique = mdfs.filter((v) => v.path.startsWith(ftvkyo.deps.unique.options.folder))
        this.cacheUnique = ApiNoteList.from(unique);

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(event: "updated", callback: () => void) {
        this.#et.addEventListener("updated", callback);
    }
}
