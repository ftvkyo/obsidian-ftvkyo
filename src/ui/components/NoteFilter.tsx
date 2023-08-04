import ApiNoteList, {NoteFilterType} from "@/api/note-list";
import Radio from "./Radio";
import Selector from "./Selector";
import Toggle from "./Toggle";

function countedOptions([name, count]: [string, number]): [string, string] {
    const key = name;

    if (name === "") {
        name = "Any";
    }
    if (name === "!") {
        name = "None";
    }
    if (name === "?") {
        name = "Some";
    }

    return [key, `${name} (${count})`];
}


export default function NoteFilter({
    notes,
    filter,
    setFilter,
}: {
    notes: ApiNoteList,
    filter: NoteFilterType,
    setFilter: (filter: NoteFilterType) => void,
}) {
    const series = notes.seriesCountedAbc.map(countedOptions);
    const types = notes.typesCountedAbc.map(countedOptions);

    // Create a series selector.
    const seriesSelector = <Selector
        className="series"
        label="Series"
        options={series}
        value={filter.series}
        onChange={(v) => setFilter({...filter, series: v})}
    />;

    // Create a type selector.
    const typeRadio = <Radio
        className="type"
        label="Type"
        options={types}
        value={filter.type}
        onChange={(v) => setFilter({...filter, type: v})}
    />;

    // Create a checkbox for filtering notes with/without titles.
    const requireH1Checkbox = <Toggle
        label="has an H1 heading"
        checked={filter.requireH1}
        onChange={(v) => setFilter({...filter, requireH1: v})}
    />;

    const onlyDraftsCheckbox = <Toggle
        label="is a draft"
        checked={filter.tag === "draft"}
        onChange={(v) => setFilter({...filter, tag: v ? "draft" : ""})}
    />;

    return <div className="note-filter">
        {seriesSelector}
        <Toggle
            className="sort"
            label="New first"
            checked={filter.orderDir === "desc"}
            onChange={(v) => setFilter({...filter, orderDir: v ? "desc" : "asc"})}
        />
        {typeRadio}
        <fieldset
            className="check"
        >
            <legend>Require</legend>
            {requireH1Checkbox}
            {onlyDraftsCheckbox}
        </fieldset>
    </div>;
}
