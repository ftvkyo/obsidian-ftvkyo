import {Plugin} from "obsidian";

import * as format from "../tools/format";
import suggest from "../tools/suggest";
import prompt from "../tools/prompt";

import logger from "../util/logger";

const lg = logger.sub(`note-create`);

/*
    Configuration.
*/

const ROOT = "notes";

// Folders-sections
let SECTIONS_TEXT = [
    "1: Journal (date)",
    "2: Static (date+name)",
    "3: Wiki (name)",
    "4: Person (name)",
];
let SECTIONS = [
    "journal",
    "static",
    "wiki",
    "people",
];

/*
    Command.
*/

async function command() {
    const { tp } = this.deps;

    const slg = lg.info(`Creating a note`).sub();

    const now = new Date();

    // Generate dynamic part of the path
    const name = format.fmtFilename(now);
    const prefix = format.fmtPrefix(now);

    slg.info(`Using name "${name}"`);
    slg.info(`Using prefix "${prefix}"`);

    /*
        Asking the user for the necessary information.
    */

    // Figure out what kind of note we want to create
    let section = await suggest(this.app, SECTIONS_TEXT, SECTIONS);

    slg.info(`Chosen section "${section}"`);

    let folder = `${ROOT}/${section}/${prefix}`;
    let tfolder = this.app.vault.getAbstractFileByPath(folder);

    slg.info(`Resulting path: "${folder}/${name}"`);

    // Figure out the title based on the chosen section
    let topic = "";

    if (section !== "journal") {
        topic = await prompt(this.app, "Input note topic");
        slg.info(`Asked for topic`);
    }

    let title = format.fmtTitle(section, now, topic);

    slg.info(`Resulting title: "${title}"`);

    /*
        Prepare note content.
    */

    // Define note content
    let content = `\
# ${title}
#draft

<% tp.file.cursor(1) %>
`;

    /*
        Note creation.
    */

    slg.info(`Using Templater to create the note...`);
    const note = await tp.templater.create_new_note_from_template(
        content,
        tfolder,
        name,
        false, // We'd rather open manually...
    );

    slg.info(`Checking if there's a current file...`);
    const current = this.app.workspace.getActiveFile();

    slg.info(`Opening the note...`);
    const leaf = this.app.workspace.getLeaf(!!current);
    await leaf.openFile(note, {
        state: { mode: "source" },
    });

    slg.info(`Navigating to the next cursor location...`);
    tp.editor_handler.jump_to_next_cursor_location();

    lg.info(`Note creation completed!`);
}

/*
    Loader.
*/

export default function NoteCreate(plugin: Plugin) {
    const callback = command.bind(plugin);
    plugin.addCommand({
        id: "note-create",
        name: "Create a note",
        callback,
    });
}
