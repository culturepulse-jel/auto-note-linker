module.exports = class AutoNoteLinkerPlugin extends Plugin {
  async onload() {
    console.log("Auto Note Linker plugin loaded!");

    // Automatically link notes when Obsidian starts
    this.addCommand({
      id: "auto-link-notes",
      name: "Auto Link Notes",
      callback: () => this.linkAllNotes(),
    });

    // Optionally run this automatically on start
    this.linkAllNotes();
  }

  onunload() {
    console.log("Auto Note Linker plugin unloaded!");
  }

  // Function to scan all markdown files and link titles
  async linkAllNotes() {
    try {
      const markdownFiles = this.getMarkdownFiles();
      const noteTitles = this.extractNoteTitles(markdownFiles);

      // Sort note titles by length in descending order (longest first)
      noteTitles.sort((a, b) => b.length - a.length);

      for (const file of markdownFiles) {
        const content = await this.app.vault.read(file);
        let updatedContent = this.addLinksToNote(content, noteTitles);

        if (content !== updatedContent) {
          // Only write back if there are changes to avoid unnecessary updates
          await this.app.vault.modify(file, updatedContent);
          console.log(`Updated links in ${file.path}`);
        } else {
          console.log(`No changes needed for ${file.path}`);
        }
      }
    } catch (error) {
      console.error("Error linking notes:", error);
    }
  }

  // Get a list of all markdown files in the vault
  getMarkdownFiles() {
    const markdownFiles = [];
    const files = this.app.vault.getFiles();
    for (const file of files) {
      if (file.extension === "md") {
        markdownFiles.push(file);
      }
    }
    return markdownFiles;
  }

  // Extract note titles from markdown filenames (without the .md extension)
  extractNoteTitles(markdownFiles) {
    return markdownFiles.map((file) => file.basename);
  }

  // Add links to notes where title matches a word or phrase in the content
  addLinksToNote(content, titles) {
    titles.forEach((title) => {
      // Regex to match the exact title as a word or phrase
      const pattern = new RegExp(`\\b(${title})\\b`, "g");
      const replacement = `[[${title}]]`;

      // Only replace if the word or phrase is not already inside brackets
      content = content.replace(
        new RegExp(`(?<!\\[\\[)${pattern.source}(?!\\]\\])`, "g"),
        replacement
      );
    });
    return content;
  }
};
