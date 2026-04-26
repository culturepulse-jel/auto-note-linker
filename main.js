const { Plugin, Notice } = require("obsidian");

module.exports = class AutoNoteLinkerPlugin extends Plugin {
  async onload() {
    console.log("Auto Note Linker plugin loaded!");

    this.addCommand({
      id: "auto-link-notes",
      name: "Auto Link Notes",
      callback: () => this.linkAllNotes(),
    });
  }

  onunload() {
    console.log("Auto Note Linker plugin unloaded!");
  }

  async linkAllNotes() {
    try {
      const markdownFiles = this.app.vault.getMarkdownFiles();
      const noteTitles = markdownFiles.map((file) => file.basename);

      // Sort by length descending so longer titles match first
      noteTitles.sort((a, b) => b.length - a.length);

      let totalUpdated = 0;

      for (const file of markdownFiles) {
        const content = await this.app.vault.read(file);
        const updatedContent = this.addLinksToNote(
          content,
          noteTitles,
          file.basename
        );

        if (content !== updatedContent) {
          await this.app.vault.modify(file, updatedContent);
          totalUpdated++;
          console.log(`Updated links in ${file.path}`);
        }
      }

      new Notice(`Auto Note Linker: updated ${totalUpdated} file(s).`);
    } catch (error) {
      console.error("Error linking notes:", error);
      new Notice("Auto Note Linker: error — check console for details.");
    }
  }

  addLinksToNote(content, titles, currentFileName) {
    // Split content into protected and unprotected segments.
    // Protected segments (frontmatter, code blocks, inline code, existing
    // wikilinks, existing markdown links, headings) are never modified.
    const protectedPattern =
      /^---\r?\n[\s\S]*?\r?\n---|\r?\n---\r?\n[\s\S]*?\r?\n---|```[\s\S]*?```|`[^`]+`|\[\[.*?\]\]|\[.*?\]\(.*?\)|^#{1,6}\s+.+$/gm;

    const segments = [];
    let lastIndex = 0;

    for (const match of content.matchAll(protectedPattern)) {
      if (match.index > lastIndex) {
        segments.push({ text: content.slice(lastIndex, match.index), editable: true });
      }
      segments.push({ text: match[0], editable: false });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      segments.push({ text: content.slice(lastIndex), editable: true });
    }

    // Build one combined regex for all titles (longest-first is already sorted)
    const escapedTitles = titles
      .filter((t) => t !== currentFileName && t.length > 0)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (escapedTitles.length === 0) return content;

    const titlePattern = new RegExp(
      `\\b(${escapedTitles.join("|")})\\b`,
      "gi"
    );

    // Replace in editable segments only
    for (const segment of segments) {
      if (!segment.editable) continue;
      segment.text = segment.text.replace(titlePattern, (match) => `[[${match}]]`);
    }

    return segments.map((s) => s.text).join("");
  }
};
