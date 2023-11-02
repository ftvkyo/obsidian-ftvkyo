import { PluginSettingTab, Setting } from "obsidian";


export interface Settings {
    debugLogging: boolean;

    resultsPerPage: 10 | 25 | 50;

    sensitiveTags: string[];
}

export const DEFAULT_SETTINGS: Settings = {
    debugLogging: false,

    resultsPerPage: 25,

    sensitiveTags: [],
};


export class OFSettingTab extends PluginSettingTab {

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Results per page")
            .setDesc("How many results display per page in the Explore view")
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
            .setName("Sensitive tags")
            .setDesc("Specify sensitive tags one per line without the leading #. Children of these tags will also be considered sensitive.")
            .addTextArea((ta) =>
                ta.setValue(ftvkyo.settings.sensitiveTags.join("\n"))
                    .onChange(async (value) => {
                        ftvkyo.settings.sensitiveTags = value.split("\n").filter((line) => line.trim().length > 0);
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
