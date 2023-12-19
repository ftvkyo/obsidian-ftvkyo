import {type ViewElement} from "./view";
import Logger from "@/util/logger";
import Calendar from "../components/Calendar";


let lg: Logger | undefined = undefined;


const ExploreView: ViewElement = {
    Element: () => {
        if (!lg) {
            lg = ftvkyo.lg.sub("Explore");
        }

        // const unique = ftvkyo.api.source.cache.unique;
        const periodic = ftvkyo.api.source.cache.periodic;

        return <>
            <Calendar
                notes={periodic}
            />
        </>;
    },
    short: "nav",
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
