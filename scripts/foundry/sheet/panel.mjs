// The Krynn panel of a character: order and moon, god, knighthood, factions, the people of the life, the Chronicle
// and open choices. Shown as a tab on PF2e's character sheet; when the sheet's layout isn't what the module expects,
// the same panel opens in a window from the sheet's "Krynn" header button.
import { MODULE_ID, T, template } from "../constants.mjs";
import { now, stateNow } from "../time.mjs";
import { robeOf, magicFor, effectData } from "../magic/moons.mjs";
import { FACTIONS } from "../../content/orders.mjs";
import { factionRows, logEntry } from "../../logic/peoples.mjs";
import { formatDate } from "../time.mjs";
import { pendingChoices, finishChoices } from "../lifewrought/finish.mjs";
import { openFactions } from "../peoples/factions.mjs";

const fa = foundry.applications;
const lang = () => (game.i18n.lang?.startsWith("pt") ? "pt" : "en");
const slugOf = (i) => i.system?.slug || i.flags?.[MODULE_ID]?.slug;
const render = (path, ctx) => (foundry.applications.handlebars?.renderTemplate ?? globalThis.renderTemplate)(path, ctx);

export function panelContext(actor) {
  const items = [...(actor.items ?? [])];
  const has = (slug) => items.find((i) => slugOf(i) === slug);
  const state = stateNow(), d = now();
  // High Sorcery and the moon tonight.
  const robe = robeOf(actor);
  let magic = null;
  if (robe) {
    const m = magicFor(actor);
    magic = { robe: T(`Robe.${robe}`), renegade: !!has("krynn-renegade"), tonight: m ? effectData(m).name : T("Panel.MoonsSilent") };
  } else if (has("krynn-renegade")) magic = { robe: T("Panel.Renegade"), renegade: true, tonight: "" };
  // The god, and whether gods answer now.
  const deity = actor.deity ?? items.find((i) => i.type === "deity") ?? null;
  const mystic = !!has("mystic-of-the-heart");
  const god = deity ? { name: deity.name, answers: state.gods, mystic } : mystic ? { name: T("Panel.Heart"), answers: true, mystic } : null;
  // The knighthoods.
  const sol = has("knight-of-solamnia-dedication"), dark = has("knight-of-takhisis-dedication");
  const measureLog = (actor.getFlag?.(MODULE_ID, "measureLog") ?? []).slice(0, 5).map((e) => ({ ...e, label: T(e.kind === "breach" ? "Panel.LogBreach" : "Panel.LogPenance") }));
  const knight = sol ? { order: T(`Knight.${sol.flags?.pf2e?.rulesSelections?.knightOrder ?? "crown"}`), breach: !!has("krynn-breach-of-the-measure"), measure: true, log: measureLog }
    : dark ? { order: T(`Knight.${dark.flags?.pf2e?.rulesSelections?.darkOrder ?? "lily"}`), breach: false, measure: false } : null;
  // Factions, the life, choices.
  const factionLog = (actor.getFlag?.(MODULE_ID, "factionLog") ?? []).slice(0, 3);
  const factions = factionRows(actor.getFlag?.(MODULE_ID, "factions") ?? {}, FACTIONS, lang()).map((r) => ({ ...r, label: T(`Factions.Standing.${r.key}`) }));
  const life = actor.getFlag?.(MODULE_ID, "lifewrought") ?? null;
  const journal = life?.journal ? game.journal?.get(life.journal) : null;
  const people = (life?.npcs ?? []).map((id) => game.actors.get(id)).filter(Boolean).map((a) => ({ id: a.id, name: a.name }));
  const open = actor.isOwner && life ? pendingChoices(actor).map((o) => o.name) : [];
  return {
    actorId: actor.id, date: `${d.day}/${d.month + 1}/${d.year}`, age: T(`Age.${state.age}.Name`), magic, god, knight, factions, gm: game.user.isGM,
    factionLog, journal: journal ? { id: journal.id, name: journal.name } : null, people, open, hasLife: !!life,
  };
}

async function onAction(actor, action, el, rerender) {
  if (action === "chronicle") game.journal.get(el.dataset.id)?.sheet?.render(true);
  if (action === "person") game.actors.get(el.dataset.id)?.sheet?.render(true);
  if (action === "factions") openFactions(actor);
  if (action === "finish") { await finishChoices(actor); rerender?.(); }
  if (action === "breach" || action === "penance") { await measure(actor, action, el.closest(".krynn-panel")?.querySelector("[name=measure-reason]")?.value?.trim() ?? ""); rerender?.(); }
}

