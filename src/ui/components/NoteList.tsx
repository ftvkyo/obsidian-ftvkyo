import { useCallback, useState } from "react";

import NoteCard from "./parts/NoteCard";
import ApiNoteList, {NoteFilterType, TagWildcard, tagDisplay} from "@/api/note-list";
import NoteFilter from "./parts/NoteFilter";
import NotePaginator from "./parts/NotePaginator";
import { TriState } from "./controls/TriToggle";

import styles from "./NoteList.module.scss";
import Icon from "./controls/Icon";


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
    const filterDefaults = {
        title: TriState.Maybe,
        todos: TriState.Maybe,
        date: TriState.Maybe,
        invalid: TriState.Maybe,
    }

    const [filter, setFilter] = useState<Omit<NoteFilterType, "tag">>({
        ...filterDefaults,
        orderKey: "date",
        orderDir: "desc",
        page: 0,
    });

    const [filtering, setFiltering] = useState(false);

    const {notes: notesFiltered, found} = notes.where({...filter, tag});
    const noteCards = generateNoteCards(notesFiltered);

    const listRef = useCallback((node: HTMLElement | null) => {
        if (node) {
            node.scrollTop = 0;
        }
    }, noteCards);

    return <>
        <div className={styles.controls}>
            <div className={styles.tagHeader}>
                <Icon
                    icon="arrow-left"
                    onClick={() => setTag(null)}
                />
                <span>{tagDisplay(tag)}</span>
                <Icon
                    icon="filter"
                    active={filtering}
                    onClick={() => {
                        setFilter({...filter, ...filterDefaults});
                        setFiltering(!filtering);
                    }}
                />
            </div>

            {filtering ? <NoteFilter
                filter={{...filter, tag}}
                setFilter={setFilter}
            /> : null}

            <NotePaginator
                total={found}
                filter={{...filter, tag}}
                setFilter={setFilter}
            />
        </div>
        <div
            ref={listRef}
            className={styles.list}
        >
            {noteCards}
        </div>
    </>;
}
