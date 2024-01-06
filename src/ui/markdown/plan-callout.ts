import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

import Logger from "@/util/logger";
import { addTime, formatTimeAsMoment, formatTimeAsDelta, parseTimeDeltaToMinutes, Time } from "@/util/plan";


let lg: Logger | undefined = undefined;


const BREAK_MINUTES = 5;
const RE_TIME_MOMENT = /^@\s?(\d\d?):(\d\d)$/;


class PlanCalloutCalculator extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
    ) {
        super(containerEl);
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

    onload() {
        const blockStart = this.#getStartTime();
        let blockDelta = {h: 0, m: 0, d: 0};

        const lis = this.#getListItems();
        lg?.debug(`Found ${lis.length} list elements.`);

        for (const li of lis) {
            const estimationCode = li.querySelector<HTMLElement>("code:first-of-type");
            if (estimationCode) {
                const minutes = parseTimeDeltaToMinutes(estimationCode.innerText);
                if (minutes) {
                    estimationCode.addClass("parsed");
                    if (blockStart) {
                        const taskStart = addTime(blockStart, blockDelta);
                        // End does not include the break
                        const taskEnd = addTime(taskStart, {h: 0, m: minutes, d: 0});
                        estimationCode.ariaLabel = `${formatTimeAsMoment(taskStart)} - ${formatTimeAsMoment(taskEnd)}`;
                    }
                    // Includes the break
                    blockDelta = addTime(blockDelta, {h: 0, m: minutes + BREAK_MINUTES, d: 0});
                }
            }
        }

        lg?.debug(`Total time is ${blockDelta}.`);

        if (blockDelta.h > 0 || blockDelta.m > 0) {
            const em = document.createElement("em");

            em.appendText(`Total: ${formatTimeAsDelta(blockDelta)}.`);

            if (blockStart) {
                const blockEnd = addTime(blockStart, blockDelta);
                em.appendText(` Finishing @ ${formatTimeAsMoment(blockEnd)}.`);
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
