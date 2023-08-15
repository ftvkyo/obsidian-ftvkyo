import { PluginSettingTab, Setting } from "obsidian";


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
            .setName("Loose tag")
            .setDesc("Tag to use for notes that have extension potential")
            .addText((text) =>
                text
                    .setValue(ftvkyo.settings.looseTag)
                    .onChange(async (value) => {
                        ftvkyo.settings.looseTag = value;
                        await ftvkyo.saveSettings();
                    })
            );
    }
}
