import { TFile } from "obsidian";
import { NoteType } from "./dependencies";


const RE_TEMPLATE = /{{(?<what>.+?):(?<fmt>.+?)(?<mod>:.+?)?}}/gm;


/* ========== *
 * Module API *
 * ========== */

export async function replaceTemplates(type: NoteType, date: moment.Moment, note: TFile) {
    // 1. Read the file
    const content = await app.vault.read(note);

    // 2. Find and replace all the templates in the file
    const newContent = content.replace(RE_TEMPLATE, (_, what, fmt, mod) => fmtTemplate(type, date, what, fmt, mod));

    // 3. Update the file with the new content
    await app.vault.modify(note, newContent);
}


/* ===== *
 * Types *
 * ===== */

type Formatter = (date: moment.Moment, fmt: string, mod?: string) => string;

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

const fmtAllWeeksInMonth: Formatter = (date, fmt, mod) => {
    const mods = {
        "linklist": ["- [[", "\n", "]]"],
        "linkenum": ["[[", ", ", "]]"],
    } as const;

    if (!mod || !(mod in mods)) {
        return `\`unknown mod '${mod}' (available ${Object.keys(mods)})\``;
    }

    const [prefix, separator, suffix] = mods[mod as keyof typeof mods];

    const month = date.month();
    const weeks: string[] = [];
    date.date(1);
    while (date.month() === month) {
        date.add(1, "day");
        const dateText = date.format(fmt);
        if (!weeks.includes(dateText)) {
            weeks.push(dateText);
        }
    }
    return weeks.map(weekText => prefix + weekText + suffix).join(separator);
};

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
        // Magic thing to format every week in the month and join them
        "week*": fmtAllWeeksInMonth,
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


function fmtTemplate(type: NoteType, date: moment.Moment, what: string, fmt: string, mod?: string): string {
    const noteFmts = FMT[type];
    const whatFmt = noteFmts[what]
    if (whatFmt) {
        return whatFmt(date.clone(), fmt, mod?.substring(1));
    }
    return `\`unknown formatter '${what}'\``;
}
