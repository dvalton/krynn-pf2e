// The dragons of Krynn: the legacy bestiaries' dragons brought into the world with the Krynn templates (Dragonfear,
// and for the Overlords the elite adjustment, Gargantuan size and the Skull Totem), and Dragonfear's save posted for
// every enemy in reach when an encounter begins.
import { MODULE_ID, T, template, setting, isLeadGM } from "../constants.mjs";
import { parseDragon, dragonfearRadius, dragonfearDC, overlordBase, withinFeet } from "../../logic/dragons.mjs";
import { OVERLORDS } from "../../content/dragons.mjs";
import { toolbeltSave } from "../compat.mjs";

const fa = foundry.applications;
const FEAR = "krynn-dragonfear", OVERLORD = "krynn-overlord", TOTEM = "krynn-skull-totem";

// Every legacy dragon in this world's Actor compendiums (the module's own packs aside).
export function findDragons() {
  const out = [];
  for (const pack of game.packs) {
    if (pack.documentName !== "Actor" || pack.collection.startsWith(`${MODULE_ID}.`)) continue;
    for (const e of pack.index) {
      const d = parseDragon(e.name);
      if (d) out.push({ ...d, name: e.name, id: e._id, pack: pack.collection, packLabel: pack.metadata?.label ?? pack.title ?? pack.collection, uuid: e.uuid ?? `Compendium.${pack.collection}.Actor.${e._id}` });
    }
  }
  const order = (x) => ["young", "adult", "ancient"].indexOf(x.age);
  return out.sort((a, b) => a.color.localeCompare(b.color) || order(a) - order(b) || a.name.localeCompare(b.name));
}

async function packItem(name) {
  for (const p of [game.packs.get(`${MODULE_ID}.dragons`), game.packs.get(`${MODULE_ID}.relics`)]) {
    const e = p?.index?.find?.((x) => x.name === name);
    if (e) { const doc = await p.getDocument(e._id).catch(() => null); if (doc) return { data: doc.toObject(), uuid: doc.uuid ?? `Compendium.${p.collection}.Item.${e._id}` }; }
  }
  return null;
}

// The Krynn template on an actor's data (before it is created): Dragonfear with its reach, and the Overlord's parts.
export async function krynnDragonData(source, { overlord = null } = {}) {
  const data = foundry.utils.mergeObject(source, {}, { inplace: false });
  delete data._id; delete data.folder; delete data.sort;
  data.items = (data.items ?? []).filter((i) => i.system?.slug !== FEAR);
  const fear = await packItem("Dragonfear");
  if (fear) {
    const radius = overlord ? 120 : dragonfearRadius(source.name);
    for (const r of fear.data.system.rules ?? []) if (r.key === "Aura") r.radius = radius;
    data.items.push({ ...fear.data, _stats: { compendiumSource: fear.uuid } });
  }
  data.flags = { ...(data.flags ?? {}), [MODULE_ID]: { ...(data.flags?.[MODULE_ID] ?? {}), dragon: { ...parseDragon(source.name), source: source._stats?.compendiumSource ?? null, overlord: overlord?.slug ?? null } } };
  if (overlord) {
    data.name = overlord.name;
    data.system = foundry.utils.mergeObject(data.system ?? {}, { traits: { size: { value: "grg" } } }, { inplace: false });
    const o = await packItem("Dragon Overlord");
    if (o) data.items.push({ ...o.data, _stats: { compendiumSource: o.uuid } });
    data.prototypeToken = { ...(data.prototypeToken ?? {}), name: overlord.name, width: 4, height: 4 };
  }
  return data;
}

export async function importDragon(uuid, { overlord = null } = {}) {
  if (!game.user.isGM) throw new Error(T("Dragons.NeedGM"));
  const src = await fromUuid(uuid);
  if (!src) throw new Error(T("Dragons.NotFound", { name: uuid }));
  const data = await krynnDragonData({ ...src.toObject(), _stats: { compendiumSource: uuid } }, { overlord });
  const folder = game.folders.find((f) => f.type === "Actor" && f.name === T("Dragons.Folder")) ?? await Folder.create({ name: T("Dragons.Folder"), type: "Actor" });
  data.folder = folder.id;
  const actor = await Actor.create(data);
  if (overlord) await actor.applyAdjustment?.("elite");
  return actor;
}

export function overlordSource(slug, dragons = findDragons()) {
  const o = OVERLORDS.find((x) => x.slug === slug);
  const base = o && dragons.find((d) => d.name.toLowerCase() === overlordBase(o.color).toLowerCase());
  return o && base ? { overlord: o, base } : null;
}

