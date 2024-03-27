import { Menu } from "obsidian";
import { useCallback } from "react";


export interface MenuItem {
    title: string,
    icon: string,
    onClick: () => void,
}


export function createMenu(items: MenuItem[]) {
    return useCallback((event: React.MouseEvent) => {
        const menu = new Menu();

        for (const item of items) {
            menu.addItem((el) => {
                el
                    .setTitle(item.title)
                    .setIcon(item.icon)
                    .onClick(item.onClick);
            });
        }

        menu.showAtMouseEvent(event.nativeEvent);
    }, [items]);
}
