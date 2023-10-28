import {useState} from "react";

import {type ViewElement} from "./view";
import Logger from "@/util/logger";
import NoteList from "../components/NoteList";
import { Tag } from "@/api/note-list";
import TagList from "../components/TagList";
import Calendar from "../components/Calendar";


let lg: Logger | undefined = undefined;


const ExploreView: ViewElement = {
    Element: () => {
        if (!lg) {
            lg = ftvkyo.lg.sub("Explore");
        }

        const [tag, setTag] = useState<Tag | null>(null);

        const notes = ftvkyo.api.source.cache.unique;

        let content;
        if (tag === null) {
            content = <TagList
                setTag={setTag}
                notes={notes}
            />;
        } else {
            content = <NoteList
                tag={tag}
                goBack={() => setTag(null)}
                notes={notes}
            />;
        }

        return <>
            <Calendar/>
            {content}
        </>;
    },
    short: "nav",
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
