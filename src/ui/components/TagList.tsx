import ApiNoteList, { TagWildcard } from "@/api/note-list";
import Icon from "./controls/Icon";
import {TagTree} from "./parts/TagTree";

import styles from "./TagList.module.scss";


export default function TagList({
    notes,
    setTag,
}: {
    notes: ApiNoteList,
    setTag: (id: string | TagWildcard) => void,
}) {
    return <div className={styles.list}>
        <div className={styles.wildcards}>
            <div
                className="clickable-icon"
                onClick={() => setTag(TagWildcard.All)}
            >
                <Icon icon="list"/>
                All notes
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(TagWildcard.Any)}
            >
                <Icon icon="hash"/>
                With tags
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(TagWildcard.None)}
            >
                <Icon icon="circle-off"/>
                No tags
            </div>
        </div>

        <TagTree
            tree={notes.tagTree}
            setTag={setTag}
        />
    </div>;
}
