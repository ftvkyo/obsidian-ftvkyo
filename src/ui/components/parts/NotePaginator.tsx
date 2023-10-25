import {NoteFilterType} from "@/api/note-list";
import Icon from "../controls/Icon";

import styles from "./NotePaginator.module.scss";


export default function NotePaginator({
    total: found,
    filter,
    setFilter,
}: {
    total: number,
    filter: NoteFilterType,
    setFilter: (filter: NoteFilterType) => void,
}) {
    const pages = Math.ceil(found / ftvkyo.settings.resultsPerPage);

    const pagePrevBtn = <Icon
        icon="chevron-left"
        disabled={filter.page < 1}
        onClick={(e: React.MouseEvent) => {
            if (e.ctrlKey) {
                setFilter({...filter, page: 0});
                return;
            }
            setFilter({...filter, page: filter.page - 1});
        }}
    />;

    const pageNextBtn = <Icon
        icon="chevron-right"
        disabled={filter.page >= pages - 1}
        onClick={() => {
            setFilter({...filter, page: filter.page + 1});
        }}
    />;

    return <div className={styles.paginator}>
        {pagePrevBtn}
        <span>{filter.page + 1}/{pages} ({found})</span>
        {pageNextBtn}
    </div>;
}
