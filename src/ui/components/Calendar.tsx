import { moment } from "obsidian";
import { useCallback, useState } from "react";
import Icon from "./controls/Icon";
import { clsx } from "clsx";
import { ApiNotePeriodicList } from "@/api/note-list";
import { equalUpTo, MomentPeriods } from "@/util/date";

import styles from "./Calendar.module.scss";
import { ApiNotePeriodic } from "@/api/note";


function dateToday(locale: moment.LocaleSpecifier) {
    return moment().locale(locale).hour(0).minute(0).second(0);
}


function dateWeekStart(locale: moment.LocaleSpecifier) {
    return dateToday(locale).weekday(0);
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
    const periodConfig = ftvkyo.deps.periodic[period];
    const note = notes.getThe(period, date);

    const onClick = useCallback(async (
        replace: boolean,
    ) => {
        if (note) {
            note.reveal({ replace });
        } else {
            const newNote = await ftvkyo.deps.createNote(period, date);
            new ApiNotePeriodic(newNote, date, period).reveal({ replace });
        }
    }, [note]);

    return <div
        className={clsx(
            "clickable-icon",
            styles.note,
            className,
            note && styles.exists,
            !periodConfig && styles.disabled,
        )}
        onClick={(e) => onClick(!e.ctrlKey)}
        onAuxClick={(e) => (e.button === 1) && onClick(false)}
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
        className={clsx(styles.year, current && styles.today)}
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
        className={clsx(styles.quarter, current && styles.today)}
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
        className={clsx(styles.month, current && styles.today)}
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
    extended,
}: NoteDateProps & NotesTakerProps & {
    extended?: boolean,
}) {
    const current = equalUpTo(date, today, "week");

    return <NoteAny
        className={clsx(styles.week, current && styles.today)}
        period={"week"}
        date={date}
        notes={notes}
    >
        {extended && "W"}
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
            current && styles.today,
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
    collapse,
}: NoteDateProps & NotesTakerProps & {
    setDate: (date: moment.Moment) => void,
    collapse: () => void,
}) {
    return <div className={styles.header}>
        <NoteYear date={date} today={today} notes={notes}/>
        <NoteQuarter date={date} today={today} notes={notes}/>

        <div className={styles.break}/>

        <NoteMonth date={date} today={today} notes={notes}/>

        <div className={styles.controls}>
            <Icon
                icon="chevron-up"
                onClick={() => setDate(date.clone().add(-1, "week"))}
            />
            <Icon
                icon="reset"
                onClick={() => setDate(dateWeekStart(ftvkyo.momentLocale))}
            />
            <Icon
                icon="chevron-down"
                onClick={() => setDate(date.clone().add(+1, "week"))}
            />
            <Icon
                icon="calendar-minus"
                onClick={collapse}
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


function CalendarCompact({
    date,
    today,
    notes,
    expand,
}: NoteDateProps & NotesTakerProps & {
    expand: () => void,
}) {
    return <div className={styles.header}>
        <NoteYear date={date} today={today} notes={notes}/>
        <NoteQuarter date={date} today={today} notes={notes}/>

        <div className={styles.break}/>

        <NoteMonth date={date} today={today} notes={notes}/>
        <NoteDay date={today} today={today} notes={notes} showingMonth={today}/>

        <div className={styles.break}/>

        <NoteWeek date={date} today={today} notes={notes} extended/>

        <div className={styles.controls}>
            <Icon
                icon="calendar-plus"
                onClick={expand}
            />
        </div>
    </div>;
}


const weekOffsets = [
    -1,
    0,
    1,
];


export default function Calendar({
    notes,
}: NotesTakerProps) {
    const today = dateToday(ftvkyo.momentLocale);

    const [compact, setCompact] = useState(true);

    // What date to center the calendar around.
    // .weekday is locale-aware.
    const [date, setDate] = useState(dateWeekStart(ftvkyo.momentLocale));

    if (compact) {
        return <div className={styles.calendar}>
            <CalendarCompact
                date={date}
                today={today}
                notes={notes}
                expand={() => setCompact(false)}
            />
        </div>;
    }

    return <div className={styles.calendar}>
        <CalendarHeader
            date={date}
            today={today}
            setDate={setDate}
            notes={notes}
            collapse={() => setCompact(true)}
        />
        <CalendarWeekHeader
            date={date}
        />
        {weekOffsets.map(offset => <CalendarWeek
            key={offset}
            date={date.clone().add(offset, "week")}
            today={today}
            showingMonth={date}
            notes={notes}
        />)}
    </div>;
}
