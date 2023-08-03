import { useMemo } from "react";

import { usePlugin } from "../context";


export default function NoteCard({
    filename,
    openNoteCallback,
}: {
    filename: string,
    openNoteCallback: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>,
}) {
    const plugin = usePlugin();

    const dateInfo = useMemo(() => plugin.api.note.getDateInfo(filename), [filename]);

    // The title used is either:
    // 1. The note's title, when available
    // 2. The note's date parsed from the filename, when available
    // 3. The note's filename, when all else fails
    const title = plugin.api.note.getTitle(filename) ?? dateInfo ?? filename;

    // The label/tooltip used shows the note's filename.
    const label = `Id: ${filename}`;

    return <a
        className="note-card internal-link"
        href={filename}
        onClick={openNoteCallback}

        // Define the tooltip and accesibility label.
        aria-label={label}
        data-tooltip-position="right"

        // Just copying obsidian here (probably)
        data-href={filename}

        target="_blank"
        rel="noopener noreferrer"
    >
        <p>{title}</p>
    </a>;
}
