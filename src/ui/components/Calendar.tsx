import { moment } from "obsidian";
import { useState } from "react";
import Icon from "./controls/Icon";
import ApiNote from "@/api/note";

import styles from "./Calendar.module.scss";
import { clsx } from "clsx";


function reset() {
    return moment().weekday(0);
}


const dateComponents = [
    "year",
    "quarter",
    "month",
    "week",
    "day",
] as const;


function isToday(
    date: moment.Moment,
    today: moment.Moment,
    upTo: typeof dateComponents[number],
) {
    for (const component of dateComponents) {
        if (date[component]() !== today[component]()) {
            return false;
        }
        if (component === upTo) {
            break;
        }
    }
    return true;
}


function NoteAny({
    className,
    note,
    children,
}: {
    className?: string,
    note?: ApiNote,
    children: React.ReactNode,
}) {
    return <div
        className={clsx(styles.note, className, "clickable-icon")}
        onClick={note ? () => note.reveal() : undefined}
    >
        {children}
    </div>;
}


interface NoteDateProps {
    date: moment.Moment,
    today: moment.Moment,
}


function NoteYear({
    date,
    today,
}: NoteDateProps) {
    const current = isToday(date, today, "year");

    return <NoteAny
        className={clsx(styles.year, current && styles.current)}
    >
        {date.format("Y")}
    </NoteAny>;
}


function NoteQuarter({
    date,
    today,
}: NoteDateProps) {
    const current = isToday(date, today, "quarter");

    return <NoteAny
        className={clsx(styles.quarter, current && styles.current)}
    >
        {date.format("[Q]Q")}
    </NoteAny>;
}


function NoteMonth({
    date,
    today,
}: NoteDateProps) {
    const current = isToday(date, today, "month");

    return <NoteAny
        className={clsx(styles.month, current && styles.current)}
    >
        {date.format("MMM")}
    </NoteAny>;
}


function NoteWeek({
    date,
    today,
}: NoteDateProps) {
    const current = isToday(date, today, "week");

    return <NoteAny
        className={clsx(styles.week, current && styles.current)}
    >
        {date.format("w")}
    </NoteAny>;
}


function NoteDay({
    date,
    today,
    showingMonth, // We need to darken days of other months
}: NoteDateProps & {
    showingMonth: moment.Moment,
}) {
    const current = isToday(date, today, "day");

    const otherMonth = !isToday(date, showingMonth, "month");

    return <NoteAny
        className={clsx(
            styles.day,
            current && styles.current,
            otherMonth && styles.otherMonth,
        )}
    >
        {date.format("D")}
    </NoteAny>;
}


function CalendarHeader({
    date,
    today,
    setDate,
}: NoteDateProps & {
    setDate: (date: moment.Moment) => void,
}) {
    return <div className={styles.header}>
        <NoteMonth date={date} today={today}/>
        <NoteYear date={date} today={today}/>
        <NoteQuarter date={date} today={today}/>

        <div className={styles.controls}>
            <Icon
                icon="chevron-up"
                onClick={() => setDate(date.clone().add(-7, "days"))}
            />
            <Icon
                icon="reset"
                onClick={() => setDate(reset())}
            />
            <Icon
                icon="chevron-down"
                onClick={() => setDate(date.clone().add(+7, "days"))}
            />
        </div>
    </div>;
}


const weekdayOffsets = [...Array(7).keys()];


function CalendarWeekHeader({
    date, // Expected to be the first day of the week
}: Omit<NoteDateProps, "today">) {
    return <div className={styles.weekHeader}>
        <div>
            W
        </div>
        {weekdayOffsets.map(offset => <div
            key={offset}
        >
            {date.clone().add(offset, "days").format("ddd")}
        </div>)}
    </div>;
}


function CalendarWeek({
    date, // Expected to be the first day of the week
    today,
    showingMonth,
}: NoteDateProps & {
    showingMonth: moment.Moment,
}) {
    return <div className={styles.weekRow}>
        <NoteWeek
            date={date}
            today={today}
        />
        {weekdayOffsets.map(offset => <NoteDay
            key={offset}
            date={date.clone().add(offset, "days")}
            today={today}
            showingMonth={showingMonth}
        />)}
    </div>;
}


const weekOffsets = [
    -7,
    0,
    7,
];


export default function Calendar() {
    const today = moment();

    // What date to center the calendar around.
    // .weekday is locale-aware.
    const [date, setDate] = useState(reset());

    return <div className={styles.calendar}>
        <CalendarHeader
            date={date}
            today={today}
            setDate={setDate}
        />
        <CalendarWeekHeader
            date={date}
        />
        {weekOffsets.map(offset => <CalendarWeek
            key={offset}
            date={date.clone().add(offset, "days")}
            today={today}
            showingMonth={date}
        />)}
    </div>;
}
