import { PluginSettingTab, Setting } from "obsidian";


export interface Settings {
    debugLogging: boolean;

    folderPeriodic: string,
    folderTemplates: string,

    groupByYear: boolean,
}

export const DEFAULT_SETTINGS: Settings = {
    debugLogging: false,

    folderPeriodic: "_periodic",
    folderTemplates: "",

    groupByYear: true,
};


export class OFSettingTab extends PluginSettingTab {

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Folder for periodic notes")
            .addText((t) =>
                t.setValue(DEFAULT_SETTINGS.folderPeriodic)
                    .setPlaceholder("periodic")
                    .onChange(async (value) => {
                        ftvkyo.settings.folderPeriodic = (value || DEFAULT_SETTINGS.folderPeriodic).replace(/\/$/, "");
                        await ftvkyo.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Folder with templates")
            .setDesc("Allowed templates are 'unique', 'date', 'week', 'month', 'quarter', 'year' files with '.md' extensions")
            .addText((t) =>
                t.setValue(ftvkyo.settings.folderTemplates)
                    .onChange(async (value) => {
                        ftvkyo.settings.folderTemplates = (value || DEFAULT_SETTINGS.folderTemplates).replace(/\/$/, "");
                        await ftvkyo.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Group notes by year")
            .setDesc("Create subfolders for every year")
            .addToggle((t) =>
                t.setValue(ftvkyo.settings.groupByYear)
                    .onChange(async (value) => {
                        ftvkyo.settings.groupByYear = value;
                        await ftvkyo.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Debug logging")
            .addToggle((toggle) =>
                toggle
                    .setValue(ftvkyo.settings.debugLogging)
                    .onChange(async (value) => {
                        ftvkyo.settings.debugLogging = value;
                        await ftvkyo.saveSettings();
                    })
            );
    }
}
