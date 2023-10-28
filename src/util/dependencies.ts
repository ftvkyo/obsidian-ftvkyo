export interface SingleNoteTypeSetting {
    format: string,
    template: string,
    folder: string,
}

export interface MaybeEnabled {
    enabled?: true;
}


const periodicNotesPeriods = [
    "daily",
    "weekly",
    "monthly",
    "quarterly",
    "yearly",
] as const;


export type PeriodicNotesPeriods = typeof periodicNotesPeriods[number];

export interface PeriodicNotesPlugin {
    settings: Record<PeriodicNotesPeriods, SingleNoteTypeSetting & MaybeEnabled>;
}


export interface UniqueNotesPlugin {
    options: SingleNoteTypeSetting;
}


export class Dependencies {

    uniqueFormat: string | null;

    periodicFormats: Record<PeriodicNotesPeriods, string | null>;

    constructor(
        readonly periodic: PeriodicNotesPlugin,
        readonly unique: UniqueNotesPlugin,
    ) {
        const reformat = (ofmt?: { format: string }) => ofmt?.format.split("/").last() ?? null;

        this.periodicFormats = {
            "yearly": reformat(periodic.settings.yearly),
            "quarterly": reformat(periodic.settings.quarterly),
            "monthly": reformat(periodic.settings.monthly),
            "weekly": reformat(periodic.settings.weekly),
            "daily": reformat(periodic.settings.daily),
        };

        this.uniqueFormat = reformat(unique.options);
    }

    static load(): Dependencies {
        const periodic = (<any>ftvkyo.app).plugins.getPlugin("periodic-notes");
        if (!periodic) {
            throw new Error("Plugin 'Periodic Notes' not found/loaded");
        }

        const unique = (<any>ftvkyo.app).internalPlugins.getEnabledPluginById("zk-prefixer");
        if (!unique) {
            throw new Error("Plugin 'Unique Note Creator' not found/loaded");
        }

        return new Dependencies(periodic, unique);
    }
}
