import ObsidianFtvkyo from "@/main";
import { TFile } from "obsidian";


export default class ApiNote {
    constructor(
        public readonly plugin: ObsidianFtvkyo,
    ) {}

    resolve(
        partialPath: string,
        from: string = ""
    ) {
        return app.metadataCache.getFirstLinkpathDest(partialPath, from);
    }

    getTitle(file: TFile | string | null) {
        if (typeof file === "string") {
            // We got a partial path.
            file = this.resolve(file);
        }

        if (!file) {
            // Not found.
            return null;
        }

        if (!(file instanceof TFile)) {
            // Not a file.
            throw new Error(`Expected TFile, got ${file}`);
        }

        const cache = app.metadataCache.getFileCache(file);
        const heading0 = cache?.headings ? cache.headings[0] : null;

        if (!heading0) {
            // No headings at all
            return null;
        }

        if (heading0.level !== 1) {
            // The first heading is not a top-level heading
            return null;
        }

        return heading0.heading;
    }
}
