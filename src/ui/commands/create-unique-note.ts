import { ApiNoteUnique } from "@/api/note";
import { Command } from "obsidian";


const CreateUniqueNote: Command = {
    id: "create-unique-note",
    name: "Create a new unique note",
    callback: async () => {
        const now = ftvkyo.moment();
        const newNote = await ftvkyo.api.source.createNote("unique", now);
        new ApiNoteUnique(newNote, now).reveal({ mode: "source" });
    },
};

export default CreateUniqueNote;
