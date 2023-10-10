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
        onChange={(v) => setFilter({...filter, title: v})}
    />;

    // Filtering WIP notes.
    const isWip = <TriToggle
        value={filter.wip}
        onChange={(v) => setFilter({...filter, wip: v})}
    />;

    // Filtering invalid notes.
    const isInvalid = <TriToggle
        value={filter.invalid}
        onChange={(v) => setFilter({...filter, invalid: v})}
    />;

    return <>
        <div className={styles.toggles}>
            <div>Title {hasTitle}</div>
            <div>WIP {isWip}</div>
            <div>Invalid {isInvalid}</div>
        </div>
    </>;
}
