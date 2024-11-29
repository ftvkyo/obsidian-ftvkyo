import { StrictMode } from "react";
import { createRoot, Root } from 'react-dom/client';
import { ErrorBoundary } from "react-error-boundary";

import { View, ViewStateResult, WorkspaceLeaf } from "obsidian";

import ObsidianFtvkyo from "@/main";


export type ViewElementProps<State> = {
    state: State,
    setState: (s: State) => void
};


export type ViewElement<State> = {
    // Short name
    short: string,

    // JSX
    Element: (props: ViewElementProps<State>) => JSX.Element,
    initialState: State,

    // Obsidian-required stuff
    viewType: string,
    displayText: string,
    icon: string,
};


export default class ObsidianFtvkyoView<State extends Record<string, unknown>> extends View {
    root: Root | undefined;

    state: State;

    updateCallback: () => void;

    static create<State extends Record<string, unknown>>(
        leaf: WorkspaceLeaf,
        plugin: ObsidianFtvkyo,

        element: ViewElement<State>,
    ) {
        return new ObsidianFtvkyoView(
            leaf,
            plugin,
            element.viewType,
            element.displayText,
            element.icon,
            element.Element,
            element.initialState,
        );
    }

    constructor(
        leaf: WorkspaceLeaf,
        readonly plugin: ObsidianFtvkyo,

        readonly viewType: string,
        readonly displayText: string,
        readonly icon: string,

        readonly Element: (props: ViewElementProps<State>) => JSX.Element,
        readonly initialState: State,
    ) {
        super(leaf);

        this.state = initialState,

        // The view is not intended to be navigated away.
        this.navigation = false;

        // TODO: figure out if I can do it in a built-in way.
        this.containerEl.setAttribute("data-type", this.viewType);
    }

    onload(): void {
        this.updateCallback = () => this.render();
        ftvkyo.api.source.on("updated", this.updateCallback);
        ftvkyo.on("tick", this.updateCallback);
    }

    onunload(): void {
        ftvkyo.api.source.off("updated", this.updateCallback);
        ftvkyo.off("tick", this.updateCallback);
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

    async setState(state: State, result: ViewStateResult): Promise<void> {
        this.state = state;
        let ret = super.setState(state, result);
        // Trigger a re-render with the new state.
        this.render();
        return ret;
    }

    getState(): Record<string, unknown> {
        return this.state;
    }

    private render() {
        const setState = (s: State) => {
            this.state = s;
            this.app.workspace.requestSaveLayout();
            // Trigger a re-render with the new state.
            this.render();
        };

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
                        <this.Element
                            state={this.state}
                            setState={setState}
                        />
                    </ErrorBoundary>
                </div>
            </StrictMode>
        );
    }
}
