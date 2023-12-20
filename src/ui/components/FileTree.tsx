import { ApiNoteUnique } from "@/api/note";
import { ApiNoteUniqueList, DirectoryTree } from "@/api/note-list";
import { clsx } from "clsx";
import { useState } from "react";

import styles from "./FileTree.module.scss";


function Note({
    note,
}: {
    note: ApiNoteUnique,
}) {
    return <div className={clsx(styles.note, note.isIndex && styles.index)}>
        {note.base}
    </div>;
}


function Directory({
    name,
    tree,
}: {
    name: string,
    tree: DirectoryTree,
}) {
    const [expanded, setExpanded] = useState(false);

    const header = <div className={styles.header}>
        {name}
    </div>;

    const subs = Object.entries(tree.subs)
        // Sort by name
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, tree]) => <Directory key={name} name={name} tree={tree} />);

    const files = tree.notes
        .sort((a, b) => a.base.localeCompare(b.base))
        .map((note) => <Note key={note.base} note={note} />);

    return <div className={styles.directory}>
        {header}
        <div className={styles.contents}>
            {subs}
            {files}
        </div>
    </div>;
}


export default function FileTree({
    notes,
}: {
    notes: ApiNoteUniqueList,
}) {
    return <div className={styles.tree}>
        <Directory
            name="/"
            tree={notes.directoryTree}
        />
    </div>;
}
