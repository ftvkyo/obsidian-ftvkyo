import {useCallback, useState} from "react";

import {DataArray} from "obsidian-dataview";

import {openFile} from "@/note/open";
import {usePlugin} from "@/ui/context";
import {type ViewElement} from "./view";
import NoteCard from "../components/NoteCard";
import Selector from "../components/Selector";
import ObsidianFtvkyo from "@/main";


// TODO: Display a warning if there are notes with the same
// name in different folders.


function acquireSeries(notes: DataArray<Record<string, any>>) {
    const tags = notes.file.tags;

    // Count the number of notes in each series.
    const series: Record<string /* key */, number> = {};
    for (const tag of tags) {
        if (tag.startsWith("#s/")) {
            const count = series[tag] ?? 0;
            series[tag] = count + 1;
        }
    }

    // Sort the series by name.
    const seriesAbc: [string, string][] = Object.entries(series)
        .map(([key, value]) => {
            const name = key.substring(3);
            const record: [string, string] = [key, `${name} (${value})`];
            return record;
        })
        .sort((a, b) => a[0].localeCompare(b[0]));

    const seriesWithout = notes.filter(page => {
        // Only pages that have no series tags.
        return !page.file.tags.map((tag: string) => tag.startsWith("#s/")).includes(true);
    });

    // Add a "Without series" option.
    seriesAbc.unshift(["!", `Without series (${seriesWithout.length})`]);

    // Add an "All" option.
    seriesAbc.unshift(["*", `All (${notes.length})`]);
    return {seriesAbc, seriesWithout};
}


function filterNotesBySeries(
    notes: DataArray<Record<string, any>>,
    series: string,
    withoutSeries: DataArray<Record<string, any>>,
) {
    const includeAnySeries = series === "*";
    const onlyWithoutSeries = series === "!";

    const notesFiltered = includeAnySeries ? notes
        : onlyWithoutSeries ? withoutSeries
        : notes.filter(page => page.file.tags.includes(series));

    return notesFiltered;
}


function acquireSections(notes: DataArray<Record<string, any>>) {
    // Currently note sections are determined by note path.

    const sections: Record<string /* key */, number> = {};

    for (const note of notes) {
        const path = note.file.path;

        const parts = path.split("/");

        // Expecting the parts to be:
        // 0. Root note directory
        // 1. Section
        // 2. Year
        // 3. Note identifier (filename)

        // Extract the section:
        const section = parts[1];

        // Count the number of notes in each section.
        const count = sections[section] ?? 0;
        sections[section] = count + 1;
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
    notes: DataArray<Record<string, any>>,
    section: string,
) {
    const includeAnySection = section === "*";

    return includeAnySection
        ? notes
        : notes.filter(page => {
            const path = page.file.path;
            const parts = path.split("/");
            const noteSection = parts[1];
            return noteSection === section;
        });
}


function generateNoteCards(
    notes: DataArray<Record<string, any>>,
    openNote: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>,
) {
    return notes
        .map(page => <NoteCard
            key={page.file.name}
            filename={page.file.name}
            openNoteCallback={openNote} />
        );
}


async function openNoteCallback(this: ObsidianFtvkyo, e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href) {
        await openFile(this, href);
    }
}


const NavView: ViewElement = {
    Element: () => {
        const plugin = usePlugin();
        const {dv, notesSource} = plugin;

        const [currentSeries, setCurrentSeries] = useState<string>("*" /* all */);
        const [currentSection, setCurrentSection] = useState<string>("*" /* all */);

        // Create a universal note opener to avoid making one for every note.
        const openNote = useCallback(openNoteCallback.bind(plugin), []);

        const notes = dv.pages(notesSource);

        // Acquire series tags for building a selector.
        const {seriesAbc, seriesWithout} = acquireSeries(notes);

        const currentSeriesNotes = filterNotesBySeries(notes, currentSeries, seriesWithout);

        // Create a series selector.
        const seriesSelector = <Selector
            label="Series"
            options={seriesAbc}
            value={currentSeries}
            onChange={setCurrentSeries}
        />;

        // Acquire sections based on current series so we get nice numbers.
        const sectionsAbc = acquireSections(currentSeriesNotes);
        const currentSectionNotes = filterNotesBySection(currentSeriesNotes, currentSection);

        // Create a section selector.
        const sectionSelector = <Selector
            label="Section"
            options={sectionsAbc}
            value={currentSection}
            onChange={setCurrentSection}
        />;

        const noteCards = generateNoteCards(
            currentSectionNotes,
            openNote,
        );

        return <>
            <div className="filters">
                {seriesSelector}
                {sectionSelector}
            </div>
            <div className="results">
                {noteCards}
            </div>
        </>;
    },
    viewType: "ftvkyo-navigation",
    displayText: "Ftvkyo Navigation",
    icon: "lucide-folder-tree",
};

export default NavView;
