export default class ApiView {

    // List of views that have been loaded.
    loadedViews: string[] = [];

    // Add the view to the workspace,
    // and register it to be removed on unload
    async place(viewType: string) {
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
    get(viewType: string) {
        const instances = app.workspace.getLeavesOfType(viewType);

        if (instances.length !== 1) {
            throw `Expected exactly one instance of the ${viewType} view`;
        }
        return instances[0];
    }

    // Reveal the view
    reveal(viewType: string) {
        const view = this.get(viewType);
        if (view) {
            app.workspace.revealLeaf(view);
        }
    }

    // Detach all views
    detachAll() {
        for (const view of this.loadedViews) {
            app.workspace.detachLeavesOfType(view);
        }
    }
}
