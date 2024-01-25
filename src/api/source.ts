import { TAbstractFile, TFile, TFolder } from "obsidian";
import { ApiNotePeriodic } from "./note";
import { ApiNotePeriodicList } from "./note-list";
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


export class ApiFolder {
    constructor(
        readonly tf: TFolder,
        readonly includeHidden: boolean = false,
    ) {
    }

    filterHidden<T extends TAbstractFile>(fs: T[]): T[] {
        return this.includeHidden ? fs : fs.filter(f => !f.name.startsWith("_"));
    }

    get subfolders(): ApiFolder[] {
        const fs = this.tf.children.filter(c => c instanceof TFolder) as TFolder[];
        return this.filterHidden(fs).map(f => new ApiFolder(f, this.includeHidden));
    }

    get files(): TFile[] {
        const fs = this.tf.children.filter(c => c instanceof TFile) as TFile[];
        return this.filterHidden(fs);
    }
}


export default class ApiSource {

    #et = new EventTarget();

    root: TFolder;
    periodic: ApiNotePeriodicList;

    constructor() {
        if (!lg) {
            lg = ftvkyo.lg.sub("api-source");
        }

        this.update();

        ftvkyo.on("metadata", () => this.update());
    }

    update() {
        this.root = app.vault.getRoot();

        const mdfs = app.vault.getMarkdownFiles();

        const notesPeriodic = [];

        for (const mdf of mdfs) {
            // A note is supposedly periodic if it's in the right directory.
            // It still may have an incorrect filename pattern.
            const supposedlyPeriodic = mdf.path.startsWith(ftvkyo.settings.folderPeriodic + "/");

            if (supposedlyPeriodic) {
                const [type, date] = this.determinePeriodicNote(mdf.path);

                if (type && date) {
                    notesPeriodic.push(new ApiNotePeriodic(mdf, date, type));
                } else {
                    lg?.error(`Unexpected note: "${mdf.path}" - can't determine type`);
                }
            }
        }

        this.periodic = new ApiNotePeriodicList(notesPeriodic);

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(e: "updated", cb: () => void) {
        this.#et.addEventListener("updated", cb);
    }

    get adapter() {
        return new ApiFolder(this.root);
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

    generatePeriodicPathFormat(noteType: MomentPeriods): string {
        let folder = ftvkyo.settings.folderPeriodic;
        folder &&= `[${folder}]/`;

        let year = ftvkyo.settings.groupByYear ? (FMT_YearGrouping[noteType] ?? FMT_YearGrouping.default ) : "";
        year &&= `${year}/`;

        let basename = FMT_Basenames[noteType];
        basename &&= `${basename}[.md]`;

        return folder + year + basename;
    }

    generatePeriodicPath(noteType: MomentPeriods, date: moment.Moment): string {
        return date.format(this.generatePeriodicPathFormat(noteType));
    }

    determinePeriodicNote(path: string): [MomentPeriods, moment.Moment] | [null] {
        const order = [
            "date",
            "week",
            "month",
            "quarter",
            "year",
        ] as const;

        for (const type of order) {
            const fmt = this.generatePeriodicPathFormat(type);
            const date = ftvkyo.momentParse(path, fmt);
            if (date.isValid()) {
                return [type, date];
            }
        }

        return [null];
    }

    /* ============== *
     * Creating stuff *
     * ============== */

    async createUniqueNoteAt(folder: string): Promise<TFile> {
        let counter = 1;
        const path = () => `${folder}/Untitled-${counter}.md`;

        // Find the first available name
        while (app.vault.getAbstractFileByPath(path())) {
            counter += 1;
        }

        await this.ensureFolder(folder);

        const template = this.getTemplate("unique");
        if (template) {
            const newNote = await app.vault.copy(template, path());
            await replaceTemplates("unique", ftvkyo.moment(), newNote);
            return newNote;
        }

        return await app.vault.create(path(), "");
    }

    async createPeriodicNote(noteType: MomentPeriods, date: moment.Moment): Promise<TFile> {
        const template = this.getTemplate(noteType);

        if (!template) {
            throw new Error(`No template for note type '${noteType}'`);
        }

        lg?.debug(`Creating a note of type ${noteType} for date ${date.format()}`)

        const path = this.generatePeriodicPath(noteType, date);

        const folderPath = path.substring(0, path.lastIndexOf("/"));
        await this.ensureFolder(folderPath);

        // Check if the file already exists
        const existing = app.vault.getAbstractFileByPath(path);

        if (existing) {
            throw Error(`Tried to create a file "${path}", but it already exists.`);
        }

        // Create the note
        const newNote = await app.vault.copy(template, path);

        // Process the templates inside
        await replaceTemplates(noteType, date, newNote);

        return newNote;
    }

    // Make sure a folder at `path` exists (and is not a file).
    // Note: empty string is treated as "/", which always exists.
    async ensureFolder(path: string) {
        if (!path) {
            return;
        }

        lg?.debug(`Ensuring folder '${path}' exists...`);

        // Check if it exists.
        const existing = app.vault.getAbstractFileByPath(path);

        if (existing) {
            if (existing instanceof TFolder) {
                return;
            }
            throw Error(`Tried to create a folder "${path}", but a file exists at this path.`);
        }

        // Does create folders recursively
        return app.vault.createFolder(path);
    }
}
