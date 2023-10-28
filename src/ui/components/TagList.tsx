import { ApiNoteUniqueList, Tag } from "@/api/note-list";
import Icon from "./controls/Icon";
import {TagTree} from "./parts/TagTree";

import styles from "./TagList.module.scss";


export default function TagList({
    notes,
    setTag,
}: {
    notes: ApiNoteUniqueList,
    setTag: (id: Tag) => void,
}) {
    return <div className={styles.list}>
        <div className={styles.wildcards}>
            <div
                className="clickable-icon"
                onClick={() => setTag(Tag.all)}
            >
                <Icon icon="list"/>
                {Tag.all.display}
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(Tag.any)}
            >
                <Icon icon="hash"/>
                {Tag.any.display}
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(Tag.none)}
            >
                <Icon icon="circle-off"/>
                {Tag.none.display}
            </div>
        </div>

        <TagTree
            tree={notes.tagTree}
            setTag={(id: string) => setTag(new Tag(id))}
        />
    </div>;
}
