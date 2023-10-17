import {NoteFilterType} from "@/api/note-list";
import TriToggle from "../controls/TriToggle";

import styles from "./NoteFilter.module.scss";


export default function NoteFilter({
    filter,
    setFilter,
}: {
    filter: NoteFilterType,
    setFilter: (filter: NoteFilterType) => void,
}) {
    // Filtering notes with/without titles.
    const hasTitle = <TriToggle
        value={filter.title}
        onChange={(v) => setFilter({...filter, title: v, page: 0})}
    />;

    // Filtering WIP notes.
    const hasTodos = <TriToggle
        value={filter.todos}
        onChange={(v) => setFilter({...filter, todos: v, page: 0})}
    />;

    const isLocked = <TriToggle
        value={filter.locked}
        onChange={(v) => setFilter({...filter, locked: v, page: 0})}
    />;

    // Filtering invalid notes.
    const isInvalid = <TriToggle
        value={filter.invalid}
        onChange={(v) => setFilter({...filter, invalid: v, page: 0})}
    />;

    return <>
        <div className={styles.toggles}>
            <div>Title {hasTitle}</div>
            <div>TODOs {hasTodos}</div>
            <div>Locked {isLocked}</div>
            <div>Invalid {isInvalid}</div>
        </div>
    </>;
}
