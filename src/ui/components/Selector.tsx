export default function Selector({
    label,
    options,
    value,
    onChange,
}: {
    label: string,
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

    return <label>
        {label}:
        <select
            className="dropdown"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {opts}
        </select>
    </label>;
}
