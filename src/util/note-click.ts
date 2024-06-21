import { ApiFile, ApiFileKind } from "@/api/source";
import { useCallback } from "react";

export function useOnNoteClick<Kind extends ApiFileKind>(note: ApiFile<Kind> | undefined) {
    const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        note && note.reveal({ replace: !e.ctrlKey });
    }, [note?.tf.path]);

    const onAuxClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (note && e.button === 1) {
            // Middle mouse button.
            e.preventDefault();

            // "genius": Relay to the other handler.
            e.button = 0;
            e.ctrlKey = true;
            onClick(e);
        }
    }, [note?.tf.path, onClick]);

    return {onClick, onAuxClick};
}
