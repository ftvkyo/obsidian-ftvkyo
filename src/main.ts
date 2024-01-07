import { Command, Plugin, moment } from "obsidian";
import { Extension } from "@codemirror/state";

import Logger from "@/util/logger";

import Api from "@/api/api";

import { sendError } from "./ui/builtin/notice";

import CopyLink from "./ui/commands/copy-link";

import { planListField } from "./ui/editor/plan-list";
import PlanCallout from "./ui/markdown/plan-callout";

import ObsidianFtvkyoView from "@/ui/views/view";
import ExploreView from "@/ui/views/Explore";

import {DEFAULT_SETTINGS, OFSettingTab, Settings} from "./ui/settings";

import "./styles.scss";


declare global {
    // Using let or const would not make this work.
    // eslint-disable-next-line no-var
    var ftvkyo: ObsidianFtvkyo;
}


const commands: Command[] = [
    CopyLink,
];

const editorExtensions: Extension[] = [
    planListField,
]

const markdown = [
    PlanCallout,
];

const views = [
    ExploreView,
];




export default class ObsidianFtvkyo extends Plugin {
    lg = new Logger("👁️‍🗨️");

    api: Api;

    #momentLocale = "en-gb";

    momentParse(date: string, format: string | string[]) {
        return moment(date, format, this.#momentLocale, /* strict */ true);
    }

    moment() {
        return moment().locale(this.#momentLocale);
    }

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

        this.lg.important(`Loading obsidian-ftvkyo`);

        await this.loadSettings();

        // May depend on the plugin being global
        // May depend on settings
        this.api = new Api();

        this.addSettingTab(new OFSettingTab(app, this));

        this.app.workspace.onLayoutReady(() => {
            try {
                this.afterLayoutReady();
            } catch (e) {
                sendError(String(e));
                console.error(e);
                this.unload();
            }
        });
    }

    onunload() {
        // Don't detach leaves on unload:
        // https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Don't+detach+leaves+in+`onunload`

        // this.api.view.detachAll();
    }

    private async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.api.source.update();
    }

    // Loads everything we actually need
    // including other plugin dependencies.
    // Should be called after all the plugins are loaded.
    // Throws when something goes wrong,
    // in which case this plugin should be unloaded.
    private afterLayoutReady() {
        this.loadCommands();
        this.loadMarkdown();
        this.loadViews();
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

        this.registerEditorExtension(editorExtensions);

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

    /* ====== *
     * Events *
     * ====== */

    on(_e: "metadata", cb: () => void) {
        const event = this.app.metadataCache.on("resolved", cb);
        this.registerEvent(event);
    }
}
