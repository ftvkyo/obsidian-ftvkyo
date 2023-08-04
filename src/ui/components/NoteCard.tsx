import ApiNote from "@/api/note";
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

    const draftIconName = note.isDraft && ftvkyo.settings.draftIcon || null;
    const draftIcon = draftIconName && <div
        className="clickable-icon"
        data-icon={draftIconName}
    />;

    const leIconName = note.hasLooseEnd && ftvkyo.settings.looseEndIcon || null;
    const leIcon = leIconName && <div
        className="clickable-icon"
        data-icon={leIconName}
    />;

    const blockInfo = <div
        className="info"
    >
        {typeIcon}
        {draftIcon}
        {leIcon}
    </div>;

    // Note controls

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
