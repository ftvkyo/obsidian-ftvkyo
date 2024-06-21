import {dateToday, NotesTakerProps, equalUpTo} from "@/util/date";
import {useEffect, useState} from "react";

import styles from "./Daily.module.scss";


function Task({
    text
}: { text: string | undefined }) {
    return <div className={styles.task}>
        {text}
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
        async function updateTodayText() {
            setTodayText(await todayNote?.text());
        };
        updateTodayText();
    });

    const todayTasks = todayNote?.tasks.map(t => {
        let { start, end } = t.position;
        return todayText?.slice(start.offset, end.offset);
    });

    return <div className={styles.tasks}>
        Today's tasks:

        {todayTasks?.map((t, i) => <Task key={i} text={t} />)}
    </div>;
}
