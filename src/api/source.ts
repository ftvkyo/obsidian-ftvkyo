import { TFile } from "obsidian";
import { ApiNote, ApiNotePeriodic, ApiNoteUnique } from "./note";
import { ApiNotePeriodicList, ApiNoteUniqueList } from "./note-list";
import { MomentPeriods } from "../util/date";
import { replaceTemplates } from "../util/templates";

import Logger from "@/util/logger";


let lg: Logger | undefined = undefined;


export type NoteType = "unique" | MomentPeriods;

const FMT_Basenames: Record<NoteType, string> = {
    unique: "YYYYMMDD-HHmmss",
    date: "YYYYMMDD",
    week: "gggg-[W]ww",
    month: "YYYYMM",
    quarter: "YYYY-[Q]Q",
    year: "YYYY",
};


const FMT_YearGrouping: { [key in NoteType]?: string } & { default: string } = {
    default: "YYYY",
    week: "gggg",
};


export default class ApiSource {

    #et = new EventTarget();

    cache: {
        unique: ApiNoteUniqueList,
        periodic: ApiNotePeriodicList,
    };

    constructor() {
        if (!lg) {
            lg = ftvkyo.lg.sub("api-source");
        }

        this.update();

        ftvkyo.on("metadata", () => this.update());
    }

    update() {
        const mdfs = ftvkyo.app.vault.getMarkdownFiles();

        const notesUnique = [];
        const notesPeriodic = [];

        for (const mdf of mdfs) {
            const [type, date] = this.determineNote(mdf.path);

            if (type === null) {
                // We only care about notes that are in periodic / unique folders.

                const inPeriodic = mdf.path.startsWith(ftvkyo.settings.folderPeriodic + "/");
                const inUnique = mdf.path.startsWith(ftvkyo.settings.folderUnique + "/");

                if (inPeriodic || inUnique) {
                    lg?.error(`Unexpected note: "${mdf.path}" - can't determine type`);
                }
            } else if (type === "unique") {
                notesUnique.push(new ApiNoteUnique(mdf, date));
            } else {
                notesPeriodic.push(new ApiNotePeriodic(mdf, date, type));
            }
        }

        this.cache = {
            unique: new ApiNoteUniqueList(notesUnique),
            periodic: new ApiNotePeriodicList(notesPeriodic),
        };

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(e: "updated", cb: () => void) {
        this.#et.addEventListener("updated", cb);
    }

    /* ================ *
     * Search the cache *
     * ================ */

    byTf(
        tf: TFile,
    ): ApiNote | null {
        const unique = this.cache.unique.find(note => note.tf.path === tf.path);
        const periodic = this.cache.periodic.find(note => note.tf.path === tf.path);

        return unique ?? periodic;
    }

    // Try to get a note from a path.
    // Returns null if the note is not found in cache.
    // If `from` is specified, the path is resolved relative to `from`.
    byPath(
        path: string,
        from: string = "",
    ): ApiNote | null {
        // Use the builtin method to find the note.
        const tf = app.metadataCache.getFirstLinkpathDest(path, from);

        if (!tf) {
            return null;
        }

        return this.byTf(tf);
    }

    /* ======================= *
     * Accessing configuration *
     * ======================= */

    getTemplate(noteType: NoteType): TFile | null {
        const path = ftvkyo.settings.folderTemplates + "/" + noteType + ".md";
        const taf = ftvkyo.app.vault.getAbstractFileByPath(path);
        if (taf && taf instanceof TFile) {
            return taf;
        }
        return null;
    }

    generatePathFormat(noteType: NoteType): string {
        let folder;
        if (noteType === "unique") {
            folder = ftvkyo.settings.folderUnique;
        } else {
            folder = ftvkyo.settings.folderPeriodic;
        }
        folder &&= `[${folder}]/`;

        let year = ftvkyo.settings.groupByYear ? (FMT_YearGrouping[noteType] ?? FMT_YearGrouping.default ) : "";
        year &&= `${year}/`;

        let basename = FMT_Basenames[noteType];
        basename &&= `${basename}[.md]`;

        return folder + year + basename;
    }

    generatePath(noteType: NoteType, date: moment.Moment): string {
        return date.format(this.generatePathFormat(noteType));
    }

    determineNote(path: string): [NoteType, moment.Moment] | [null] {
        const order = [
            "unique",
            "date",
            "week",
            "month",
            "quarter",
            "year",
        ] as const;

        for (const type of order) {
            const fmt = this.generatePathFormat(type);
            const date = ftvkyo.momentParse(path, fmt);
            if (date.isValid()) {
                return [type, date];
            }
        }

        return [null];
    }

    async createNote(noteType: NoteType, date: moment.Moment): Promise<TFile> {
        const template = this.getTemplate(noteType);

        if (!template) {
            throw new Error(`No template for note type '${noteType}'`);
        }

        lg?.debug(`Creating a note of type ${noteType} for date ${date.format()}`)

        const path = this.generatePath(noteType, date);

        // Create the note
        const newNote = await app.vault.copy(template, path);

        // Process the templates inside
        await replaceTemplates(noteType, date, newNote);

        return newNote;
    }
}
