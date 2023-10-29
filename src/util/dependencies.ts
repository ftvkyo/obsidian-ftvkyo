import { moment, TFile } from "obsidian";
import { MomentPeriods } from "./date";


export interface SingleNoteTypeSetting {
    format: string,
    template: string,
    folder: string,
}

export interface MaybeEnabled {
    enabled?: true;
}


export type PeriodicNotesPeriods = "yearly" | "quarterly" | "monthly" | "weekly" | "daily";

export interface PeriodicNotesPlugin {
    settings: Record<PeriodicNotesPeriods, (SingleNoteTypeSetting & MaybeEnabled) | undefined>;
}


export interface UniqueNotesPlugin {
    options: SingleNoteTypeSetting;
}


export type NoteType = "unique" | MomentPeriods;


// TODO: merge this with ApiSource if I just stop depending on the unique and periodic notes plugins...
export default class Dependencies {

    constructor(
        public readonly unique: SingleNoteTypeSetting,
        public readonly periodic: {
            [K in MomentPeriods]: SingleNoteTypeSetting | null;
        },
    ) {}

    static load(): Dependencies {
        const app = ftvkyo.app as unknown as {
            plugins: { getPlugin: (name: "periodic-notes") => (PeriodicNotesPlugin | undefined) },
            internalPlugins: { getEnabledPluginById: (name: "zk-prefixer") => (UniqueNotesPlugin | undefined) },
        };

        const unique = app.internalPlugins.getEnabledPluginById("zk-prefixer");
        if (!unique) {
            throw new Error("Plugin 'Unique Note Creator' not found/loaded");
        }

        const periodic = app.plugins.getPlugin("periodic-notes");
        if (!periodic) {
            throw new Error("Plugin 'Periodic Notes' not found/loaded");
        }

        const pps = periodic.settings;

        return new Dependencies(
            unique.options,
            {
                "day": pps.daily?.enabled && pps.daily || null,
                "week": pps.weekly?.enabled && pps.weekly || null,
                "month": pps.monthly?.enabled && pps.monthly || null,
                "quarter": pps.quarterly?.enabled && pps.quarterly || null,
                "year": pps.yearly?.enabled && pps.yearly || null,
            }
        );
    }

    getConfig(type: NoteType): SingleNoteTypeSetting | null {
        return type === "unique" ? this.unique : this.periodic[type];
    }

    getBasenameFormat(type: NoteType): string | null {
        const config = this.getConfig(type);
        return config?.format.split("/").last() ?? null;
    }

    getTemplate(type: NoteType): TFile | null {
        const config = this.getConfig(type);
        const taf = config ? ftvkyo.app.vault.getAbstractFileByPath(config.template) : null;
        if (taf && taf instanceof TFile) {
            return taf;
        }
        return null;
    }

    generatePathFormat(config: SingleNoteTypeSetting): string {
        const {folder = "", format } = config;
        return (folder ? `[${folder}]/` : "") + format + "[.md]";
    }

    generatePath(config: SingleNoteTypeSetting, date: moment.Moment): string {
        return date.format(this.generatePathFormat(config));
    }

    determineNote(path: string): [NoteType, moment.Moment] | null {
        const order = [
            "unique",
            "day",
            "week",
            "month",
            "quarter",
            "year",
        ] as const;

        for (const type of order) {
            const config = this.getConfig(type);
            if (config) {
                const fmt = this.generatePathFormat(config);
                const date = moment(path, fmt, true).locale(ftvkyo.momentLocale);
                if (date.isValid()) {
                    return [type, date];
                }
            }
        }

        return null;
    }

    async createNote(type: NoteType, date: moment.Moment): Promise<TFile> {
        const config = this.getConfig(type);

        if (!config) {
            throw new Error(`Note type ${type} is not configured`);
        }

        const path = this.generatePath(config, date);

        const template = this.getTemplate(type);

        if (!template) {
            throw new Error(`Could not load template for type ${type}`);
        }

        return await ftvkyo.app.vault.copy(template, path);
    }
}
