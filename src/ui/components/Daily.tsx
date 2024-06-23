import {useEffect, useState} from "react";
import { clsx } from "clsx";

import {NotesTakerProps, equalUpTo} from "@/util/date";
import { iconForTaskStatus, parseTask, Task, TaskTimed } from "@/util/tasks";
import Icon from "./controls/Icon";

import styles from "./Daily.module.scss";


const SCALE_FACTOR = 2;


function timeToOffset(time: moment.Moment): number {
    return (time.hours() * 60 + time.minutes()) * SCALE_FACTOR;
}


function TaskScheduleNow({
    time,
}: { time: moment.Moment }) {
    const top = timeToOffset(time) + "px";
    return <div className={clsx(styles.guide, styles.now)} style={{top}}>
        {time.format("HH:mm")}
    </div>;
}


function TaskScheduleGuide({
    time,
}: { time: moment.Moment }) {
    const top = timeToOffset(time) + "px";
    return <div className={styles.guide} style={{top}}>
        {time.format("HH:mm")}
    </div>;
}


function TaskScheduleItem({
    task,
}: { task: TaskTimed }) {
    const top = timeToOffset(task.time.start) + "px";
    const height = (task.time.duration?.asMinutes() ?? 1) * SCALE_FACTOR + "px";

    return <div className={styles.task} style={{top, height}}>
        {task.time.start.format("HH:mm")} - {task.text}
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
    const guides = [];
    for (let i = 0; i < 25; i++) {
        const guideTime = today.clone().hours(i);
        guides.push(<TaskScheduleGuide key={i} time={guideTime}/>)
    }

    return <div className={styles.taskSchedule}>
        {guides}
        {tasks.map((t, i) => <TaskScheduleItem key={i} task={t}/>)}
        <TaskScheduleNow time={now}/>
    </div>;
}


function TaskListItem({
    task,
}: { task: Task }) {
    const icon = iconForTaskStatus(task.status);

    const start = task.time && task.time.start.format("HH:mm");
    const end = task.time?.duration && task.time.start.clone().add(task.time.duration).format("[- ]HH:mm");

    const blockTime = start ? <>
        <Icon icon="clock"/> {start} {end}
    </> : undefined;

    return <div className={styles.task}>
        <Icon icon={icon}/>
        {task.text}
        {blockTime}
    </div>;
}


function TaskList({
    tasks,
}: { tasks: Task[] }) {
    return <div className={styles.taskList}>
        {tasks.map((t, i) => <TaskListItem key={i} task={t} />)}
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

    const [todayText, setTodayText] = useState<string | undefined>();

    useEffect(() => {
        // TODO: Make sure there is no update spam?
        //       Maybe acquire today's note in an outer component and only update it when we receive
        //       an update event for it?
        async function updateTodayText() {
            setTodayText(await todayNote?.text());
        }
        updateTodayText();
    });

    const todayTasks = todayNote?.tasks.map(t => {
        const { start, end } = t.position;
        const taskText = todayText?.slice(start.offset, end.offset);
        return taskText && parseTask(taskText);
    }).filter(t => t) as Task[] ?? [];

    return <div className={styles.daily}>
        {now.format("YYYY-MM-DD, [W]w ddd, HH:mm")}
        <TaskList tasks={todayTasks.filter(t => !t.time)}/>
        <TaskSchedule today={today} now={now} tasks={todayTasks.filter(t => t.time) as TaskTimed[]}/>
    </div>;
}
