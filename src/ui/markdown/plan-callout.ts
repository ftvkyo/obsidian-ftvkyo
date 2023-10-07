import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

import Logger from "@/util/logger";

//import ApiNote from "@/api/note";


let lg: Logger | undefined = undefined;


const BREAK_MINUTES = 5;
const RE_TIME_MOMENT = /^@\s?(\d\d?):(\d\d)$/;
const RE_TIME_DELTA = /^(\d+[hH])?\s?(\d+[mM])?$/;


class PlanCalloutCalculator extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
    ) {
        super(containerEl);
    }

    #getListItemMinutes(listEl: HTMLLIElement): null | number {
        const code = listEl.querySelector<HTMLElement>("code:first-of-type");
        if (code) {
            const td = this.#parseTimeDeltaToMinutes(code.innerText);
            if (td) {
                code.addClass("parsed");
                return td;
            }
        }
        return null;
    }

    #parseTimeDeltaToMinutes(est: string): null | number {
        const match = RE_TIME_DELTA.exec(est) ?? [];

        const [, h, m] = match;

        if (h === undefined && m === undefined) {
            lg?.debug(`No hours nor minutes found in "${est}"`);
            return null;
        }

        const hm = h ? Number(h.substring(0, h.length - 1)) : 0;
        const mm = m ? Number(m.substring(0, m.length - 1)) : 0;

        return hm * 60 + mm;
    }

    #formatTimeDelta(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const minutesRemainder = minutes % 60;

        let time = "";
        if (hours > 0) {
            time += `${hours}h`;
        }
        time += " ";
        if (minutesRemainder > 0) {
            time += `${minutesRemainder}m`;
        }
        time = time.trim();

        return time;
    }

    #formatBreaks(breaks: number): string {
        let ret = `${breaks} break`;
        if (breaks > 1) {
            ret += "s";
        }
        return ret;
    }

    #formatEndTime(start: {h: number, m: number}, minutes: number): string {
        start.m += minutes;
        start.h += Math.floor(start.m / 60);
        start.m %= 60;

        const days = Math.floor(start.h / 24);
        start.h %= 24;

        const mpad = String(start.m).padStart(2, "0");

        let ret = `@ ${start.h}:${mpad}`;
        if (days > 0) {
            ret += ` (+${days}d)`;
        }

        return ret;
    }

    #getListItems(): HTMLLIElement[] {
        return Array.from(this.containerEl.querySelectorAll("li"));
    }

    #getStartTime(): null | {h: number, m: number} {
        const code = this.containerEl.querySelector<HTMLElement>(".callout-title-inner > code:first-of-type");
        if (!code) {
            lg?.debug("Code in title not found.");
            return null;
        }

        const match = RE_TIME_MOMENT.exec(code.innerText) ?? [];
        const [, h, m] = match;

        if (h === undefined || m === undefined) {
            lg?.debug(`Could not extract start time from ${code.innerText}`);
            return null;
        }

        return {h: Number(h), m: Number(m)};
    }

    onload() {
        const start = this.#getStartTime();

        let minutesTotal = 0;
        let breaks = 0;

        const lis = this.#getListItems();
        lg?.debug(`Found ${lis.length} list elements.`);

        for (const li of lis) {
            const minutes = this.#getListItemMinutes(li);
            if (minutes) {
                minutesTotal += minutes + BREAK_MINUTES;
                breaks++;
            }
        }

        lg?.debug(`Total minutes is ${minutesTotal}.`);

        if (minutesTotal > 0) {
            const em = document.createElement("em");

            em.appendText("Total: ");
            const codeTotal = document.createElement("code");
            const td = this.#formatTimeDelta(minutesTotal);
            codeTotal.innerText = td;
            em.appendChild(codeTotal);
            const brs = this.#formatBreaks(breaks);
            em.appendText(`, ${brs}.`);

            if (start) {
                em.appendText(" Finishing: ");
                const codeEnd = document.createElement("code");
                codeEnd.innerText = this.#formatEndTime(start, minutesTotal);
                em.appendChild(codeEnd);
                em.appendText(".");
            }

            this.containerEl.appendChild(em);
        }
    }
}



export default function PlanCallout(
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
) {
    if (!lg) {
        lg = ftvkyo.lg.sub("plan-callout");
    }

    // Find all plan callouts
    const plans = Array.from(element.querySelectorAll<HTMLDivElement>("div.callout[data-callout=\"plan\"]"));

    if (plans.length > 0) {
        lg.debug(`Found ${plans.length} plan callouts.`);
    }

    for (const plan of plans) {
        context.addChild(new PlanCalloutCalculator(plan));
    }
}
