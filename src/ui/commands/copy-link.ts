import { Command } from "obsidian";

import { toClipboard } from "@/util/clipboard";


const CopyLink: Command = {
    id: "copy-link",
    name: "Copy Wikilink to the current note",
    checkCallback: (checking) => {
        const currentFile = ftvkyo.app.workspace.getActiveFile();

        if (checking || currentFile === null) {
            return currentFile !== null;
        }

        toClipboard(`[[${currentFile.basename}]]`)
    },
};

export default CopyLink;
