import { MarkdownRenderChild } from "obsidian";

import ObsidianFtvkyo from "@/main";
import ApiNote from "@/api/note";


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

export default function AutoAlias(plugin: ObsidianFtvkyo) {
    const lg = plugin.lg.sub("auto-alias");

    plugin.registerMarkdownPostProcessor((element, context) => {
        // Find all internal links
        const links = Array.from(element.querySelectorAll<HTMLElement>("a.internal-link"));

        if (links.length > 0) {
            lg.info(`Found ${links.length} internal links.`);
        }

        for (const link of links) {
            const href = link.getAttribute("href");
            const filename = href + ".md";

            // Only process links that have the same alias as href
            if (link.innerText !== href) {
                lg.info(`Link has an alias already`);
                continue;
            }

            const note = ApiNote.fromPath(filename);

            if (!note) {
                lg.info(`Note not found`);
                continue;
            }

            if (!note.h1) {
                lg.info(`No h1 found`);
                continue;
            }

            lg.info(`Found h1 "${note.h1}"`);

            context.addChild(new AliasLink(link, note.h1));
        }
    });
}
