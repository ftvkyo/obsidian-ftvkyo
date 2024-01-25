import { revealNote } from "@/api/note";
import { ApiFolder } from "@/api/source";
import { clsx } from "clsx";
import { TFile } from "obsidian";
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


const getFileCache = (file: TFile) => {
    return app.metadataCache.getFileCache(file);
}

const getTasks = (file: TFile) => {
    const fc = getFileCache(file);
    return fc?.listItems?.filter(val => val.task !== undefined) ?? [];
}

const getIndexStatus = (file: TFile) => {
    const fm = getFileCache(file)?.frontmatter;
    return !!(fm?.["index"] || fm?.["root"]);
}


function Note({
    file: note,
}: {
    file: TFile,
}) {
    const tasksAll = getTasks(note);
    const tasks = tasksAll.length;
    const tasksDone = tasksAll.filter(val => val.task !== " ").length;

    const isIndex = getIndexStatus(note);

    const icon = isIndex ? "file-badge" : "file";
    const iconClass = isIndex ? styles.index : null;

    const titleInfo = parseTitle(note.basename);
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
        onClick={(e) => revealNote(note, { replace: !e.ctrlKey })}
        onAuxClick={(e) => e.button === 1 && revealNote(note)}
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


const sortSubfolders = (
    a: [string, ApiFolder],
    b: [string, ApiFolder],
) => a[0].localeCompare(b[0]);


const sortNotes = (
    a: TFile,
    b: TFile,
) => {
    // Make the index notes go to the top.
    if (getIndexStatus(a) && !getIndexStatus(b)) {
        return -1;
    }
    if (!getIndexStatus(a) && getIndexStatus(b)) {
        return 1;
    }
    // If both notes are index, or if none of them are index,
    // compare as usual.
    return a.basename.localeCompare(b.basename);
}


function Directory({
    folder,
}: {
    folder: ApiFolder,
}) {
    // Root starts expanded
    const [expanded, setExpanded] = useState(folder.tf.isRoot());

    const newNote = useCallback(async () => {
        const newNote = await ftvkyo.api.source.createUniqueNoteAt(folder.tf.path);
        await revealNote(newNote, { rename: "end" });
    }, [folder.tf.path]);

    const expandedIcon = expanded ? "folder" : "folder-closed";
    const expandedClass = expanded ? null : styles.hidden;

    const subs = Object.entries(folder.subfolders)
        // Sort by name
        .sort(sortSubfolders)
        .map(([name, folder]) => <Directory key={name} folder={folder} />);

    const notes = folder.files
        .sort(sortNotes)
        .map((file) => <Note key={file.basename} file={file} />);

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
        <div className={styles.controls}>
            <Icon className={styles.icon} icon="plus" onClick={newNote}/>
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
