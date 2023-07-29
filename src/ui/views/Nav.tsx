import { useCallback } from "react";

import { openFile } from "@/note/open";
import { usePlugin } from "@/ui/context";
import { type ViewElement } from "./view";
import NoteCard from "../components/NoteCard";

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
            {pages.map(page =>
                <NoteCard
                    key={page.file.name}
                    filename={page.file.name}
                    openNoteCallback={openNote}
                />
            )}
        </div>;
    },
    viewType: "ftvkyo-navigation",
    displayText: "Ftvkyo Navigation",
    icon: "lucide-folder-tree",
};

export default NavView;
