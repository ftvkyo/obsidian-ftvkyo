import { MarkdownRenderChild } from "obsidian";

import logger from "../util/logger";
import {getTitleByFileName} from "../util/note";
import ObsidianFtvkyo from "../main";

const lg = logger.sub("auto-alias");


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
    plugin.registerMarkdownPostProcessor((element, context) => {
        // Find all internal links
        const links = Array.from(element.querySelectorAll<HTMLElement>("a.internal-link"));

        if (links.length > 0) {
            lg.info(`Found ${links.length} internal links.`);
        }

        for (const link of links) {
            const llg = lg.sub(`"${link.innerText}"`);

            const href = link.getAttribute("href");
            const filename = href + ".md";

            // Only process links that have the same alias as href
            if (link.innerText !== href) {
                llg.info(`Link has an alias already`);
                continue;
            }

            const title = getTitleByFileName(plugin, filename);

            if (!title) {
                llg.info(`No title found`);
                continue;
            }

            llg.info(`Found title "${title}"`);

            context.addChild(new AliasLink(link, title));
        }
    });
}