import {ItemView, WorkspaceLeaf} from "obsidian";

export const VIEW_TYPE_NAVIGATION = "ftvkyo-navigation";

export class NavigationView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_NAVIGATION;
    }

    getDisplayText() {
        return "Navigation";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl("h4", {text: "Na vi ga ti on"});
    }

    async onClose() {
        // Nothing to clean up.
    }
}
