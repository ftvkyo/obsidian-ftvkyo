import { Plugin } from "obsidian";
import { getAPI as getDataviewAPI, DataviewApi } from "obsidian-dataview";

import Logger from "@/util/logger";

import Api from "@/api/api";

import NoteCreate from "@/commands/note-create";

import AutoAlias from "@/ui/markdown/auto-alias";

import ObsidianFtvkyoView from "@/ui/views/view";
import NavView from "@/ui/views/Nav";

import "./styles.scss";


const dependencies = {
    "tp": "templater-obsidian",
    "dv": "dataview",
};

const commands = [
    NoteCreate,
];

const markdown = [
    AutoAlias,
];

const views = [
    NavView,
];

export default class ObsidianFtvkyo extends Plugin {
    lg = new Logger("👁️‍🗨️");

    loadedViews: string[] = [];

    dv: DataviewApi;
    tp: any;

    api = new Api(this);

    /* ====== *
     * Config *
     * ====== */

    notesSource = `"text"`;

    /* ================= *
     * Lifecycle methods *
     * ================= */

    onload() {
        this.lg
            .clear()
            .big(new Date().toISOString())
            .big("obsidian-ftvkyo");

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
        for (const view of this.loadedViews) {
            this.app.workspace.detachLeavesOfType(view);
        }
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
        this.lg.info("Loading dependencies...");

        const dv = getDataviewAPI(this.app);
        if (!dv) {
            throw new Error("Plugin 'dataview' not found/loaded");
        }
        this.dv = dv;

        this.tp = this.ensurePlugin(dependencies.tp);
    }

    private loadCommands() {
        const lg = this.lg.info("Loading commands...").sub("load-commands");

		for (const command of commands) {
			command(this);
			lg.info(`Loaded command '${command.name}'`);
		}
    }

    private loadMarkdown() {
        const lg = this.lg.info("Loading custom markdown renderers...").sub("load-markdown");

        for (const renderer of markdown) {
            renderer(this);
            lg.info(`Loaded markdown renderer '${renderer.name}'`);
        }
    }

    private loadViews() {
        const lg = this.lg.info("Loading views...").sub("load-views");

        for (const view of views) {
            const t = view.viewType;

            this.registerView(t, (leaf) => ObsidianFtvkyoView.create(
                leaf,
                this,
                view,
            ));
            this.addCommand({
                "id": `reveal-${t}`,
                "name": `Reveal ${view.displayText}`,
                "callback": () => this.viewReveal(t),
            });

            lg.info(`Registered view '${t}'`);

            this.viewPlace(t);
            lg.info(`Placed view '${t}'`);
        }
    }

    /* ============== *
     * Helper methods *
     * ============== */

	// Get a loaded plugin or throw if not loaded
	private ensurePlugin(pluginId: string) {
		const p = (this.app as any).plugins.plugins[pluginId];
		if (!p) {
			throw new Error(`Plugin '${pluginId}' not found/loaded`);
		}
		return p;
	}

    /* =============== *
     * View management *
     * =============== */

    // Add the view to the workspace,
    // and register it to be removed on unload
    async viewPlace(viewType: string) {
        this.app.workspace.detachLeavesOfType(viewType);
        await this.app.workspace.getLeftLeaf(false).setViewState({
            type: viewType,
            active: true,
        });

        if (!this.loadedViews.includes(viewType)) {
            this.loadedViews.push(viewType);
        }
    }

    // Get the reference to the view
    viewGet(viewType: string) {
        const instances = this.app.workspace.getLeavesOfType(viewType);

        if (instances.length !== 1) {
            throw `Expected exactly one instance of the ${viewType} view`;
        }
        return instances[0];
    }

    // Reveal the view
    viewReveal(viewType: string) {
        const view = this.viewGet(viewType);
        if (view) {
            this.app.workspace.revealLeaf(view);
        }
    }
}
