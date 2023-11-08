import { equalUpTo, MomentPeriods } from "@/util/date";
import { ApiNote, ApiNotePeriodic, ApiNoteUnique } from "./note";


export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
}

type TS = TriState;
const TS = TriState;


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


export interface TagMap {
    [id: string]: {
        notes: ApiNoteUnique[],
        noteRoot?: ApiNoteUnique,
    },
}


export interface TagTree {
    // Unlike `TagMap`, this is a recursive
    // structure, and the keys are path bits.
    [bit: string]: {
        notes: ApiNoteUnique[],
        noteRoot?: ApiNoteUnique,
        subtags: TagTree,
    },
}


interface WhereFilter {
    title: TS,
    tasks: TS,
    dated: TS,
    broken: TS,
    root: TS,
}

interface WhereOrder {
    key: "base" | "title",
    dir: "asc" | "desc",
}


export class ApiWhere {

    constructor(
        public readonly tag: Tag = Tag.all,
        public readonly filter: WhereFilter = {
            title: TS.Maybe,
            tasks: TS.Maybe,
            dated: TS.Maybe,
            broken: TS.Maybe,
            root: TS.Maybe,
        },
        public readonly order: WhereOrder = {
            key: "base",
            dir: "desc",
        },
        // TODO: Maybe page does not belong here, actually.
        public readonly page: number | undefined = undefined,
    ) {}

    static default = new ApiWhere();

    static init(tag: Tag) {
        return ApiWhere.default.withTag(tag).withPage(0);
    }

    /* ================== *
     * Flexible modifiers *
     * ================== */

    resetTag() {
        return new ApiWhere(
            ApiWhere.default.tag,
            this.filter,
            this.order,
            this.pageZero,
        );
    }

    withTag(tag: Tag) {
        return new ApiWhere(
            tag,
            this.filter,
            this.order,
            this.pageZero,
        );
    }

    resetOrder() {
        return new ApiWhere(
            this.tag,
            this.filter,
            ApiWhere.default.order,
            this.pageZero,
        );
    }

    withOrder(order: Partial<WhereOrder>) {
        return new ApiWhere(
            this.tag,
            this.filter,
            {
                ...this.order,
                ...order,
            },
            this.pageZero,
        );
    }

    resetFilter() {
        return new ApiWhere(
            this.tag,
            ApiWhere.default.filter,
            this.order,
            this.pageZero,
        );
    }

    withFilter(filter: Partial<WhereFilter>) {
        return new ApiWhere(
            this.tag,
            {
                ...this.filter,
                ...filter,
            },
            this.order,
            this.pageZero,
        );
    }

    withPage(page: number | undefined) {
        return new ApiWhere(
            this.tag,
            this.filter,
            this.order,
            page,
        );
    }

    /* ================ *
     * Filter shortcuts *
     * ================ */

    title(title: WhereFilter["title"]) {
        return this.withFilter({title});
    }

    tasks(tasks: WhereFilter["tasks"]) {
        return this.withFilter({tasks});
    }

    dated(dated: WhereFilter["dated"]) {
        return this.withFilter({dated});
    }

    broken(broken: WhereFilter["broken"]) {
        return this.withFilter({broken});
    }

    root(root: WhereFilter["root"]) {
        return this.withFilter({root});
    }

    /* =============== *
     * Order shortcuts *
     * =============== */

    key(key: WhereOrder["key"]) {
        return this.withOrder({key});
    }

    keyNext() {
        switch (this.order.key) {
            case "base":
                return this.key("title");
            case "title":
                return this.key("base");
            default:
                throw new Error(`Unreachable: unknown key '${this.order.key}'`);
        }
    }

    get keyIcon() {
        switch (this.order.key) {
            case "base":
                return "list-tree";
            case "title":
                return "heading-1";
            default:
                throw new Error(`Unreachable: unknown key '${this.order.key}'`);
        }
    }

    dir(dir: WhereOrder["dir"]) {
        return this.withOrder({dir});
    }

