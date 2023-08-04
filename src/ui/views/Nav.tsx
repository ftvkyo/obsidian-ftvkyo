import {useState} from "react";

import {type ViewElement} from "./view";
import NoteCard from "../components/NoteCard";
import ApiNoteList from "@/api/note-list";
import Logger from "@/util/logger";
import NoteFilter from "../components/NoteFilter";


let lg: Logger | undefined = undefined;


// TODO: Display a warning if there are notes with the same
// name in different folders.

// TODO: Logic to count the notes in dropdowns based on the
// current search?
// It's tricky because we have to make it so:
// - The selected series does not affect its own dropdown, as
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


const NavView: ViewElement = {
    Element: () => {
        if (!lg) {
            lg = ftvkyo.lg.sub("nav");
        }

        const [filter, setFilter] = useState({
            series: "",
            type: "",
            tag: "",
            requireH1: false,
        });

        const notes = ApiNoteList.all();

        const notesFiltered = notes.where(filter);
        const noteCards = generateNoteCards(notesFiltered);

        return <>
            <NoteFilter
                notes={notes}
                filter={filter}
                setFilter={setFilter}
            />
            <p
                className="note-counter"
            >
                Found {notesFiltered.length} results.
            </p>
            <div className="note-list">
                {noteCards}
            </div>
        </>;
    },
    short: "nav",
    viewType: "ftvkyo-navigation",
    displayText: "Ftvkyo Navigation",
    icon: "lucide-folder-tree",
};

export default NavView;
