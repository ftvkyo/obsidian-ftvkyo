# obsidian-ftvkyo

<a href="https://github.com/ftvkyo/obsidian-ftvkyo/wiki">
<img src="https://github.com/ftvkyo/obsidian-ftvkyo/assets/17923271/958385bb-1f2b-4ad8-951b-3943860a27e2" height="300"/>
</a>

## Description

This is an [Obsidian.md](https://obsidian.md) plugin that is tailored specifically for [my](https://github.com/ftvkyo) goals:
- Easier long-term planning (day, week, month, quarter, year)
- Easier scheduling within the timespan of a day
- Note discoverability based on tags, getting rid of sorting the notes between directories
- Reducing redundant actions (e.g. writing custom text for links)

As this is a plugin that represents my personal workflow, feature requests may only make it if I think "how have I lived without that?"
However, I will look into making the plugin more robust, and adding feature toggles, so only a part of its functionality could be enabled if desired.

See the 🧑🫴 [project wiki](https://github.com/ftvkyo/obsidian-ftvkyo/wiki) for:
- Current **features** and some ideas I have for future improvements.
- More **screenshots**.

> ⚠️ Not all features are well documented yet.
>
> For example, there are some advanced templates for periodic notes.
> Such as `{{weeks:gggg-[W]ww:link,list}}` in monthly notes that generates a list of links to all weekly notes that intersect with this month.

> ⚠️ The plugin is not tested in the Live Editor mode.

> ⚠️ The plugin is subject to change (although the core of my workflow is stable now, so most of the changes would rather be extensions).

Feel free to create issues for bugs and ask questions in [discussions](https://github.com/ftvkyo/obsidian-ftvkyo/discussions).

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
