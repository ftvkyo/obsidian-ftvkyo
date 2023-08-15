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
    const tags = notes.tagsCountedAbc.map(countedOptions);
    const types = notes.typesCountedAbc.map(countedOptions);

    // Tag selector.
    const tagSelector = <Selector
        className="tag"
        label="Tag"
        options={tags}
        value={filter.tag}
        onChange={(v) => setFilter({...filter, tag: v})}
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

    // Filtering WIP notes.
    const isWipCheckbox = <Checkbox
        label="Is WIP"
        checked={filter.requireWip}
        onChange={(v) => setFilter({...filter, requireWip: v})}
    />;

    // Filtering notes that have places that can be filled in.
    const isLooseCheckbox = <Checkbox
        label="Is loose"
        checked={filter.requireLoose}
        onChange={(v) => setFilter({...filter, requireLoose: v})}
    />;

    return <div className="note-filter">
        {tagSelector}
        {typeRadio}
        <fieldset
            className="check"
        >
            <legend>Has</legend>
            {hasH1Checkbox}
            {isWipCheckbox}
            {isLooseCheckbox}
        </fieldset>
    </div>;
}
