import ApiNoteList, {NoteFilterType} from "@/api/note-list";
import Radio from "./Radio";
import Selector from "./Selector";
import Checkbox from "./Checkbox";

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

    // Series selector.
    const seriesSelector = <Selector
        className="series"
        label="Series"
        options={series}
        value={filter.series}
        onChange={(v) => setFilter({...filter, series: v})}
    />;

    // Type selector.
    const typeRadio = <Radio
        className="type"
        label="Type"
        options={types}
        value={filter.type}
        onChange={(v) => setFilter({...filter, type: v})}
    />;

    // Filtering notes with/without titles.
    const hasH1Checkbox = <Checkbox
        label="H1 heading"
        checked={filter.requireH1}
        onChange={(v) => setFilter({...filter, requireH1: v})}
    />;

    const tagD = ftvkyo.settings.draftTag;

    // Filtering drafts
    const hasDraftCheckbox = <Checkbox
        label={"#" + tagD}
        checked={filter.tags[tagD] ?? false}
        onChange={(v) => setFilter({...filter, tags: {...filter.tags, [tagD]: v}})}
    />;

    const tagLe = ftvkyo.settings.looseEndTag;

    // Filtering notes that have places that can be filled in.
    const hasLooseCheckbox = <Checkbox
        label={"#" + tagLe}
        checked={filter.tags[tagLe] ?? false}
        onChange={(v) => setFilter({...filter, tags: {...filter.tags, [tagLe]: v}})}
    />;

    return <div className="note-filter">
        {seriesSelector}
        <Checkbox
            className="sort"
            label="New first"
            checked={filter.orderDir === "desc"}
            onChange={(v) => setFilter({...filter, orderDir: v ? "desc" : "asc"})}
        />
        {typeRadio}
        <fieldset
            className="check"
        >
            <legend>Has</legend>
            {hasH1Checkbox}
            {hasDraftCheckbox}
            {hasLooseCheckbox}
        </fieldset>
    </div>;
}
