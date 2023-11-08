import { useEffect, useRef, useState } from "react";

import NoteCard from "./parts/NoteCard";
import {ApiNoteUniqueList, ApiWhere, Tag, TriState} from "@/api/note-list";
import NoteFilter from "./parts/NoteFilter";
import NotePaginator from "./parts/NotePaginator";

import styles from "./NoteList.module.scss";
import Icon from "./controls/Icon";
import { ApiNoteUnique } from "@/api/note";
import { useOnNoteClick } from "@/util/note-click";
import { clsx } from "clsx";


// TODO: Display a warning if there are notes with the same
// name in different folders.

// TODO: Logic to count the notes in dropdowns based on the
// current search?
// It's tricky because we have to make it so:
// - The selected tag does not affect its own dropdown, as
//   we can only select 1.
// - Other stuff :)


function NoteListControls({
    w,
    setW,
    found,
    goBack,
    rootNote,
}: {
    w: ApiWhere,
    setW: (f: ApiWhere) => void,
    found: number,
    goBack: () => void,
    rootNote: ApiNoteUnique | undefined,
}) {
    const [filtering, setFiltering] = useState(false);

    const {onClick: rootOnC, onAuxClick: rootOnAC} = useOnNoteClick(rootNote);
    const rootBroken = rootNote?.broken;
    const rootLink = rootNote
        ? <a
            onClick={rootOnC}
            onAuxClick={rootOnAC}

            className={clsx(styles.displayingWhat, rootBroken && styles.rootBroken)}
            aria-label={rootBroken || undefined}
        >
            {w.tag.display}
        </a>
        : <span className={styles.displayingWhat}>
            {w.tag.display}
        </span>;

    return <div className={styles.controls}>
        <div className={styles.header}>
            <Icon
                icon="arrow-left"
                onClick={goBack}
            />
            {rootLink}
            <Icon
                icon={w.keyIcon}
                onClick={() => setW(w.keyNext())}
            />
            <Icon
                icon={w.dirIcon}
                onClick={() => setW(w.dirNext())}
            />
            <Icon
                icon="filter"
                pressed={filtering}
                onClick={() => {
                    setW(w.resetFilter());
                    setFiltering(!filtering);
                }}
            />
        </div>

        {filtering ? <NoteFilter
            w={w}
            setW={setW}
        /> : null}

        <NotePaginator
            total={found}
            w={w}
            setW={setW}
        />
    </div>;
}


function NoteCards({
    notes
}: {
    notes: ApiNoteUniqueList
}) {
    const listRef = useRef<HTMLDivElement | null>(null);

    // Only scroll to top when the notes displayed actually change.
    // useEffect's deps are checked by Object.is, so we can't just pass an array.
    const noteBases = JSON.stringify(notes.notes.map((note) => note.base));
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = 0;
        }
    }, [noteBases]);

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
    goBack,
    notes,
}: {
    tag: Tag,
    goBack: () => void,
    notes: ApiNoteUniqueList,
}) {
    const [where, setWhere] = useState(
        ApiWhere.default
            .withTag(tag)
            .withPage(0)
            .root(TriState.Off)
    );

    const rootNote = notes.find(note => note.rootFor === tag.raw);
    const {notes: notesFiltered, found} = notes.where(where);

    return <>
        <NoteListControls
            w={where}
            setW={setWhere}
            found={found}
            goBack={goBack}
            rootNote={rootNote ?? undefined}
        />

        <NoteCards
            notes={notesFiltered}
        />
    </>;
}
