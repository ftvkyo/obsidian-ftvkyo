import { PluginSettingTab, Setting } from "obsidian";


export interface Settings {
    debugLogging: boolean;

    wipIcon: string;

    typeIcons: Record<string, string>;

    enableTooltip: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    debugLogging: false,

    wipIcon: "pencil",

    typeIcons: {
        "wiki": "network",
        "person": "user",
    },

    enableTooltip: false,
};


export class OFSettingTab extends PluginSettingTab {

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

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
