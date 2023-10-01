import { TriState } from "@/ui/components/TriToggle";
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

    // Get all unique tags of the notes.
    get tags(): string[] {
        return this.notes
            .flatMap(note => note.tags)
            .filter(onlyUnique)
            .array();
    }

    // Get all unique tags of the notes,
    // sorted alphabetically.
    get tagsAbc(): string[] {
        return this.tags
            .sort((a, b) => a.localeCompare(b));
    }

    // Get all unique tags of the notes,
    // with the number of notes for each tag.
    // Counts all notes towards "" (empty string) key.
    // Counts notes without tags towards "!" key.
    // Counts notes with at least some tags towards "?" key.
    get tagsCounted(): { [key: string]: number } {
        const tags = this.notes
            .flatMap(note => note.tags)
            .array();

        const tagsCounted = tags
            .reduce((prev, curr) => {
                prev[curr] = (prev[curr] ?? 0) + 1;
                return prev;
            }, {} as { [key: string]: number });

        const withoutTags = this.where({
            tag: "!",
        }).notes;

        return {
            "": this.notes.length,
            "!": withoutTags.length,
            "?": tags.length,
            ...tagsCounted,
        };
    }

    // Sorted version of tagsCounted.
    get tagsCountedAbc(): [string, number][] {
        return Object.entries(this.tagsCounted)
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
    // Special syntax for `type` and `tag`:
    // - "" => Match all.
    // - "!" => Match only nulls.
    // - "?" => Match only non-nulls.
    // - else => Match only the given value.
    //
    where({
        type = "",
        tag = "",
        title: heading = TriState.Maybe,
        wip = TriState.Maybe,
        invalid = TriState.Maybe,
        orderKey = "date",
        orderDir = "desc",
    }: {
        // What type to match.
        // - Uses special syntax.
        type?: string,
        // What tag to require.
        // - Uses special syntax.
        tag?: string,
        // Heading presence
        title?: TriState,
        // Note status
        wip?: TriState,
        // Note validity
        invalid?: TriState,
        // How to order the notes.
        orderKey?: "date" | "title",
        orderDir?: "asc" | "desc",
    }) {
        let notes = this.notes;

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

        // "" is falsy so no need for a special case
        if (tag) {
            notes = notes.filter(note => {
                if (tag === "!") {
                    // No tags.
                    return note.tags.length === 0;
                }
                if (tag === "?") {
                    // At least some tags.
                    return note.tags.length !== 0;
                }
                return note.tags.includes(tag)
            });
        }

        if (heading === TriState.On) {
            notes = notes.filter(note => note.title !== null);
        } else if (heading === TriState.Off) {
            notes = notes.filter(note => note.title === null);
        }

        if (wip === TriState.On) {
            notes = notes.filter(note => note.wip);
        } else if (wip === TriState.Off) {
            notes = notes.filter(note => !note.wip);
        }

        if (invalid === TriState.On) {
            notes = notes.filter(note => note.invalid !== false);
        } else if (invalid === TriState.Off) {
            notes = notes.filter(note => note.invalid === false);
        }

        const keyF = orderKey === "title"
            ? (e: ApiNote) => e.title ?? e.base
            : (e: ApiNote) => e.base;

        notes = notes.sort(keyF, orderDir);

        return new ApiNoteList(notes);
    }
}

export type NoteFilterType = Required<Parameters<typeof ApiNoteList.prototype.where>[0]>;
