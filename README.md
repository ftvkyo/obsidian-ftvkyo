# obsidian-ftvkyo

<a href="https://github.com/ftvkyo/obsidian-ftvkyo/wiki">
<img src="https://github.com/ftvkyo/obsidian-ftvkyo/assets/17923271/958385bb-1f2b-4ad8-951b-3943860a27e2" height="300"/>
</a>

## Description

This is an [Obsidian.md](https://obsidian.md) plugin which is tailored specifically for [my](https://github.com/ftvkyo) goals.

For this reason, it is not currently released in the Obsidian plugin store.
For the same reason, feature requests would likely only be implemented if I think "how have I lived without that?"

See the 🧑🫴 [project wiki](https://github.com/ftvkyo/obsidian-ftvkyo/wiki) for:
- Current **features** and some ideas I have for future improvements.
- More **screenshots**.

> ⚠️ The plugin is not tested in the Live Editor mode.

## For developers

The repository uses Yarn with some quirks.
For Visual Studio Code to pick up the project, you need to:
- run `yarn dlx @yarnpkg/sdks vscode` to install the SDK (they also exist for [other editors](https://yarnpkg.com/getting-started/editor-sdks))
- install recommended VSCode extensions (specifically, ZipFS is required)

Dependency installation is done as usual (`yarn` or `yarn install`).
To build the project, run `yarn build`.
This creates an `out/` directory.
For development my `out/` is usually a symlink to `.obsidian/plugins/obsidian-ftvkyo` in my Obsidian Vault, so I don't need to copy any files.

You may be interested in `yarn dev` for automatic rebuilds on changes and in [Hot-Reload for Obsidian Plugins](https://github.com/pjeby/hot-reload), but I don't use them together as they may make the experience laggy and annoying at times.
