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


function generateNoteCards(
    currentSeries: string,
    notes: DataArray<Record<string, any>>,
    seriesWithout: DataArray<Record<string, any>>,
    openNote: (e: React.MouseEvent<HTMLAnchorElement>) => Promise<void>
) {
    const any = currentSeries === "*";
    const withoutSeries = currentSeries === "!";

    const notesFiltered = any ? notes
        : withoutSeries ? seriesWithout
            : notes.filter(page => page.file.tags.includes(currentSeries));

    const noteCards = notesFiltered
        .map(page => <NoteCard
            key={page.file.name}
            filename={page.file.name}
            openNoteCallback={openNote} />
        );

    return noteCards;
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

        const notes = dv.pages(notesSource);

        // Acquire series tags for building a selector.
        const {seriesAbc, seriesWithout} = acquireSeries(notes);

        // Create a series selector.
        const seriesSelector = <Selector
            options={seriesAbc}
            value={currentSeries}
            onChange={setCurrentSeries}
        />;

        // Create a universal note opener to avoid making one for every note.
        const openNote = useCallback(openNoteCallback.bind(plugin), []);

        const noteCards = generateNoteCards(currentSeries, notes, seriesWithout, openNote);

        return <>
            <div className="filters">
                {seriesSelector}
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
