// Foundry serves the HTML files of modules as plain text (so a frame pointed at them shows the source). The Lifewrought
// page is therefore fetched and written into the frame (srcdoc), with a <base> so its scripts and data load from the
// module's folder, and a flag that tells it it is inside Foundry. Pure logic, no Foundry.
export function embedHTML(html, baseHref) {
  const inject = `<base href="${baseHref.replace(/"/g, "&quot;")}"><script>window.LW_EMBED = "foundry";</script>`;
  const at = html.search(/<head[^>]*>/i);
  if (at < 0) return inject + html;
  const end = html.indexOf(">", at) + 1;
  return html.slice(0, end) + inject + html.slice(end);
}
