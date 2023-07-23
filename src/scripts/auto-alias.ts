import { MarkdownRenderChild, Plugin, TFile } from "obsidian";

import logger from "../util/logger";

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

export default function AutoAlias(plugin: Plugin) {
    plugin.registerMarkdownPostProcessor((element, context) => {
        const fcs = Object.keys((plugin.app.metadataCache as any).fileCache);

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

            let linkedFile = null;
            for (const fc of fcs) {
                // If the file has the same name as the link, use it
                if (fc.endsWith("/" + filename)) {
                    linkedFile = fc;
                    break;
                }
            }

            if (!linkedFile) {
                llg.info(`Linked file not found`);
                continue;
            }

            const tf = plugin.app.vault.getAbstractFileByPath(linkedFile);

            if (!(tf instanceof TFile)) {
                llg.info(`Linked file is not a TFile`);
                continue;
            }

            if (!tf) {
                llg.info(`File not found`);
                // Dead link
                continue;
            }

            const cache = plugin.app.metadataCache.getFileCache(tf);
            const heading0 = cache?.headings ? cache.headings[0] : null;

            if (!heading0) {
                llg.info(`No headings`);
                // No headings at all
                continue;
            }

            if (heading0.level !== 1) {
                llg.info(`First heading is not a top-level heading`);
                // The first heading is not a top-level heading
                continue;
            }

            const title = heading0.heading;

            llg.info(`Found title "${title}"`);

            context.addChild(new AliasLink(link, title));
        }
    });
}
