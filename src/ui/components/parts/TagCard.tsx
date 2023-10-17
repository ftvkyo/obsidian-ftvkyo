import {tagDisplay, TagWildcard} from "@/api/note-list";
import {clsx} from "clsx";
import {useCallback} from "react";

import styles from "./TagCard.module.scss";


export function TagCard({
    id,
    setTag,
}: {
    id: string | TagWildcard,
    setTag: (id: string | TagWildcard) => void,
}) {
    const onClick = useCallback(() => {
        setTag(id);
    }, [setTag, id]);

    let nestedness = 0;
    if (typeof id === "string") {
        nestedness = id.match(/\//)?.length ?? 0;
    }

    return <a
        className={clsx(styles.card)}
        onClick={onClick}
        style={{
            marginLeft: `${nestedness}em`
        }}
    >
        {tagDisplay(id)}
    </a>
}
