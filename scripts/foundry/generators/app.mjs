// The Generators of Krynn (GM): people, encounters, rumours, treasure, travel and weather, inns, ships, gnome
// inventions and kender pockets, for a region, a place and a year. Results go to the GM as chat cards, with
// buttons to show them to the players, to make the NPC, and to put the encounter on the scene.
import { MODULE_ID, T, template, setting } from "../constants.mjs";
import { now } from "../time.mjs";
import { lwData } from "../lifewrought/engine.mjs";
import { seasonsFor } from "../../logic/calendar.mjs";
import * as Gen from "../../logic/generators.mjs";
import { buildNpc } from "../../logic/npc.mjs";
import { ROLES, REGION_TERRAIN } from "../../content/generators.mjs";

const fa = foundry.applications;
const lang = () => (game.i18n.lang?.startsWith("pt") ? "pt" : "en");
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const TERRAINS = ["plains", "forest", "hills", "mountains", "underground", "coast", "swamp", "desert", "arctic", "volcanic"];

// The party: PF2e's Party actor, or the players' characters.
export function party() {
  const members = game.actors.party?.members?.filter?.((a) => a.type === "character") ?? game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner);
  const levels = members.map((a) => a.level ?? a.system?.details?.level?.value ?? 1);
  return { size: Math.max(1, members.length || 4), level: levels.length ? Math.round(levels.reduce((x, y) => x + y, 0) / levels.length) : 1 };
}

// Every creature with a level in this world's Actor compendiums, by normalized name: the module's first, then the
// Monster Core, then the rest.
let INDEX = null;
export async function creatureIndex(force = false) {
  if (INDEX && !force) return INDEX;
  const out = new Map();
  const packs = [...game.packs].filter((p) => p.documentName === "Actor");
  const rank = (p) => (p.collection.startsWith(`${MODULE_ID}.creatures`) ? 0 : p.collection.includes("monster-core") ? 1 : p.collection.startsWith(`${MODULE_ID}.`) ? 9 : 2);
  for (const pack of packs.sort((a, b) => rank(a) - rank(b))) {
    const index = (await pack.getIndex?.({ fields: ["system.details.level.value", "type"] }).catch(() => null)) ?? pack.index;
    for (const e of index) {
      const level = e.system?.details?.level?.value;
      if (typeof level !== "number" || (e.type && e.type !== "npc")) continue;
      const k = norm(e.name);
      if (!out.has(k)) out.set(k, { name: e.name, level, uuid: e.uuid ?? `Compendium.${pack.collection}.Actor.${e._id}` });
    }
  }
  return (INDEX = out);
}

