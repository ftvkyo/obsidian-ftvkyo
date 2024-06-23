const statuses = [
    " ",
    "x",
    "-",
] as const;

export type TaskStatus = typeof statuses[number];


function isValidStatus(status: string): asserts status is TaskStatus {
    if (!(statuses as unknown as string[]).includes(status)) {
        throw new Error(`Unknown task status "${status}"`);
    }
}


export function iconForTaskStatus(status: TaskStatus): string {
    switch (status) {
        case " ":
            return "dot";
        case "x":
            return "check";
        case "-":
            return "x";
    }
}


export type TaskTime = {
    start: moment.Moment,
    duration?: moment.Duration,
};


const RE_TASK_TIME = /\[time::\s*(?<start>\d?\d:\d\d)(?:\s+(?<duration>.*))?\s*\]/u;

function parseTaskTime(taskText: string): TaskTime | undefined {
    const match = taskText.match(RE_TASK_TIME);

    const { start, duration } = match?.groups ?? {};

    if (!start) {
        return undefined;
    }

    const mStart = ftvkyo.momentParse(start, "HH:mm");

    if (!mStart.isValid()) {
        return undefined;
    }

    if (duration) {
        const mDuration = ftvkyo.momentParseDuration(duration);

        if (mDuration.isValid()) {
            return {
                start: mStart,
                duration: mDuration,
            };
        }
    }

    return {
        start: mStart,
    };
}


export interface Task {
    status: TaskStatus;
    text: string;
    time?: TaskTime;
}


const RE_TASK = /^\s*- \[(?<status>.)\]\s+(?<rest>.*)$/u;

export function parseTask(task: string): Task | undefined {
    const match = task.match(RE_TASK);

    const { status, rest } = match?.groups ?? {};

    if (!status || !rest) {
        return undefined;
    }

    isValidStatus(status);

    const time = parseTaskTime(rest);
    const text = rest.replace(RE_TASK_TIME, "");

    return {
        status,
        text,
        time,
    }
}
