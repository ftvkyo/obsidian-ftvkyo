import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

import Logger from "@/util/logger";

import ApiNote from "@/api/note";


let lg: Logger | undefined = undefined;


class AliasLink extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
        readonly alias: string,
    ) {
        super(containerEl);
    }

    onload() {
        this.containerEl.innerText = this.alias;
    }
}

export default function AutoAlias(
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
) {
    if (!lg) {
        lg = ftvkyo.lg.sub("auto-alias");
    }

    // Find all internal links
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a.internal-link"));

    if (links.length > 0) {
        lg.debug(`Found ${links.length} internal links.`);
    }

    for (const link of links) {
        const href = link.getAttribute("href");
        const filename = href + ".md";

        // Only process links that have the same alias as href
        if (link.innerText !== href) {
            lg.debug(`Link has an alias already`);
            continue;
        }

        const note = ApiNote.fromPath(filename);

        if (!note) {
            lg.debug(`Note not found`);
            continue;
        }

        if (!note.h1) {
            lg.debug(`No h1 found`);
            continue;
        }

        lg.debug(`Found h1 "${note.h1}"`);

        context.addChild(new AliasLink(link, note.h1));
    }
}
