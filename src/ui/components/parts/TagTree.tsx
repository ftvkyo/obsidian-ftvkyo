import { ApiNote } from "@/api/note";
import { TagTree } from "@/api/note-list";
import { clsx } from "clsx";
import { useCallback, useState } from "react";
import Icon from "../controls/Icon";

import styles from "./TagTree.module.scss";


function TagSingle({
    id,
    display,
    count,
    noteRoot,
    setTag,
    subtree,
}: {
    id: string,
    display: string,
    count: number,
    noteRoot?: ApiNote,
    setTag: (id: string) => void,
    subtree?: React.ReactElement,
}) {
    const [expand, setExpand] = useState(false);

    const onRootClick = useCallback((replace: boolean) => {
        noteRoot?.reveal({ replace });
    }, [noteRoot?.base]);

    const tagHeader = <div className={styles.single}>
        <Icon
            icon={subtree
                ? expand
                    ? "chevron-down"
                    : "chevron-right"
                : "minus"
            }
            disabled={!subtree}
            onClick={subtree ? (() => setExpand(e => !e)) : undefined}
        />

        <a onClick={() => setTag(id)}>
            {display}
        </a>

        {noteRoot && <Icon
            icon="hash"
            label="Root note"
            onClick={(e) => onRootClick(!e.ctrlKey)}
            onAuxClick={(e) => (e.button === 1) && onRootClick(false)}
        />}

        <span className={styles.count}>
            {count}
        </span>
    </div>;

    return <div
        className={styles.card}
    >
        {tagHeader}
        {expand && subtree}
    </div>;
}


export function TagTree({
    root = false,
    tree,
    prefix = "",
    setTag,
}: {
    root?: boolean,
    tree: TagTree,
    prefix?: string,
    setTag: (id: string) => void,
}) {
    const tags = Object.entries(tree).sort(([a], [b]) => a.localeCompare(b));

    return <div className={clsx(styles.list, root && styles.root)}>
        {tags.map(([id, info]) => {
            const fullId = prefix ? `${prefix}/${id}` : id;

            const subtree = Object.isEmpty(info.subtags)
                ? undefined
                : <TagTree
                    tree={info.subtags}
                    prefix={fullId}
                    setTag={setTag}
                />;

            return <TagSingle
                key={fullId}
                id={fullId}
                display={id}
                count={info.notes.length}
                noteRoot={info.noteRoot}
                setTag={setTag}
                subtree={subtree}
            />;
        })}
    </div>;
}
