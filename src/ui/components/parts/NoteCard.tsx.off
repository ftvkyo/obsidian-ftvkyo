import { clsx } from "clsx";
import { useCallback } from "react";

import { ApiNoteUnique } from "@/api/note";
import { toClipboard } from "@/util/clipboard";
import Icon from "../controls/Icon";
import MarkdownWrapper from "@/ui/markdown/MarkdownWrapper";

import styles from "./NoteCard.module.scss";


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


interface Props {
    note: ApiNoteUnique,
}


function Header({
    note
}: Props): JSX.Element {
    const copy = useCallback(() => toClipboard(`[[${note.base}]]`), [note.base]);

    return <div
        className={styles.header}
    >
        <a
            className={clsx(
                styles.title,
                note.isSensitive && styles.sensitive,
            )}
            href={note.path}
            onClick={onClick}
            onAuxClick={onAuxClick}
        >
            {note.title
                ? <MarkdownWrapper>{note.title}</MarkdownWrapper>
                : <code>{note.base}</code>
            }
        </a>

        <Icon
            icon="link"
            label="Copy link"
            onClick={copy}
        />
    </div>;
}


function Tags({
    note
}: Props): JSX.Element | null {
    if (note.tags) {
        return <div className={styles.tags}>
            {note.tags.map((t) => "#" + t).join(", ")}
        </div>;
    }
    return null;
}


function State({
    note
}: Props): JSX.Element | null {
    const undone = note.tasksUndone.length;
    const done = note.tasksDone.length;

    let tasks = null;
    if (undone > 0 || done > 0) {
        const total = undone + done;
        tasks = <div className={styles.state}>
            <Icon icon="check-circle"/>
            {done} of {total}
            <progress
                value={done}
                max={total}
            />
        </div>;
    }

    return <>
        {tasks}
    </>;
}


function Invalid({
    note
}: Props): JSX.Element | null {
    if (note.broken) {
        return <div className={styles.invalid}>
            {note.broken}
        </div>;
    }
    return null;
}


function Info({
    note
}: Props): JSX.Element {
    return <div className={styles.info}>
        <State note={note}/>
        <Tags note={note}/>
        <Invalid note={note}/>
    </div>;
}


export default function NoteCard({
    note,
}: Props) {
    return <div className={styles.card}>
        <Header note={note}/>
        <Info note={note}/>
    </div>
}
