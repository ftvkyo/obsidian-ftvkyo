import { App, FuzzyMatch, FuzzySuggestModal } from "obsidian";

import Logger from "@/util/logger";
import ObsidianFtvkyo from "@/main";


let lg: undefined | Logger = undefined;


type Resolve = (value: string) => void;
type Reject = (reason?: any) => void;


class SuggesterModal extends FuzzySuggestModal<string> {
    is_submitted = false;

    suppress_reject = false;

    resolve: Resolve;
    reject: Reject;

    constructor(
        readonly app: App,
        readonly items_text: string[],
        readonly items: string[],
    ) {
        super(app);
    }

    async work(
        resolve: Resolve,
        reject: Reject,
    ) {
        lg?.info(`Suggesting from ${this.items_text.length} items`);

        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }

    // From `FuzzySuggestModal`:

    getItems() {
        return this.items;
    }

    getItemText(item: string) {
        return this.items_text[this.items.indexOf(item)];
    }

    onChooseItem(item: string) {
        lg?.info(`Chosen item "${item}"`);
        this.resolve(item);
    }

    // From `SuggestModal`:

    // Override to prevent closing earlier than we want
    selectSuggestion(
        v: FuzzyMatch<string>,
        e: MouseEvent | KeyboardEvent,
    ) {
        this.suppress_reject = true;
        this.close();
        this.onChooseSuggestion(v, e); // From `FuzzySuggestModal`
    }

    // From `Modal`:

    onClose() {
        lg?.info(`Closed`);
        if (!this.suppress_reject) {
            this.reject("cancelled");
        }
    }
}

async function suggest(
    plugin: ObsidianFtvkyo,
    items_text: string[],
    items: string[],
) {
    if (!lg) {
        lg = plugin.lg.sub("suggester");
    }

    return new Promise((resolve: Resolve, reject: Reject) => {
        const modal = new SuggesterModal(
            app,
            items_text,
            items,
        );

        modal.work(resolve, reject);
    });
}

export default suggest;
