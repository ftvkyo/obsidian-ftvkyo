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

    const blockInfo = <div
        className="info"
    >
        {note.h1 ? <p>{note.h1}</p> : null}
        {note.type ? null : <code>{note.dateInfo ?? note.base}</code>}
    </div>;

    // Note controls

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

    const blockControls = <div
        className="controls"
    >
        {openReplace}
        {openNewTab}
    </div>;

    return <div
        className="note-card"

        // Define the tooltip and accesibility label.
        aria-label={note.base}
        data-tooltip-position="right"
    >
        {blockInfo}
        {blockControls}
    </div>
}
