import { equalUpTo, MomentPeriods } from "@/util/date";
import { ApiNotePeriodic } from "./note";


export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
}


export abstract class ApiNoteList<Note> {

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
