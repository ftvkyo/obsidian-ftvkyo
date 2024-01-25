import { useCallback, useState } from "react";
import Icon from "./controls/Icon";
import { clsx } from "clsx";
import { ApiNotePeriodicList } from "@/api/note-list";
import { equalUpTo, MomentPeriods } from "@/util/date";
import { revealNote } from "@/api/note";

import styles from "./Calendar.module.scss";


function dateToday() {
    return ftvkyo.moment().hour(0).minute(0).second(0);
}


function dateWeekStart() {
    return dateToday().weekday(0);
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
    const periodTemplate = ftvkyo.api.source.getTemplate(period);
    const note = notes.getThe(period, date);

    const onClick = useCallback(async (
        replace: boolean,
    ) => {
        if (note) {
            revealNote(note.tf, { replace });
        } else if (periodTemplate) {
            const newNote = await ftvkyo.api.source.createPeriodicNote(period, date);
            revealNote(newNote, { replace });
        }
    }, [note, period, date, periodTemplate?.path]);

    return <div
        className={clsx(
            "clickable-icon",
            styles.note,
            className,
            note && styles.exists,
            !(periodTemplate || note) && styles.disabled,
        )}
        onClick={(e) => onClick(!e.ctrlKey)}
        onAuxClick={(e) => (e.button === 1) && onClick(false)}
    >
        {children}
    </div>;
}


interface NoteDateProps {
    // Expected to be the Monday of the week we are displaying
    week: moment.Moment,
    // Expected to be today
    today: moment.Moment,
}


interface NotesTakerProps {
    notes: ApiNotePeriodicList,
}


function NoteYear({
    week,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    const current = equalUpTo(week, today, "year");

    return <NoteAny
        className={clsx(styles.year, current && styles.today)}
        period={"year"}
        date={week}
        notes={notes}
    >
        {week.format("Y")}
    </NoteAny>;
}


function NoteQuarter({
    week,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    const current = equalUpTo(week, today, "quarter");

    return <NoteAny
        className={clsx(styles.quarter, current && styles.today)}
        period={"quarter"}
        date={week}
        notes={notes}
    >
        {week.format("[Q]Q")}
    </NoteAny>;
}


function NoteMonth({
    week,
    today,
    notes,
}: NoteDateProps & NotesTakerProps) {
    // This is tricky, as the calendar is week-centric rather than month-centric.
    // A week may have days from 2 different months in it.
    // So which month we want to display depends on the today date.
    // However, we want to display the month of monday when we scroll up/down.
    // So the solution would be to check whether `today` and `date` are in the same week.

    const displayingTodayWeek = equalUpTo(week, today, "week");
    const displayingMonthFor = displayingTodayWeek ? today : week;

    const current = equalUpTo(week, today, "month");

    return <NoteAny
        className={clsx(styles.month, current && styles.today)}
        period={"month"}
        date={displayingMonthFor}
        notes={notes}
    >
        {displayingMonthFor.format("MMM")}
    </NoteAny>;
}


function NoteWeek({
    week,
    today,
    notes,
    extended,
}: NoteDateProps & NotesTakerProps & {
    extended?: boolean,
}) {
    const current = equalUpTo(week, today, "week");

    return <NoteAny
        className={clsx(styles.week, current && styles.today)}
        period={"week"}
        date={week}
        notes={notes}
    >
        {extended && "W"}
        {week.format("w")}
    </NoteAny>;
}


function NoteDay({
    date,
    today,
    centerWeek,
    notes,
}: NotesTakerProps & {
    date: moment.Moment,
    today: moment.Moment,
    centerWeek: moment.Moment,
}) {
    const isToday = equalUpTo(date, today, "date");

    const centerMonth = equalUpTo(centerWeek, today, "week") ? today : centerWeek;

    // We need to darken days of other months
    const otherMonth = !equalUpTo(date, centerMonth, "month");

    return <NoteAny
        className={clsx(
            styles.day,
            isToday && styles.today,
            otherMonth && styles.otherMonth,
        )}
        period={"date"}
        date={date}
        notes={notes}
    >
        {date.format("D")}
    </NoteAny>;
}


function CalendarHeader({
    week,
    today,
    setWeek: setDate,
    notes,
    collapse,
}: NoteDateProps & NotesTakerProps & {
    setWeek: (date: moment.Moment) => void,
    collapse: () => void,
}) {
    return <div className={styles.header}>
        <NoteYear week={week} today={today} notes={notes}/>
        <NoteQuarter week={week} today={today} notes={notes}/>

        <div className={styles.break}/>

        <NoteMonth week={week} today={today} notes={notes}/>

        <div className={styles.controls}>
            <Icon
                icon="chevron-up"
                onClick={() => setDate(week.clone().add(-1, "week"))}
            />
            <Icon
                icon="reset"
                onClick={() => setDate(dateWeekStart())}
            />
            <Icon
                icon="chevron-down"
                onClick={() => setDate(week.clone().add(+1, "week"))}
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
    week,
}: Omit<NoteDateProps, "today">) {
    return <div className={styles.weekHeader}>
        <div>
            W
        </div>
        {weekdayOffsets.map(offset => <div
            key={offset}
        >
            {week.clone().add(offset, "days").format("ddd")}
        </div>)}
    </div>;
}


function CalendarWeek({
    week,
    today,
    centerWeek,
    notes,
}: NoteDateProps & NotesTakerProps & {
    centerWeek: moment.Moment,
}) {
    return <div className={styles.weekRow}>
        <NoteWeek
            week={week}
            today={today}
            notes={notes}
        />
        {weekdayOffsets.map(offset => <NoteDay
            key={offset}
            date={week.clone().add(offset, "days")}
            today={today}
            centerWeek={centerWeek}
            notes={notes}
        />)}
    </div>;
}


function CalendarCompact({
    week,
    today,
    notes,
    expand,
}: NoteDateProps & NotesTakerProps & {
    expand: () => void,
}) {
    return <div className={styles.header}>
        <NoteYear week={week} today={today} notes={notes}/>
        <NoteQuarter week={week} today={today} notes={notes}/>

        <div className={styles.break}/>

        <NoteMonth week={week} today={today} notes={notes}/>
        <NoteDay date={today} today={today} centerWeek={week} notes={notes}/>

        <div className={styles.break}/>

        <NoteWeek week={week} today={today} notes={notes} extended/>

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
    compact,
    setCompact,
}: {
    compact: boolean,
    setCompact: (c: boolean) => void,
} & NotesTakerProps) {
    const today = dateToday();

    // What date to center the calendar around.
    // .weekday is locale-aware.
    const [week, setWeek] = useState(dateWeekStart());

    if (compact) {
        return <div className={styles.calendar}>
            <CalendarCompact
                week={week}
                today={today}
                notes={notes}
                expand={() => setCompact(false)}
            />
        </div>;
    }

    return <div className={styles.calendar}>
        <CalendarHeader
            week={week}
            today={today}
            setWeek={setWeek}
            notes={notes}
            collapse={() => setCompact(true)}
        />
        <CalendarWeekHeader
            week={week}
        />
        {weekOffsets.map(offset => <CalendarWeek
            key={offset}
            week={week.clone().add(offset, "week")}
            today={today}
            centerWeek={week}
            notes={notes}
        />)}
    </div>;
}
