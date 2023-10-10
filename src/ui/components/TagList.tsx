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

    let nestedness = 0;
    if (typeof id === "string") {
        nestedness = id.match(/\//)?.length ?? 0;
    }

    return <a
        className={clsx(styles.card)}
        onClick={onClick}
        style={{
            marginLeft: `${nestedness}em`
        }}
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
        <h1>Tags</h1>

        <h2>Wildcards</h2>

        {wildcards.map((id) => <TagCard
            key={id}
            id={id}
            setTag={setTag}
        />)}

        <h2>Tags</h2>

        {notes.tags.map((id) => <TagCard
            key={id}
            id={id}
            setTag={setTag}
        />)}
    </div>;
}
