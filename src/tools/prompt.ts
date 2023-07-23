import { App, Modal, TextComponent } from "obsidian";

import logger from "../util/logger";


const lg = logger.sub("prompter");


type Resolve = (value: string) => void;
type Reject = (reason?: any) => void;


class PrompterModal extends Modal {
    is_submitted = false;

    resolve: Resolve;
    reject: Reject;

    constructor(
        readonly app: App,
        readonly prompt: string = "",
        readonly value_initial: string = "",
    ) {
        super(app);
    }

    async work(
        resolve: Resolve,
        reject: Reject,
    ) {
        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }

    handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            const v = (e.target! as HTMLInputElement).value;

            // Resolve if it's not empty
            if (v !== "") {
                lg.info(`Resolving with "${v}"`);
                this.resolve(v);
            } else {
                lg.info(`Empty value, rejecting`);
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
        lg.info(`Closed`);
        this.contentEl.empty();
        this.reject("cancelled");
    }
}


async function prompt(
    app: App,
    prompt: string,
    value_initial?: string,
) {
    lg.info(`Prompting for "${prompt}" with initial value "${value_initial}"`);

    return new Promise((resolve: Resolve, reject: Reject) => {
        const modal = new PrompterModal(
            app,
            prompt,
            value_initial,
        );

        modal.work(resolve, reject);
    });
}

export default prompt;
