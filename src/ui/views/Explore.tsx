import {useState} from "react";

import {type ViewElement} from "./view";
import Logger from "@/util/logger";
import NoteList from "../components/NoteList";
import { Tag } from "@/api/note-list";
import TagList from "../components/TagList";


let lg: Logger | undefined = undefined;


const ExploreView: ViewElement = {
    Element: () => {
        if (!lg) {
            lg = ftvkyo.lg.sub("Explore");
        }

        const [tag, setTag] = useState<Tag | null>(null);

        const notes = ftvkyo.api.source.cache.unique;

        if (tag === null) {
            return <TagList
                setTag={setTag}
                notes={notes}
            />
        } else {
            return <NoteList
                tag={tag}
                setTag={setTag}
                notes={notes}
            />;
        }
    },
    short: "nav",
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
