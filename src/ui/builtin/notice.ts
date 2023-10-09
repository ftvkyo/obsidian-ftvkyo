import { Notice } from "obsidian";

import styles from "./notice.module.scss";


export function sendError(text: string) {
    const fragment = new DocumentFragment();
    const span = document.createElement("span");
    span.addClass(styles.error ?? "error");
    span.innerText = text;
    fragment.append(span);
    new Notice(fragment);
}


export function sendNotice(text: string) {
    new Notice(text, 3000);
}