// The Measure: the GM records a breach (the effect goes on, with the reason) or the penance done (it comes off).
export async function measure(actor, action, reason = "") {
  if (!game.user.isGM) return;
  const current = actor.items.find((i) => slugOf(i) === "krynn-breach-of-the-measure");
  if (action === "breach" && !current) {
    const pack = game.packs.get(`${MODULE_ID}.orders`);
    const e = pack?.index?.find?.((x) => x.name === "Breach of the Measure");
    const doc = e ? await pack.getDocument(e._id) : null;
    if (doc) await actor.createEmbeddedDocuments("Item", [doc.toObject()]);
  }
  if (action === "penance" && current) await actor.deleteEmbeddedDocuments("Item", [current.id]);
  await actor.setFlag(MODULE_ID, "measureLog", logEntry(actor.getFlag(MODULE_ID, "measureLog"), { kind: action, reason, date: formatDate(now()) }));
  await ChatMessage.create({ speaker: { alias: T("Chat.Speaker") }, whisper: game.users.filter((u) => u.isGM || actor.testUserPermission?.(u, "OWNER")).map((u) => u.id),
    content: `<div class="krynn-card"><h3>${T(`Panel.${action === "breach" ? "BreachTitle" : "PenanceTitle"}`, { name: foundry.utils.escapeHTML(actor.name) })}</h3>${reason ? `<p>${foundry.utils.escapeHTML(reason)}</p>` : ""}</div>` });
}

export class KrynnPanelApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = { classes: ["krynn", "krynn-panel-window"], window: { title: "KRYNN.Panel.Title", icon: "fa-solid fa-dragon", resizable: true }, position: { width: 420 } };
  static PARTS = { panel: { template: template("krynn-panel") } };
  constructor({ actor }) { super({ id: `krynn-panel-${actor.id}` }); this.actor = actor; }
  get title() { return T("Panel.TitleOf", { name: this.actor.name }); }
  async _prepareContext() { return panelContext(this.actor); }
  _onRender(context, options) {
    super._onRender?.(context, options);
    wire(this.element, this.actor, () => this.render());
  }
}

function wire(root, actor, rerender) {
  for (const el of root?.querySelectorAll?.("[data-krynn-panel]") ?? []) el.addEventListener("click", (ev) => { ev.preventDefault(); onAction(actor, el.dataset.krynnPanel, el, rerender); });
}

export function openPanel(actor) { (foundry.applications.instances.get(`krynn-panel-${actor.id}`) ?? new KrynnPanelApp({ actor })).render({ force: true }); }

// The tab on PF2e's character sheet: a nav item and a tab in PF2e's own containers, so its Tabs controller
// handles them. Returns whether the tab could be placed.
export async function injectTab(app, html) {
  const actor = app.actor ?? app.document;
  if (!actor || actor.type !== "character") return false;
  const root = html instanceof HTMLElement ? html : html?.[0];
  const nav = root?.querySelector?.("nav.sheet-navigation");
  const content = root?.querySelector?.(".sheet-content");
  if (!nav || !content || nav.querySelector('[data-tab="krynn"]')) return false;
  const a = document.createElement("a");
  a.className = "item";
  a.dataset.tab = "krynn";
  a.dataset.tooltip = T("Panel.Title");
  a.innerHTML = `<i class="fa-solid fa-dragon"></i>`;
  nav.append(a);
  const tab = document.createElement("div");
  tab.className = "tab krynn-tab";
  tab.dataset.tab = "krynn";
  tab.innerHTML = await render(template("krynn-panel"), panelContext(actor));
  content.append(tab);
  wire(tab, actor, () => app.render?.(false));
  return true;
}

// The sheet's header buttons (Application v1 sheets): Krynn.
export function headerButtons(sheet, buttons) {
  const actor = sheet.actor;
  if (!actor || actor.type !== "character") return;
  buttons.unshift({ label: T("Panel.Short"), class: "krynn-panel-button", icon: "fa-solid fa-dragon", onclick: () => openPanel(actor) });
}
