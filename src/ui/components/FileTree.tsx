import { ApiNoteUnique } from "@/api/note";
import { ApiNoteUniqueList, DirectoryTree } from "@/api/note-list";
import { clsx } from "clsx";
import { useState } from "react";
import Icon from "./controls/Icon";
import ProgressBar from "./parts/ProgressBar";

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
        {
            note.tasks.length > 0
            ? <ProgressBar
                icon="check-circle"
                value={note.tasksDone.length}
                max={note.tasks.length}
            />
            : null
        }
    </div>;
}


const sortSubfolders = (
    a: [string, DirectoryTree],
    b: [string, DirectoryTree],
) => a[0].localeCompare(b[0]);


const sortNotes = (
    a: ApiNoteUnique,
    b: ApiNoteUnique,
) => {
    // Make the index notes go to the top.
    if (a.isIndex && !b.isIndex) {
        return -1;
    }
    if (!a.isIndex && b.isIndex) {
        return 1;
    }
    // If both notes are index, or if none of them are index,
    // compare as usual.
    return a.base.localeCompare(b.base);
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

    const subs = Object.entries(tree.subs)
        // Sort by name
        .sort(sortSubfolders)
        .map(([name, tree]) => <Directory key={name} name={name} tree={tree} />);

    const notes = tree.notes
        .sort(sortNotes)
        .map((note) => <Note key={note.base} note={note} />);

    return <div className={styles.directory}>
        <Icon
            className={styles.icon}
            icon={expandedIcon}
            onClick={() => setExpanded((v) => !v)}
        />
        <div className={styles.name}>
            {name}
        </div>
        <div className={clsx(styles.guide, expandedClass)}/>
        <div className={clsx(styles.contents, expandedClass)}>
            {subs}
            {notes}
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
