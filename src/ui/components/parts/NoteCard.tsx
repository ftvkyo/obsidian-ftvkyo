import { clsx } from "clsx";
import Markdown from "react-markdown";

import ApiNote from "@/api/note";
import { toClipboard } from "@/util/clipboard";

import styles from "./NoteCard.module.scss";
import {useIcons} from "@/util/icons";


function onClick(
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


interface Props {
    note: ApiNote,
}


function Header({
    note
}: Props): JSX.Element {
    return <div
        className={styles.header}
    >
        <a
            className={clsx(styles.title, note.title && styles.h1)}
            href={note.path}
            onClick={onClick}
            onAuxClick={onAuxClick}
        >
            {note.title
                ? <Markdown>{note.title}</Markdown>
                : <code>{note.base}</code>
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
}: Props): JSX.Element | null {
    if (!note.isRoot && note.tags) {
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
        tasks = <>
            <div data-icon="check-circle"/>
            {done} of {total}
            <progress
                value={done}
                max={total}
            />
        </>;
    }

    // TODO: Frontmatter info here?

    if (tasks) {
        return <div
            className={styles.state}
        >
            {tasks}
        </div>
    }

    return null;
}


function Invalid({
    note
}: Props): JSX.Element | null {
    if (note.invalid) {
        return <div className={styles.invalid}>
            {note.invalid}
        </div>;
    }
    return null;
}


function Info({
    note
}: Props): JSX.Element {
    return <div
        className={styles.info}
    >
        <State note={note}/>
        <Tags note={note}/>
        <Invalid note={note}/>
    </div>;
}


export default function NoteCard({
    note,
}: Props) {
    const updateRef = useIcons();

    return <div
        ref={updateRef}
        className={styles.card}
    >
        <Header note={note}/>
        <Info note={note}/>
    </div>
}
