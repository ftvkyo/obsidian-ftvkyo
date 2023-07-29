import { StrictMode } from "react";
import { createRoot, Root } from 'react-dom/client';

import { View, WorkspaceLeaf } from "obsidian";

import ObsidianFtvkyo from "@/main";
import { PluginContext } from "@/ui/context";


export type ViewElement = {
    Element: () => JSX.Element,
    viewType: string,
    displayText: string,
    icon: string,
};


export default class ObsidianFtvkyoView extends View {
    root: Root | undefined;

    static create(
        leaf: WorkspaceLeaf,
        plugin: ObsidianFtvkyo,

        element: ViewElement,
    ) {
        return new ObsidianFtvkyoView(
            leaf,
            plugin,
            element.viewType,
            element.displayText,
            element.icon,
            element.Element,
        );
    }

    constructor(
        leaf: WorkspaceLeaf,
        readonly plugin: ObsidianFtvkyo,

        readonly viewType: string,
        readonly displayText: string,
        readonly icon: string,

        readonly Element: () => JSX.Element,
    ) {
        super(leaf);

        // The view is not intended to be navigated away.
        this.navigation = false;

        this.containerEl.setAttribute("data-type", this.viewType);
    }

    getViewType() {
        return this.viewType;
    }

    getDisplayText() {
        return this.displayText;
    }

    getIcon() {
        return this.icon;
    }

    async onOpen() {
        this.root = createRoot(this.containerEl);
        this.root.render(
            <StrictMode>
                <PluginContext.Provider value={this.plugin}>
                    <this.Element />
                </PluginContext.Provider>
            </StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
