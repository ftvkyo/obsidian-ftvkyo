import {useState} from "react";

import {DataArray} from "obsidian-dataview";

import {usePlugin} from "@/ui/context";
import {type ViewElement} from "./view";
import NoteCard from "../components/NoteCard";
import Selector from "../components/Selector";
import ApiNote from "@/api/note";
import Toggle from "../components/Toggle";


// TODO: Display a warning if there are notes with the same
// name in different folders.

// TODO: Filters for sections as toggles rather than a select.

// TODO: Filter for notes with/without titles.


function acquireSeries(notes: DataArray<ApiNote>) {
    // Count the number of occurences of each series.
    const seriesCounted: Record<string /* key */, number> = {};
    for (const s of notes.series) {
        const count = seriesCounted[s] ?? 0;
        seriesCounted[s] = count + 1;
    }

    // Sort the series by name.
    const seriesAbc: [string, string][] = Object.entries(seriesCounted)
        .map(([name, value]) => {
            const record: [string, string] = [name, `${name} (${value})`];
            return record;
        })
        .sort((a, b) => a[0].localeCompare(b[0]));

    const notesWithoutSeries = notes.filter(note => {
        // Only pages that have no series tags.
        return note.series.length === 0;
    });

    // Add a "Without series" option.
    seriesAbc.unshift(["!", `Without series (${notesWithoutSeries.length})`]);

    // Add an "All" option.
    seriesAbc.unshift(["*", `All (${notes.length})`]);

    return {seriesAbc, notesWithoutSeries};
}


function filterNotesBySeries(
    notes: DataArray<ApiNote>,
    series: string,
    notesWithoutSeries: DataArray<ApiNote>,
) {
    const includeAnySeries = series === "*";
    const onlyWithoutSeries = series === "!";

    const notesFiltered = includeAnySeries ? notes
        : onlyWithoutSeries ? notesWithoutSeries
        : notes.filter(page => page.series.includes(series));

    return notesFiltered;
}


function acquireSections(notes: DataArray<ApiNote>) {
    // Note section is defined as `type` field in frontmatter

    const sections: Record<string /* key */, number> = {};

    for (const note of notes) {
        if (note.type === null) {
            continue;
        }

        // Count the number of notes in each section.
        const count = sections[note.type] ?? 0;
        sections[note.type] = count + 1;
    }

    // Sort the sections by name.
    const sectionsAbc: [string, string][] = Object.entries(sections)
        .map(([key, value]) => {
            const record: [string, string] = [key, `${key} (${value})`];
            return record;
        })
        .sort((a, b) => a[0].localeCompare(b[0]));

    const notesWithoutSection = notes.filter(note => {
        // Only pages that have no series tags.
        return note.type === null;
    });

    // Add a "Without section" option.
    sectionsAbc.unshift(["!", `Without section (${notesWithoutSection.length})`]);

    // Add an "All" option.
    sectionsAbc.unshift(["*", `All (${notes.length})`]);

    return {sectionsAbc, notesWithoutSection};
}


function filterNotesBySection(
    notes: DataArray<ApiNote>,
    section: string,
    notesWithoutSection: DataArray<ApiNote>,
) {
    const includeAnySection = section === "*";
    const onlyWithoutSection = section === "!";

    const notesFiltered = includeAnySection ? notes
        : onlyWithoutSection ? notesWithoutSection
        : notes.filter(note => note.type === section);

    return notesFiltered;
}


function generateNoteCards(
    notes: DataArray<ApiNote>,
) {
    return notes
        .map(note => <NoteCard
            key={note.base}
            note={note}
        />);
}


const NavView: ViewElement = {
    Element: () => {
        const plugin = usePlugin();
        const {dv, settings} = plugin;

        const [currentSeries, setCurrentSeries] = useState<string>("*" /* all */);
        const [currentSection, setCurrentSection] = useState<string>("*" /* all */);

        const [onlyWithH1, setOnlyWithH1] = useState<boolean>(false);

        const notes = dv.pages(`"${settings.notesRoot}"`)
            .map(ApiNote.fromDv)
            .filter(n => n !== null) as DataArray<ApiNote>;

        // Acquire series tags for building a selector.
        const {seriesAbc, notesWithoutSeries} = acquireSeries(notes);

        const currentSeriesNotes = filterNotesBySeries(notes, currentSeries, notesWithoutSeries);

        // Create a series selector.
        const seriesSelector = <Selector
            label="Series"
            options={seriesAbc}
            value={currentSeries}
            onChange={setCurrentSeries}
        />;

        // Acquire sections based on current series so we get nice numbers.
        const {sectionsAbc, notesWithoutSection} = acquireSections(currentSeriesNotes);

        const currentSectionNotes = filterNotesBySection(currentSeriesNotes, currentSection, notesWithoutSection);

        // Create a section selector.
        const sectionSelector = <Selector
            label="Section"
            options={sectionsAbc}
            value={currentSection}
            onChange={setCurrentSection}
        />;

        const onlyWithH1Notes = onlyWithH1
            ? currentSectionNotes.filter(note => {
                return note.h1 !== null;
            })
            : currentSectionNotes;

        // Create a checkbox for filtering notes with/without titles.
        const onlyWithTitleCheckbox = <Toggle
            label="Only notes with level-1 headings"
            checked={onlyWithH1}
            onChange={setOnlyWithH1}
        />;

        const noteCards = generateNoteCards(
            onlyWithH1Notes,
        );

        return <>
            <div className="filters">
                {seriesSelector}
                {sectionSelector}
                {onlyWithTitleCheckbox}
            </div>
            <div className="results">
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
