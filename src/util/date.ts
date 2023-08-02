type DatePiece = {
    d: "year" | "month" | "day" | "hour" | "minute" | "second";
};

type DatePieceOrLiteral = DatePiece | { l: string };

type DateFormat = readonly DatePieceOrLiteral[];


function extractDatePiece(
    date: Date,
    piece: DatePiece,
): [number /* value */, number /* padding */] {
    switch (piece.d) {
        case "year":
            return [date.getFullYear(), 4];
        case "month":
            return [date.getMonth() + 1, 2];
        case "day":
            return [date.getDate(), 2];
        case "hour":
            return [date.getHours(), 2];
        case "minute":
            return [date.getMinutes(), 2];
        case "second":
            return [date.getSeconds(), 2];
    }
}

function fmtDatePiece(
    date: Date,
    piece: DatePieceOrLiteral,
) {
    if ("l" in piece) {
        return piece.l;
    }

    const [value, padding] = extractDatePiece(date, piece);
    return value.toString().padStart(padding, "0");
}

function fmtDate(
    date: Date,
    fmt: DateFormat,
) {
    return fmt.map((f) => fmtDatePiece(date, f)).join("");
}

export function fmtFilename(
    date: Date,
) {
    const fmt = [
        {d: "year"},
        {d: "month"},
        {d: "day"},
        {l: "-"},
        {d: "hour"},
        {d: "minute"},
        {d: "second"},
    ] as const;

    return fmtDate(date, fmt);
}

export function fmtPrefix(
    date: Date,
) {
    const fmt = [
        {d: "year"},
    ] as const;

    return fmtDate(date, fmt);
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
