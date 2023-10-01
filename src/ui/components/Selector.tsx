export default function Selector({
    options,
    value,
    onChange,
}: {
    options: [string /* key */, string /* value */][],
    value: string,
    onChange: (option: string) => void,
}) {
    const opts = options.map(([key, name]) => {
        return <option
            key={key}
            value={key}
        >
            {name}
        </option>;
    });

    return <select
        className="dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
    >
        {opts}
    </select>;
}
