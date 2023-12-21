import { clsx } from "clsx";
import Icon from "../controls/Icon";

import styles from "./Progress.module.scss";


export default function Progress({
    icon,
    value,
    max,
    compact = false,
    reverse = false,
    className,
}: {
    icon?: string,
    value: number,
    max: number,
    compact?: boolean,
    reverse?: boolean,
    className?: string,
}) {
    return <div className={clsx(className, styles.progress, reverse && styles.reverse)}>
        {icon && <Icon icon={icon}/>}
        {value}/{max}
        {compact
            || <progress
                value={value}
                max={max}
            />
        }
    </div>
}
