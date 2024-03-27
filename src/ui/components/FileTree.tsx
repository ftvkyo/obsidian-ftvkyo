import { ApiFile, ApiFolder } from "@/api/source";
import { clsx } from "clsx";
import { useCallback, useState } from "react";
import { createMenu } from "../builtin/menu";
import Icon from "./controls/Icon";
import Progress from "./controls/Progress";

import styles from "./FileTree.module.scss";


function Note({
    file: note,
}: {
    file: ApiFile,
}) {
    const tasksAll = note.tasks;
    const tasks = tasksAll.length;
    const tasksDone = tasksAll.filter(val => val.task !== " ").length;

    const isIndex = note.isIndex;

    const icon = isIndex ? "file-badge" : "file";
    const iconClass = isIndex ? styles.index : null;

    return <div
        className={styles.leaf}
        onClick={(e) => note.reveal({ replace: !e.ctrlKey })}
        onAuxClick={(e) => e.button === 1 && note.reveal()}
    >
        <div className={styles.info}>
            <Icon className={clsx(styles.icon, iconClass)} icon={icon} />
            <span>
                {note.tf.basename}
            </span>
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


function Directory({
    folder,
}: {
    folder: ApiFolder,
}) {
    // Root starts expanded
    const [expanded, setExpanded] = useState(folder.tf.isRoot());

    const toggleExpanded = useCallback(() => {
        // Don't allow toggling the root-level directory
        if (!folder.tf.isRoot()) {
            setExpanded((v) => !v);
        }
    }, [folder.tf.path]);

    const newNote = useCallback(async () => {
        const newNote = await ftvkyo.api.source.createUniqueNoteAt(folder.tf.path);
        await newNote.reveal({ rename: "end" });
    }, [folder.tf.path]);

    const snowMenu = createMenu([
        {
            title: "New note",
            icon: "edit",
            onClick: newNote,
        },
        {
            title: "New folder",
            icon: "folder-open",
            onClick: () => console.log("unimplemented"),
        },
    ]);

    const hasConfig = folder.config !== null;

    const expandedIcon = expanded ? (hasConfig ? "folder-open-dot" : "folder") : "folder-closed";
    const expandedClass = expanded ? null : styles.hidden;

    const subs = folder.subfolders
        .map((folder) => <Directory key={folder.tf.name} folder={folder} />);

    const notes = folder.files
        .map((file) => <Note key={file.tf.basename} file={file} />);

    const hr = subs.length > 0 && notes.length > 0
        ? <hr/>
        : null;

    return <div className={styles.leaf}>
        <div
            className={styles.info}
            onClick={toggleExpanded}
            onContextMenu={snowMenu}
        >
            <Icon className={styles.icon} icon={expandedIcon}/>
            <span>{folder.tf.name || "/"}</span>
        </div>
        <div className={clsx(styles.children, expandedClass)}>
            {subs}
            {hr}
            {notes}
        </div>
    </div>;
}


export default function FileTree({
    folder,
}: {
    folder: ApiFolder,
}) {
    return <div className={styles.tree}>
        <Directory folder={folder}/>
    </div>;
}
