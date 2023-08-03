import ApiNote from "@/api/note";


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
    note.reveal();
}


export default function NoteCard({
    note,
}: {
    note: ApiNote,
}) {
    // The title used is either:
    // 1. The note's h1, when available
    // 2. The note's date parsed from the basename, when available
    // 3. The note's basename, when all else fails
    const title = note.h1 ?? note.dateInfo ?? note.base;

    // The label/tooltip used shows the note's filename.
    const label = `Id: ${note.base}`;

    return <a
        className="note-card internal-link"
        href={note.path}
        onClick={open}

        // Define the tooltip and accesibility label.
        aria-label={label}
        data-tooltip-position="right"

        // Just copying obsidian here (probably)
        data-href={note.path}

        target="_blank"
        rel="noopener noreferrer"
    >
        <p>{title}</p>
    </a>;
}