export class GeneratorsApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "krynn-generators",
    classes: ["krynn", "krynn-generators"],
    tag: "form",
    window: { title: "KRYNN.Gen.Title", icon: "fa-solid fa-dice", resizable: true },
    position: { width: 560 },
    form: { handler: GeneratorsApp.#onChange, submitOnChange: true, closeOnSubmit: false },
    actions: {
      person: (e) => GeneratorsApp.run("person"), encounter: () => GeneratorsApp.run("encounter"), rumours: () => GeneratorsApp.run("rumours"),
      treasure: () => GeneratorsApp.run("treasure"), travel: () => GeneratorsApp.run("travel"), inn: () => GeneratorsApp.run("inn"),
      ship: () => GeneratorsApp.run("ship"), invention: () => GeneratorsApp.run("invention"), pockets: () => GeneratorsApp.run("pockets"),
    },
  };
  static PARTS = { form: { template: template("generators") } };
  static state = null;

  static defaults() {
    const p = party(), d = now();
    return { region: setting("lwRegion") || "abanasinia", place: "", year: d.year, terrain: "", level: p.level, size: p.size, difficulty: "moderate", role: "", npcLevel: "", hoard: "encounter" };
  }

  async _prepareContext() {
    const D = await lwData();
    const s = (GeneratorsApp.state ??= GeneratorsApp.defaults());
    const regions = D.regions.filter((r) => r.content === "ready").map((r) => ({ value: r.id, label: r.name, selected: r.id === s.region }));
    const places = Gen.placesIn(D, s.region).filter((p) => /^[A-Z]/.test(p.name)).map((p) => ({ value: p.id, label: p.name, selected: p.id === s.place }));
    const sel = (list, v, prefix) => list.map((x) => ({ value: x, label: T(`${prefix}.${x}`), selected: x === v }));
    return { s, regions, places, terrains: sel(TERRAINS.filter((t) => (REGION_TERRAIN[s.region] ?? TERRAINS).includes(t)), s.terrain, "Gen.Terrain"),
      difficulties: sel(["trivial", "low", "moderate", "severe", "extreme"], s.difficulty, "Gen.Difficulty"), roles: sel(Object.keys(ROLES), s.role, "Gen.Role"),
      hoards: sel(["encounter", "hoard"], s.hoard, "Gen.Hoard") };
  }

  static async #onChange(event, form, formData) {
    const f = foundry.utils.expandObject(formData.object);
    const s = GeneratorsApp.state ?? GeneratorsApp.defaults();
    const regionChanged = f.region && f.region !== s.region;
    Object.assign(s, { region: f.region ?? s.region, place: regionChanged ? "" : f.place ?? "", year: Number(f.year) || s.year, terrain: regionChanged ? "" : f.terrain ?? "",
      level: Number(f.level) || s.level, size: Number(f.size) || s.size, difficulty: f.difficulty ?? s.difficulty, role: f.role ?? "", npcLevel: f.npcLevel ?? "", hoard: f.hoard ?? s.hoard });
    if (regionChanged) this.render();
  }

  static async run(kind, state = GeneratorsApp.state ?? GeneratorsApp.defaults(), { rng = Math.random } = {}) {
    const D = await lwData(), s = state, L = lang();
    const regionName = D.regions.find((r) => r.id === s.region)?.name ?? s.region;
    let title = "", body = "", data = {};
    if (kind === "person") {
      const p = Gen.makePerson(D, { region: s.region, place: s.place || null, lang: L, rng });
      title = p.name;
      body = personHTML(p);
      data = { person: p, role: s.role || p.role, level: s.npcLevel === "" ? null : Number(s.npcLevel) };
    } else if (kind === "encounter") {
      const index = await creatureIndex();
      const pool = Gen.encounterPool(s.region, s.terrain || null, s.year);
      const candidates = pool.map((c) => ({ ...c, ...(index.get(norm(c.name)) ?? {}) })).filter((c) => typeof c.level === "number");
      const enc = Gen.buildEncounter({ candidates, partyLevel: s.level, partySize: s.size, difficulty: s.difficulty, rng });
      title = T("Gen.EncounterTitle", { region: regionName, difficulty: T(`Gen.Difficulty.${s.difficulty}`) });
      body = enc.creatures.length
        ? `<ul>${enc.creatures.map((c) => `<li>${c.count}× @UUID[${c.uuid}]{${esc(c.name)}} <span class="hint">(${T("Gen.Level", { level: c.level })}, ${c.xp} XP)</span></li>`).join("")}</ul><p>${T("Gen.XP", { total: enc.total, budget: enc.budget, size: s.size, level: s.level })}</p>`
        : `<p>${T("Gen.NoCreatures")}</p>`;
      data = { encounter: enc.creatures.map((c) => ({ uuid: c.uuid, count: c.count, name: c.name })) };
    } else if (kind === "rumours") {
      const list = Gen.rumours(D, { region: s.region, year: s.year, lang: L, rng });
      title = T("Gen.RumoursTitle", { place: esc(s.place ? D.origin.places[s.place]?.name : regionName), year: s.year });
      body = `<ul>${list.map((r) => `<li>${r.kind === "news" ? `<strong>${T("Gen.News")}:</strong> ` : ""}${esc(r.text)}</li>`).join("")}</ul>`;
    } else if (kind === "treasure") {
      const items = await krynnItems();
      const t = Gen.treasure({ level: s.level, size: s.hoard, partySize: s.size, lang: L, rng, items });
      title = T("Gen.TreasureTitle", { level: s.level });
      body = `<p><strong>${t.coins}</strong> ${T("Gen.Steel")}</p>${t.valuables.length ? `<ul>${t.valuables.map((v) => `<li>${esc(v.text)} (${v.value} ${T("Gen.SteelShort")})</li>`).join("")}</ul>` : ""}${t.item ? `<p>@UUID[${t.item.uuid}]{${esc(t.item.name)}}</p>` : ""}<p class="hint">${T("Gen.TreasureNote", { total: t.total })}</p>`;
    } else if (kind === "travel") {
      const d = now(), season = Gen.seasonOfDay(seasonsFor(setting("calendarStyle")), d.dayOfYear);
      const w = Gen.weather(s.region, season, { lang: L, rng });
      title = T("Gen.TravelTitle", { region: regionName });
      body = `<p><strong>${T(`Calendar.Season.${season}`)}:</strong> ${esc(w.text)}.${w.effect ? ` <em>${esc(w.effect)}</em>` : ""}</p><p><strong>${T("Gen.OnTheRoad")}:</strong> ${esc(Gen.roadEvent({ lang: L, rng }))}</p>`;
    } else if (kind === "inn") {
      const i = Gen.inn(D, { lang: L, rng, region: s.region, year: s.year });
      title = i.name;
      body = `<p><strong>${T("Gen.Keeper")}:</strong></p>${personHTML(i.keeper)}<p><strong>${T("Gen.Dish")}:</strong> ${esc(i.dish)}</p>${i.rumour ? `<p><strong>${T("Gen.Heard")}:</strong> ${esc(i.rumour)}</p>` : ""}`;
      data = { person: i.keeper, role: "merchant", level: null };
    } else if (kind === "ship") {
      title = T("Gen.ShipTitle");
      body = `<ul>${[0, 1, 2].map(() => `<li><em>${esc(Gen.shipName({ lang: L, rng }))}</em></li>`).join("")}</ul>`;
    } else if (kind === "invention") {
      const i = Gen.invention({ lang: L, rng });
      title = i.name;
      body = `<p>${T("Gen.InventionUse", { use: esc(i.use) })}</p><p>${T("Gen.InventionFlaw", { flaw: esc(i.flaw) })}</p>`;
    } else if (kind === "pockets") {
      const pack = game.packs.get(`${MODULE_ID}.tables`);
      const e = pack?.index?.find?.((x) => x.name === "Kender Pockets");
      const table = e ? await pack.getDocument(e._id) : null;
      if (table?.draw) return table.draw({ rollMode: "gmroll" });
      return ui.notifications.warn(T("Gen.NoTable"));
    }
    const buttons = [`<button type="button" data-krynn-gen="reveal"><i class="fa-solid fa-eye"></i> ${T("Gen.Reveal")}</button>`];
    if (data.person) buttons.push(`<button type="button" data-krynn-gen="npc"><i class="fa-solid fa-user-plus"></i> ${T("Gen.MakeNpc")}</button>`);
    if (data.encounter?.length) buttons.push(`<button type="button" data-krynn-gen="place"><i class="fa-solid fa-chess-pawn"></i> ${T("Gen.Place")}</button>`);
    const content = `<div class="krynn-card krynn-gen"><h3>${esc(title)}</h3>${body}<div class="krynn-gen-buttons">${buttons.join("")}</div></div>`;
    return ChatMessage.create({ speaker: { alias: T("Gen.Speaker") }, whisper: game.users.filter((u) => u.isGM).map((u) => u.id), content, flags: { [MODULE_ID]: { gen: { kind, ...data } } } });
  }
}

