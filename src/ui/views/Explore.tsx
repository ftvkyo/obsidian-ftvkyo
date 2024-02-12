import {ViewElementProps, type ViewElement} from "./view";
import Logger from "@/util/logger";
import Calendar from "../components/Calendar";
import FileTree from "../components/FileTree";


let lg: Logger | undefined = undefined;


export type ExploreViewState = {
    calendarCompact: boolean,
};

const ExploreView: ViewElement<ExploreViewState> = {
    short: "nav",
    Element: ({state, setState}: ViewElementProps<ExploreViewState>) => {
        if (!lg) {
            lg = ftvkyo.lg.sub("Explore");
        }

        const unique = ftvkyo.api.source.adapter;
        const periodic = ftvkyo.api.source.periodic;

        return <>
            <Calendar
                notes={periodic}
                compact={state.calendarCompact}
                setCompact={(compact) => setState({...state, calendarCompact: compact})}
            />
            <FileTree
                folder={unique}
            />
        </>;
    },
    initialState: {
        calendarCompact: true,
    },
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
