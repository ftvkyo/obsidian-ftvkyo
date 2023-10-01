export default function Radio({
    legend,
    options,
    value,
    onChange,
}: {
    legend: string,
    options: [string /* key */, string /* display */][],
    value: string,
    onChange: (option: string) => void,
}) {
    return  <fieldset>
        <legend>{legend}</legend>

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
