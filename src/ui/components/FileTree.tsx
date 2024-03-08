import { ApiFile, ApiFolder } from "@/api/source";
import { clsx } from "clsx";
import { useCallback, useState } from "react";
import Icon from "./controls/Icon";
import Progress from "./controls/Progress";

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

    const titleInfo = parseTitle(note.tf.basename);
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
        <div className={styles.info}>
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


function Directory({
    folder,
}: {
    folder: ApiFolder,
}) {
    // Root starts expanded
    const [expanded, setExpanded] = useState(folder.tf.isRoot());

    /*
    const newNote = useCallback(async () => {
        const newNote = await ftvkyo.api.source.createUniqueNoteAt(folder.tf.path);
        await newNote.reveal({ rename: "end" });
    }, [folder.tf.path]);
    */

    const expandedIcon = expanded ? "folder" : "folder-closed";
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
            // Don't allow toggling the root-level directory
            onClick={() => !folder.tf.isRoot() && setExpanded((v) => !v)}
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