function personHTML(p) {
  return `<p><strong>${esc(p.name)}</strong>, ${esc(p.peopleLabel)} (${esc(p.genderLabel)})${p.placeName ? `, ${T("Gen.From", { place: esc(p.placeName) })}` : ""}.</p>`
    + `<ul><li><strong>${T("Gen.Trade")}:</strong> ${esc(p.trade)}</li><li><strong>${T("Gen.Want")}:</strong> ${esc(p.want)}</li><li class="krynn-gm"><strong>${T("Gen.Secret")}:</strong> ${esc(p.secret)}</li><li><strong>${T("Gen.Quirk")}:</strong> ${esc(p.quirk)}</li></ul>`;
}

// The Krynn items treasure can include: the module's dragons and relics packs, by level (not the unique relics).
async function krynnItems() {
  const out = [];
  for (const name of ["dragons", "relics"]) {
    const pack = game.packs.get(`${MODULE_ID}.${name}`);
    const index = (await pack?.getIndex?.({ fields: ["system.level.value", "system.traits.rarity", "type"] }).catch(() => null)) ?? pack?.index ?? [];
    for (const e of index) {
      if (!["weapon", "armor", "equipment"].includes(e.type) || e.system?.traits?.rarity === "unique") continue;
      out.push({ name: e.name, level: e.system?.level?.value ?? 0, uuid: e.uuid ?? `Compendium.${MODULE_ID}.${name}.Item.${e._id}` });
    }
  }
  return out;
}