export class DragonsApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "krynn-dragons",
    classes: ["krynn", "krynn-dragons"],
    window: { title: "KRYNN.Dragons.Title", icon: "fa-solid fa-dragon", resizable: true },
    position: { width: 620, height: 640 },
    actions: { import: DragonsApp.#onImport, overlord: DragonsApp.#onOverlord },
  };
  static PARTS = { dragons: { template: template("dragons"), scrollable: [".krynn-dragons-list"] } };

  async _prepareContext() {
    const dragons = findDragons();
    const colors = {};
    for (const d of dragons) (colors[d.color] ??= { color: T(`Dragons.Color.${d.color}`), chromatic: d.chromatic, rows: [] }).rows.push({ ...d, ageLabel: T(`Dragons.Age.${d.age}`) });
    const overlords = OVERLORDS.map((o) => { const s = overlordSource(o.slug, dragons); return { slug: o.slug, name: o.name, color: T(`Dragons.Color.${o.color}`), base: s?.base.name ?? overlordBase(o.color), ready: !!s }; });
    return { groups: Object.values(colors), overlords, none: !dragons.length };
  }

  static async #onImport(e, t) {
    try { const a = await importDragon(t.dataset.uuid); ui.notifications.info(T("Dragons.Imported", { name: a.name })); a.sheet?.render(true); } catch (err) { ui.notifications.error(err.message); }
  }
  static async #onOverlord(e, t) {
    const s = overlordSource(t.dataset.slug);
    if (!s) return ui.notifications.warn(T("Dragons.NoBase", { name: overlordBase(OVERLORDS.find((o) => o.slug === t.dataset.slug).color) }));
    try { const a = await importDragon(s.base.uuid, { overlord: s.overlord }); ui.notifications.info(T("Dragons.Imported", { name: a.name })); a.sheet?.render(true); } catch (err) { ui.notifications.error(err.message); }
  }
}

export function openDragons() { (foundry.applications.instances.get("krynn-dragons") ?? new DragonsApp()).render({ force: true }); }

// When an encounter begins: each dragon with Dragonfear, the enemies it reaches, and their Will save.
export async function onCombatStart(combat) {
  if (!isLeadGM() || !setting("dragonfearCards")) return;
  const scene = combat.scene ?? game.scenes?.current;
  const grid = scene?.grid ?? { size: 100, distance: 5 };
  const centre = (t) => ({ id: t.id, name: t.name, uuid: t.uuid, x: t.x + (t.width * grid.size) / 2, y: t.y + (t.height * grid.size) / 2, size: t.width, disposition: t.disposition, level: t.actor?.level ?? 0, actor: t.actor });
  const tokens = (combat.combatants?.contents ?? [...(combat.combatants ?? [])]).map((c) => c.token).filter(Boolean);
  for (const tok of tokens) {
    const fear = tok.actor?.items?.find?.((i) => i.system?.slug === FEAR);
    if (!fear) continue;
    const radius = fear.system.rules?.find((r) => r.key === "Aura")?.radius ?? 90;
    const me = centre(tok), level = tok.actor.level ?? 0, dc = dragonfearDC(level);
    const foes = withinFeet(me, tokens.filter((t) => t.disposition !== tok.disposition).map(centre), radius, grid.distance, grid.size);
    const immuneOf = (f) => f.level > level || f.actor?.items?.some?.((i) => i.system?.slug === "krynn-faced-dragonfear");
    const rows = foes.map((f) => {
      const immune = f.level > level || f.actor?.items?.some?.((i) => i.system?.slug === "krynn-faced-dragonfear");
      return `<li>${foundry.utils.escapeHTML(f.name)}${immune ? ` <span class="hint">(${T("Dragons.Immune")})</span>` : ""}</li>`;
    }).join("");
    if (!foes.length) continue;
    await ChatMessage.create({ speaker: { alias: tok.name },
      content: `<div class="krynn-card krynn-dragonfear"><h3>${T("Dragons.FearTitle", { name: foundry.utils.escapeHTML(tok.name) })}</h3><p>${T("Dragons.FearText", { feet: radius, m: Math.round(radius * 0.3) })}</p><ul>${rows}</ul><p>@Check[will|dc:${dc}|traits:emotion,fear,mental|options:area-effect,inflicts:frightened]</p></div>` });
    await toolbeltSave({ statistic: "will", dc, targets: foes.filter((f) => !immuneOf(f)).map((f) => f.uuid).filter(Boolean), traits: ["emotion", "fear", "mental"], options: ["area-effect"], speaker: { alias: tok.name } });
  }
}
