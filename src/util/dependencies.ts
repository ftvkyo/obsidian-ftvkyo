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
    settings: Record<PeriodicNotesPeriods, SingleNoteTypeSetting & MaybeEnabled>;
}


export interface UniqueNotesPlugin {
    options: SingleNoteTypeSetting;
}


export class Dependencies {

    uniqueFormat: string | null;

    periodicFormats: Record<MomentPeriods, string | null>;

    constructor(
        readonly periodic: PeriodicNotesPlugin,
        readonly unique: UniqueNotesPlugin,
    ) {
        const reformat = (ofmt?: { format: string }) => ofmt?.format.split("/").last() ?? null;

        this.periodicFormats = {
            "year": reformat(periodic.settings.yearly),
            "quarter": reformat(periodic.settings.quarterly),
            "month": reformat(periodic.settings.monthly),
            "week": reformat(periodic.settings.weekly),
            "day": reformat(periodic.settings.daily),
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
