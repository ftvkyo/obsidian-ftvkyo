import { moment } from "obsidian";
import { useState } from "react";
import Icon from "./controls/Icon";
import ApiNote from "@/api/note";

import styles from "./Calendar.module.scss";
import { clsx } from "clsx";


function reset() {
    return moment().weekday(0);
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


function NoteYear({
    date,
}: {
    date: moment.Moment,
}) {
    return <NoteAny
        className={styles.year}
    >
        {date.format("Y")}
    </NoteAny>;
}


function NoteQuarter({
    date,
}: {
    date: moment.Moment,
}) {
    return <NoteAny>
        {date.format("[Q]Q")}
    </NoteAny>;
}


function NoteMonth({
    date,
}: {
    date: moment.Moment,
}) {
    return <NoteAny>
        {date.format("MMM")}
    </NoteAny>;
}


function NoteWeek({
    date,
}: {
    date: moment.Moment,
}) {
    return <NoteAny
        className={styles.week}
    >
        {date.format("w")}
    </NoteAny>;
}


function NoteDay({
    date,
}: {
    date: moment.Moment,
}) {
    return <NoteAny>
        {date.format("D")}
    </NoteAny>;
}


function CalendarHeader({
    date,
    setDate
}: {
    date: moment.Moment,
    setDate: (date: moment.Moment) => void,
}) {
    return <div className={styles.header}>
        <NoteMonth date={date}/>
        <NoteYear date={date}/>
        <NoteQuarter date={date}/>

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
    start,
}: {
    start: moment.Moment,
}) {
    return <div className={styles.weekHeader}>
        <div>
            W
        </div>
        {weekdayOffsets.map(offset => <div
            key={offset}
        >
            {start.clone().add(offset, "days").format("ddd")}
        </div>)}
    </div>;
}


function CalendarWeek({
    start,
}: {
    start: moment.Moment,
}) {
    return <div className={styles.weekRow}>
        <NoteWeek date={start}/>
        {weekdayOffsets.map(offset => <NoteDay
            key={offset}
            date={start.clone().add(offset, "days")}
        />)}
    </div>;
}


const weekOffsets = [
    -7,
    0,
    7,
];


export default function Calendar() {
    // What date to center the calendar around.
    // .weekday is locale-aware.
    const [date, setDate] = useState(reset());

    return <div className={styles.calendar}>
        <CalendarHeader date={date} setDate={setDate}/>
        <CalendarWeekHeader start={date}/>
        {weekOffsets.map(offset => <CalendarWeek
            key={offset}
            start={date.clone().add(offset, "days")}
        />)}
    </div>;
}
