module.exports = async (params) => {
  const { app, quickAddApi } = params;

  // Get the active editor safely (no MarkdownView dependency)
  const editor = app.workspace.activeEditor?.editor;
  if (!editor) {
    try { new Notice("No active editor found"); } catch (_) {}
    return;
  }

  const content = editor.getValue();

  // Match labels like {#eq-foo}, {#fig-bar}, and also bare #eq-foo / #fig-bar
  const re = /{#fig-[A-Za-z0-9_-]+}|#fig-[A-Za-z0-9_-]+/g;

  const ids = new Set();
  let m;
  while ((m = re.exec(content)) !== null) {
    const raw = m[0];
    // Normalize to plain id without braces or leading '#'
    const id = raw.startsWith("{#") ? raw.slice(2, -1) : raw.slice(1);
    ids.add(id);
  }

  if (ids.size === 0) {
    try { new Notice("No or #fig- labels found in this note"); } catch (_) {}
    return;
  }

  const options = Array.from(ids).sort();
  const picked = await quickAddApi.suggester(options, options);
  if (!picked) return;

  // Insert @label at cursor
  editor.replaceSelection("@" + picked + "");
};