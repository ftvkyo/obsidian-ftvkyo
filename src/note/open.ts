import { TFile } from "obsidian";

import ObsidianFtvkyo from "@/main";
import { resolveFileName } from "./file";


export async function openFile(plugin: ObsidianFtvkyo, name: string, mode: "source" | "preview" = "preview") {
    const tf = resolveFileName(plugin, name);
    if (tf) {
        await openTFile(plugin, tf, mode);
    }
}


// Open file in the current tab if it's a new tab, otherwise, create a new tab.
export async function openTFile(plugin: ObsidianFtvkyo, tf: TFile, mode: "source" | "preview" = "preview") {
    const current = plugin.app.workspace.getActiveFile();

    const leaf = plugin.app.workspace.getLeaf(!!current);
    await leaf.openFile(tf, {
        state: { mode },
    });
}
