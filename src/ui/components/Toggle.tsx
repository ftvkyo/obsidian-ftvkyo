export default function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
}) {

    return <label>
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        {label}
    </label>;
}
