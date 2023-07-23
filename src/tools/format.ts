function fmtDatePiece(
    date: Date,
    options: Intl.DateTimeFormatOptions,
) {
    if (typeof options === "string") {
        return options;
    }

    let formatter = new Intl.DateTimeFormat("en-GB", options);
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
