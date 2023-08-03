import {useState} from "react";

import {DataArray} from "obsidian-dataview";

import {usePlugin} from "@/ui/context";
import {type ViewElement} from "./view";
import NoteCard from "../components/NoteCard";
import Selector from "../components/Selector";
import ApiNote from "@/api/note";


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
    withoutSeries: DataArray<ApiNote>,
) {
    const includeAnySeries = series === "*";
    const onlyWithoutSeries = series === "!";

    const notesFiltered = includeAnySeries ? notes
        : onlyWithoutSeries ? withoutSeries
        : notes.filter(page => page.series.includes(series));

    return notesFiltered;
}


function acquireSections(notes: DataArray<ApiNote>, defaultSection: string) {
    // Note section is defined as `type` field in frontmatter

    const sections: Record<string /* key */, number> = {};

    for (const note of notes) {
        const t = note.type ?? defaultSection;

        // Count the number of notes in each section.
        const count = sections[t] ?? 0;
        sections[t] = count + 1;
    }

    // Sort the sections by name.
    const sectionsAbc: [string, string][] = Object.entries(sections)
        .map(([key, value]) => {
            const record: [string, string] = [key, `${key} (${value})`];
            return record;
        })
        .sort((a, b) => a[0].localeCompare(b[0]));

    // Add an "All" option.
    sectionsAbc.unshift(["*", `All (${notes.length})`]);

    return sectionsAbc;
}


function filterNotesBySection(
    notes: DataArray<ApiNote>,
    section: string,
    defaultSection: string,
) {
    const includeAnySection = section === "*";

    return includeAnySection
        ? notes
        : notes.filter(note => {
            const t = note.type ?? defaultSection;
            return t === section;
        });
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
        const sectionsAbc = acquireSections(currentSeriesNotes, plugin.settings.defaultNoteType);
        const currentSectionNotes = filterNotesBySection(currentSeriesNotes, currentSection, plugin.settings.defaultNoteType);

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
        const onlyWithTitleCheckbox = <label>
            <input
                type="checkbox"
                checked={onlyWithH1}
                onChange={e => setOnlyWithH1(e.target.checked)}
            />
            Only notes with level-1 headings
        </label>;

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
