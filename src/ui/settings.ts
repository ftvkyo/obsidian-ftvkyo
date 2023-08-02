import ObsidianFtvkyo from "@/main";
import { PluginSettingTab, Setting } from "obsidian";

export class OFSettingTab extends PluginSettingTab {
    constructor(
        readonly plugin: ObsidianFtvkyo
    ) {
        super(plugin.app, plugin);
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Notes source")
            .setDesc(`Dataview source to query from (e.g. "text" including quotes)`)
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.notesSource)
                    .onChange(async (value) => {
                        this.plugin.settings.notesSource = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
