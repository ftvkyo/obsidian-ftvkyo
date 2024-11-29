export default class ApiView {

    // Add the view to the workspace if it's not there yet.
    async place(viewType: string) {
        const instances = ftvkyo.app.workspace.getLeavesOfType(viewType);
        if (instances.length < 1) {
            // Need to place the view.
            await ftvkyo.app.workspace.getLeftLeaf(false)!.setViewState({
                type: viewType,
                active: true,
            });
            // Otherwise we just keep the view where it was.
        }
    }

    exists(viewType: string) {
        const instances = ftvkyo.app.workspace.getLeavesOfType(viewType);
        return instances.length > 0;
    }

    // Get the reference to the view
    get(viewType: string) {
        const instances = ftvkyo.app.workspace.getLeavesOfType(viewType);

        if (instances.length !== 1) {
            throw `Expected exactly one instance of the ${viewType} view`;
        }
        return instances[0];
    }

    // Reveal the view
    reveal(viewType: string) {
        const view = this.get(viewType);
        if (view) {
            ftvkyo.app.workspace.revealLeaf(view);
        }
    }
}
