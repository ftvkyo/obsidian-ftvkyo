import fs from "fs/promises";

import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

import { postcssModules, sassPlugin } from "esbuild-sass-plugin";


const OUT = "./out";


const copyManifest = () => ({
	name: "copy-manifest",
	setup(build) {
		build.onEnd(async () => {
			await fs.copyFile(`./manifest.json`, `${OUT}/manifest.json`);
		});
	},
});


const renameCSS = () => ({
	name: "rename-css",
	setup(build) {
		build.onEnd(async () => {
			// "esbuild-sass-plugin" saves "main.css"
			// but Obsidian expects "styles.css"
			await fs.rename(`${OUT}/main.css`, `${OUT}/styles.css`);
		});
	},
});


const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === "production");

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ["src/main.ts"],
	outdir: OUT,
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	plugins: [
		copyManifest(),
		sassPlugin({
			filter: /\.module\.scss$/,
			transform: postcssModules({}),
		}),
		sassPlugin(),
		renameCSS(),
	],
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
