import { App, ButtonComponent, Modal } from "obsidian";

import Logger from "@/util/logger";

import styles from "./confirm.module.scss";


type Resolve = (value: boolean) => void;
type Reject = (reason?: any) => void;

let lg: Logger | undefined = undefined;

class ConfirmerModal extends Modal {
    resolve: Resolve;
    reject: Reject;

    constructor(readonly app: App, readonly question: string = "") {
        super(app);
    }

    async work(resolve: Resolve, reject: Reject) {
        lg?.debug(`Confirming if "${this.question}" should be done`);

        this.resolve = resolve;
        this.reject = reject;
        this.open();
    }

    // From `Modal`:

    onOpen() {
        this.titleEl.setText(this.question);

        const div = this.contentEl.createDiv();

        div.addClass(styles.confirm ?? "confirm");

        const no = new ButtonComponent(div);
        const yes = new ButtonComponent(div);

        no.setButtonText("No");
        yes.setButtonText("Yes");

        no.onClick(() => {
            this.reject("cancelled");
            this.close();
        });
        yes.onClick(() => {
            this.resolve(true);
            this.close();
        });
    }

    onClose() {
        lg?.debug(`Closed`);
        this.contentEl.empty();
        this.reject("cancelled");
    }
}

async function confirm(question: string) {
    if (!lg) {
        lg = ftvkyo.lg.sub("confirmer");
    }

    return new Promise((resolve: Resolve, reject: Reject) => {
        const modal = new ConfirmerModal(app, question);

        modal.work(resolve, reject);
    });
}

export default confirm;
