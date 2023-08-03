import {TFile} from "obsidian";

import ObsidianFtvkyo from "@/main";


export default class ApiUi {
    constructor(
        public readonly plugin: ObsidianFtvkyo,
    ) {}

    async openFile(
        name: string,
        mode: "source" | "preview" = "preview"
    ) {
        const tf = this.plugin.api.note.resolve(name);
        if (tf) {
            await this.openTFile(tf, mode);
        }
    }

    // Open file in the current tab if it's a new tab, otherwise, create a new tab.
    async openTFile(
        tf: TFile,
        mode: "source" | "preview" = "preview"
    ) {
        const current = app.workspace.getActiveFile();

        const leaf = app.workspace.getLeaf(!!current);
        await leaf.openFile(tf, {
            state: { mode },
        });

        return leaf;
    }

    /* =============== *
     * View management *
     * =============== */

    // Add the view to the workspace,
    // and register it to be removed on unload
    async viewPlace(viewType: string) {
        app.workspace.detachLeavesOfType(viewType);
        await app.workspace.getLeftLeaf(false).setViewState({
            type: viewType,
            active: true,
        });

        if (!this.plugin.loadedViews.includes(viewType)) {
            this.plugin.loadedViews.push(viewType);
        }
    }

    // Get the reference to the view
    viewGet(viewType: string) {
        const instances = app.workspace.getLeavesOfType(viewType);

        if (instances.length !== 1) {
            throw `Expected exactly one instance of the ${viewType} view`;
        }
        return instances[0];
    }

    // Reveal the view
    viewReveal(viewType: string) {
        const view = this.viewGet(viewType);
        if (view) {
            app.workspace.revealLeaf(view);
        }
    }
}
