import { PluginSettingTab, Setting } from "obsidian";


export interface Settings {
    debugLogging: boolean;

    resultsPerPage: 10 | 25 | 50;
}

export const DEFAULT_SETTINGS: Settings = {
    debugLogging: false,

    resultsPerPage: 25,
};


export class OFSettingTab extends PluginSettingTab {

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Results per page")
            .addDropdown((dropdown) =>
                dropdown
                    .setValue(String(ftvkyo.settings.resultsPerPage))
                    .onChange(async (value) => {
                        ftvkyo.settings.resultsPerPage = Number(value) as 10 | 25 | 50;
                        await ftvkyo.saveSettings();
                    })
                    .addOptions({
                        "10": "10",
                        "25": "25",
                        "50": "50",
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
