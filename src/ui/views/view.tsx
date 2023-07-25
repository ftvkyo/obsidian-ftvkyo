import { StrictMode } from "react";
import { createRoot, Root } from 'react-dom/client';

import { View, WorkspaceLeaf } from "obsidian";

import ObsidianFtvkyo from "@/main";
import { PluginContext } from "./context";


export default class ObsidianFtvkyoView extends View {
    root: Root | undefined;

    constructor(
        leaf: WorkspaceLeaf,

        readonly plugin: ObsidianFtvkyo,

        readonly viewType: string,
        readonly displayText: string,
        readonly element: () => JSX.Element,
    ) {
        super(leaf);

        // The view is not intended to be navigated away.
        this.navigation = false;
    }

    getViewType() {
        return this.viewType;
    }

    getDisplayText() {
        return this.displayText;
    }

    async onOpen() {
        this.root = createRoot(this.containerEl);
        this.root.render(
            <StrictMode>
                <PluginContext.Provider value={this.plugin}>
                    <this.element />
                </PluginContext.Provider>
            </StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
