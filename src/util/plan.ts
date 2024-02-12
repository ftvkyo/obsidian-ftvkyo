export type Time = {h: number, m: number, d: number};


export function addTime(start: Time, delta: Time): Time {
    let m = start.m + delta.m;
    let h = start.h + delta.h + Math.floor(m / 60);
    const d = start.d + delta.d + Math.floor(h / 24);

    m = m % 60;
    h = h % 24;

    return {h, m, d};
}


export function formatTimeAsDelta(delta: Time): string {
    let time = "";
    if (delta.d > 0) {
        time += `${delta.d}d`;
    }
    time += " ";
    if (delta.h > 0) {
        time += `${delta.h}h`;
    }
    time += " ";
    if (delta.m > 0) {
        time += `${delta.m}m`;
    }
    time = time.trim();

    return time;
}


export function formatTimeAsMoment(moment: Time): string {
    const mpad = String(moment.m).padStart(2, "0");

    let ret = `${moment.h}:${mpad}`;
    if (moment.d > 0) {
        ret += ` (+${moment.d}d)`;
    }

    return ret;
}


const RE_TIME_DELTA = /^(\d+[hH])?\s?(\d+[mM])?$/;

export function parseTimeDeltaToMinutes(est: string): number | null {
    const match = RE_TIME_DELTA.exec(est) ?? [];

    const [, h, m] = match;

    if (h === undefined && m === undefined) {
        return null;
    }

    const hm = h ? Number(h.substring(0, h.length - 1)) : 0;
    const mm = m ? Number(m.substring(0, m.length - 1)) : 0;

    return hm * 60 + mm;
}
