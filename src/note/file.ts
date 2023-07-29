import ObsidianFtvkyo from "@/main";

export function resolveFileName(plugin: ObsidianFtvkyo, name: string, from: string = "") {
    return plugin.app.metadataCache.getFirstLinkpathDest(name, from);
}
