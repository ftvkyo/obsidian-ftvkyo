import { Command, Plugin } from "obsidian";
import { getAPI as getDataviewAPI, DataviewApi } from "obsidian-dataview";

import Logger from "@/util/logger";

import Api from "@/api/api";

import AutoAlias from "@/ui/markdown/auto-alias";

import ObsidianFtvkyoView from "@/ui/views/view";
import NavView from "@/ui/views/Nav";

import "./styles.scss";
import {OFSettingTab} from "./ui/settings";


declare global {
    // Using let or const would not make this work.
    // eslint-disable-next-line no-var
    var ftvkyo: ObsidianFtvkyo;
}


interface Settings {
    notesRoot: string;

    wipIcon: string;

    looseTag: string;
    looseIcon: string;

    typeIcons: Record<string, string>;

    enableTooltip: boolean;
}

const DEFAULT_SETTINGS: Settings = {
    notesRoot: "text",

    wipIcon: "pencil",

    looseTag: "le",
    looseIcon: "circle-ellipsis",

    typeIcons: {
        "wiki": "network",
        "person": "user",
    },

    enableTooltip: false,
};


const commands: Command[] = [
];

const markdown = [
    AutoAlias,
];

const views = [
    NavView,
];


export default class ObsidianFtvkyo extends Plugin {
    lg = new Logger("👁️‍🗨️");

    dv: DataviewApi;

    api = new Api();

    /* ======== *
     * Settings *
     * ======== */

    settings: Settings;

    /* ================= *
     * Lifecycle methods *
     * ================= */

    async onload() {
        // Make the plugin available globally
        globalThis.ftvkyo = this;

        this.lg
            .clear()
            .big(new Date().toISOString())
            .big("obsidian-ftvkyo");

        await this.loadSettings();
        this.addSettingTab(new OFSettingTab(app, this));

        this.app.workspace.onLayoutReady(() => {
            try {
                this.afterLayoutReady();
            } catch (e) {
                console.error(e);
                this.unload();
            }
        });
    }

    onunload() {
        this.api.view.detachAll();
    }

    private async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    // Loads everything we actually need
    // including other plugin dependencies.
    // Should be called after all the plugins are loaded.
    // Throws when something goes wrong,
    // in which case this plugin should be unloaded.
    private afterLayoutReady() {
        this.loadDependencies();
        this.loadCommands();
        this.loadMarkdown();
        this.loadViews();
    }

    private loadDependencies() {
        const lg = this.lg.sub("dependencies");

        const dv = getDataviewAPI(this.app);
        if (!dv) {
            throw new Error("Plugin 'dataview' not found/loaded");
        }
        this.dv = dv;

        lg.info("Loaded 'dataview'");
    }

    private loadCommands() {
        const lg = this.lg.sub("commands");

		for (const command of commands) {
            this.addCommand(command);
			lg.info(`Loaded '${command.name}'`);
		}
    }

    private loadMarkdown() {
        const lg = this.lg.sub("markdown");

        for (const renderer of markdown) {
            this.registerMarkdownPostProcessor(renderer);
            lg.info(`Loaded renderer '${renderer.name}'`);
        }
    }

    private loadViews() {
        const lg = this.lg.sub("views");

        for (const view of views) {
            const slg = lg.subSame(view.short);

            const t = view.viewType;

            this.registerView(t, (leaf) => ObsidianFtvkyoView.create(
                leaf,
                this,
                view,
            ));
            slg.info(`Registered`);

            this.addCommand({
                "id": `reveal-${t}`,
                "name": `Reveal ${view.displayText}`,
                "callback": () => this.api.view.reveal(t),
            });
            slg.info(`Added reveal command`);

            this.api.view.place(t);
            slg.info(`Placed`);
        }
    }
}
