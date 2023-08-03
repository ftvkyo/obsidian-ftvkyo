import ObsidianFtvkyo from "@/main";
import { TFile } from "obsidian";


export default class ApiNote {
    constructor(
        public readonly plugin: ObsidianFtvkyo,
    ) {}

    resolveFileName(
        name: string,
        from: string = ""
    ) {
        return this.plugin.app.metadataCache.getFirstLinkpathDest(name, from);
    }

    getTitleByFileName(name: string) {
        const tfile = this.resolveFileName(name);
        return tfile ? this.getTitleOfTFile(tfile) : null;
    }

    getTitleByAbsolutePath(path: string) {
        const tf = this.plugin.app.vault.getAbstractFileByPath(path);

        if (!(tf instanceof TFile)) {
            // Not a file
            return null;
        }

        if (!tf) {
            // Dead link
            return null;
        }

        return this.getTitleOfTFile(tf);
    }

    getTitleOfTFile(tf: TFile) {
        const cache = this.plugin.app.metadataCache.getFileCache(tf);
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
