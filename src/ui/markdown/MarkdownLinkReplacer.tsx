import { MarkdownRenderChild } from "obsidian";
import { createRoot, Root } from "react-dom/client";

import MarkdownWithoutP from "./MarkdownWithoutP";


export default class MarkdownReplacer extends MarkdownRenderChild {
    root: Root;

    constructor(
        readonly containerEl: HTMLElement,
        readonly text: string,
    ) {
        super(containerEl);
        this.root = createRoot(containerEl);
    }

    onload() {
        this.root.render(<MarkdownWithoutP>
            {this.text}
        </MarkdownWithoutP>);
    }
}
