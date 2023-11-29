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
  - [Note list](#note-list)
  - [Root notes](#root-notes)
- [Plan callout](#plan-callout)
- [Commands](#commands)

The screenshots are taken with the [Obsidian Nord](https://github.com/insanum/obsidian_nord) theme and with some personal CSS tweaks not included in the plugin.

Note: the plugin is not tested in the Live Editor mode.

Note: there are "unique" and "periodic" notes.
Some functionality between them is shared, but otherwise they are separate.
For example, the "H1 titles" feature currently only applies to unique notes.
Paths to the directories with these notes are configured in the settings.

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

Additionally, notes that have a `date` field in their frontmatter get their date info automatically appended to their title.
The field can be set to:
- `"auto"`, then the date info is inferred from the filename, which is the note creation timestamp
- `"todo"`, then the date info becomes "to-do", and the note is assumed to have tasks for filtering purposes (even if there are no actual tasks inside)
- `"YYYYMMDD-HHmmss"` or `"YYYYMMDD"` timestamp to set an arbitrary date

#### Sensitive tags

Some tags can be configured as sensitive.
The intention is that the titles of the notes that contain said tags would be blurred when they are rendered (until you hover).
This can be useful if you like to screencast.

#### Link Auto Text

The aforementioned Front Matter Title plugin has a feature for automatically adding aliases for notes.
This plugin has a different approach.
Instead, the links that don't have custom text are resolved during note rendering, using their [H1 title](#h1-titles).

Links to headings and blocks are also supported.

I like this feature because I don't like when there is unnecessary custom text for links everywhere.
I also like it because it supports markdown in note titles!

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

Only unique notes get included in the tree and the resulting [Note lists](#note-list).

This is essentially a (partial) substitute for Obsidian's file browser, tag tree and search views.

The tag tree displays all the tags in a tree (uh...) except the tags that start with a hyphen `-` (I hide obsolete tags like that).
Each tag has a count of the notes with that tag.
If a tag has children tags, there is a button to reveal them.

There is a button to open the [Root note](#root-notes) for the tag if it exists.

Selecting a tag opens a list of notes with it and its children.
There are also buttons to display:
- All notes
- Only notes with tags
- Only notes without tags

#### Note list

This is a nice list of notes.
It supports pagination, sorting (title/date + asc/desc) and some special filters.
If the currently selected tag has a root note, the header of the list becomes a link to it.

After a tag is selected in the tag tree, extra filters can be applied to further narrow down the search.
The filters use a custom "TriState" component which allows choosing between "Exclude", "Whatever", and "Require" states.

The filters are:
- Title presence ([H1 titles](#h1-titles))
- Tasks presence
- Whether the note has a date set
- Whether the note is broken

For each note these things are displayed:
- Title, or just the filename if the title is not present
- Button to copy the wikilink to the note
- List of tags
- If the note has tasks, numbers of the completed and total tasks along with a progressbar
- If the note is broken, the message about the problem

The broken notes still require to be picked up to be displayed.
This generally means they should have the correct filename pattern.
An example of what would be a broken note is a note that has the correct filename, but that has 2 H1 headings.

#### Root notes

Notes that have a tag as their title are considered "root notes".
I use them as "entrypoints" for various projects, hobbies etc.
They help me partition the vault.
I usually track general tasks there that I later schedule to be done using periodic notes.
If they get too big, I split things into other notes and leave a link there.

### Plan callout

This is a scheduling feature I actively use in my daily notes.
It is basically a crossbreed of Pomodoro and time-blocking techniques.

I make a list of tasks, estimate how much each of the tasks takes, and the plugin sums up the times + adds a 5 minute break after every task.
It displays the total time at the bottom of the callout.
I don't actually always take breaks, and sometimes I just schedule break time, but this works as a good buffer for overrunning on time either way.

I can also specify the start time for the block in its title.
Then the plugin will also show me the projected time of finishing the block.
This way I can plan ahead without manually counting time.

I love this feature for how much it helps me compared to how simple it is.
It's very easy to shuffle tasks around, change the start time for the entire block, change task estimations etc.

### Commands

There are currently 2 useful commands:

- Copy a Wikilink to the current note
- Create a unique note
