import * as format from "@/util/format";
import suggest from "@/ui/builtin/suggest";
import prompt from "@/ui/builtin/prompt";

import ObsidianFtvkyo from "@/main";
import Logger from "@/util/logger";


/*
    Configuration.
*/

const ROOT = "notes";

// Folders-sections
const SECTIONS_TEXT = [
    "1: Journal (date)",
    "2: Static (date+name)",
    "3: Wiki (name)",
    "4: Person (name)",
];
const SECTIONS = [
    "journal",
    "static",
    "wiki",
    "people",
];

/*
    Command.
*/

async function command(plugin: ObsidianFtvkyo, lg: Logger) {
    const tp = plugin.tp;

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
    const section = await suggest(plugin, SECTIONS_TEXT, SECTIONS);

    lg.info(`Chosen section "${section}"`);

    const folder = `${ROOT}/${section}/${prefix}`;
    const tfolder = plugin.app.vault.getAbstractFileByPath(folder);

    lg.info(`Resulting path: "${folder}/${name}"`);

    // Figure out the title based on the chosen section
    let topic = "";

    if (section !== "journal") {
        topic = await prompt(plugin, "Input note topic");
        lg.info(`Asked for topic`);
    }

    const title = format.fmtTitle(section, now, topic);

    lg.info(`Resulting title: "${title}"`);

    /*
        Prepare note content.
    */

    // Define note content
    const content = `\
# ${title}
#draft

<% tp.file.cursor(1) %>
`;

    /*
        Note creation.
    */

        lg.info(`Using Templater to create the note...`);
    const note = await tp.templater.create_new_note_from_template(
        content,
        tfolder,
        name,
        false, // We'd rather open manually...
    );

    lg.info(`Checking if there's a current file...`);
    const current = plugin.app.workspace.getActiveFile();

    lg.info(`Opening the note...`);
    const leaf = plugin.app.workspace.getLeaf(!!current);
    await leaf.openFile(note, {
        state: { mode: "source" },
    });

    lg.info(`Navigating to the next cursor location...`);
    tp.editor_handler.jump_to_next_cursor_location();

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
