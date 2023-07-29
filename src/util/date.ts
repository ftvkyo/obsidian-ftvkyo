function fmtDatePiece(
    date: Date,
    options: Intl.DateTimeFormatOptions,
) {
    if (typeof options === "string") {
        return options;
    }

    const formatter = new Intl.DateTimeFormat("en-GB", options);
    return formatter.format(date);
}

function fmtDate(
    date: Date,
    options: any[],
) {
    return options.map((o) => fmtDatePiece(date, o)).join("");
}

export function fmtFilename(
    date: Date,
) {
    const options = [
        {year: "numeric"},
        {month: "2-digit"},
        {day: "2-digit"},
        "-",
        {hour: "2-digit"},
        {minute: "2-digit"},
        {second: "2-digit"},
    ];

    return fmtDate(date, options);
}

export function fmtPrefix(
    date: Date,
) {
    const options = [
        {year: "numeric"},
    ];

    return fmtDate(date, options);
}

export function fmtTitle(
    kind: "journal" | "static" | string,
    date: Date,
    topic: string,
) {
    if (typeof topic !== "string") {
        throw new Error("Topic must be a string");
    }

    if (kind === "journal") {
        if (topic) {
            throw new Error("Journal notes don't have topics");
        }

        const options = [
            {year: "numeric"},
            ".",
            {month: "2-digit"},
            ".",
            {day: "2-digit"},
            ", ",
            {weekday: "long"},
            ", ",
            {hour: "2-digit"},
            ":",
            {minute: "2-digit"},
            ":",
            {second: "2-digit"},
        ];

        return fmtDate(date, options);
    }

    if (kind === "static") {
        const options = [
            {year: "numeric"},
            ".",
            {month: "2-digit"},
            ".",
            {day: "2-digit"},
            ": ",
            topic
        ];

        return fmtDate(date, options);
    }

    return topic;
}

export function filenameToPretty(filename: string) {
    const parts = filename.split(/[-.]/);
    const date = parts[0];
    const time: string | undefined = parts[1];

    if (!date || date.length !== 8) {
        throw new Error(`Invalid date in filename ${filename}`);
    }

    const y = date.substring(0, 4);
    const m = date.substring(4, 6);
    const d = date.substring(6, 8);

    if (!time) {
        return `${y}/${m}/${d}`;
    }

    if (time.length !== 6) {
        throw new Error(`Invalid time in filename ${filename}`);
    }

    const h = time.substring(0, 2);
    const min = time.substring(2, 4);
    const s = time.substring(4, 6);

    return `${y}/${m}/${d} ${h}:${min}:${s}`;
}
