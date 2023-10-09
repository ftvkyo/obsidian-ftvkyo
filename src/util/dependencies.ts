import { getAPI as getDataviewAPI, DataviewApi } from "obsidian-dataview";


export interface SingleNoteTypeSetting {
    format: string,
    template: string,
    folder: string,
}

export interface MaybeEnabled {
    enabled?: true;
}


export type PeriodicNotesPeriods = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export interface PeriodicNotesPlugin {
    settings: Record<PeriodicNotesPeriods, SingleNoteTypeSetting & MaybeEnabled>;
}


export interface UniqueNotesPlugin {
    options: SingleNoteTypeSetting;
}


export class Dependencies {

    constructor(
        readonly dv: DataviewApi,
        readonly periodic: PeriodicNotesPlugin,
        readonly unique: UniqueNotesPlugin,
    ) {}

    static load(): Dependencies {
        const dv = getDataviewAPI(ftvkyo.app);
        if (!dv) {
            throw new Error("Plugin 'dataview' not found/loaded");
        }

        const periodic = (<any>ftvkyo.app).plugins.getPlugin("periodic-notes");
        if (!periodic) {
            throw new Error("Plugin 'Periodic Notes' not found/loaded");
        }

        const unique = (<any>ftvkyo.app).internalPlugins.getEnabledPluginById("zk-prefixer");
        if (!unique) {
            throw new Error("Plugin 'Unique Note Creator' not found/loaded");
        }

        return new Dependencies(dv, periodic, unique);
    }
}
