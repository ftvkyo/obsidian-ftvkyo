import { Plugin } from "obsidian";

import logger from "@/util/logger";

import AutoAlias from "@/scripts/auto-alias";
import NoteCreate from "@/scripts/note-create";

import {NavigationView, VIEW_TYPE_NAVIGATION} from "@/ui/views/nav";


const dependencies = {
    "tp": "templater-obsidian",
    "dv": "dataview",
};

const scripts = [
    AutoAlias,
    NoteCreate,
];

export default class ObsidianFtvkyo extends Plugin {
    deps: Record<string, any> = {};

    onload() {
        logger.big("Loading Obsidian Ftvkyo plugin...");

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
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_NAVIGATION);
    }

    // Loads everything we actually need
    // including other plugin dependencies.
    // Should be called after all the plugins are loaded.
    // Throws when something goes wrong,
    // in which case this plugin should be unloaded.
    private afterLayoutReady() {
        this.loadPlugins();
        this.loadScripts();
        this.loadViews();
    }

    private loadPlugins() {
        const lg = logger.info("Loading plugins...").sub();

        for (const [k, v] of Object.entries(dependencies)) {
            this.deps[k] = this.plugin(v);
            lg.info(`Ensured plugin '${v}' is present, saved as '${k}'`);
        }
    }

    private loadScripts() {
        const lg = logger.info("Loading scripts...").sub();

		for (const script of scripts) {
			script(this);
			lg.info(`Loaded script '${script.name}'`);
		}
    }

    private loadViews() {
        const lg = logger.info("Loading views...").sub();

        const views = {
            [VIEW_TYPE_NAVIGATION]: NavigationView,
        };

        for (const [k, v] of Object.entries(views)) {
            this.registerView(k, (leaf) => new v(leaf));
            this.addCommand({
                "id": `activate-${k}`,
                "name": `Activate ${k}`,
                "callback": () => v.activateView(this),
            });
            lg.info(`Registered view '${k}'`);
        }
    }

	// Get a loaded plugin or throw if not loaded
	private plugin(pluginId: string) {
		const p = (this.app as any).plugins.plugins[pluginId];
		if (!p) {
			throw new Error(`Plugin ${pluginId} not found/loaded`);
		}
		return p;
	}
}
