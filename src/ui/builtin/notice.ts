import { Notice } from "obsidian";

export default function sendNotice(text: string) {
    new Notice(text, 3000);
}
