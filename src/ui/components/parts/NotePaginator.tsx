import {NoteFilterType} from "@/api/note-list";
import Selector from "../controls/Selector";


export default function NotePaginator({
    total: found,
    filter,
    setFilter,
}: {
    total: number,
    filter: NoteFilterType,
    setFilter: (filter: NoteFilterType) => void,
}) {
    const pages = Math.ceil(found / filter.onPage);

    const sortingSelector = <Selector
        options={[
            ["date-desc", "Date: New first"],
            ["date-asc", "Date: Old first"],
            ["title-asc", "Title: A-Z"],
            ["title-desc", "Title: Z-A"],
        ]}
        value={`${filter.orderKey}-${filter.orderDir}`}
        onChange={(v) => {
            const [orderKey, orderDir] = v.split("-");
            setFilter({
                ...filter,
                orderKey: orderKey as "date" | "title",
                orderDir: orderDir as "asc" | "desc",
                page: 0,
            });
        }}
    />;

    const onPageSelector = <Selector
        options={[
            ["10", "10"],
            ["25", "25"],
            ["50", "50"],
        ]}
        value={String(filter.onPage)}
        onChange={(v) => {
            setFilter({
                ...filter,
                onPage: Number(v),
                page: 0,
            });
        }}
    />;

    const pagePrevBtn = <button
        disabled={filter.page < 1}
        onClick={() => {setFilter({...filter, page: filter.page - 1})}}
    >
        {"<"}
    </button>;

    const pageNextBtn = <button
        disabled={filter.page >= pages - 1}
        onClick={() => {setFilter({...filter, page: filter.page + 1})}}
    >
        {">"}
    </button>;

    return <>
        <div>
            Found {found},
            {onPageSelector} per page
        </div>
        <div>
            {sortingSelector}
            {pagePrevBtn}
            {filter.page + 1}/{pages}
            {pageNextBtn}
        </div>
    </>
}
