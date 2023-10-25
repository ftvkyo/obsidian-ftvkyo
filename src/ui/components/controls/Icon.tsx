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
    active?: boolean,
    onClick?: () => void,
}


export default function Icon({
    icon,
    label,
    active,
    onClick,
}: IconProps) {
    return <div
        ref={setIconCallback}

        className={clsx(
            "clickable-icon", // General styling from obsidian
            active && "is-active", // When it's a toggle that is pressed
            styles.icon, // Custom styling
            !onClick && styles.off, // When the icon should not be interactive
        )}

        data-icon={icon}
        aria-label={label}

        onClick={onClick}
    />;
}
