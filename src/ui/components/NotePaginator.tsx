import {NoteFilterType} from "@/api/note-list";
import Selector from "./Selector";

export default function NotePaginator({
    found,
    filter,
    setFilter,
}: {
    found: number,
    filter: NoteFilterType,
    setFilter: (filter: NoteFilterType) => void,
}) {
    const sortingSelector = <Selector
        className="sort"
        label="Sort"
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
            });
        }}
    />;

    return <div className="note-paginator">
        {sortingSelector}
        <div className="found">
            {found} found.
        </div>
    </div>
}
