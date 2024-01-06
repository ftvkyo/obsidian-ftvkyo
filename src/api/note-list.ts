import { equalUpTo, MomentPeriods } from "@/util/date";
import { ApiNote, ApiNotePeriodic, ApiNoteUnique } from "./note";


export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
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


export interface DirectoryTree {
    subs: Record<string, DirectoryTree>,
    notes: ApiNoteUnique[],
}


export class ApiNoteUniqueList extends ApiNoteList<ApiNoteUnique> {

    get directoryTree(): DirectoryTree {
        const tree = {
            subs: {},
            notes: [],
        };

        const addNote = (tree: DirectoryTree, path: string[], note: ApiNoteUnique) => {
            if (path.length === 0) {
                throw "Recursion too deep, no path?";
            }

            if (path.length === 1) {
                tree.notes.push(note);
                return;
            }

            const thispath = path.shift();
            if (thispath) {
                tree.subs[thispath] ??= { subs: {}, notes: [] };
                addNote(tree.subs[thispath] as DirectoryTree, path, note);
            }
        };

        for (const note of this.notes) {
            addNote(tree, note.pathparts, note);
        }

        return tree;
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
