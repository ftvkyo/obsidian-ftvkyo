import {MarkdownView} from "obsidian";

import * as format from "@/util/date";
import suggest from "@/ui/builtin/suggest";
import prompt from "@/ui/builtin/prompt";

import ObsidianFtvkyo from "@/main";
import Logger from "@/util/logger";


// FIXME: this still adds a newline into the current file and moves the cursor?


/*
    Configuration.
*/

// Note types
const TYPES_TEXT = [
    "1: Default",
    "2: Wiki (name)",
    "3: Person (name)",
];
const TYPES = [
    "default",
    "wiki",
    "person",
];

/*
    Command.
*/

async function command(plugin: ObsidianFtvkyo, lg: Logger) {
    const now = new Date();

    // Generate dynamic part of the path
    const name = format.fmtFilename(now);
    const prefix = format.fmtPrefix(now);

    lg.info(`Using name "${name}"`);
    lg.info(`Using prefix "${prefix}"`);

    /*
        Asking the user for the necessary information.
    */

    // Figure out what kind of note we want to create
    const noteType = await suggest(plugin, TYPES_TEXT, TYPES);

    lg.info(`Chosen note type "${noteType}"`);

    const folder = `${plugin.settings.notesRoot}/${prefix}`;
    lg.info(`Resulting path: "${folder}/${name}"`);

    let tfolder = plugin.app.vault.getAbstractFileByPath(folder);
    if (!tfolder) {
        lg.info(`Folder "${folder}" does not exist, creating`);
        await plugin.app.vault.createFolder(folder);
        tfolder = plugin.app.vault.getAbstractFileByPath(folder);
    }

    // Try to ask for the title
    const title = await prompt(plugin, "Input note title (optional)", undefined, true);
    const heading = title ? `# ${title}` : "";

    lg.info(`Resulting heading: "${heading}"`);

    /*
        Prepare note content.
    */

    let content = "";

    if (noteType !== "default") {
        content += `\
---
type: ${noteType}
---
`;
    }

    if (heading) {
        content += `${heading}\n`;
    }

    content += `#${plugin.settings.draftTag}\n\n\n`;

    // Count the lines in the content
    const lines = content.split("\n").length;

    // Calculate the desired cursor position,
    // which is the line before the last line
    const cursor = {
        line: lines - 2,
        ch: 0,
    };

    /*
        Note creation.
    */

    lg.info(`Creating the note...`);
    const note = await plugin.app.vault.create(`${folder}/${name}.md`, content);

    lg.info(`Opening the note...`);
    await plugin.api.note.openTFile(note, "source");

    lg.info(`Moving the cursor...`);
    const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    const editor = view?.editor;

    editor?.transaction({
        selections: [{
            from: cursor,
        }],
    });

    lg.info(`Note creation completed!`);
}

/*
    Loader.
*/

export default function NoteCreate(plugin: ObsidianFtvkyo) {
    const lg = plugin.lg.sub(`note-create`);
    const callback = () => command(plugin, lg);
    plugin.addCommand({
        id: "note-create",
        name: "Create a note",
        callback,
    });
}
