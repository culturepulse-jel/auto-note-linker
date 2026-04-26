# Auto Note Linker

An Obsidian plugin that automatically creates `[[wikilinks]]` between your notes by scanning for exact title matches. If you mention the name of another note anywhere in your vault, Auto Note Linker will wrap it in a link for you — so you never miss a connection.

## Features

- Scans every markdown file in your vault for mentions of other note titles
- Wraps matches in `[[wikilinks]]` automatically
- Longest titles match first, so "Machine Learning Basics" won't get partially matched by a note called "Machine"
- Case-insensitive matching
- Skips regions that shouldn't be modified:
  - Frontmatter (`---` blocks)
  - Code blocks and inline code
  - Existing wikilinks and markdown links
  - Headings
- A note will never link to itself
- Shows a notification when finished with how many files were updated

## Quickstart

### 1. Install

Since this plugin isn't in the Obsidian Community Plugin directory, install it manually:

1. In your vault folder, navigate to `.obsidian/plugins/` (create the `plugins` folder if it doesn't exist)
2. Create a folder called `auto-note-linker`
3. Copy `main.js` and `manifest.json` into that folder:
   ```
   your-vault/
     .obsidian/
       plugins/
         auto-note-linker/
           main.js
           manifest.json
   ```
4. Open Obsidian and go to **Settings > Community plugins**
5. Turn off **Restricted mode** if it's still on
6. You should see **Auto Note Linker** in the list — enable it

### 2. Use

1. Open the command palette with `Ctrl+P` (or `Cmd+P` on Mac)
2. Search for **Auto Link Notes**
3. Press Enter — the plugin will scan your vault and add links wherever it finds a match

A notification will appear telling you how many files were updated.

### 3. Example

Say you have three notes: `Python`, `Machine Learning`, and `Projects`.

Before running the command, your `Projects` note might look like:

```md
I started learning Python last month. Now I'm exploring Machine Learning.
```

After running **Auto Link Notes**:

```md
I started learning [[Python]] last month. Now I'm exploring [[Machine Learning]].
```

## Things to know

- The command modifies files in place. If you want to undo changes, use `Ctrl+Z` in any affected note or revert via git.
- It only runs when you manually trigger the command — it does not run automatically on startup or on file save.
- Titles with special characters (parentheses, periods, etc.) are handled safely.
