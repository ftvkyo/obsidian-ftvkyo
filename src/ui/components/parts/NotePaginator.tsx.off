import { ApiWhere } from "@/api/note-list";
import Icon from "../controls/Icon";

import styles from "./NotePaginator.module.scss";


export default function NotePaginator({
    total: found,
    w,
    setW,
}: {
    total: number,
    w: ApiWhere,
    setW: (w: ApiWhere) => void,
}) {
    const pages = Math.ceil(found / ftvkyo.settings.resultsPerPage);

    const pagePrevBtn = <Icon
        icon="chevron-left"
        disabled={w.pageSet < 1}
        onClick={(e: React.MouseEvent) => {
            if (e.ctrlKey) {
                setW(w.pageFirst());
                return;
            }
            setW(w.pagePrev());
        }}
    />;

    const pageNextBtn = <Icon
        icon="chevron-right"
        disabled={w.pageSet >= pages - 1}
        onClick={() => {
            setW(w.pageNext());
        }}
    />;

    return <div className={styles.paginator}>
        {pagePrevBtn}
        <span>{w.pageSet + 1}/{pages} ({found})</span>
        {pageNextBtn}
    </div>;
}
