import {MarkdownRenderChild} from "obsidian";

export default class Replacer extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
        readonly text: string,
    ) {
        super(containerEl);
    }

    onload() {
        this.containerEl.innerText = this.text;
    }
}
