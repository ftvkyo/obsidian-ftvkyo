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


// TODO: maybe store actual TFolders,
//       or look into a structure that can be updated with patches
//       rather than regenerated every time.
export interface DirectoryTree {
    pathparts: string[],
    subs: Record<string, DirectoryTree>,
    notes: ApiNoteUnique[],
}


export class ApiNoteUniqueList extends ApiNoteList<ApiNoteUnique> {

    get directoryTree(): DirectoryTree {
        const tree = {
            pathparts: [],
            subs: {},
            notes: [],
        };

        const addNote = (tree: DirectoryTree, pathparts: string[], note: ApiNoteUnique) => {
            if (pathparts.length === 0) {
                throw "Recursion too deep, no path?";
            }

            if (pathparts.length === 1) {
                tree.notes.push(note);
                return;
            }

            const pathpart = pathparts.shift();
            if (pathpart) {
                tree.subs[pathpart] ??= {
                    // Reaccumulate the path parts for each of the folders
                    pathparts: [...tree.pathparts, pathpart],
                    subs: {},
                    notes: []
                };
                addNote(tree.subs[pathpart] as DirectoryTree, pathparts, note);
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
