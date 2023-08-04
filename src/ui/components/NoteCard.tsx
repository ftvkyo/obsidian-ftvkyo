import ApiNote from "@/api/note";
import {setIcon} from "obsidian";
import {useEffect, useRef} from "react";


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

    const typeIcon = note.type && ftvkyo.settings.typeIcons[note.type] + " " || null;
    const draftIcon = note.isDraft && ftvkyo.settings.draftIcon + " " || null;

    const blockInfo = <div
        className="info"
    >
        {typeIcon}
        {draftIcon}
    </div>;

    // Note controls

    const openReplaceRef = useRef<HTMLAnchorElement>(null);
    const openReplace = <a
        ref={openReplaceRef}
        className="clickable-icon note-opener"
        href={note.path}
        onClick={open}
    />;

    const openNewTabRef = useRef<HTMLAnchorElement>(null);
    const openNewTab = <a
        ref={openNewTabRef}
        className="clickable-icon note-opener"
        href={note.path}
        onClick={open}
        target="_blank"
    />;

    useEffect(() => {
        if (openReplaceRef.current) {
            setIcon(openReplaceRef.current, "corner-down-right");
        }
        if (openNewTabRef.current) {
            setIcon(openNewTabRef.current, "plus");
        }
    }, [openNewTabRef, openReplaceRef]);

    const blockControls = <div
        className="controls"
    >
        {openReplace}
        {openNewTab}
    </div>;

    return <div
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
