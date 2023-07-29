import { TFile } from "obsidian";

import ObsidianFtvkyo from "@/main";
import { resolveFileName } from "./file";


export function getTitleByFileName(plugin: ObsidianFtvkyo, name: string) {
    const tfile = resolveFileName(plugin, name);
    return tfile ? getTitleOfTFile(plugin, tfile) : null;
}


export function getTitleByAbsolutePath(plugin: ObsidianFtvkyo, path: string) {
    const tf = plugin.app.vault.getAbstractFileByPath(path);

    if (!(tf instanceof TFile)) {
        // Not a file
        return null;
    }

    if (!tf) {
        // Dead link
        return null;
    }

    return getTitleOfTFile(plugin, tf);
}


export function getTitleOfTFile(plugin: ObsidianFtvkyo, tf: TFile) {
    const cache = plugin.app.metadataCache.getFileCache(tf);
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
