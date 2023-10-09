import { PluginSettingTab, Setting } from "obsidian";


export interface Settings {
    notesRoot: string;

    debugLogging: boolean;

    wipIcon: string;

    typeIcons: Record<string, string>;

    enableTooltip: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
    notesRoot: "text",

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
            .setName("Notes root")
            .setDesc("Directory where to find the notes")
            .addText((text) =>
                text
                    .setValue(ftvkyo.settings.notesRoot)
                    .onChange(async (value) => {
                        ftvkyo.settings.notesRoot = value;
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
