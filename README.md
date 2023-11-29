# obsidian-ftvkyo

This is an [Obsidian.md](https://obsidian.md) plugin which is tailored specifically for [my](https://github.com/ftvkyo) goals.

For this reason, it is not currently released in the Obsidian plugin store.
For the same reason, feature requests would likely only be implemented if I think "how have I lived without that?"

See the [documentation](docs/README.md) for:
- Developer docs.
- Future features.
- Extra notes.

## Features

- [H1 titles](#h1-titles)
  - [Sensitive tags](#sensitive-tags)
  - [Link Auto Text](#link-auto-text)
- [Note opening and creation](#note-opening-and-creation)
- [Explore view](#explore-view)
  - [Calendar](#calendar)
  - [Tag tree](#tag-tree)
  - [Extra filters](#extra-filters)
  - [Root notes](#root-notes)
- [Plan callout](#plan-callout)
- [Commands](#commands)

The screenshots are taken with the [Obsidian Nord](https://github.com/insanum/obsidian_nord) theme and with some personal CSS tweaks not included in the plugin.

Note: the plugin is not tested in the Live Editor mode.

### H1 titles

Inspired by what the [Front Matter Title](https://github.com/snezhig/obsidian-front-matter-title) plugin can do, this plugin treats top-level headings as note titles.
However, this plugin does not actually replace the titles in the Obsidian interface.
Instead, the titles are used in two places:
- In the [Explore view](#explore-view)
- For the [Link Auto Text](#link-auto-text) feature

The reasons for this choice are simple:
- I don't want paths to notes to contain spaces or non-ASCII characters
- I want to eliminate the aspect of sorting the notes into directories, and instead I want to sort and find notes by their tags
- Not all of my notes have titles (e.g. imported journaling notes)

#### Sensitive tags

Some tags can be configured as sensitive.
The intention is that the titles of the notes that contain said tags would be blurred when they are rendered (until you hover).
This can be useful if you like to screencast.

#### Link Auto Text

The aforementioned Front Matter Title plugin has a feature for automatically adding aliases for notes.
This plugin has a different approach.
Instead, the links that don't have custom text are resolved during note rendering, using their [H1 title](#h1-titles).

Links to headings and blocks are also supported.

### Note opening and creation

For my replacement of the Unique Notes core plugin and for the [Explore view](#explore-view) I have a custom logic to open and create notes.

Unlike some other implementations (that vary), it:
1. Correctly creates a new tab instead of creating a split (unlike the Calendar plugin at the moment)
2. Supports "replace current tab" and "use new tab" modes (but always replaces when the current tab is empty)
3. Supports selecting whether the note should be in the View mode or Edit mode
4. When creating a note, does not focus your cursor on the filename (unlike the Unique Notes current plugin)
5. Supports some flavour of templates

Additionally, for consistency there is a shared piece of code (React Hook) that makes buttons that should open or create notes support Ctrl-clicks and Middle clicks, so that it is encouraged to open in a new tab.

### Explore view

This is an attempt to rethink Obsidian's navigation.
There are more things I would change, but I find the current version neat already.

#### Calendar

This is a replacement for the [Calendar](https://github.com/liamcain/obsidian-calendar-plugin) and the [Periodic Notes](https://github.com/liamcain/obsidian-periodic-notes) plugins.
There are currently no commands, but otherwise the calendar fits my needs better.

The features include:
- Highlight notes that exist
- Border for "today" and "this week" notes
- Dim notes when they are in the other month
- Access to yearly, quarterly, monthly, weekly and daily notes
- Week-centric rather than month-centric, buttons to move +/- 1 week and to go to today
- Compact mode
- Buttons are enabled/disabled just based on the presence of the template file, so almost no config is required

#### Tag tree

This is essentially a substitute for Obsidian's file browser, tag tree and search views.
It's not a complete subsitute, but I like it more.

The tag tree displays all the tags in a tree (uh...) except the tags that start with a hyphen `-` (I hide obsolete tags like that).
Each tag has a count of the notes with that tag.
If a tag has children tags, there is a button to reveal them.

There is a button to open the tag's [Root note](#root-notes) if such exists.

#### Extra filters

#### Root notes

### Plan callout

### Commands
