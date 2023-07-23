import ObsidianFtvkyo from "main";
import {TFile} from "obsidian";


export function getTitleByFileName(plugin: ObsidianFtvkyo, name: string) {
    // Keys are filenames
    const fileCache = Object.keys((plugin.app.metadataCache as any).fileCache);
    const files = plugin.app.vault.getFiles();

    // We need to find the best match for the path
    let linkedFile = null;
    for (const entry of files) {
        // If the file has the same name as the link, use it
        if (entry.name === name) {
            linkedFile = entry;
            break;
        }
    }

    if (!linkedFile) {
        return null;
    }

    return getTitleByAbsolutePath(plugin, linkedFile.path);
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
