import {ViewElementProps, type ViewElement} from "./view";
import Logger from "@/util/logger";
import Calendar from "../components/Calendar";
import Daily from "../components/Daily";
import { dateNow, dateToday } from "@/util/date";
import { useEffect, useState } from "react";


let lg: Logger | undefined = undefined;


export type ExploreViewState = {
};

const ExploreView: ViewElement<ExploreViewState> = {
    short: "nav",
    Element: ({state, setState}: ViewElementProps<ExploreViewState>) => {
        if (!lg) {
            lg = ftvkyo.lg.sub("Explore");
        }

        const periodic = ftvkyo.api.source.periodic;

        const now = dateNow();
        const today = dateToday();

        return <>
            <Calendar
                notes={periodic}
                today={today}
            />
            <Daily
                notes={periodic}
                today={today}
                now={now}
            />
        </>;
    },
    initialState: {},
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
