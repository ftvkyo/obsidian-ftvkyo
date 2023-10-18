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
            Wildcards:
            <div
                className="clickable-icon"
                data-icon="asterisk"
                aria-label="All notes"
                onClick={() => setTag(TagWildcard.All)}
            />
            <div
                className="clickable-icon"
                data-icon="hash"
                aria-label="With tags"
                onClick={() => setTag(TagWildcard.Any)}
            />
            <div
                className="clickable-icon"
                data-icon="circle-off"
                aria-label="Without tags"
                onClick={() => setTag(TagWildcard.None)}
            />
        </div>

        <TagTree
            tree={notes.tagTree}
            setTag={setTag}
        />
    </div>;
}
