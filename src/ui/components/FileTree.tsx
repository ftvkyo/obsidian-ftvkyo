import { ApiNoteUnique } from "@/api/note";
import { ApiNoteUniqueList, DirectoryTree } from "@/api/note-list";
import { clsx } from "clsx";
import { useState } from "react";
import Icon from "./controls/Icon";
import Progress from "./parts/Progress";

import styles from "./FileTree.module.scss";


const RE_NUMBER_PREFIX = /^(?<prefix>\d+\s+)?(?<content>.*)$/;

function parseTitle(title: string): {
    prefix?: string,
    content: string,
} {
    const match = RE_NUMBER_PREFIX.exec(title);
    return {
        prefix: match?.groups?.["prefix"],
        content: match?.groups?.["content"] ?? title,
    };
}


function Note({
    note,
}: {
    note: ApiNoteUnique,
}) {
    const tasks = note.tasks.length;
    const tasksDone = note.tasksDone.length;

    const icon = note.isIndex ? "file-badge" : "file";
    const iconClass = note.isIndex ? styles.index : null;

    const titleInfo = parseTitle(note.base);
    const title = titleInfo.prefix
        ? <span>
            <code>{titleInfo.prefix}</code>
            {titleInfo.content}
        </span>
        : <span>
            {titleInfo.content}
        </span>;

    return <div
        className={styles.leaf}
        onClick={(e) => note.reveal({ replace: !e.ctrlKey })}
        onAuxClick={(e) => e.button === 1 && note.reveal()}
    >
        <div className={styles.header}>
            <Icon className={clsx(styles.icon, iconClass)} icon={icon} />
            {title}
            {tasks > 0
                && <Progress
                    className={styles.progress}
                    icon="check"
                    value={tasksDone}
                    max={tasks}
                    compact
                    reverse
                />
            }
        </div>
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
    name = "/",
    tree,
}: {
    name?: string,
    tree: DirectoryTree,
}) {
    // "/" (root) starts expanded
    const [expanded, setExpanded] = useState(name === "/");

    const expandedIcon = expanded ? "folder" : "folder-closed";
    const expandedClass = expanded ? null : styles.hidden;

    const subs = Object.entries(tree.subs)
        // Sort by name
        .sort(sortSubfolders)
        .map(([name, tree]) => <Directory key={name} name={name} tree={tree} />);

    const notes = tree.notes
        .sort(sortNotes)
        .map((note) => <Note key={note.base} note={note} />);

    const hr = subs.length > 0 && notes.length > 0
        ? <hr/>
        : null;

    return <div className={styles.leaf}>
        <div
            className={styles.header}
            // Don't allow toggling the root-level directory
            onClick={() => name !== "/" && setExpanded((v) => !v)}
        >
            <Icon className={styles.icon} icon={expandedIcon}/>
            <span>{name}</span>
        </div>
        <div className={clsx(styles.children, expandedClass)}>
            {subs}
            {hr}
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
            tree={notes.directoryTree}
        />
    </div>;
}
