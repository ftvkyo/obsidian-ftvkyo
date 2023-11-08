import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { createRoot, Root } from "react-dom/client";

import { ApiNoteUnique } from "@/api/note";
import MarkdownWrapper from "./MarkdownWrapper";
import Logger from "@/util/logger";

import styles from "./AutoLinkText.module.scss";


let lg: Logger | undefined = undefined;


class MarkdownLink extends MarkdownRenderChild {
    root: Root;

    constructor(
        readonly containerEl: HTMLElement,
        readonly text: string,
        readonly sensitive?: boolean,
    ) {
        super(containerEl);
        this.root = createRoot(containerEl);
    }

    onload() {
        if (this.sensitive && styles.sensitive) {
            this.containerEl.addClass(styles.sensitive);
        }

        this.root.render(<MarkdownWrapper>
            {this.text}
        </MarkdownWrapper>);
    }
}

const SEP_LINK_HREF = "#";
const SEP_LINK_TEXT = " > ";


function findProperLinkTitle(href: string, text: string): {
    note: ApiNoteUnique,
    newTitle?: string,
} | null {
    const hrefSplit = href.indexOf(SEP_LINK_HREF);

    const filename = (hrefSplit === -1 ? href : href.substring(0, hrefSplit)) + ".md";

    // TODO: provide path to the current note for correct path resolution
    const note = ftvkyo.api.source.byPath(filename);

    if (!note) {
        lg?.debug(`Note for "${href}" not found`);
        return null;
    }

    if (!(note instanceof ApiNoteUnique)) {
        lg?.debug(`Note for "${href}" found is not a unique note`);
        return null;
    }

    const title = note.title;

    if (!title) {
        lg?.debug(`No title found in the note for "${href}"`);
        return null;
    }

    if (hrefSplit === -1) {
        // No headings involved.
        if (href === text) {
            // Text matches - no alias, use the simple title
            return { note, newTitle: title };
        } else {
            // Text does not match - there is an alias already.
            // Don't touch the text.
            return { note };
        }
    }

    // From here, headings ARE involved.

    const textSplit = text.indexOf(SEP_LINK_TEXT);

    if (textSplit === -1) {
        // This is a heading link, but the text does not show it,
        // so there is a custom alias already.
        // Don't touch the text.
        return { note };
    }

    const hrefBase = href.substring(0, hrefSplit);
    const hrefRest = href.substring(hrefSplit + SEP_LINK_HREF.length);

    const textBase = text.substring(0, textSplit);
    const textRest = text.substring(textSplit + SEP_LINK_TEXT.length);

    // At this point, both the href and the text are formatted like
    // links with headings.
    // This still may be because of a weird alias that contains the
    // link text heading separator, so let's check that the parts match.

    if (textBase === hrefBase && hrefRest == textRest) {
        // This is a fully matching heading link, replace it, but add the heading part.
        return { note, newTitle: title + SEP_LINK_TEXT + textRest };
    }

    // This is a heading link with an alias which is weird, or there is a bug.
    // Don't touch the text.
    return { note };
}


export default function AutoLinkText(
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
) {
    if (!lg) {
        lg = ftvkyo.lg.sub("auto-alias");
    }

    // Find all internal links
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>("a.internal-link"));

    for (const link of links) {
        const href = link.getAttribute("href") ?? "";

        const noteInfo = findProperLinkTitle(href, link.innerText);

        if (noteInfo && noteInfo.newTitle) {
            lg.debug(`Using title "${noteInfo.newTitle}" for link to "${href}"`);
            context.addChild(new MarkdownLink(link, noteInfo.newTitle, noteInfo.note.isSensitive));
        } else {
            lg.debug(`Not modifying link "${link.innerText}" to "${href}"`);
        }
    }
}
