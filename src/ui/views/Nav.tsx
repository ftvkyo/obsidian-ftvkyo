import { useCallback } from "react";

import { openFile } from "@/note/open";
import { getTitleByFileName } from "@/note/title";
import { usePlugin } from "@/ui/context";
import { type ViewElement } from "./view";

const NavView: ViewElement = {
    Element: () => {
        const plugin = usePlugin();
        const { dv, notesSource } = plugin;

        const pages = dv.pages(notesSource);

        // TODO: Display a warning if there are notes with the same
        // name in different folders.

        const openNote = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();
            const href = e.currentTarget.getAttribute("href");
            if (href) {
                await openFile(plugin, href);
            }
        }, []);

        return <div className="view-content">
            <ul>
                {pages.map(page => <li key={page.file.name}>
                    <a
                        href={page.file.name}
                        className="internal-link"
                        target="_blank"
                        rel="noopener"
                        aria-label={page.file.name}
                        data-href={page.file.name}
                        data-tooltip-position="top"

                        onClick={openNote}
                    >
                        {getTitleByFileName(plugin, page.file.name)}
                    </a>
                </li>)}
            </ul>
        </div>;
    },
    viewType: "ftvkyo-navigation",
    displayText: "Ftvkyo Navigation",
    icon: "lucide-folder-tree",
};

export default NavView;
