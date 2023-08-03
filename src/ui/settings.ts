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
            .setName("Draft tag")
            .setDesc("Tag to use for draft notes")
            .addText((text) =>
                text
                    .setValue(ftvkyo.settings.draftTag)
                    .onChange(async (value) => {
                        ftvkyo.settings.draftTag = value;
                        await ftvkyo.saveSettings();
                    })
            );
    }
}
