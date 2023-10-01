import ApiNote from "@/api/note";
import { toClipboard } from "@/util/clipboard";
import {setIcon} from "obsidian";
import {useCallback} from "react";
import Markdown from "react-markdown";

import styles from "./NoteCard.module.scss";


function open(
    e: React.MouseEvent<HTMLAnchorElement>,
) {
    e.preventDefault();

    const href = e.currentTarget.getAttribute("href");
    if (!href) {
        return;
    }

    const note = ApiNote.fromPath(href);
    if (!note) {
        return;
    }

    const newTab = e.currentTarget.getAttribute("target") === "_blank";
    note.reveal({ replace: !newTab });
}


function copy(
    e: React.MouseEvent<HTMLAnchorElement>,
) {
    e.preventDefault();

    const href = e.currentTarget.getAttribute("href");
    if (!href) {
        return;
    }

    toClipboard(href);
}


function populateIcons(
    card: HTMLElement,
) {
    // Query all children with a "data-icon" attribute.
    const icons = card.querySelectorAll<HTMLElement>("[data-icon]");

    icons.forEach((icon) => {
        const name = icon.getAttribute("data-icon");
        name && setIcon(icon, name);
    });
}


function getBlockTitle(
    note: ApiNote,
): JSX.Element {
    const className = note.h1 ? styles.title : styles.untitle;
    let title;

    if (note.h1) {
        title = <Markdown>{note.h1}</Markdown>;
    } else {
        title = "Untitled, " + (note.dateInfo || note.base);
    }

    return <div
        className={className}
    >
        {title}
    </div>;
}


export default function NoteCard({
    note,
}: {
    note: ApiNote,
}) {
    const blockTitle = getBlockTitle(note);

    // Note info

    const typeIconName = note.type && ftvkyo.settings.typeIcons[note.type] || null;
    const typeIcon = typeIconName && <div
        className="clickable-icon"
        data-icon={typeIconName}
    />;

    const draftIconName = note.wip && ftvkyo.settings.wipIcon || null;
    const draftIcon = draftIconName && <div
        className="clickable-icon"
        data-icon={draftIconName}
    />;

    const blockInfo = <div
        className={styles.info}
    >
        {typeIcon}
        {draftIcon}
    </div>;

    // Note controls

    const copyLink = <a
        className="clickable-icon"
        href={`[[${note.base}]]`}
        onClick={copy}

        data-icon="link"
    />;

    const openReplace = <a
        className="clickable-icon"
        href={note.path}
        onClick={open}

        data-icon="corner-down-right"
    />;

    const openNewTab = <a
        className="clickable-icon"
        href={note.path}
        onClick={open}
        target="_blank"

        data-icon="plus"
    />;

    const blockControls = <div
        className={styles.controls}
    >
        {openReplace}
        {openNewTab}
        {copyLink}
    </div>;

    const updateRef = useCallback((node: HTMLDivElement) => {
        node && populateIcons(node);
    }, []);

    return <div
        ref={updateRef}

        className={styles.noteCard}

        // Define the tooltip and accesibility label.
        aria-label={ftvkyo.settings.enableTooltip && note.base || ""}
        data-tooltip-position="right"
    >
        {blockTitle}
        {blockInfo}
        {blockControls}
    </div>
}
