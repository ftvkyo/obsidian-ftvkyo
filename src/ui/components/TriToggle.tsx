import { clsx } from "clsx";
import { useId } from "react";

export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
}

export default function TriToggle({
    className,
    label,
    value,
    onChange,
}: {
    className?: string,
    label: string,
    value: TriState,
    onChange: (state: TriState) => void,
}) {
    const name = useId();

    return <div
        className={clsx("tri-toggle", className)}
    >
        {label}:

        <div
            className="tri-toggle-selector"
        >
            <div className={clsx("tri-toggle-slider", value)}/>

            <input type="radio" name={name} className={TriState.Off}
                checked={value == TriState.Off}
                onChange={() => onChange(TriState.Off)}
            />
            <input type="radio" name={name} className={TriState.Maybe}
                checked={value == TriState.Maybe}
                onChange={() => onChange(TriState.Maybe)}
            />
            <input type="radio" name={name} className={TriState.On}
                checked={value == TriState.On}
                onChange={() => onChange(TriState.On)}
            />
        </div>
    </div>;
}
