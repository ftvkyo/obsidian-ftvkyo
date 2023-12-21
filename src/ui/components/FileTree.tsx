import { ApiNoteUnique } from "@/api/note";
import { ApiNoteUniqueList, DirectoryTree } from "@/api/note-list";
import { clsx } from "clsx";
import { useState } from "react";
import Icon from "./controls/Icon";

import styles from "./FileTree.module.scss";


function onClick(
    e: React.MouseEvent<HTMLAnchorElement>,
) {
    e.preventDefault();

    const href = e.currentTarget.getAttribute("href");
    if (!href) {
        return;
    }

    const note = ftvkyo.api.source.byPath(href);
    if (!note) {
        return;
    }

    note.reveal({ replace: !e.ctrlKey });

    // Otherwise, we ignore the clicks
}


function onAuxClick(
    e: React.MouseEvent<HTMLAnchorElement>,
) {
    if (e.button === 1) {
        // Middle mouse button.
        e.preventDefault();

        // "genius": Relay to the other handler.
        e.button = 0;
        e.ctrlKey = true;
        onClick(e);
    }
}


function Note({
    note,
}: {
    note: ApiNoteUnique,
}) {
    return <div
        className={clsx(styles.note, note.isIndex && styles.index)}
    >
        <a
            href={note.path}
            onClick={onClick}
            onAuxClick={onAuxClick}
        >
            {note.base}
        </a>
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

    const expandedIcon = expanded ? "chevron-down" : "chevron-right";
    const expandedClass = expanded ? null : styles.hidden;

    const header = <div className={styles.header}>
        <Icon
            icon={expandedIcon}
            onClick={() => setExpanded((v) => !v)}
        />
        <span>{name}</span>
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
        <div className={clsx(styles.contents, expandedClass)}>
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
