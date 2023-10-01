import { clsx } from "clsx";
import { useId } from "react";

import styles from "./TriToggle.module.scss";

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
        className={styles.triToggle}
    >
        <div className={clsx(styles.slider, styles[value])}/>

        <input type="radio" name={name}
            checked={value == TriState.Off}
            onChange={() => onChange(TriState.Off)}
        />
        <input type="radio" name={name}
            checked={value == TriState.Maybe}
            onChange={() => onChange(TriState.Maybe)}
        />
        <input type="radio" name={name}
            checked={value == TriState.On}
            onChange={() => onChange(TriState.On)}
        />
    </div>;
}
