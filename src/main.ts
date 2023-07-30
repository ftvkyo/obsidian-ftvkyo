import { Plugin } from "obsidian";
import { getAPI as getDataviewAPI, DataviewApi } from "obsidian-dataview";

import Logger from "@/util/logger";

import AutoAlias from "@/scripts/auto-alias";
import NoteCreate from "@/scripts/note-create";

import NavView from "@/ui/views/Nav";
import ObsidianFtvkyoView from "@/ui/views/view";

import "./styles.scss";


const dependencies = {
    "tp": "templater-obsidian",
    "dv": "dataview",
};

const scripts = [
    AutoAlias,
    NoteCreate,
];

export default class ObsidianFtvkyo extends Plugin {
    lg = new Logger("👁️‍🗨️");

    loadedViews: string[] = [];

    dv: DataviewApi;
    tp: any;

    /* ====== *
     * Config *
     * ====== */

    notesSource = `"notes"`;

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
        this.loadScripts();
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

    private loadScripts() {
        const lg = this.lg.info("Loading scripts...").sub("load-scripts");

		for (const script of scripts) {
			script(this);
			lg.info(`Loaded script '${script.name}'`);
		}
    }

    private loadViews() {
        const lg = this.lg.info("Loading views...").sub("load-views");

        const views = [
            NavView,
        ];

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
    async viewPlace(view: string) {
        this.app.workspace.detachLeavesOfType(view);
        await this.app.workspace.getLeftLeaf(false).setViewState({
            type: view,
            active: true,
        });

        if (!this.loadedViews.includes(view)) {
            this.loadedViews.push(view);
        }
    }

    // Get the reference to the view
    viewGet(view: string) {
        const instances = this.app.workspace.getLeavesOfType(view);

        if (instances.length !== 1) {
            throw `Expected exactly one instance of the ${view} view`;
        }
        return instances[0];
    }

    // Reveal the view
    viewReveal(view: string) {
        this.app.workspace.revealLeaf(this.viewGet(view));
    }
}
