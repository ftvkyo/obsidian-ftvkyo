import { clsx } from "clsx";
import { useId } from "react";

export enum TriState {
    On = "on",
    Off = "off",
    Maybe = "maybe",
}

export default function TriToggle({
    value,
    onChange,
}: {
    value: TriState,
    onChange: (state: TriState) => void,
}) {
    const name = useId();

    return <div
        className="tri-toggle"
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
    </div>;
}
