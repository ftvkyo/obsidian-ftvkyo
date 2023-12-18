import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

import Logger from "@/util/logger";

//import ApiNote from "@/api/note";


let lg: Logger | undefined = undefined;


const BREAK_MINUTES = 5;
const RE_TIME_MOMENT = /^@\s?(\d\d?):(\d\d)$/;
const RE_TIME_DELTA = /^(\d+[hH])?\s?(\d+[mM])?$/;

type Time = {h: number, m: number, d: number};


class PlanCalloutCalculator extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
    ) {
        super(containerEl);
    }

    #getEstimationCodeMinutes(code: HTMLElement): null | number {
        const td = this.#parseTimeDeltaToMinutes(code.innerText);
        if (td) {
            code.addClass("parsed");
            return td;
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

    #addTime(start: Time, delta: Time): Time {
        let m = start.m + delta.m;
        let h = start.h + delta.h + Math.floor(m / 60);
        const d = start.d + delta.d + Math.floor(h / 24);

        m = m % 60;
        h = h % 24;

        return {h, m, d};
    }

    #formatTimeDelta(delta: Time): string {
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

    #formatMoment(moment: Time): string {
        const mpad = String(moment.m).padStart(2, "0");

        let ret = `${moment.h}:${mpad}`;
        if (moment.d > 0) {
            ret += ` (+${moment.d}d)`;
        }

        return ret;
    }

    #getListItems(): HTMLLIElement[] {
        return Array.from(this.containerEl.querySelectorAll("li"));
    }

    #getStartTime(): null | Time {
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

        return {h: Number(h), m: Number(m), d: 0};
    }

    #addTooltip(el: HTMLElement, tooltip: string) {
        el.ariaLabel = tooltip;
    }

    onload() {
        const blockStart = this.#getStartTime();
        let blockDelta = {h: 0, m: 0, d: 0};

        const lis = this.#getListItems();
        lg?.debug(`Found ${lis.length} list elements.`);

        for (const li of lis) {
            const estimationCode = li.querySelector<HTMLElement>("code:first-of-type");
            if (estimationCode) {
                const minutes = this.#getEstimationCodeMinutes(estimationCode);
                if (minutes) {
                    if (blockStart) {
                        const taskStart = this.#addTime(blockStart, blockDelta);
                        // End does not include the break
                        const taskEnd = this.#addTime(taskStart, {h: 0, m: minutes, d: 0});
                        this.#addTooltip(estimationCode, `${this.#formatMoment(taskStart)} - ${this.#formatMoment(taskEnd)}`);
                    }
                    // Includes the break
                    blockDelta = this.#addTime(blockDelta, {h: 0, m: minutes + BREAK_MINUTES, d: 0});
                }
            }
        }

        lg?.debug(`Total time is ${blockDelta}.`);

        if (blockDelta.h > 0 || blockDelta.m > 0) {
            const em = document.createElement("em");

            em.appendText(`Total: ${this.#formatTimeDelta(blockDelta)}.`);

            if (blockStart) {
                const blockEnd = this.#addTime(blockStart, blockDelta);
                em.appendText(` Finishing @ ${this.#formatMoment(blockEnd)}.`);
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
