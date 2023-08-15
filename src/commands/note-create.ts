import {MarkdownView} from "obsidian";

import Logger from "@/util/logger";

import * as format from "@/util/date";
import suggest from "@/ui/builtin/suggest";
import prompt from "@/ui/builtin/prompt";

import ApiNote from "@/api/note";


// FIXME: this still adds a newline into the current file and moves the cursor?


let lg: Logger | undefined = undefined;


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


const NoteCreate = {
    id: "note-create",
    name: "Create a note",
    callback: async () => {
        if (!lg) {
            lg = ftvkyo.lg.sub("note-create");
        }

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
        const noteType = await suggest(TYPES_TEXT, TYPES);

        lg.info(`Chosen note type "${noteType}"`);

        const folder = `${ftvkyo.settings.notesRoot}/${prefix}`;
        lg.info(`Resulting path: "${folder}/${name}"`);

        let tfolder = app.vault.getAbstractFileByPath(folder);
        if (!tfolder) {
            lg.info(`Folder "${folder}" does not exist, creating`);
            await app.vault.createFolder(folder);
            tfolder = app.vault.getAbstractFileByPath(folder);
        }

        // Try to ask for the title
        const title = await prompt("Input note title (optional)", undefined, true);
        const heading = title ? `# ${title}` : "";

        lg.info(`Resulting heading: "${heading}"`);

        /*
            Prepare note content.
        */

        let content = "---\n";

        if (noteType !== "default") {
            content += noteType + "\n";
        }

        content += "status: wip\n";

        content += "---\n\n";

        if (heading) {
            content += `${heading}\n`;
        }

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
        const noteTF = await app.vault.create(`${folder}/${name}.md`, content);
        const note = ApiNote.from(noteTF);

        lg.info(`Opening the note...`);
        await note.reveal({ mode: "source"});

        lg.info(`Moving the cursor...`);
        const view = app.workspace.getActiveViewOfType(MarkdownView);
        const editor = view?.editor;

        editor?.transaction({
            selections: [{
                from: cursor,
            }],
        });

        lg.info(`Note creation completed!`);
    }
}

export default NoteCreate;
