import ApiNoteList, {NoteFilterType} from "@/api/note-list";
import Radio from "./Radio";
import Selector from "./Selector";
import TriToggle from "./TriToggle";

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
    const hasTitle = <TriToggle
        label="Title present"
        value={filter.title}
        onChange={(v) => setFilter({...filter, title: v})}
    />;

    // Filtering WIP notes.
    const isWip = <TriToggle
        label="Work in Progress"
        value={filter.wip}
        onChange={(v) => setFilter({...filter, wip: v})}
    />;

    return <div className="note-filter">
        {tagSelector}
        {typeRadio}
        <fieldset
            className="check"
        >
            <legend>Condition</legend>
            {hasTitle}
            {isWip}
        </fieldset>
    </div>;
}
