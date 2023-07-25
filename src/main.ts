import { Plugin } from "obsidian";

import logger from "@/util/logger";

import AutoAlias from "@/scripts/auto-alias";
import NoteCreate from "@/scripts/note-create";

import NavView from "@/ui/views/Nav";
import ObsidianFtvkyoView from "@/ui/views/view";


const dependencies = {
    "tp": "templater-obsidian",
    "dv": "dataview",
};

const scripts = [
    AutoAlias,
    NoteCreate,
];

export default class ObsidianFtvkyo extends Plugin {
    loadedViews: string[] = [];

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
        for (const view of this.loadedViews) {
            this.app.workspace.detachLeavesOfType(view);
        }

        // The plugin is probably getting reloaded, so let's ruin
        // everything else's logs.
        console.clear();
        console.log("@", new Date().toISOString());
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
        const lg = logger.info("Loading dependencies...").sub();

        for (const [k, v] of Object.entries(dependencies)) {
            this.deps[k] = this.plugin(v);
            lg.info(`Plugin '${v}' saved as '${k}'`);
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

        const views = [
            NavView,
        ];

        for (const view of views) {
            const t = view.type;
            const displayText = view.displayText;

            this.registerView(t, (leaf) => new ObsidianFtvkyoView(
                leaf,
                this,
                t,
                displayText,
                view,
            ));
            this.addCommand({
                "id": `reveal-${t}`,
                "name": `Reveal ${displayText}`,
                "callback": () => this.viewReveal(t),
            });

            lg.info(`Registered view '${t}'`);

            this.viewPlace(t);
            lg.info(`Placed view '${t}'`);
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

    // Add the view to the workspace,
    // and register it to be removed on unload
    async viewPlace(view: string) {
        this.app.workspace.detachLeavesOfType(view);
        await this.app.workspace.getLeftLeaf(false).setViewState({
            type: view,
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
