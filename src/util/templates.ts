import { TFile } from "obsidian";
import { NoteType } from "./dependencies";


const RE_TEMPLATE = /{{(?<what>.+?):(?<fmt>.+?)}}/gm;


/* ========== *
 * Module API *
 * ========== */

export async function replaceTemplates(type: NoteType, date: moment.Moment, note: TFile) {
    // 1. Read the file
    const content = await app.vault.read(note);

    // 2. Find and replace all the templates in the file
    const newContent = content.replace(RE_TEMPLATE, (_, what, fmt) => fmtTemplate(type, date, what, fmt));

    // 3. Update the file with the new content
    await app.vault.modify(note, newContent);
}


/* ===== *
 * Types *
 * ===== */

type Formatter = (date: moment.Moment, fmt: string) => string;

type NoteFormatters = {
    [key: string]: Formatter,
}

type FormatConfig = {
    [key in NoteType]: NoteFormatters;
};


/* ==================== *
 * Available formatters *
 * ==================== */

const fmtIdentity: Formatter = (date, fmt) => date.format(fmt);
// Days in week start at 0
const fmtWeekday: (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => Formatter = (day) => (date, fmt) => date.weekday(day).format(fmt);

const FMT: FormatConfig = {
    unique: {
        date: fmtIdentity,
    },
    year: {
        date: fmtIdentity,
    },
    quarter: {
        date: fmtIdentity,
    },
    month: {
        date: fmtIdentity,
        // Dates in month start at 1
        first: (date, fmt) => date.date(1).format(fmt),
        // Months have variable lengths, so go to the next month and underflow.
        last: (date, fmt) => date.add(1, "month").date(0).format(fmt),
    },
    week: {
        date: fmtIdentity,
        mon: fmtWeekday(0),
        tue: fmtWeekday(1),
        wed: fmtWeekday(2),
        thu: fmtWeekday(3),
        fri: fmtWeekday(4),
        sat: fmtWeekday(5),
        sun: fmtWeekday(6),
    },
    date: {
        date: fmtIdentity,
    },
};


function fmtTemplate(type: NoteType, date: moment.Moment, what: string, fmt: string): string {
    const noteFmts = FMT[type];
    const whatFmt = noteFmts[what]
    if (whatFmt) {
        return whatFmt(date.clone(), fmt);
    }
    return `\`unknown formatter '${what}'\``;
}
