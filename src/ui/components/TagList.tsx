import { clsx } from "clsx";
import { useMemo } from "react";

import ApiNoteList, { tagDisplay, TagWildcard } from "@/api/note-list";

import styles from "./TagList.module.scss";


function TagCard({
    id,
    onClick,
}: {
    id: string | TagWildcard,
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void,
}) {
    return <div
        key={id}
        data-id={id}
        className={clsx(styles.card)}
        onClick={onClick}
    >
        {tagDisplay(id)}
    </div>
}


export default function TagList({
    notes,
    setTag,
}: {
    notes: ApiNoteList,
    setTag: (id: string | TagWildcard) => void,
}) {
    const wildcards = [
        TagWildcard.All,
        TagWildcard.Any,
        TagWildcard.None,
    ];

    const onClick = useMemo(() => (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.getAttribute("data-id");
        if (id) {
            setTag(id);
        }
    }, [setTag]);

    return <div className={styles.list}>
        {wildcards.map((w) => <TagCard
            id={w}
            onClick={() => setTag(w)}
        />)}

        {notes.tags.map((id) => <TagCard
            id={id}
            onClick={onClick}
        />)}
    </div>
}
