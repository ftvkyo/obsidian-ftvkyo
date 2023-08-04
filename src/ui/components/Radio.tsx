export default function Radio({
    className,
    label,
    options,
    value,
    onChange,
}: {
    className?: string,
    label: string,
    options: [string /* key */, string /* display */][],
    value: string,
    onChange: (option: string) => void,
}) {
    return  <fieldset
        className={className}
    >
        <legend>{label}</legend>

        {options.map(([key, display]) => <label
            key={key}
        >
            <input
                type="radio"
                checked={key === value}
                onChange={() => onChange(key)}
            />
            {display}
        </label>)}
    </fieldset>;
}
