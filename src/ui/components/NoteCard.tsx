import { getTitleByFileName } from "@/note/title";
import {filenameToPretty} from "@/util/date";
import {useMemo} from "react";
import { usePlugin } from "../context";


export default function NoteCard({
    filename,
    openNoteCallback,
}: {
    filename: string,
    openNoteCallback: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>,
}) {
    const plugin = usePlugin();
    const title = getTitleByFileName(plugin, filename) ?? filename;

    const date = useMemo(() => filenameToPretty(filename), [filename]);

    return <a
        className="note-card internal-link"
        href={filename}
        onClick={openNoteCallback}

        // Define the tooltip and accesibility label.
        aria-label={date}
        data-tooltip-position="right"

        // Just copying obsidian here (probably)
        data-href={filename}

        target="_blank"
        rel="noopener noreferrer"
    >
        <p>{title}</p>
    </a>;
}
