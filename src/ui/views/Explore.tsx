import {ViewElementProps, type ViewElement} from "./view";
import Logger from "@/util/logger";
import Calendar from "../components/Calendar";


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

        return <>
            <Calendar
                notes={periodic}
            />
        </>;
    },
    initialState: {},
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
