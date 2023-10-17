import { TriState } from "@/ui/components/controls/TriToggle";
import {TFile} from "obsidian";

import ApiNote from "./note";


// To be used by .filter() to get only unique values.
function onlyUnique<T>(
    value: T,
    index: number,
    array: T[],
) {
    return array.indexOf(value) === index;
}


export enum TagWildcard {
    All,
    Any,
    None,
}


export function tagDisplay(tag: string | TagWildcard) {
    if (tag === TagWildcard.All) {
        return "All notes";
    }
    if (tag === TagWildcard.Any) {
        return "Any tags";
    }
    if (tag === TagWildcard.None) {
        return "Without tags";
    }
    return "#" + tag;
}


export default class ApiNoteList {

    constructor(
        public readonly notes: ApiNote[],
    ) {}

    static from(files: TFile[]) {
        return new ApiNoteList(
            files.map(ApiNote.from)
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
            .sort((a, b) => a.localeCompare(b));
    }

    // Get all unique tags of the notes,
    // with the number of notes for each tag.
    get tagsCounted(): [string, number][] {
        const tags = this.notes
            .flatMap(note => note.tags);

        return Object.entries(
            tags.reduce((prev, curr) => {
                prev[curr] = (prev[curr] ?? 0) + 1;
                return prev;
            }, {} as { [key: string]: number })
        ).sort(([a], [b]) => a.localeCompare(b));
    }

    // Filter the notes.
    where({
        tag = TagWildcard.All,
        title: heading = TriState.Maybe,
        wip = TriState.Maybe,
        invalid = TriState.Maybe,
        orderKey = "date",
        orderDir = "desc",
        onPage = undefined,
        page = 0,
    }: {
        // What tag to require.
        tag?: string | TagWildcard,
        // Heading presence
        title?: TriState,
        // Note status
        wip?: TriState,
        // Note validity
        invalid?: TriState,
        // How to order the notes.
        orderKey?: "date" | "title",
        orderDir?: "asc" | "desc",
        // Pagination
        onPage?: number,
        page?: number,
    }): {notes: ApiNoteList, found: number} {
        let notes = this.notes;

        if (tag !== TagWildcard.All) {
            notes = notes.filter(note => {
                // No tags.
                if (tag === TagWildcard.None) {
                    return note.tags.length === 0;
                }
                // At least some tags.
                if (tag === TagWildcard.Any) {
                    return note.tags.length !== 0;
                }
                // Include both tags themselves and their subtags
                for (const nt of note.tags) {
                    if (nt === tag) {
                        return true;
                    }
                    if (nt.startsWith(tag + "/")) {
                        return true;
                    }
                }
                return false;
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

        notes = notes.sort((a, b) => keyF(a).localeCompare(keyF(b)));

        if (orderDir === "desc") {
            notes = notes.reverse();
        }

        const count = notes.length;

        if (page && onPage) {
            notes = notes.slice(onPage * page);
        }

        if (onPage !== undefined) {
            notes = notes.slice(undefined, onPage);
        }

        return {notes: new ApiNoteList(notes), found: count};
    }
}

export type NoteFilterType = Required<Parameters<typeof ApiNoteList.prototype.where>[0]>;
