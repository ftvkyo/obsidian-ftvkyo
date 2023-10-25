import { clsx } from "clsx";
import { setIcon } from "obsidian";

import styles from "./Icon.module.scss";


function setIconCallback(node: HTMLElement | null) {
    if (node) {
        const name = node.getAttribute("data-icon");
        name && setIcon(node, name);
    }
}


export interface IconProps {
    icon: string,
    label?: string,
    pressed?: boolean,
    disabled?: boolean,
    onClick?: (e: React.MouseEvent) => void,
}


export default function Icon({
    icon,
    label,
    pressed,
    disabled,
    onClick,
}: IconProps) {
    return <div
        ref={setIconCallback}

        className={clsx(
            "clickable-icon", // General styling from obsidian
            pressed && "is-active", // When it's a toggle that is pressed
            styles.icon, // Custom styling
            disabled && styles.disabled,
            !onClick && styles.passive, // When the icon should not be interactive
        )}

        data-icon={icon}
        aria-label={label}

        onClick={onClick}
    />;
}
