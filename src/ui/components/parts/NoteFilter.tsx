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

    const hasDate = <TriToggle
        value={filter.date}
        onChange={(v) => setFilter({...filter, date: v, page: 0})}
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
            <div>Dated {hasDate}</div>
            <div>Invalid {isInvalid}</div>
        </div>
    </>;
}
