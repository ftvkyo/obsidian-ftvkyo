import { clsx } from "clsx";
import { useCallback } from "react";

import ApiNoteList, { tagDisplay, TagWildcard } from "@/api/note-list";

import styles from "./TagList.module.scss";


function TagCard({
    id,
    setTag,
}: {
    id: string | TagWildcard,
    setTag: (id: string | TagWildcard) => void,
}) {
    const onClick = useCallback(() => {
        setTag(id);
    }, [setTag, id]);

    return <a
        className={clsx(styles.card)}
        onClick={onClick}
    >
        {tagDisplay(id)}
    </a>
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

    return <div className={styles.list}>
        {wildcards.map((id) => <TagCard
            key={id}
            id={id}
            setTag={setTag}
        />)}

        {notes.tags.map((id) => <TagCard
            key={id}
            id={id}
            setTag={setTag}
        />)}
    </div>
}
