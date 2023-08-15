import { DataArray } from "obsidian-dataview";

import ApiNote from "./note";


// To be used by .filter() to get only unique values.
function onlyUnique<T>(
    value: T,
    index: number,
    array: T[],
) {
    return array.indexOf(value) === index;
}


export default class ApiNoteList {

    constructor(
        public readonly notes: DataArray<ApiNote>,
    ) {}

    static all() {
        return ApiNoteList.from(`"${ftvkyo.settings.notesRoot}"`);
    }

    // Find all the notes in the source in the vault.
    static from(source: string) {
        return new ApiNoteList(
            ftvkyo.dv.pages(source)
                .map(ApiNote.fromDv)
                .filter(n => n !== null) as DataArray<ApiNote>
        );
    }

    get length() {
        return this.notes.length;
    }

    // Get all unique series of the notes.
    get series(): string[] {
        return this.notes
            .flatMap(note => note.series)
            .filter(onlyUnique)
            .array();
    }

    // Get all unique series of the notes,
    // sorted alphabetically.
    get seriesAbc(): string[] {
        return this.series
            .sort((a, b) => a.localeCompare(b));
    }

    // Get all unique series of the notes,
    // with the number of notes in each series.
    // Counts all notes towards "" (empty string) key.
    // Counts notes without series towards "!" key.
    // Counts notes with at least some series towards "?" key.
    get seriesCounted(): { [key: string]: number } {
        const series = this.notes
            .flatMap(note => note.series)
            .array();

        const seriesCounted = series
            .reduce((prev, curr) => {
                prev[curr] = (prev[curr] ?? 0) + 1;
                return prev;
            }, {} as { [key: string]: number });

        const withoutSeries = this.where({
            series: "!",
        }).notes;

        return {
            "": this.notes.length,
            "!": withoutSeries.length,
            "?": series.length,
            ...seriesCounted,
        };
    }

    // Sorted version of seriesCounted.
    get seriesCountedAbc(): [string, number][] {
        return Object.entries(this.seriesCounted)
        .sort(([a], [b]) => a.localeCompare(b));
    }

    // Get the list of types of the notes.
    get types(): string[] {
        return this.notes
            .map(note => note.type)
            .filter(type => type !== null)
            .filter(onlyUnique)
            .array() as string[];
    }

    // Get the list of types of the notes,
    // with the number of notes of each type.
    get typesCounted() {
        const types = this.notes
            .map(note => note.type)
            .filter(type => type !== null)
            .array() as string[];

        const typesCounted = types
            .reduce((prev, curr) => {
                prev[curr] = (prev[curr] ?? 0) + 1;
                return prev;
            }, {} as { [key: string]: number });

        const withoutType = this.where({
            type: "!",
        }).notes;

        return {
            "": this.notes.length,
            "!": withoutType.length,
            "?": types.length,
            ...typesCounted,
        };
    }

    // Sorted version of typesCounted.
    get typesCountedAbc(): [string, number][] {
        return Object.entries(this.typesCounted)
            .sort(([a], [b]) => a.localeCompare(b));
    }

    // Filter the notes.
    //
    // Special syntax for series and type:
    // - "" => Match all.
    // - "!" => Match only nulls.
    // - "?" => Match only non-nulls.
    // - else => Match only the given value.
    //
    where({
        series = "",
        type = "",
        tags = {},
        requireH1 = false,
        requireWip = false,
        requireLoose = false,
        orderKey = "date",
        orderDir = "desc",
    }: {
        // What series to match.
        // - Uses special syntax.
        series?: string,
        // What type to match.
        // - Uses special syntax.
        type?: string,
        // What tags to require.
        tags?: Record<string, boolean | undefined>,
        // Whether to only include notes with a single H1.
        requireH1?: boolean,
        // Whether to only include notes with `status: wip`.
        requireWip?: boolean,
        // Whether to only include notes that have expansion potential.
        requireLoose?: boolean,
        // How to order the notes.
        orderKey?: "date" | "title",
        orderDir?: "asc" | "desc",
    }) {
        let notes = this.notes;

        // "" is falsy so no need for a special case
        if (series) {
            notes = notes.filter(note => {
                if (series === "!") {
                    // No series.
                    return note.series.length === 0;
                }
                if (series === "?") {
                    // At least some series.
                    return note.series.length !== 0;
                }
                return note.series.includes(series)
            });
        }

        // "" is falsy so no need for a special case
        if (type) {
            notes = notes.filter(note => {
                if (type === "!") {
                    // No type.
                    return note.type === null;
                }
                if (type === "?") {
                    // At least some type.
                    return note.type !== null;
                }
                return note.type === type;
            });
        }

        if (tags) {
            notes = notes.filter(note => {
                return Object.entries(tags)
                    .every(([tag, enabled]) => !enabled || note.tags.includes(tag));
            });
        }

        if (requireH1) {
            notes = notes.filter(note => note.h1 !== null);
        }

        if (requireWip) {
            notes = notes.filter(note => note.wip);
        }

        if (requireLoose) {
            notes = notes.filter(note => note.loose);
        }

        const keyF = orderKey === "title"
            ? (e: ApiNote) => e.h1 ?? e.base
            : (e: ApiNote) => e.base;

        notes = notes.sort(keyF, orderDir);

        return new ApiNoteList(notes);
    }
}

export type NoteFilterType = Required<Parameters<typeof ApiNoteList.prototype.where>[0]>;
