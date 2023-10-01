import ApiNoteList, {NoteFilterType} from "@/api/note-list";
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

    // Tag selector.
    const tagSelector = <Selector
        options={tags}
        value={filter.tag}
        onChange={(v) => setFilter({...filter, tag: v})}
    />;

    // Filtering notes with/without titles.
    const hasTitle = <TriToggle
        value={filter.title}
        onChange={(v) => setFilter({...filter, title: v})}
    />;

    // Filtering WIP notes.
    const isWip = <TriToggle
        value={filter.wip}
        onChange={(v) => setFilter({...filter, wip: v})}
    />;

    return <div className="note-filter">
        <span>Tag</span> {tagSelector}
        <span>Title</span> {hasTitle}
        <span>Work in Progress</span> {isWip}
    </div>;
}
