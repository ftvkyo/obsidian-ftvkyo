import ObsidianFtvkyo from "@/main";
import { TFile } from "obsidian";


export default class ApiNote {
    constructor(
        public readonly plugin: ObsidianFtvkyo,
    ) {}

    resolve(
        note: string | TFile,
        from: string = ""
    ) {
        if (note instanceof TFile) {
            return note;
        }
        return app.metadataCache.getFirstLinkpathDest(note, from);
    }

    getTitle(note: TFile | string) {
        const resolved = this.resolve(note);

        if (!resolved) {
            // Not found (or not a note).
            return null;
        }

        const cache = app.metadataCache.getFileCache(resolved);
        const heading0 = cache?.headings ? cache.headings[0] : null;

        if (!heading0) {
            // No headings at all.
            return null;
        }

        if (heading0.level !== 1) {
            // The first heading is not a top-level heading.
            return null;
        }

        return heading0.heading;
    }

    getDateInfo(note: TFile | string) {
        const resolved = this.resolve(note);

        if (!resolved) {
            // Not found (or not a note).
            return null;
        }

        return this.dateInfoFromBasename(resolved.basename);
    }

    private dateInfoFromBasename(basename: string) {
        // Date info is encoded in the filename.
        // The filenames are expected to be in the format:
        // - YYYYMMDD
        // - YYYYMMDD-HHmmss

        const parts = basename.split(/[-.]/);
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
            return `${Y}/${M}/${D}`;
        }

        if (time.length !== 6) {
            // Invalid time in basename
            return null;
        }

        const h = time.substring(0, 2);
        const m = time.substring(2, 4);
        const s = time.substring(4, 6);

        return `${Y}/${M}/${D} ${h}:${m}:${s}`;
    }
}
