import ApiNoteList, { tagDisplay, TagWildcard } from "@/api/note-list";
import { clsx } from "clsx";
import { useMemo } from "react";
import styles from "./TagList.module.scss";


export default function TagList({
    notes,
    setTag,
}: {
    notes: ApiNoteList,
    setTag: (id: string | TagWildcard) => void,
}) {
    const onClick = useMemo(() => (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (id) {
            setTag(id);
        }
    }, [setTag]);

    return <div className={styles.list}>
        {[TagWildcard.All, TagWildcard.Any, TagWildcard.None].map((w) => <div
            key={w}
            className={styles.card}
            onClick={() => setTag(w)}
        >
            {tagDisplay(w)}
        </div>)}

        {notes.tags.map((id) => <div
            key={id}
            data-id={id}
            className={clsx(styles.card, styles.tag)}
            onClick={onClick}
        >
            {tagDisplay(id)}
        </div>)}
    </div>
}
