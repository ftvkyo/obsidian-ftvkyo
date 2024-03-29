import { clsx } from "clsx";
import { setIcon } from "obsidian";
import { useCallback } from "react";

import styles from "./Icon.module.scss";


export interface IconProps {
    icon: string,
    label?: string,
    pressed?: boolean,
    disabled?: boolean,
    onClick?: (e: React.MouseEvent) => void,
    onAuxClick?: (e: React.MouseEvent) => void,
    className?: string,
}


export default function Icon({
    icon,
    label,
    pressed,
    disabled,
    onClick,
    onAuxClick,
    className,
}: IconProps) {
    const updateIcon = useCallback((node: HTMLElement | null) => {
        if (node) {
            const name = node.getAttribute("data-icon");
            name && setIcon(node, name);
        }
    }, [icon]);

    return <div
        ref={updateIcon}

        className={clsx(
            className, // Styling from the parent component
            "clickable-icon", // General styling from obsidian
            pressed && "is-active", // When it's a toggle that is pressed
            styles.icon, // Custom styling
            disabled && styles.disabled,
            !onClick && styles.passive, // When the icon should not be interactive
        )}

        data-icon={icon}
        aria-label={label}

        onClick={onClick}
        onAuxClick={onAuxClick}
    />;
}
