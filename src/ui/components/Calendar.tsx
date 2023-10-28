import { moment } from "obsidian";
import { useState } from "react";
import Icon from "./controls/Icon";
import { clsx } from "clsx";
import { ApiNotePeriodicList } from "@/api/note-list";
import { equalUpTo, MomentPeriods } from "@/util/date";

import styles from "./Calendar.module.scss";


function reset() {
    return moment().weekday(0);
}


function NoteAny({
    className,
    period,
    date,
    notes,
    children,
}: {
    className?: string,
    period: MomentPeriods,
    date: moment.Moment,
    notes: ApiNotePeriodicList,
    children: React.ReactNode,
}) {
    const note = notes.getThe(period, date);

    return <div
        className={clsx(
            "clickable-icon",
            styles.note,
            className,
            note && styles.exists,
        )}
        onClick={note ? () => note.reveal() : undefined}
    >
        {children}
    </div>;
}


interface NoteDateProps {
    date: moment.Moment,
    today: moment.Moment,
}


interface NotesTakerProps {
    notes: ApiNotePeriodicList,
}


function NoteYear({
    date,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    const current = equalUpTo(date, today, "year");

    return <NoteAny
        className={clsx(styles.year, current && styles.current)}
        period={"year"}
        date={date}
        notes={notes}
    >
        {date.format("Y")}
    </NoteAny>;
}


function NoteQuarter({
    date,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    const current = equalUpTo(date, today, "quarter");

    return <NoteAny
        className={clsx(styles.quarter, current && styles.current)}
        period={"quarter"}
        date={date}
        notes={notes}
    >
        {date.format("[Q]Q")}
    </NoteAny>;
}


function NoteMonth({
    date,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    const current = equalUpTo(date, today, "month");

    return <NoteAny
        className={clsx(styles.month, current && styles.current)}
        period={"month"}
        date={date}
        notes={notes}
    >
        {date.format("MMM")}
    </NoteAny>;
}


function NoteWeek({
    date,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    const current = equalUpTo(date, today, "week");

    return <NoteAny
        className={clsx(styles.week, current && styles.current)}
        period={"week"}
        date={date}
        notes={notes}
    >
        {date.format("w")}
    </NoteAny>;
}


function NoteDay({
    date,
    today,
    showingMonth, // We need to darken days of other months
    notes,
}: NoteDateProps & NotesTakerProps & {
    showingMonth: moment.Moment,
}) {
    const current = equalUpTo(date, today, "day");

    const otherMonth = !equalUpTo(date, showingMonth, "month");

    return <NoteAny
        className={clsx(
            styles.day,
            current && styles.current,
            otherMonth && styles.otherMonth,
        )}
        period={"day"}
        date={date}
        notes={notes}
    >
        {date.format("D")}
    </NoteAny>;
}


function CalendarHeader({
    date,
    today,
    setDate,
    notes,
}: NoteDateProps & NotesTakerProps & {
    setDate: (date: moment.Moment) => void,
}) {
    return <div className={styles.header}>
        <NoteMonth date={date} today={today} notes={notes}/>
        <NoteYear date={date} today={today} notes={notes}/>
        <NoteQuarter date={date} today={today} notes={notes}/>

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
    notes,
}: NoteDateProps & NotesTakerProps & {
    showingMonth: moment.Moment,
}) {
    return <div className={styles.weekRow}>
        <NoteWeek
            date={date}
            today={today}
            notes={notes}
        />
        {weekdayOffsets.map(offset => <NoteDay
            key={offset}
            date={date.clone().add(offset, "days")}
            today={today}
            showingMonth={showingMonth}
            notes={notes}
        />)}
    </div>;
}


const weekOffsets = [
    -7,
    0,
    7,
];


export default function Calendar({
    notes,
}: NotesTakerProps) {
    const today = moment();

    // What date to center the calendar around.
    // .weekday is locale-aware.
    const [date, setDate] = useState(reset());

    return <div className={styles.calendar}>
        <CalendarHeader
            date={date}
            today={today}
            setDate={setDate}
            notes={notes}
        />
        <CalendarWeekHeader
            date={date}
        />
        {weekOffsets.map(offset => <CalendarWeek
            key={offset}
            date={date.clone().add(offset, "days")}
            today={today}
            showingMonth={date}
            notes={notes}
        />)}
    </div>;
}
