import {setIcon} from "obsidian";


export function populateIcons(
    under: HTMLElement,
) {
    // Query all children with a "data-icon" attribute.
    const icons = under.querySelectorAll<HTMLElement>("[data-icon]");

    icons.forEach((icon) => {
        const name = icon.getAttribute("data-icon");
        name && setIcon(icon, name);
    });
}
