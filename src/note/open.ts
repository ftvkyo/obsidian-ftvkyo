import { TFile } from "obsidian";

import ObsidianFtvkyo from "@/main";


export async function openTFile(plugin: ObsidianFtvkyo, tf: TFile) {
    const current = plugin.app.workspace.getActiveFile();

    const leaf = plugin.app.workspace.getLeaf(!!current);
    await leaf.openFile(tf, {
        state: { mode: "source" },
    });
}
