import { Plugin } from "obsidian";

import logger from "./util/logger";

import AutoAlias from "./scripts/auto-alias";
import NoteCreate from "./scripts/note-create";


export default class ObsidianFtvkyo extends Plugin {
    deps: any = {}; // Dependencies (other plugins)

    onload() {
        this.app.workspace.onLayoutReady(() => {
            try {
                this.afterLayoutReady();
            } catch (e) {
                console.error(e);
                this.unload();
            }
        });
    }

    // Loads everything we actually need
    // including other plugin dependencies.
    // Should be called after all the plugins are loaded.
    // Throws when something goes wrong,
    // in which case this plugin should be unloaded.
    private afterLayoutReady() {
		// Loading dependencies

        let lg = logger.info("Loading plugins...").sub();

        const deps = {
            tp: "templater-obsidian",
            dv: "dataview",
        };

        for (const [k, v] of Object.entries(deps)) {
            this.deps[k] = this.plugin(v);
            lg.info(`Ensured plugin '${v}' is present, saved as '${k}'`);
        }

        logger.info("All plugins loaded");

		// Loading scripts

        lg = logger.info("Loading scripts...").sub();

		const scripts = [
			AutoAlias,
			NoteCreate,
		];

		for (const script of scripts) {
			script(this);
			lg.info(`Loaded script '${script.name}'`);
		}

        logger.info("All scripts loaded");
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