// The NPC of a card, as a PF2e actor.
export async function makeNpc(gen) {
  const c = Gen.roleCreature(gen.person, gen.role, gen.level, lang());
  const notes = `<p>${esc(gen.person.peopleLabel)} · ${esc(gen.person.trade)}</p><p><strong>${T("Gen.Want")}:</strong> ${esc(gen.person.want)}</p><p><strong>${T("Gen.Quirk")}:</strong> ${esc(gen.person.quirk)}</p>`;
  const data = buildNpc(c, { id: () => foundry.utils.randomID(), notes });
  delete data._id; delete data._key;
  for (const i of data.items) { i._id = foundry.utils.randomID(); delete i._key; }
  data.system.details.privateNotes = `<p><strong>${T("Gen.Secret")}:</strong> ${esc(gen.person.secret)}</p>`;
  data.system.details.blurb = `${c.roleName} ${c.level}`;
  const folder = game.folders.find((f) => f.type === "Actor" && f.name === T("Gen.Folder")) ?? await Folder.create({ name: T("Gen.Folder"), type: "Actor" });
  data.folder = folder.id;
  return Actor.create(data);
}

// The encounter's creatures on the viewed scene: actors brought in from their compendiums once, tokens in a row.
export async function placeEncounter(list) {
  const scene = globalThis.canvas?.scene;
  if (!scene) return ui.notifications.warn(T("Gen.NoScene"));
  const folder = game.folders.find((f) => f.type === "Actor" && f.name === T("Gen.EncFolder")) ?? await Folder.create({ name: T("Gen.EncFolder"), type: "Actor" });
  const grid = scene.grid?.size ?? 100;
  const cx = canvas.stage?.pivot?.x ?? scene.width / 2, cy = canvas.stage?.pivot?.y ?? scene.height / 2;
  const tokens = [];
  let n = 0;
  for (const c of list) {
    let actor = game.actors.find((a) => a._stats?.compendiumSource === c.uuid || a.flags?.core?.sourceId === c.uuid);
    if (!actor) {
      const src = await fromUuid(c.uuid);
      if (!src) continue;
      actor = await Actor.create({ ...src.toObject(), folder: folder.id, _stats: { compendiumSource: c.uuid } });
    }
    for (let i = 0; i < c.count; i++, n++) {
      const x = cx + ((n % 4) - 1.5) * grid * 1.5, y = cy + (Math.floor(n / 4) - 0.5) * grid * 1.5;
      const td = await actor.getTokenDocument?.({ x: Math.round(x / grid) * grid, y: Math.round(y / grid) * grid });
      tokens.push(td?.toObject?.() ?? { name: actor.name, actorId: actor.id, x, y });
    }
  }
  if (tokens.length) await scene.createEmbeddedDocuments("Token", tokens);
  return tokens.length;
}

// The card's buttons (GM only).
export function onChatCard(message, html) {
  const gen = message.flags?.[MODULE_ID]?.gen;
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!gen || !root) return;
  for (const b of root.querySelectorAll("[data-krynn-gen]")) {
    if (!game.user.isGM) { b.remove(); continue; }
    b.addEventListener("click", async () => {
      const what = b.dataset.krynnGen;
      try {
        if (what === "reveal") await ChatMessage.create({ speaker: message.speaker, content: message.content.replace(/<div class="krynn-gen-buttons">[\s\S]*?<\/div>/, "").replace(/<li class="krynn-gm">[\s\S]*?<\/li>/g, "") });
        if (what === "npc") { const a = await makeNpc(gen); a?.sheet?.render(true); }
        if (what === "place") { const n = await placeEncounter(gen.encounter); if (n) ui.notifications.info(T("Gen.Placed", { n })); }
      } catch (e) { ui.notifications.error(e.message); }
    });
  }
}

export function openGenerators() { (foundry.applications.instances.get("krynn-generators") ?? new GeneratorsApp()).render({ force: true }); }
export const _test = { reset: () => { INDEX = null; GeneratorsApp.state = null; } };
