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
    const openReplaceRef = useRef<HTMLAnchorElement>(null);
    const openReplace = <a
        ref={openReplaceRef}
        className="internal-link note-opener"
        href={note.path}
        onClick={open}
    />;

    const openNewTabRef = useRef<HTMLAnchorElement>(null);
    const openNewTab = <a
        ref={openNewTabRef}
        className="internal-link note-opener"
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

    // The title used is either:
    // 1. The note's h1, when available
    // 2. The note's date parsed from the basename, when available
    // 3. The note's basename, when all else fails
    const blockTitle = <p className="title">
        {note.h1 ?? note.dateInfo ?? note.base}
    </p>

    const blockDate = note.h1 && note.type === null
        ? <code className="date">{note.dateInfo}</code>
        : null;

    return <div
        className="note-card"

        // Define the tooltip and accesibility label.
        aria-label={note.base}
        data-tooltip-position="right"
    >
        <div className="info">
            {blockTitle}
            {blockDate}
        </div>

        <div className="controls">
            {openReplace}
            {openNewTab}
        </div>
    </div>
}
