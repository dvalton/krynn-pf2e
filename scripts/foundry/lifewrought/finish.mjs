// "Finish your choices": the PF2e choices a Lifewrought character still lacks (a feat among compendium feats, a
// heritage's bonus feat) are made by taking those items again on the owner's client, so PF2e asks for them.
import { MODULE_ID, T } from "../constants.mjs";
import { openChoices, grantTree } from "../../logic/peoples.mjs";

// PF2e's own predicate test against the actor's roll options, when available.
function tester(actor) {
  const P = game.pf2e?.Predicate;
  if (!P || !actor.getRollOptions) return null;
  const options = new Set(actor.getRollOptions());
  return (predicate) => { try { return new P(predicate).test(options); } catch (e) { return false; } };
}

export const pendingChoices = (actor) => openChoices([...actor.items], tester(actor));

export async function finishChoices(actor) {
  if (!actor?.isOwner) throw new Error(T("Finish.NotOwner"));
  const open = pendingChoices(actor);
  if (!open.length) { ui.notifications.info(T("Finish.Nothing")); return []; }
  const done = [];
  for (const o of open) {
    const src = await fromUuid(o.source).catch(() => null);
    if (!src) { ui.notifications.warn(T("Finish.NoSource", { name: o.name })); continue; }
    const data = src.toObject();
    if (o.location != null) data.system.location = o.location;
    data._stats = { ...(data._stats || {}), compendiumSource: o.source };
    // What the old item had chosen already stays chosen; only the open choices are asked again.
    const before = actor.items.get(o.id)?.toObject?.();
    const kept = { ...(before?.flags?.pf2e?.rulesSelections || {}) };
    for (const f of o.flags) delete kept[f];
    data.flags = { ...(data.flags || {}), pf2e: { ...(data.flags?.pf2e || {}), rulesSelections: kept } };
    for (const r of data.system?.rules || []) if (r.key === "ChoiceSet" && r.flag && r.flag in kept) r.selection = kept[r.flag];
    await actor.deleteEmbeddedDocuments("Item", grantTree([...actor.items], o.id));
    const made = await actor.createEmbeddedDocuments("Item", [data]);
    if (made?.length) done.push(o.name);
  }
  if (done.length) ui.notifications.info(T("Finish.Done", { items: done.join(", ") }));
  await actor.setFlag(MODULE_ID, "choicesDone", Date.now());
  return done;
}

// A note on the character sheet while choices are open, with the button that makes them.
export function sheetNotice(app, html) {
  const actor = app.actor ?? app.document;
  if (!actor || actor.type !== "character" || !actor.isOwner || !actor.getFlag(MODULE_ID, "lifewrought")) return;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector(".krynn-finish")) return;
  const open = pendingChoices(actor);
  if (!open.length) return;
  const box = document.createElement("div");
  box.className = "krynn-finish";
  const names = open.map((o) => foundry.utils.escapeHTML(o.name)).join(", ");
  box.innerHTML = `<i class="fa-solid fa-list-check"></i> <span>${T("Finish.Notice", { items: names })}</span> <button type="button"><i class="fa-solid fa-wand-magic-sparkles"></i> ${T("Finish.Button")}</button>`;
  box.querySelector("button").addEventListener("click", async () => {
    try { await finishChoices(actor); } catch (e) { ui.notifications.error(e.message); }
    app.render?.(true);
  });
  const target = root.querySelector(".sheet-body") || root.querySelector(".window-content") || root;
  target.prepend(box);
}
