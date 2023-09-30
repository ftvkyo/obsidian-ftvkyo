import { StrictMode } from "react";
import { createRoot, Root } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";

import { EventRef, View, WorkspaceLeaf } from "obsidian";

import ObsidianFtvkyo from "@/main";


export type ViewElement = {
    // Short name
    short: string,

    // JSX
    Element: () => JSX.Element,

    // Obsidian-required stuff
    viewType: string,
    displayText: string,
    icon: string,
};


// TODO: only register metadata change event when the initial loading is done


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

        // TODO: figure out if I can do it in a built-in way.
        this.containerEl.setAttribute("data-type", this.viewType);

        // Typecheck the Dataview event correctly
        type DMC = typeof app.metadataCache & {
            on: (event: "dataview:metadata-change", callback: () => void) => EventRef,
        }

        // Register the metadata change event only after the metadata has been fully resolved.
        // Then, remove the metadata resolution event.
        // This is done to prevent re-rendering for every single file during metadata initialization.
        const context: { ref?: EventRef } = {};
        context.ref = app.metadataCache.on("resolved", () => {
            const dvEvent = (app.metadataCache as DMC).on("dataview:metadata-change", () => {
                this.render();
            });
            plugin.registerEvent(dvEvent);

            // Unregister self
            if (context.ref) {
                app.metadataCache.offref(context.ref);
                delete context.ref;
            }
        });
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
        this.render();
    }

    async onClose() {
        this.root?.unmount();
    }

    private render() {
        this.root?.render(
            <StrictMode>
                <div className="view-content">
                    <ErrorBoundary
                        fallbackRender={({ error }) => {
                            return <div>
                                <h1>Something went wrong</h1>
                                <pre>{error.message}</pre>
                            </div>;
                        }}
                    >
                        <this.Element />
                    </ErrorBoundary>
                </div>
            </StrictMode>
        );
    }
}
