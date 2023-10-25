import { ApiWhere } from "@/api/note-list";
import TriToggle from "../controls/TriToggle";
import styles from "./NoteFilter.module.scss";


export default function NoteFilter({
    w,
    setW,
}: {
    w: ApiWhere,
    setW: (w: ApiWhere) => void,
}) {
    // Filtering notes with/without titles.
    const hasTitle = <TriToggle
        value={w.filter.title}
        onChange={(v) => setW(w.title(v))}
    />;

    // Filtering WIP notes.
    const hasTodos = <TriToggle
        value={w.filter.todos}
        onChange={(v) => setW(w.todos(v))}
    />;

    const hasDate = <TriToggle
        value={w.filter.dated}
        onChange={(v) => setW(w.dated(v))}
    />;

    // Filtering broken notes.
    const isBroken = <TriToggle
        value={w.filter.broken}
        onChange={(v) => setW(w.broken(v))}
    />;

    return <>
        <div className={styles.toggles}>
            <div>Title {hasTitle}</div>
            <div>TODOs {hasTodos}</div>
            <div>Dated {hasDate}</div>
            <div>Broken {isBroken}</div>
        </div>
    </>;
}
