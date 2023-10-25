import { useCallback, useState } from "react";

import NoteCard from "./parts/NoteCard";
import ApiNoteList, {NoteFilterType, Tag, TriState} from "@/api/note-list";
import NoteFilter from "./parts/NoteFilter";
import NotePaginator from "./parts/NotePaginator";

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


const filterDefaults = {
    title: TriState.Maybe,
    todos: TriState.Maybe,
    date: TriState.Maybe,
    invalid: TriState.Maybe,
};


function NoteListControls({
    tag,
    setTag,
    filter,
    setFilter,
    found,
}: {
    tag: Tag,
    setTag: (t: Tag | null) => void,
    filter: Omit<NoteFilterType, "tag">,
    setFilter: (f: Omit<NoteFilterType, "tag">) => void,
    found: number,
}) {
    const [filtering, setFiltering] = useState(false);

    return <div className={styles.controls}>
        <div className={styles.header}>
            <Icon
                icon="arrow-left"
                onClick={() => setTag(null)}
            />
            <span>{tag.display}</span>
            <Icon
                icon={filter.orderKey === "date" ? "calendar" : "type"}
                onClick={() => setFilter({
                    ...filter,
                    orderKey: filter.orderKey === "date" ? "title" : "date",
                    page: 0,
                })}
            />
            <Icon
                icon={"sort-" + filter.orderDir}
                onClick={() => setFilter({
                    ...filter,
                    orderDir: filter.orderDir === "asc" ? "desc" : "asc",
                    page: 0,
                })}
            />
            <Icon
                icon="filter"
                pressed={filtering}
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
    </div>;
}


function NoteCards({
    notes
}: {
    notes: ApiNoteList
}) {
    const listRef = useCallback((node: HTMLElement | null) => {
        if (node) {
            node.scrollTop = 0;
        }
    }, [notes]);

    return <div
        ref={listRef}
        className={styles.list}
    >
        {notes.notes.map(note => <NoteCard
            key={note.base}
            note={note}
        />)}
    </div>;
}



export default function NoteList({
    tag,
    setTag,
    notes,
}: {
    tag: Tag,
    setTag: (t: Tag | null) => void,
    notes: ApiNoteList,
}) {
    const [filter, setFilter] = useState<Omit<NoteFilterType, "tag">>({
        ...filterDefaults,
        orderKey: "date",
        orderDir: "desc",
        page: 0,
    });

    const {notes: notesFiltered, found} = notes.where({...filter, tag});

    return <>
        <NoteListControls
            tag={tag}
            setTag={setTag}
            filter={filter}
            setFilter={setFilter}
            found={found}
        />

        <NoteCards
            notes={notesFiltered}
        />
    </>;
}