    dirNext() {
        switch (this.order.dir) {
            case "asc":
                return this.dir("desc");
            case "desc":
                return this.dir("asc");
            default:
                throw new Error(`Unreachable: unknown dir '${this.order.dir}'`);
        }
    }

    get dirIcon() {
        switch (this.order.dir) {
            case "asc":
                return "sort-asc";
            case "desc":
                return "sort-desc";
            default:
                throw new Error(`Unreachable: unknown dir '${this.order.dir}'`);
        }
    }

    /* ================ *
     * Paging shortcuts *
     * ================ */

    // Get the page 0 if it's set and undefined otherwise.
    get pageZero() {
        return this.page === undefined ? undefined : 0;
    }

    // Assume that the page is set, get it, throw otherwise.
    get pageSet() {
        if (this.page === undefined) {
            throw new Error("Page is not set");
        }
        return this.page;
    }

    pageNone() {
        return this.withPage(undefined);
    }

    pageFirst() {
        return this.withPage(this.pageZero);
    }

    pageNext() {
        if (this.page === undefined) {
            throw new Error("Can't increment page as it's not set");
        }
        return this.withPage(this.page + 1);
    }

    pagePrev() {
        if (this.page === undefined) {
            throw new Error("Can't decrement page as it's not set");
        }
        return this.withPage(this.page - 1);
    }
}


export abstract class ApiNoteList<Note extends ApiNote> {

    constructor(
        public readonly notes: Note[],
    ) {}

    get length() {
        return this.notes.length;
    }

    find(predicate: (note: Note) => boolean) {
        return this.notes.find(predicate) ?? null;
    }

    map<Res>(f: (note: Note) => Res): Res[] {
        return this.notes.map(f);
    }
}


export class ApiNoteUniqueList extends ApiNoteList<ApiNoteUnique> {

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
                    if (note.rootFor && !note.broken) {
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

    // Filter the notes.
    where(w: ApiWhere): {notes: ApiNoteUniqueList, found: number} {
        const {
            tag,
            filter: {
                title,
                tasks,
                dated,
                broken,
                root,
            },
            order: {
                key,
                dir,
            },
            page,
        } = w;

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

        if (title === TS.On) {
            notes = notes.filter(note => note.title !== null);
        } else if (title === TS.Off) {
            notes = notes.filter(note => note.title === null);
        }

        if (tasks === TS.On) {
            notes = notes.filter(note => note.hasTasks);
        } else if (tasks === TS.Off) {
            notes = notes.filter(note => !note.hasTasks);
        }

        if (dated === TS.On) {
            notes = notes.filter(note => note.isDated);
        } else if (dated === TS.Off) {
            notes = notes.filter(note => !note.isDated);
        }

        if (broken === TS.On) {
            notes = notes.filter(note => note.broken !== false);
        } else if (broken === TS.Off) {
            notes = notes.filter(note => note.broken === false);
        }

        if (root === TS.On) {
            notes = notes.filter(note => note.rootFor);
        } else if (root == TS.Off) {
            notes = notes.filter(note => !note.rootFor);
        }

        const keyF = key === "title"
            ? (e: ApiNoteUnique) => e.title ?? e.base
            : (e: ApiNoteUnique) => e.base;

        notes = notes.sort((a, b) => keyF(a).localeCompare(keyF(b)));

        if (dir === "desc") {
            notes = notes.reverse();
        }

        const count = notes.length;

        if (page !== undefined) {
            const start = ftvkyo.settings.resultsPerPage * page;
            const end = start + ftvkyo.settings.resultsPerPage;
            notes = notes.slice(start, end);
        }

        return {notes: new ApiNoteUniqueList(notes), found: count};
    }
}


export class ApiNotePeriodicList extends ApiNoteList<ApiNotePeriodic> {

    getThe(
        period: MomentPeriods,
        date: moment.Moment,
    ) {
        return this.find((note) => {
            const { period: np, date: nd } = note;
            return np === period && equalUpTo(nd, date, period);
        });
    }
}
