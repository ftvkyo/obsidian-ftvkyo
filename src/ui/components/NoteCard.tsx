import { getTitleByFileName } from "@/note/title";
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

    return <a
        className="note-card"
        href={filename}
        onClick={openNoteCallback}
    >
        <p>{title}</p>
        <code>{filename}</code>
    </a>;
}
