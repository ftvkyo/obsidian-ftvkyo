import { MarkdownPostProcessorContext } from "obsidian";

import Logger from "@/util/logger";

import { ApiNoteUnique } from "@/api/note";
import MarkdownReplacer from "./MarkdownLinkReplacer";


let lg: Logger | undefined = undefined;


export default function AutoLinkText(
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

        // TODO: provide path to the current note for correct path resolution
        const note = ftvkyo.api.source.byPath(filename);

        if (!note) {
            lg.debug(`Note not found`);
            continue;
        }

        if (!(note instanceof ApiNoteUnique)) {
            lg.debug(`Note found is not a unique note`);
            continue;
        }

        if (!note.title) {
            lg.debug(`No h1 found`);
            continue;
        }

        lg.debug(`Using title "${note.title}"`);

        context.addChild(new MarkdownReplacer(link, note.title));
    }
}
