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

        const unique = ftvkyo.api.source.cache.unique;
        const periodic = ftvkyo.api.source.cache.periodic;

        return <>
            <Calendar
                notes={periodic}
            />
            {tag
            ? <NoteList
                tag={tag}
                goBack={() => setTag(null)}
                notes={unique}
            />
            : <TagList
                setTag={setTag}
                notes={unique}
            />}
        </>;
    },
    short: "nav",
    viewType: "ftvkyo-explore",
    displayText: "Explore",
    icon: "lucide-globe-2",
};

export default ExploreView;
