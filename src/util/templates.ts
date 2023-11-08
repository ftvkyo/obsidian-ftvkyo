import { NoteType } from "@/api/source";
import { TFile } from "obsidian";
import { equalUpTo } from "./date";


const RE_TEMPLATE = /{{(?<what>.+?):(?<fmt>.+?)(?<flags>:.+?)?}}/gm;


/* ========== *
 * Module API *
 * ========== */

export async function replaceTemplates(noteType: NoteType, date: moment.Moment, note: TFile) {
    // 1. Read the file
    const content = await app.vault.read(note);

    // 2. Find and replace all the templates in the file
    const newContent = content.replace(RE_TEMPLATE, (_, what: string, fmt: string, flags: string | undefined) => {
        return fmtTemplate(noteType, date, what, fmt, flags ? flags.substring(1).split(",") : []);
    });

    // 3. Update the file with the new content
    await app.vault.modify(note, newContent);
}


/* ===== *
 * Types *
 * ===== */

type Formatter = (date: moment.Moment, fmt: string, flags: string[]) => string;

type FormatterDecorator = (f: Formatter) => Formatter;

type DateMultiplicator = (date: moment.Moment) => moment.Moment[];

type DateReducer = (entries: string[]) => string;

type NoteFormatters = {
    [key: string]: Formatter,
}

type FormatConfig = {
    [key in NoteType]: NoteFormatters;
};


/* ==================== *
 * Formatter decorators *
 * ==================== */

const maybeLinks: FormatterDecorator = f => (date, fmt, flags) => {
    const text = f(date, fmt, flags)
    if (!flags.includes("link")) {
        return text;
    }

    return `[[${text}]]`;
};

const list: DateReducer = entries => {
    return entries.map(e => `- ${e}\n`).join("");
};

const enumerate: DateReducer = entries => {
    return entries.join(", ");
};


/* =================== *
 * Date multiplicators *
 * =================== */

const eachWeekInMonth: DateMultiplicator = (date) => {
    const day = date.clone().date(1);
    const weeks: moment.Moment[] = [];
    while (equalUpTo(day, date, "month")) {
        const weekExists = weeks.find(w => equalUpTo(w, day, "week"));
        if (!weekExists) {
            weeks.push(day.clone());
        }
        day.add(1, "day");
    }
    return weeks;
}

/* ==================== *
 * Available formatters *
 * ==================== */

const fmtIdentity: Formatter = maybeLinks((date, fmt) => date.format(fmt));

// Days in week start at 0
const fmtWeekday: (day: 0 | 1 | 2 | 3 | 4 | 5 | 6) => Formatter = (day) => maybeLinks((date, fmt) => date.weekday(day).format(fmt));

const fmtWeeksInMonth: Formatter = (date, fmt, flags) => {
    const weeks = eachWeekInMonth(date);
    const entries = weeks.map(w => fmtIdentity(w, fmt, flags));

    if (flags.includes("list")) {
        return list(entries);
    }

    return enumerate(entries);
}

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
        "weeks": fmtWeeksInMonth,
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


function fmtTemplate(noteType: NoteType, date: moment.Moment, what: string, fmt: string, flags: string[]): string {
    const noteFmts = FMT[noteType];
    const whatFmt = noteFmts[what]
    if (whatFmt) {
        return whatFmt(date.clone(), fmt, flags);
    }
    return `\`unknown formatter '${what}'\``;
}
