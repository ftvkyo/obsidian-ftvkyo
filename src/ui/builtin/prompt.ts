import { App, Modal, TextComponent } from "obsidian";

import Logger from "@/util/logger";


type Resolve = (value: string) => void;
type Reject = (reason?: any) => void;


let lg: Logger | undefined = undefined;


class PrompterModal extends Modal {
    is_submitted = false;

    resolve: Resolve;
    reject: Reject;

    constructor(
        readonly app: App,
        readonly prompt: string = "",
        readonly value_initial: string = "",
        readonly allow_empty: boolean = false,
    ) {
        super(app);
    }

    async work(
        resolve: Resolve,
        reject: Reject,
    ) {
        lg?.info(`Prompting for "${this.prompt}" with initial value "${this.value_initial}"`);

        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }

    handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            const v = (e.target! as HTMLInputElement).value;

            // Resolve if it's not empty
            if (v !== "" || this.allow_empty) {
                lg?.info(`Resolving with "${v}"`);
                this.resolve(v);
            } else {
                lg?.info(`Empty value, rejecting`);
                this.reject("empty");
            }

            this.close();
        }
    }

    // From `Modal`:

    onOpen() {
        this.titleEl.setText(this.prompt);

        const div = this.contentEl.createDiv();

        const textInput = new TextComponent(div);
        textInput.inputEl.style.width = "100%";
        textInput.setValue(this.value_initial);
        textInput.inputEl.addEventListener("keydown", this.handleKeydown.bind(this));
    }

    onClose() {
        lg?.info(`Closed`);
        this.contentEl.empty();
        this.reject("cancelled");
    }
}

async function prompt(
    prompt: string,
    value_initial?: string,
    allow_empty?: boolean,
) {
    if (!lg) {
        lg = ftvkyo.lg.sub("prompter");
    }

    return new Promise((resolve: Resolve, reject: Reject) => {
        const modal = new PrompterModal(
            app,
            prompt,
            value_initial,
            allow_empty,
        );

        modal.work(resolve, reject);
    });
}

export default prompt;
