import ApiNote from "@/api/note";
import {TagTree} from "@/api/note-list";
import Icon from "../controls/Icon";

import styles from "./TagTree.module.scss";


function TagSingle({
    id,
    display,
    count,
    noteRoot,
    setTag,
    children,
}: {
    id: string,
    display: string,
    count: number,
    noteRoot?: ApiNote,
    setTag: (id: string) => void,
    children?: React.ReactNode,
}) {
    return <div
        className={styles.card}
    >
        <div className={styles.single}>
            <a onClick={() => setTag(id)}>
                {display}
            </a>

            <span className={styles.count}>
                ({count})
            </span>

            {noteRoot && <Icon
                icon="hash"
                label="Root note"
                onClick={() => noteRoot.reveal()}
            />}
        </div>

        {children}
    </div>;
}


export function TagTree({
    tree,
    prefix = "",
    setTag,
}: {
    tree: TagTree,
    prefix?: string,
    setTag: (id: string) => void,
}) {
    const tags = Object.entries(tree).sort(([a], [b]) => a.localeCompare(b));

    return <>
        {tags.map(([id, info]) => {
            const fullId = prefix ? `${prefix}/${id}` : id;
            return <TagSingle
                key={fullId}
                id={fullId}
                display={id}
                count={info.notes.length}
                noteRoot={info.noteRoot}
                setTag={setTag}
            >
                {info.subtags && <TagTree
                    tree={info.subtags}
                    prefix={fullId}
                    setTag={setTag}
                />}
            </TagSingle>;
        })}
    </>;
}