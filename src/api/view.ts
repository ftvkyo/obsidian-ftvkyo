export default class ApiView {

    // List of views that have been loaded.
    loadedViews: string[] = [];

    // Add the view to the workspace if it's not there yet.
    async place(viewType: string) {
        const instances = app.workspace.getLeavesOfType(viewType);
        if (instances.length < 1) {
            // Need to place the view.
            await app.workspace.getLeftLeaf(false).setViewState({
                type: viewType,
                active: true,
            });
            // Otherwise we just keep the view where it was.
        }

        // Save the view for the unlikely event we'd want to detach it later.
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
