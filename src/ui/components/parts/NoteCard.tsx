import { clsx } from "clsx";
import {setIcon} from "obsidian";
import {useCallback} from "react";
import Markdown from "react-markdown";

import ApiNote from "@/api/note";
import { toClipboard } from "@/util/clipboard";

import styles from "./NoteCard.module.scss";


function open(
    e: React.MouseEvent<HTMLAnchorElement>,
) {
    e.preventDefault();

    const href = e.currentTarget.getAttribute("href");
    if (!href) {
        return;
    }

    const note = ApiNote.fromPath(href);
    if (!note) {
        return;
    }

    const tabNew = e.button === 1 || (e.button === 0 && e.ctrlKey);
    const tabReplace = !tabNew && e.button === 0;

    if (tabNew || tabReplace) {
        note.reveal({ replace: tabReplace });
    }

    // Otherwise, we ignore the clicks
}


function copy(
    e: React.MouseEvent<HTMLAnchorElement>,
) {
    e.preventDefault();

    const href = e.currentTarget.getAttribute("href");
    if (!href) {
        return;
    }

    toClipboard(href);
}


function populateIcons(
    card: HTMLElement,
) {
    // Query all children with a "data-icon" attribute.
    const icons = card.querySelectorAll<HTMLElement>("[data-icon]");

    icons.forEach((icon) => {
        const name = icon.getAttribute("data-icon");
        name && setIcon(icon, name);
    });
}


function Header({
    note
}: {
    note: ApiNote,
}): JSX.Element {
    return <div
        className={styles.header}
    >
        <a
            className={clsx(styles.title, note.title && styles.h1)}
            href={note.path}
            onClick={open}
        >
            {note.title
                ? <Markdown>{note.title}</Markdown>
                : "Untitled, " + (note.dateInfo || note.base)
            }
        </a>

        <a
            className="clickable-icon"
            data-icon="link"

            href={`[[${note.base}]]`}
            onClick={copy}
        />
    </div>;
}


function Tags({
    note
}: {
    note: ApiNote,
}): JSX.Element | null {
    if (!note.root && note.tags) {
        return <div className={styles.tags}>
            {note.tags.map((t) => "#" + t).join(", ")}
        </div>;
    }
    return null;
}


function Tasks({
    note
}: {
    note: ApiNote,
}): JSX.Element | null {
    const undone = note.tasksUndone.length;
    const done = note.tasksDone.length;

    if (undone > 0 || done > 0) {
        return <div
            className={styles.tasks}
        >
            <div
                className="clickable-icon"
                data-icon="circle"
            />

            {undone}

            <div
                className="clickable-icon"
                data-icon="check-circle"
            />

            {done}
        </div>;
    }
    return null;
}


function Invalid({
    note
}: {
    note: ApiNote,
}): JSX.Element | null {
    if (note.invalid) {
        return <div className={styles.invalid}>
            {note.invalid}
        </div>;
    }
    return null;
}


function Info({
    note
}: {
    note: ApiNote,
}): JSX.Element {
    return <div
        className={styles.info}
    >
        <Tags note={note}/>
        <Tasks note={note}/>
        <Invalid note={note}/>
    </div>;
}


export default function NoteCard({
    note,
}: {
    note: ApiNote,
}) {
    const updateRef = useCallback((node: HTMLDivElement) => {
        node && populateIcons(node);
    }, []);

    return <div
        ref={updateRef}
        className={styles.card}
    >
        <Header note={note}/>
        <Info note={note}/>
    </div>
}
