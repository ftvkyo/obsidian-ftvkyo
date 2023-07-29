import { useCallback, useState } from "react";

import { openFile } from "@/note/open";
import { usePlugin } from "@/ui/context";
import { type ViewElement } from "./view";
import NoteCard from "../components/NoteCard";
import Selector from "../components/Selector";


// TODO: Display a warning if there are notes with the same
// name in different folders.


const NavView: ViewElement = {
    Element: () => {
        const plugin = usePlugin();
        const { dv, notesSource } = plugin;

        const [currentSeries, setCurrentSeries] = useState<string>("*" /* all */);

        const notes = dv.pages(notesSource);

        // Acquire series tags for building a selector.

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

        // Add a "Without series" option.
        seriesAbc.unshift(["!", "Without series"]);

        // Add an "All" option.
        seriesAbc.unshift(["*", "All"]);

        // Create a series selector.
        const seriesSelector = <Selector
            options={seriesAbc}
            value={currentSeries}
            onChange={setCurrentSeries}
        />;

        // Create a universal note opener to avoid making one for every note.
        const openNote = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            const href = e.currentTarget.getAttribute("href");
            if (href) {
                await openFile(plugin, href);
            }
        }, []);

        return <>
            {seriesSelector}
            {notes
                // Filter series to show.
                .filter(page => {
                    const any = currentSeries === "*";
                    const withoutSeries = currentSeries === "!" && !page.file.tags.map((tag: string) => tag.startsWith("#s/")).includes(true);

                    return any || withoutSeries || page.file.tags.includes(currentSeries);
                })
                .map(page =>
                    <NoteCard
                        key={page.file.name}
                        filename={page.file.name}
                        openNoteCallback={openNote}
                    />
                )
            }
        </>;
    },
    viewType: "ftvkyo-navigation",
    displayText: "Ftvkyo Navigation",
    icon: "lucide-folder-tree",
};

export default NavView;
