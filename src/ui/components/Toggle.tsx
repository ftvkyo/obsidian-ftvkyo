export default function Toggle({
    className,
    label,
    checked,
    onChange,
}: {
    className?: string,
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
}) {

    return <label
        className={className}
    >
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
        />
        {label}
    </label>;
}
