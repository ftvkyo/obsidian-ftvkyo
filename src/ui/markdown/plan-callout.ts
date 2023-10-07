import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

import Logger from "@/util/logger";

//import ApiNote from "@/api/note";


let lg: Logger | undefined = undefined;


const BREAK_MINUTES = 5;
const RE_TIME_DELTA = /^(\d+[hH])?\s?(\d+[mM])?$/;


class PlanCalloutCalculator extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
    ) {
        super(containerEl);
    }

    #getListItemMinutes(listEl: HTMLLIElement): null | number {
        const code = listEl.querySelector<HTMLElement>("code:first-of-type");
        return code ? this.#parseTimeDeltaToMinutes(code.innerText) : null;
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

    #getListItems(): HTMLLIElement[] {
        return Array.from(this.containerEl.querySelectorAll("li"));
    }

    onload() {
        let minutesTotal = 0;
        let breaks = 0;

        const lis = this.#getListItems();
        for (const li of lis) {
            const minutes = this.#getListItemMinutes(li);
            if (minutes) {
                minutesTotal += minutes + BREAK_MINUTES;
                breaks++;
            }
            // TODO: add a marker for successfully parsed lis
        }

        const td = this.#formatTimeDelta(minutesTotal);
        const brs = this.#formatBreaks(breaks);

        const p = document.createElement<"em">("em");
        p.innerText = `Total: ${td}, ${brs}.`;

        this.containerEl.appendChild(p);
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
