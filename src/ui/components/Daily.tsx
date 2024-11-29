import {useEffect, useState} from "react";
import {moment} from "obsidian";

import {NotesTakerProps, equalUpTo} from "@/util/date";
import Icon from "./controls/Icon";
import {iconForTaskStatus, Task, TaskTimed} from "@/api/source";

import styles from "./Daily.module.scss";


const SCALE_FACTOR = 2;
const DEFAULT_DURATION = moment.duration("PT5M");


function startToOffset(time: moment.Moment, duration?: moment.Duration): number {
    return (time.hours() * 60 + time.minutes()) * SCALE_FACTOR;
}

function durationToHeight(duration: moment.Duration): number {
    return (duration.asMinutes()) * SCALE_FACTOR;
}

function determineScheduleStart(tasks: TaskTimed[]): moment.Moment | undefined {
    const earliest = tasks.map(task => task.time.start).sort((a, b) => a.valueOf() - b.valueOf())[0];

    // Start at a whole hour, just before the earliest task
    return earliest && earliest.clone().minute(0);
}

// Note: returns the start of the last hour block
function determineScheduleEnd(tasks: TaskTimed[]): moment.Moment | undefined {
    const latest = tasks.map(task => task.time.start.clone().add(task.time.duration ?? DEFAULT_DURATION)).sort((a, b) => b.valueOf() - a.valueOf())[0];

    // End at a whole hour after the latest task
    return latest && latest.clone().minute(0).add(1, "hour");
}

function TaskText({
    task,
}: {
    task: Task,
}) {
    let pieces = [<span key={0}>{task.text}</span>];

    let c = 1;
    let parent = task.parent;
    while(parent) {
        pieces.push(<span key={c} className={styles.separator}> → </span>);
        pieces.push(<span key={c + 1}>{parent.text}</span>);
        parent = parent.parent;
        c += 2;
    }

    return <div>
        {pieces.reverse()}
    </div>;
}


function TaskScheduleGuide({
    time,
}: { time: moment.Moment }) {
    return <div className={styles.guide}>
        {time.format("HH:mm")}
    </div>;
}


function TaskScheduleItem({
    task,
    offset,
}: { task: TaskTimed, offset: number }) {
    const top = startToOffset(task.time.start) - offset + "px";
    const height = durationToHeight(task.time.duration ?? DEFAULT_DURATION) - 1 + "px";
    const z = task.time.start.format("HHmm");

    const start = <div className={styles.start}>
        {task.time.start.format("HH:mm")}
    </div>;

    const icon = iconForTaskStatus(task.status);
    const text = <div className={styles.text}>
        <Icon icon={icon} className={styles.icon}/>
        <TaskText task={task}/>
    </div>;

    const end = task.time.duration
        ? <div className={styles.end}>{task.time.start.clone().add(task.time.duration).format("HH:mm")}</div>
        : undefined;

    return <div className={styles.task} style={{top, height}} data-z={z}>
        <div className={styles.contents}>
            {start}
            {text}
            {end}
        </div>
    </div>;
}


function TaskScheduleNow({
    time,
    offset,
}: { time: moment.Moment, offset: number }) {
    const top = startToOffset(time) - offset + "px";
    return <div className={styles.now} style={{top}} data-time={time.format("HH:mm")}>
    </div>;
}


function TaskSchedule({
    today,
    now,
    tasks,
}: {
    today: moment.Moment,
    now: moment.Moment,
    tasks: TaskTimed[],
}) {
    const scheduleStart = determineScheduleStart(tasks);
    const scheduleEnd = determineScheduleEnd(tasks);

    if (scheduleStart && scheduleEnd) {
        const startOffset = startToOffset(scheduleStart);

        const scheduleCounter = scheduleStart.clone();
        const guides = [];
        while (scheduleCounter.valueOf() <= scheduleEnd.valueOf()) {
            guides.push(<TaskScheduleGuide key={guides.length} time={scheduleCounter.clone()}/>);
            scheduleCounter.add(1, "hour");
        }

        // We receive the start of the last hour, but the last hour lasts another hour...
        scheduleEnd.add(1, "hour");
        const guideNow = (scheduleStart.valueOf() < now.valueOf() && now.valueOf() < scheduleEnd.valueOf())
            ? <TaskScheduleNow time={now} offset={startOffset}/>
            : undefined;

        const taskTracks: TaskTimed[][] = [];

        for (const t of tasks) {
            let trackReused = false;

            for (const track of taskTracks) {
                let conflicts = false;

                for (const tt of track) {
                    const tStart = t.time.start;
                    const tEnd = t.time.start.clone().add(t.time.duration ?? DEFAULT_DURATION);
                    const ttStart = tt.time.start;
                    const ttEnd = tt.time.start.clone().add(t.time.duration ?? DEFAULT_DURATION);

                    if (tStart.isBetween(ttStart, ttEnd) || tEnd.isBetween(ttStart, ttEnd)) {
                        conflicts = true;
                        break;
                    }
                }

                if (!conflicts) {
                    track.push(t);
                    trackReused = true;
                    break;
                }
            }

            if (!trackReused) {
                taskTracks.push([t]);
            }
        }

        return <div className={styles.taskSchedule}>
            {guides}
            {tasks.map((t, i) => <TaskScheduleItem key={i} task={t} offset={startOffset}/>)}
            {guideNow}
        </div>;
    } else {
        return <div className={styles.taskSchedule}>
            No scheduled tasks today.
        </div>;
    }
}


function Clock({
    now,
}: { now: moment.Moment }) {
    return <div className={styles.clock}>
        <time className={styles.date} dateTime={now.format("YYYY-MM-DD")}>
            {now.format("YYYY-MM-DD")}
        </time>
        <time className={styles.time} dateTime={now.format("HH:mm")}>
            {now.format("HH:mm")}
        </time>
    </div>;
}


export default function Daily({
    notes,
    today,
    now,
}: NotesTakerProps & { now: moment.Moment }) {
    const todayNote = notes.find(note => {
        const { period: np, date: nd } = note.kind;
        return np === "date" && equalUpTo(nd, today, "date");
    });

    const [todayTasks, setTodayTasks] = useState<Task[]>([]);

    useEffect(() => {
        // TODO: Make sure there is no update spam?
        //       Maybe acquire today's note in an outer component and only update it when we receive
        //       an update event for it?
        async function updateTodayTasks() {
            setTodayTasks(await todayNote?.tasks() ?? []);
        }
        updateTodayTasks();
    });

    return <div className={styles.daily}>
        <Clock now={now}/>
        <TaskSchedule today={today} now={now} tasks={todayTasks.filter(t => t.time) as TaskTimed[]}/>
    </div>;
}
