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

                aria-label={Tag.all.display}
            >
                <Icon icon="list"/>
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(Tag.any)}

                aria-label={Tag.any.display}
            >
                <Icon icon="hash"/>
            </div>

            <div
                className="clickable-icon"
                onClick={() => setTag(Tag.none)}

                aria-label={Tag.none.display}
            >
                <Icon icon="circle-off"/>
            </div>
        </div>

        <TagTree
            tree={notes.tagTree}
            setTag={(id: string) => setTag(new Tag(id))}
        />
    </div>;
}
