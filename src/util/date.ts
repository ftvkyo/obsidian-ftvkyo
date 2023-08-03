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
