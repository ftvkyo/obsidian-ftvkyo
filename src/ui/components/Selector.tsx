export default function Selector({
    className,
    label,
    options,
    value,
    onChange,
}: {
    className?: string,
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

    return <label
        className={className}
    >
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
