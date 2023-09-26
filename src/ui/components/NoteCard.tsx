import ApiNote from "@/api/note";
import { toClipboard } from "@/util/clipboard";
import {setIcon} from "obsidian";
import {useCallback} from "react";


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


export default function NoteCard({
    note,
}: {
    note: ApiNote,
}) {

    // Note information

    const title = note.h1 !== null && <p>
        {note.h1}
    </p>;

    const date = note.type === null && <code>
        {note.dateInfo ?? note.base}
    </code>;

    const blockTitle = <div
        className="title"
    >
        {title}
        {date}
    </div>;

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
        className="info"
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
        className="controls"
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

        className="note-card"

        // Define the tooltip and accesibility label.
        aria-label={ftvkyo.settings.enableTooltip && note.base || ""}
        data-tooltip-position="right"
    >
        {blockTitle}
        {blockInfo}
        {blockControls}
    </div>
}
