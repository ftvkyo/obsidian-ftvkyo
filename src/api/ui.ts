import ApiNote from "./note";


export default class ApiUi {

    // Open file in the current tab if it's a new tab, otherwise, create a new tab.
    async noteReveal(
        note: ApiNote,
        mode: "source" | "preview" = "preview"
    ) {
        const current = app.workspace.getActiveFile();

        const leaf = app.workspace.getLeaf(!!current);
        await leaf.openFile(note.tf, {
            state: { mode },
        });

        return leaf;
    }

    /* =============== *
     * View management *
     * =============== */

    // List of views that have been loaded.
    loadedViews: string[] = [];

    // Add the view to the workspace,
    // and register it to be removed on unload
    async viewPlace(viewType: string) {
        app.workspace.detachLeavesOfType(viewType);
        await app.workspace.getLeftLeaf(false).setViewState({
            type: viewType,
            active: true,
        });

        if (!this.loadedViews.includes(viewType)) {
            this.loadedViews.push(viewType);
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

    // Detach all views
    viewDetachAll() {
        for (const view of this.loadedViews) {
            app.workspace.detachLeavesOfType(view);
        }
    }
}
