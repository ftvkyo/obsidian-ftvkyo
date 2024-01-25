import { ApiNote, revealNote } from "@/api/note";
import { useCallback } from "react";

export function useOnNoteClick(note: ApiNote | undefined) {
    const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        note && revealNote(note.tf, { replace: !e.ctrlKey });
    }, [note?.path]);

    const onAuxClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (note && e.button === 1) {
            // Middle mouse button.
            e.preventDefault();

            // "genius": Relay to the other handler.
            e.button = 0;
            e.ctrlKey = true;
            onClick(e);
        }
    }, [note?.path, onClick]);

    return {onClick, onAuxClick};
}
