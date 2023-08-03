import {useState} from "react";

import {type ViewElement} from "./view";
import NoteCard from "../components/NoteCard";
import Selector from "../components/Selector";
import Toggle from "../components/Toggle";
import ApiNoteList from "@/api/note-list";
import Logger from "@/util/logger";


let lg: Logger | undefined = undefined;


// TODO: Display a warning if there are notes with the same
// name in different folders.

// TODO: Filters for sections as toggles rather than a select.

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


function countedOptions([name, count]: [string, number]): [string, string] {
    const key = name;

    if (name === "") {
        name = "Any";
    }
    if (name === "!") {
        name = "None";
    }
    if (name === "?") {
        name = "Some";
    }

    return [key, `${name} (${count})`];
}


const NavView: ViewElement = {
    Element: () => {
        if (!lg) {
            lg = ftvkyo.lg.sub("nav");
        }

        const [filter, setFilter] = useState({
            series: "",
            types: [""],
            requireH1: false,
        });

        const notes = ApiNoteList.all();

        const series = notes.seriesCountedAbc.map(countedOptions);
        const types = notes.typesCountedAbc.map(countedOptions);

        // Create a series selector.
        const seriesSelector = <Selector
            label="Series"
            options={series}
            value={filter.series}
            onChange={(v) => setFilter({...filter, series: v})}
        />;

        // Create a type selector.
        const typeSelector = <Selector
            label="Type"
            options={types}
            value={filter.types[0] ?? ""}
            onChange={(v) => setFilter({...filter, types: [v]})}
        />;

        // Create a checkbox for filtering notes with/without titles.
        const requireH1Checkbox = <Toggle
            label="Require H1 headings"
            checked={filter.requireH1}
            onChange={(v) => setFilter({...filter, requireH1: v})}
        />;

        const notesFiltered = notes.where(filter);
        const noteCards = generateNoteCards(notesFiltered);

        return <>
            <div className="filters">
                {seriesSelector}
                {typeSelector}
                {requireH1Checkbox}
            </div>
            <div className="results">
                <p>Found {notesFiltered.length} results.</p>
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
