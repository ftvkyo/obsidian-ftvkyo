import { useState } from "react";

import NoteCard from "./parts/NoteCard";
import ApiNoteList, {NoteFilterType, TagWildcard, tagDisplay} from "@/api/note-list";
import NoteFilter from "./parts/NoteFilter";
import NotePaginator from "./parts/NotePaginator";
import { TriState } from "./controls/TriToggle";

import styles from "./NoteList.module.scss";


// TODO: Display a warning if there are notes with the same
// name in different folders.

// TODO: Logic to count the notes in dropdowns based on the
// current search?
// It's tricky because we have to make it so:
// - The selected tag does not affect its own dropdown, as
//   we can only select 1.
// - Other stuff :)


function generateNoteCards(
    notes: ApiNoteList,
) {
    return notes
        .notes
        .map(note => <NoteCard
            key={note.base}
            note={note}
        />);
}


export default function NoteList({
    tag,
    setTag,
    notes,
}: {
    tag: string | TagWildcard,
    setTag: (t: string | TagWildcard | null) => void,
    notes: ApiNoteList,
}) {
    const [filter, setFilter] = useState<Omit<NoteFilterType, "tag">>({
        title: TriState.Maybe,
        wip: TriState.Maybe,
        invalid: TriState.Maybe,
        orderKey: "date",
        orderDir: "desc",
        onPage: 25,
        page: 0,
    });

    const {notes: notesFiltered, found} = notes.where({...filter, tag});
    const noteCards = generateNoteCards(notesFiltered);

    return <>
        <div className={styles.controls}>
            <div className={styles.tagHeader}>
                <button onClick={() => setTag(null)}>{"<"}</button>
                <span>{tagDisplay(tag)}</span>
            </div>
            <NoteFilter
                filter={{...filter, tag}}
                setFilter={setFilter}
            />
            <NotePaginator
                total={found}
                filter={{...filter, tag}}
                setFilter={setFilter}
            />
        </div>
        <div className={styles.list}>
            {noteCards}
        </div>
    </>;
}
