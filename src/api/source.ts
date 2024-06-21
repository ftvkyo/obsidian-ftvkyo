import { FrontMatterCache, TAbstractFile, TFile, TFolder } from "obsidian";
import { MomentPeriods } from "../util/date";
import { replaceTemplates } from "../util/templates";

import Logger from "@/util/logger";


let lg: Logger | undefined = undefined;


export type NoteType = MomentPeriods;

export type ApiFileKind = {
    period: MomentPeriods,
    date: moment.Moment,
};


const FMT_Basenames: Record<NoteType, string> = {
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


export class ApiFile<Kind extends ApiFileKind> {
    constructor(
        readonly tf: TFile,
        readonly kind: Kind,
    ) {
        if (kind) {
            kind.date.hour(0).minute(0).second(0);
        }
    }

    get fc() {
        return app.metadataCache.getFileCache(this.tf);
    }

    get fm() {
        return this.fc?.frontmatter ?? null;
    }

    get tasks() {
        return this.fc?.listItems?.filter(val => val.task !== undefined) ?? [];
    }

    async reveal(
        {
            mode,
            replace = false,
            rename,
        }: {
            // What mode to open the note in.
            mode?: "preview" | "source",
            // Whether to replace the current workspace leaf.
            replace?: boolean,
            // Whether to put the cursor to note title for renaming.
            rename?: "end",
        } = {},
    ) {
        const current = app.workspace.getActiveFile();
        const shouldReplace = replace || current === null;

        const leaf = app.workspace.getLeaf(!shouldReplace);
        await leaf.openFile(this.tf, {
            state: { mode },
            eState: { rename },
        });

        return leaf;
    }
}


export default class ApiSource {

    #et = new EventTarget();

    periodic: ApiFile<ApiFileKind>[];

    constructor() {
        if (!lg) {
            lg = ftvkyo.lg.sub("api-source");
        }

        this.update();

        ftvkyo.on("metadata", () => this.update());
    }

    update() {
        this.periodic = [];

        const mdfs = app.vault.getMarkdownFiles();

        for (const mdf of mdfs) {
            // A note is supposedly periodic if it's in the right directory.
            // It still may have an incorrect filename pattern.
            const supposedlyPeriodic = mdf.path.startsWith(ftvkyo.settings.folderPeriodic + "/");

            if (supposedlyPeriodic) {
                const [period, date] = this.determinePeriodicNote(mdf.path);

                if (period && date) {
                    this.periodic.push(new ApiFile(mdf, {period, date}));
                } else {
                    lg?.error(`Unexpected note: "${mdf.path}" - can't determine type`);
                }
            }
        }

        this.#et.dispatchEvent(new Event("updated"));
    }

    on(e: "updated", cb: () => void) {
        this.#et.addEventListener("updated", cb);
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

    async createPeriodicNote(period: MomentPeriods, date: moment.Moment): Promise<ApiFile<ApiFileKind>> {
        const template = this.getTemplate(period);

        if (!template) {
            throw new Error(`No template for note type '${period}'`);
        }

        lg?.debug(`Creating a note of type ${period} for date ${date.format()}`)

        const path = this.generatePeriodicPath(period, date);

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
        await replaceTemplates(period, date, newNote);

        return new ApiFile(newNote, { period, date });
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
