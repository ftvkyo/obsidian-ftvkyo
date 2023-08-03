import ObsidianFtvkyo from "@/main";
import { PluginSettingTab, Setting } from "obsidian";

export class OFSettingTab extends PluginSettingTab {
    constructor(
        readonly plugin: ObsidianFtvkyo
    ) {
        super(app, plugin);
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Notes root")
            .setDesc("Directory where to find the notes")
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.notesRoot)
                    .onChange(async (value) => {
                        this.plugin.settings.notesRoot = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Default note type")
            .setDesc("What note type to assume for notes without a type in frontmatter")
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.defaultNoteType)
                    .onChange(async (value) => {
                        this.plugin.settings.defaultNoteType = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName("Draft tag")
            .setDesc("Tag to use for draft notes")
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.draftTag)
                    .onChange(async (value) => {
                        this.plugin.settings.draftTag = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
