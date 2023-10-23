import ApiNoteList, { TagWildcard } from "@/api/note-list";
import {useIcons} from "@/util/icons";
import {TagTree} from "./parts/TagTree";

import styles from "./TagList.module.scss";


export default function TagList({
    notes,
    setTag,
}: {
    notes: ApiNoteList,
    setTag: (id: string | TagWildcard) => void,
}) {
    const updateRef = useIcons();

    return <div ref={updateRef} className={styles.list}>
        <div className={styles.wildcards}>
            <div
                className="clickable-icon"
                onClick={() => setTag(TagWildcard.All)}
            >
                <div data-icon="asterisk"/>
                All notes
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(TagWildcard.Any)}
            >
                <div data-icon="hash"/>
                With tags
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(TagWildcard.None)}
            >
                <div data-icon="circle-off"/>
                No tags
            </div>
        </div>

        <TagTree
            tree={notes.tagTree}
            setTag={setTag}
        />
    </div>;
}
