import {TFile} from "obsidian";

import ApiNote from "./note";


export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
}


export enum TagWildcard {
    All,
    Any,
    None,
}


export class Tag {
    constructor(
        public readonly raw: string | TagWildcard
    ) {}

    static all = new Tag(TagWildcard.All);

    static any = new Tag(TagWildcard.Any);

    static none = new Tag(TagWildcard.None);

    get display() {
        switch (this.raw) {
            case TagWildcard.All:
                return "All";
            case TagWildcard.Any:
                return "With tags";
            case TagWildcard.None:
                return "No tags";
            default:
                return "#" + this.raw;
        }
    }
}


export type TagMap = {
    [id: string]: {
        notes: ApiNote[],
        noteRoot?: ApiNote,
    },
};


export type TagTree = {
    // Unlike `TagMap`, this is a recursive
    // structure, and the keys are path bits.
    [bit: string]: {
        notes: ApiNote[],
        noteRoot?: ApiNote,
        subtags: TagTree,
    }
};



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

    // Get a map from tags to notes.
    // Does not include subnotes into tag notes.
    get tags() {
        return this.notes
            .reduce((acc, note) => {
                for (const tag of note.tags) {
                    const tacc = acc[tag] ?? {
                        notes: [],
                    };
                    acc[tag] = tacc;

                    tacc.notes.push(note);
                    if (note.isRoot && !note.invalid) {
                        tacc.noteRoot = note;
                    }
                }
                return acc;
            }, {} as TagMap);
    }

    // Get a tree of maps from tags to their notes and children.
    // Does include subnotes from child tags into tags' own notes.
    get tagTree() {
        const walkTagTree = (acc: TagTree, path: string[], info: TagMap[keyof TagMap]) => {
            const bit = path.shift();
            if (!bit) {
                // Recursion stop
                return;
            }

            const tag = acc[bit] ?? {
                notes: [],
                subtags: {},
            };
            acc[bit] = tag;

            tag.notes.push(...info.notes);
            if (path.length === 0) {
                // If we are at the bottom, also can add a root note
                tag.noteRoot = info.noteRoot;
            }

            walkTagTree(tag.subtags, path, info);
        };

        const res = Object.entries(this.tags)
            .reduce((acc, [id, info]) => {
                const path = id.split("/");
                walkTagTree(acc, path, info);
                return acc;
            }, {} as TagTree);

        return res;
    }

    // TODO: make the filter an class rather than just an object, so things like
    // resetting the page on changing other filters are not forgotten at the usage site.

    // Filter the notes.
    where({
        tag = Tag.all,
        title = TriState.Maybe,
        todos = TriState.Maybe,
        date = TriState.Maybe,
        invalid = TriState.Maybe,
        orderKey = "date",
        orderDir = "desc",
        page = undefined,
    }: {
        // What tag to require.
        tag?: Tag,
        // Heading presence
        title?: TriState,
        // Note status
        todos?: TriState,
        // Whether the note has a date
        date?: TriState,
        // Note validity
        invalid?: TriState,
        // How to order the notes.
        orderKey?: "date" | "title",
        orderDir?: "asc" | "desc",
        // Pagination, undefined = all results
        page?: number,
    }): {notes: ApiNoteList, found: number} {
        let notes = this.notes;

        if (tag !== Tag.all) {
            notes = notes.filter(note => {
                // No tags.
                if (tag === Tag.none) {
                    return note.tags.length === 0;
                }
                // At least some tags.
                if (tag === Tag.any) {
                    return note.tags.length !== 0;
                }
                // Include both tags themselves and their subtags
                for (const nt of note.tags) {
                    if (nt === tag.raw) {
                        return true;
                    }
                    if (nt.startsWith(tag.raw + "/")) {
                        return true;
                    }
                }
                return false;
            });
        }

        if (title === TriState.On) {
            notes = notes.filter(note => note.title !== null);
        } else if (title === TriState.Off) {
            notes = notes.filter(note => note.title === null);
        }

        if (todos === TriState.On) {
            notes = notes.filter(note => note.hasTodos);
        } else if (todos === TriState.Off) {
            notes = notes.filter(note => !note.hasTodos);
        }

        if (date === TriState.On) {
            notes = notes.filter(note => note.date);
        } else if (date === TriState.Off) {
            notes = notes.filter(note => !note.date);
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

        if (page !== undefined) {
            const start = ftvkyo.settings.resultsPerPage * page;
            const end = start + ftvkyo.settings.resultsPerPage;
            notes = notes.slice(start, end);
        }

        return {notes: new ApiNoteList(notes), found: count};
    }
}

export type NoteFilterType = Required<Parameters<typeof ApiNoteList.prototype.where>[0]>;
