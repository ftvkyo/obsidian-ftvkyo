const periods = [
    "year",
    "quarter",
    "month",
    "week",
    "day",
] as const;


export type MomentPeriods = typeof periods[number][1];


export function equalUpTo(
    date1: moment.Moment,
    date2: moment.Moment,
    upTo: MomentPeriods,
) {
    for (const p of periods) {
        if (date1[p]() !== date2[p]()) {
            return false;
        }
        if (upTo === p) {
            break;
        }
    }
    return true;
}
