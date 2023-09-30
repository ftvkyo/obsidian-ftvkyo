import { clsx } from "clsx";
import { useId } from "react";

export enum TriToggleState {
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
    value: TriToggleState,
    onChange: (state: TriToggleState) => void,
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

            <input type="radio" name={name} className={TriToggleState.Off}
                checked={value == TriToggleState.Off}
                onChange={() => onChange(TriToggleState.Off)}
            />
            <input type="radio" name={name} className={TriToggleState.Maybe}
                checked={value == TriToggleState.Maybe}
                onChange={() => onChange(TriToggleState.Maybe)}
            />
            <input type="radio" name={name} className={TriToggleState.On}
                checked={value == TriToggleState.On}
                onChange={() => onChange(TriToggleState.On)}
            />
        </div>
    </div>;
}
