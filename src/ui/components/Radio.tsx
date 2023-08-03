export default function Radio({
    label,
    options,
    value,
    onChange,
}: {
    label: string,
    options: [string /* key */, string /* display */][],
    value: string,
    onChange: (option: string) => void,
}) {
    return <form
        onSubmit={() => false}
    >
        <fieldset>
            <legend>{label}</legend>

            {options.map(([key, display]) => <label
                key={key}
            >
                <input
                    key={key}
                    type="radio"
                    checked={key === value}
                    onChange={() => onChange(key)}
                />
                {display}
            </label>)}
        </fieldset>
    </form>;
}
