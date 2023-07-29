import ObsidianFtvkyo from "@/main";

export function resolveFileName(plugin: ObsidianFtvkyo, name: string) {
    // Keys are filenames
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

    // TODO: throw on ambiguity

    return linkedFile;
}
