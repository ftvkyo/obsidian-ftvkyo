import Icon from "../controls/Icon";

import styles from "./ProgressBar.module.scss";


export default function ProgressBar({
    icon,
    value,
    max,
}: {
    icon: string | undefined,
    value: number,
    max: number,
}) {
    return <div className={styles.progress}>
        {icon && <Icon icon={icon}/>}
        {value} of {max}
        <progress
            value={value}
            max={max}
        />
    </div>
}
