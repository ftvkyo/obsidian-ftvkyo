import { MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";

import Logger from "@/util/logger";

//import ApiNote from "@/api/note";


let lg: Logger | undefined = undefined;


const BREAK_MINUTES = 5;

class PlanCalloutCalculator extends MarkdownRenderChild {
    constructor(
        readonly containerEl: HTMLElement,
        readonly minutesEstimated: number,
        readonly breaks: number,
    ) {
        super(containerEl);
    }

    onload() {
        const minutesTotal = this.minutesEstimated + BREAK_MINUTES * this.breaks;

        const hoursTotal = Math.floor(minutesTotal / 60);
        const minutesTotalRemainder = minutesTotal % 60;

        let time = "";
        if (hoursTotal > 0) {
            time += `${hoursTotal}h`;
        }
        time += " ";
        if (minutesTotalRemainder > 0) {
            time += `${minutesTotalRemainder}m`;
        }
        time = time.trim();

        let breaks = this.breaks + " break";
        if (this.breaks > 1) {
            breaks += "s";
        }

        const p = document.createElement<"em">("em");
        p.innerText = `Total: ${time}, ${breaks}.`;

        this.containerEl.appendChild(p);
    }
}


const RE_TIME = /^(\d+[hH])?\s?(\d+[mM])?$/;

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
        lg.info(`Found ${plans.length} plan callouts.`);
    }

    for (const plan of plans) {
        // Find all <code> elements inside of <li> elements in the plan.
        // This is because we expect task time estimations in the "`...`" syntax.
        // FIXME: this also tries to grab other <code> elements in <li>s.
        const estimations = Array.from(plan.querySelectorAll<HTMLElement>("li > code"));

        if (estimations.length <= 0) {
            continue;
        }

        lg.info(`Found ${estimations.length} "li > code".`);

        let minutes = 0;
        let breaks = 0;

        for (const estimation of estimations) {
            // Check if the estimation contains time.
            const match = RE_TIME.exec(estimation.innerText) ?? [];

            const [, h, m] = match;

            if (h === undefined && m === undefined) {
                lg.info(`Failed to extract time from ${estimation.innerText}`);
                continue;
            }

            const hm = h ? Number(h.substring(0, h.length - 1)) : 0;
            const mm = m ? Number(m.substring(0, m.length - 1)) : 0;

            minutes += hm * 60 + mm;
            breaks += 1;
        }

        if (breaks === 0) {
            lg.info("No estimations were parsed successfully.");
            continue;
        }

        context.addChild(new PlanCalloutCalculator(plan, minutes, breaks));
    }
}
