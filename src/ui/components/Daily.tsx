import {useEffect, useState} from "react";

import {dateToday, NotesTakerProps, equalUpTo} from "@/util/date";
import { iconForTaskStatus, parseTask, Task } from "@/util/tasks";
import Icon from "./controls/Icon";

import styles from "./Daily.module.scss";


function TaskBox({
    task
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


export default function Daily({
    notes,
}: NotesTakerProps) {
    const today = dateToday();

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
    }).filter(t => t) as Task[];

    return <div className={styles.daily}>
        Today: {today.format("YYYY-MM-DD, [W]w ddd")}

        <div className={styles.schedule}>
            {todayTasks?.map((t, i) => <TaskBox key={i} task={t} />)}
        </div>
    </div>;
}
