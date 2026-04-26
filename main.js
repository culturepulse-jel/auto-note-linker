const { Plugin, Notice } = require("obsidian");

module.exports = class AutoNoteLinkerPlugin extends Plugin {
  async onload() {
    console.log("Auto Note Linker plugin loaded!");

    this.addCommand({
      id: "auto-link-notes",
      name: "Auto Link Notes",
      callback: () => this.linkAllNotes(),
    });

    // Run automatically once the vault layout is ready
    this.app.workspace.onLayoutReady(() => this.linkAllNotes());
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
    const filteredTitles = titles.filter(
      (t) => t !== currentFileName && t.length > 0
    );

    // Process each title individually, longest first (already sorted).
    // After each pass, re-segment so newly created [[links]] are protected
    // from shorter titles (e.g. "CulturePulse S.R.O." before "CulturePulse").
    for (const title of filteredTitles) {
      const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Use \b only on sides where the title starts/ends with a word char.
      // Titles like "S.R.O." end with "." (non-word), so \b would fail there.
      const isWordStart = /^\w/.test(title);
      const isWordEnd = /\w$/.test(title);
      const prefix = isWordStart ? "\\b" : "";
      const suffix = isWordEnd ? "\\b" : "";

      const titlePattern = new RegExp(`${prefix}${escaped}${suffix}`, "gi");

      content = this.replaceInEditable(content, titlePattern, (match) => `[[${match}]]`);
    }

    return content;
  }

  replaceInEditable(content, pattern, replacer) {
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

    for (const segment of segments) {
      if (!segment.editable) continue;
      segment.text = segment.text.replace(pattern, replacer);
    }

    return segments.map((s) => s.text).join("");
  }
};
