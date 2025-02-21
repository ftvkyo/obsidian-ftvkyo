import {ApiFile, ApiFileKind} from "@/api/source";


const periods = [
    "year",
    "quarter",
    "month",
    "week",
    "date",
] as const;


export type MomentPeriods = typeof periods[number];


export interface NotesTakerProps {
    notes: ApiFile<ApiFileKind>[],
    // Expected to be today
    today: moment.Moment,
}


export function equalUpTo(
    date1: moment.Moment,
    date2: moment.Moment,
    upTo: MomentPeriods,
): boolean {
    // These need to be processed separately:
    // - Year -> Quarter -> Month -> Day
    // - Year -> Week

    if (upTo === "week") {
        return date1.isoWeekYear() === date2.isoWeekYear() && date1.isoWeek() === date2.isoWeek();
    }

    if (upTo === "date") {
        // Note: day is about weekdays...
        return equalUpTo(date1, date2, "month") && date1.date() === date2.date();
    }

    for (const p of ["year", "quarter", "month"] as const) {
        if (date1[p]() !== date2[p]()) {
            return false;
        }
        if (upTo === p) {
            break;
        }
    }
    return true;
}


export function dateNow() {
    return ftvkyo.moment();
}


export function dateToday() {
    return dateNow().hour(0).minute(0).second(0);
}


export function dateWeekStart() {
    return dateToday().weekday(0);
}
