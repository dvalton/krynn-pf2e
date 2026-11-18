// Builds the compendium packs from the module's content (scripts/content) and Lifewrought's gods
// (lifewrought/data.json): JSON sources in packs-src/, LevelDB packs in packs/ (with the official Foundry CLI),
// and the Brazilian Portuguese translations for Babele in babele/pt-BR/.
//   node tools/build-packs.mjs          sources, translations and packs
//   node tools/build-packs.mjs --json   sources and translations only (what the tests read)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { FEATS, EFFECTS, JOURNALS } from "../scripts/content/magic.mjs";
import { DEITIES_PT } from "../scripts/content/deities-pt.mjs";
import { HERITAGES, ANCESTRY_FEATS, BACKGROUNDS, TABLES } from "../scripts/content/peoples.mjs";
import { ORDER_FEATS, ORDER_EFFECTS } from "../scripts/content/orders.mjs";
import { CREATURES, stat, fill } from "../scripts/content/creatures.mjs";
import { DRAGON_ACTIONS, DRAGON_EFFECTS, GEAR, RELICS, DRAGON_JOURNALS } from "../scripts/content/dragons.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "lifewrought/data.json"), "utf8"));
const SRC = path.join(ROOT, "packs-src"), OUT = path.join(ROOT, "packs"), BAB = path.join(ROOT, "babele/pt-BR");

export const PACKS = [
  { name: "magic", label: "Krynn: Magic", labelPt: "Krynn: Magia", type: "Item" },
  { name: "deities", label: "Krynn: Gods", labelPt: "Krynn: Deuses", type: "Item" },
  { name: "peoples", label: "Krynn: Peoples", labelPt: "Krynn: Povos", type: "Item" },
  { name: "backgrounds", label: "Krynn: Backgrounds", labelPt: "Krynn: Antecedentes", type: "Item" },
  { name: "orders", label: "Krynn: Knightly Orders", labelPt: "Krynn: Ordens de Cavalaria", type: "Item" },
  { name: "tables", label: "Krynn: Tables", labelPt: "Krynn: Tabelas", type: "RollTable" },
  { name: "creatures", label: "Krynn: Draconians and Creatures", labelPt: "Krynn: Draconianos e Criaturas", type: "Actor" },
  { name: "dragons", label: "Krynn: Dragons", labelPt: "Krynn: Dragões", type: "Item" },
  { name: "relics", label: "Krynn: Relics", labelPt: "Krynn: Relíquias", type: "Item" },
  { name: "guides", label: "Krynn: Guides", labelPt: "Krynn: Guias", type: "JournalEntry" },
  { name: "gm-guides", label: "Krynn: GM Guides", labelPt: "Krynn: Guias do Mestre", type: "JournalEntry", gmOnly: true },
];

// Stable 16-character ids, so a pack keeps its ids between builds (links and Babele keep working).
const id = (s) => { const h = crypto.createHash("sha1").update(`krynn-pf2e:${s}`).digest(); const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; return Array.from(h.subarray(0, 16), (b) => A[b % 62]).join(""); };
const publication = { title: "Krynn for PF2e", license: "ORC", remaster: true, authors: "" };
const stats = { coreVersion: "14.370", systemId: "pf2e", systemVersion: "8.7.1" };

// Links written in the content as @UUID[TABLE:slug] and @UUID[FEAT:Skill Feat Name] become real UUIDs.
const SKILL_FEATS = Object.fromEntries(D.build.skill_feats.map((x) => [x.name, x.uuid]));
export function featUuid(name) { const u = SKILL_FEATS[name]; if (!u) throw new Error(`no PF2e skill feat named ${name}`); return u; }
export const tableUuid = (slug) => `Compendium.krynn-pf2e.tables.RollTable.${id(`table:${slug}`)}`;
const itemPack = (slug) => (RELICS.some((r) => r.slug === slug) ? "relics" : "dragons");
const itemKind = (slug) => (DRAGON_EFFECTS.some((e) => e.slug === slug) ? "effect" : [...GEAR, ...RELICS].some((g) => g.slug === slug) ? "gear" : "action");
export const itemUuid = (slug) => `Compendium.krynn-pf2e.${itemPack(slug)}.Item.${id(`${itemKind(slug)}:${slug}`)}`;
export const links = (html) => html.replace(/@UUID\[TABLE:([\w-]+)\]/g, (_, s) => `@UUID[${tableUuid(s)}]`).replace(/@UUID\[FEAT:([^\]]+)\]/g, (_, n) => `@UUID[${featUuid(n)}]`)
  .replace(/@UUID\[(?:EFFECT|ITEM):([\w-]+)\]/g, (_, s) => `@UUID[${itemUuid(s)}]`).replace(/@UUID\[SPELL:([^\]]+)\]/g, (_, n) => `@UUID[${SPELL(n)}]`);
const text = (t) => ({ en: links(t.en), pt: links(t.pt) });

function feat(f) {
  const _id = id(`feat:${f.slug}`);
  return { _id, _key: `!items!${_id}`, name: f.name.en, type: "feat", img: f.img, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: f.slug } }, effects: [], ownership: { default: 0 }, _stats: stats,
    system: {
      slug: f.slug, category: f.category, level: { value: f.level }, actionType: { value: f.actionType || "passive" }, actions: { value: null },
      description: { value: links(f.description.en), gm: "" }, rules: f.rules || [], publication,
      prerequisites: { value: (f.prerequisites?.en || []).map((value) => ({ value })) },
      traits: { value: f.traits, rarity: "common", otherTags: [] },
      ...(f.frequency ? { frequency: { max: f.frequency.max, per: f.frequency.per, value: f.frequency.max } } : {}),
    } };
}

function effect(e) {
  const _id = id(`effect:${e.slug}`);
  return { _id, _key: `!items!${_id}`, name: e.name.en, type: "effect", img: e.img, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: e.slug } }, effects: [], ownership: { default: 0 }, _stats: stats,
    system: { slug: e.slug, description: { value: links(e.description.en), gm: "" }, rules: e.rules, publication, level: { value: 1 }, traits: { value: [], rarity: "common", otherTags: [] },
      duration: e.duration ? { value: e.duration.value, unit: e.duration.unit, expiry: "turn-start", sustained: false } : { value: -1, unit: "unlimited", expiry: null, sustained: false }, start: { value: 0, initiative: null }, tokenIcon: { show: true }, badge: null } };
}

const SPELLS = Object.fromEntries(D.build.spells.map((x) => [x.name, x.uuid]));
const SPELL = (name) => { const u = SPELLS[name]; if (!u) throw new Error(`no PF2e spell named ${name}`); return u; };
function deity(slug, g, lang) {
  const t = lang === "pt" ? DEITIES_PT[slug] : g;
  const L = lang === "pt" ? { edicts: "Éditos", anathema: "Anátema", magic: "Os deuses da magia não têm clérigos: eles concedem a Alta Feitiçaria, pela sua lua, aos magos da sua ordem." }
    : { edicts: "Edicts", anathema: "Anathema", magic: "The gods of magic have no clerics: they grant High Sorcery, through their moon, to the mages of their order." };
  const moon = ["solinari", "lunitari", "nuitari"].includes(slug);
  return `<p><strong>${g.name}</strong>, ${t.title}.</p><p><strong>${L.edicts}</strong> ${t.edicts}</p><p><strong>${L.anathema}</strong> ${t.anathema}</p>${moon ? `<p>${L.magic}</p>` : ""}`;
}
function deityDoc(slug, g) {
  const _id = id(`deity:${slug}`);
  return { _id, _key: `!items!${_id}`, name: g.name, type: "deity", img: "systems/pf2e/icons/default-icons/deity.svg", folder: null, sort: 0, flags: { "krynn-pf2e": { slug } }, effects: [], ownership: { default: 0 }, _stats: stats,
    system: { slug: `krynn-${slug.replace(/_/g, "-")}`, category: "deity", description: { value: deity(slug, g, "en"), gm: "" }, rules: [], publication,
      domains: { primary: g.domains, alternate: [] }, font: g.font, sanctification: g.sanct === "none" ? null : { modal: "can", what: [g.sanct] },
      attribute: g.attribute, skill: [g.skill], weapons: [g.weapon], spells: g.spell ? { 1: SPELL(g.spell) } : {} } };
}

const ANCESTRIES = D.rules.ancestries;
function heritage(h) {
  const _id = id(`heritage:${h.slug}`), a = ANCESTRIES[h.ancestry];
  if (!a) throw new Error(`no ancestry ${h.ancestry}`);
  return { _id, _key: `!items!${_id}`, name: h.name.en, type: "heritage", img: h.img, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: h.slug } }, effects: [], ownership: { default: 0 }, _stats: stats,
    system: { slug: h.slug, ancestry: { name: a.name, slug: h.ancestry, uuid: a.uuid }, description: { value: links(h.description.en), gm: "" }, rules: h.rules || [], publication,
      traits: { value: [h.ancestry], rarity: "common", otherTags: [] } } };
}

const ATTRS = ["str", "dex", "con", "int", "wis", "cha"];
function background(b) {
  const _id = id(`background:${b.slug}`), uuid = featUuid(b.feat);
  return { _id, _key: `!items!${_id}`, name: b.name.en, type: "background", img: b.img, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: b.slug } }, effects: [], ownership: { default: 0 }, _stats: stats,
    system: { slug: b.slug, description: { value: links(b.description.en), gm: "" }, rules: [], publication, traits: { value: [], rarity: "common", otherTags: [] },
      boosts: { 0: { value: b.boosts, selected: null }, 1: { value: ATTRS, selected: null } },
      trainedSkills: { value: [b.skill], lore: [b.lore] },
      items: { [id(`bgfeat:${b.slug}`).slice(0, 5)]: { uuid, img: "systems/pf2e/icons/features/feats/feats.webp", name: b.feat, level: 1 } } } };
}

function table(t) {
  const _id = id(`table:${t.slug}`);
  return { _id, _key: `!tables!${_id}`, name: t.name.en, img: t.img, description: "", formula: t.formula, replacement: true, displayRoll: true, folder: null, sort: 0,
    flags: { "krynn-pf2e": { slug: t.slug } }, ownership: { default: 0 }, _stats: stats,
    results: t.results.map(([en], i) => { const rid = id(`result:${t.slug}:${i}`); return { _id: rid, _key: `!tables.results!${_id}.${rid}`, type: "text", name: en, description: en, text: en,
      img: t.img, weight: 1, range: [i + 1, i + 1], drawn: false, flags: {}, _stats: stats }; }) };
}

// The Krynn templates and gear (packs "dragons" and "relics").
function action(a) {
  const _id = id(`action:${a.slug}`);
  return { _id, _key: `!items!${_id}`, name: a.name.en, type: "action", img: a.img, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: a.slug } }, effects: [], ownership: { default: 0 }, _stats: stats,
    system: { slug: a.slug, actionType: { value: "passive" }, actions: { value: null }, category: "offensive", description: { value: links(a.description.en), gm: "" }, rules: a.rules || [], publication,
      traits: { value: a.traits || [], rarity: "common", otherTags: [] } } };
}
function gear(g) {
  const _id = id(`gear:${g.slug}`);
  const base = { slug: g.slug, level: { value: g.level }, price: { value: { gp: g.price } }, quantity: 1, description: { value: links(g.description.en), gm: "" }, rules: g.rules || [], publication,
    traits: { value: g.traits || g.system.traits || [], rarity: g.rarity, otherTags: [] }, hardness: 0, hp: { max: 0, value: 0 }, material: { grade: null, type: null }, size: "med", containerId: null,
    equipped: { carryType: "worn", handsHeld: 0, invested: null } };
  const { traits, ...sys } = g.system;
  const system = { ...base, ...sys };
  if (g.type === "weapon") Object.assign(system, { bonus: { value: 0 }, bonusDamage: { value: 0 }, splashDamage: { value: 0 }, range: null, reload: { value: null }, expend: null, ammo: null, runes: { potency: 0, striking: 0, property: [], ...(sys.runes || {}) } });
  if (g.type === "armor") Object.assign(system, { runes: { potency: 0, resilient: 0, property: [] }, group: null, baseItem: null });
  return { _id, _key: `!items!${_id}`, name: g.name.en, type: g.type, img: g.img, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: g.slug } }, effects: [], ownership: { default: 0 }, _stats: stats, system };
}

// The creatures of Krynn as PF2e NPCs, from the building tables (scripts/content/creatures.mjs).
const SIZE = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
const ACTION_TYPE = (a) => (typeof a === "number" ? { actionType: { value: "action" }, actions: { value: a } } : { actionType: { value: a }, actions: { value: null } });
export function creature(c) {
  const _id = id(`creature:${c.slug}`), L = c.level;
  const items = [];
  const item = (key, data) => { const iid = id(`creature:${c.slug}:${key}`); items.push({ _id: iid, _key: `!actors.items!${_id}.${iid}`, img: c.img, effects: [], flags: {}, sort: items.length * 100000, _stats: stats, ...data }); };
  for (const [name, t, dmg, type, traits] of c.strikes) {
    const range = traits.map((x) => /^(?:range|thrown)-(\d+)$/.exec(x)).find(Boolean);
    item(`strike:${name}`, { name, type: "melee", system: { slug: null, bonus: { value: stat.atk(L, t) }, damageRolls: { [id(`dmg:${c.slug}:${name}`).toLowerCase()]: { damage: dmg === "dmg" ? stat.dmg(L, t) : dmg, damageType: type } },
      traits: { value: traits.filter((x) => !/^range-\d+$/.test(x)), rarity: "common" }, attack: { value: "" }, attackEffects: { custom: "", value: [] }, description: { value: "" }, range: range ? { increment: Number(range[1]), max: null } : null, rules: [], publication } });
  }
  for (const [slug, name, act, traits, text, rules] of c.actions) {
    const desc = text.en.startsWith("@Localize") ? text.en : `@Localize[KRYNN.Bestiary.${c.slug}.${slug}]`;
    item(`action:${slug}`, { name: name.en, type: "action", flags: { "krynn-pf2e": { slug } }, system: { slug, ...ACTION_TYPE(act), category: act === "passive" || act === "reaction" ? "defensive" : "offensive",
      description: { value: desc }, rules: rules || [], traits: { value: traits, rarity: "common" }, publication } });
  }
  const a = c.abilities, sz = SIZE[c.size];
  return {
    _id, _key: `!actors!${_id}`, name: c.name.en, type: "npc", img: c.img, folder: null, sort: 0, ownership: { default: 0 }, _stats: stats,
    flags: { "krynn-pf2e": { slug: c.slug, ...(c.draconian ? { draconian: c.draconian } : {}) } },
    prototypeToken: { name: c.name.en, texture: { src: c.img }, width: sz, height: sz, disposition: -1, actorLink: false, displayName: 20, displayBars: 20, bar1: { attribute: "attributes.hp" } },
    items,
    system: {
      abilities: Object.fromEntries(Object.entries(a).map(([k, v]) => [k, { mod: v }])),
      attributes: {
        ac: { value: stat.ac(L, c.ac), details: "" }, allSaves: { value: "" },
        hp: { value: stat.hp(L, c.hp), max: stat.hp(L, c.hp), temp: 0, details: "" },
        speed: { value: c.speed, otherSpeeds: c.other.map(([type, value]) => ({ type, value })) },
        immunities: (c.immunities || []).map((type) => ({ type })),
        resistances: (c.resistances || []).map(([type, value, exceptions]) => ({ type, value, ...(exceptions ? { exceptions } : {}) })),
        weaknesses: (c.weaknesses || []).map(([type, value]) => ({ type, value })),
      },
      details: { level: { value: L }, blurb: "", languages: { value: c.languages, details: "" }, publicNotes: `@Localize[KRYNN.Bestiary.${c.slug}.Notes]`, privateNotes: "", publication },
      initiative: { statistic: "perception" },
      perception: { mod: stat.save(L, c.perception), senses: c.senses.map((type) => ({ type })), details: "" },
      saves: Object.fromEntries(Object.entries(c.saves).map(([k, t]) => [k, { value: stat.save(L, t), saveDetail: "" }])),
      skills: Object.fromEntries(Object.entries(c.skills).map(([k, t]) => [k, { base: stat.skill(L, t) }])),
      traits: { rarity: "common", size: { value: c.size }, value: c.traits },
      resources: {},
    },
  };
}

function journal(j) {
  const _id = id(`journal:${j.slug}`);
  return { _id, _key: `!journal!${_id}`, name: j.name.en, folder: null, sort: 0, flags: { "krynn-pf2e": { slug: j.slug } }, ownership: { default: 0 }, _stats: stats, categories: [],
    pages: j.pages.map((pg, i) => { const pid = id(`page:${j.slug}:${pg.slug}`); return { _id: pid, _key: `!journal.pages!${_id}.${pid}`, name: pg.name.en, type: "text", sort: (i + 1) * 100000,
      title: { show: true, level: 1 }, text: { content: pg.text.en, format: 1 }, flags: {}, ownership: { default: -1 }, _stats: stats }; }) };
}

const ALL_JOURNALS = [...JOURNALS, ...DRAGON_JOURNALS];
export function buildDocs() {
  return {
    magic: [...FEATS.map(feat), ...EFFECTS.map(effect)],
    deities: Object.entries(D.deities).map(([slug, g]) => deityDoc(slug, g)),
    peoples: [...HERITAGES.map(heritage), ...ANCESTRY_FEATS.map((f) => feat({ category: "ancestry", level: 1, ...f }))],
    backgrounds: BACKGROUNDS.map(background),
    orders: [...ORDER_FEATS.map((f) => feat({ category: "class", ...f })), ...ORDER_EFFECTS.map(effect)],
    tables: TABLES.map(table),
    creatures: CREATURES.map(creature),
    dragons: [...DRAGON_ACTIONS.map(action), ...DRAGON_EFFECTS.map(effect), ...GEAR.map(gear)],
    relics: RELICS.map(gear),
    guides: ALL_JOURNALS.filter((j) => !j.gmOnly).map(journal),
    "gm-guides": ALL_JOURNALS.filter((j) => j.gmOnly).map(journal),
  };
}

export function buildBabele() {
  const items = [...FEATS, ...EFFECTS];
  const entries = (list) => Object.fromEntries(list.map((x) => [x.name.en, { name: x.name.pt, description: text(x.description).pt }]));
  const out = {
    peoples: { label: "Krynn: Povos", mapping: { description: "system.description.value" }, entries: entries([...HERITAGES, ...ANCESTRY_FEATS]) },
    backgrounds: { label: "Krynn: Antecedentes", mapping: { description: "system.description.value" }, entries: entries(BACKGROUNDS) },
    orders: { label: "Krynn: Ordens de Cavalaria", mapping: { description: "system.description.value" }, entries: entries([...ORDER_FEATS, ...ORDER_EFFECTS]) },
    creatures: { label: "Krynn: Draconianos e Criaturas", entries: Object.fromEntries(CREATURES.map((c) => [c.name.en, { name: c.name.pt, tokenName: c.name.pt }])) },
    dragons: { label: "Krynn: Dragões", mapping: { description: "system.description.value" }, entries: entries([...DRAGON_ACTIONS, ...DRAGON_EFFECTS, ...GEAR]) },
    relics: { label: "Krynn: Relíquias", mapping: { description: "system.description.value" }, entries: entries(RELICS) },
    tables: { label: "Krynn: Tabelas", entries: Object.fromEntries(TABLES.map((t) => [t.name.en, { name: t.name.pt,
      results: Object.fromEntries(t.results.map(([, pt], i) => [`${i + 1}-${i + 1}`, pt])) }])) },
    magic: { label: "Krynn: Magia", mapping: { description: "system.description.value" },
      entries: Object.fromEntries(items.map((x) => [x.name.en, { name: x.name.pt, description: x.description.pt }])) },
    deities: { label: "Krynn: Deuses", mapping: { description: "system.description.value" },
      entries: Object.fromEntries(Object.entries(D.deities).map(([slug, g]) => [g.name, { name: g.name, description: deity(slug, g, "pt") }])) },
  };
  for (const [pack, gm] of [["guides", false], ["gm-guides", true]]) {
    out[pack] = { label: gm ? "Krynn: Guias do Mestre" : "Krynn: Guias",
      entries: Object.fromEntries(ALL_JOURNALS.filter((j) => !!j.gmOnly === gm).map((j) => [j.name.en, { name: j.name.pt,
        pages: Object.fromEntries(j.pages.map((pg) => [pg.name.en, { name: pg.name.pt, text: pg.text.pt }])) }])) };
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const docs = buildDocs();
  fs.rmSync(SRC, { recursive: true, force: true });
  for (const [pack, list] of Object.entries(docs)) {
    fs.mkdirSync(path.join(SRC, pack), { recursive: true });
    for (const d of list) fs.writeFileSync(path.join(SRC, pack, `${d.flags["krynn-pf2e"].slug}.json`), JSON.stringify(d, null, 1) + "\n");
  }
  fs.mkdirSync(BAB, { recursive: true });
  for (const [pack, data] of Object.entries(buildBabele())) fs.writeFileSync(path.join(BAB, `krynn-pf2e.${pack}.json`), JSON.stringify(data, null, 1) + "\n");
  console.log(Object.entries(docs).map(([k, v]) => `${k}: ${v.length}`).join(", "));
  if (!process.argv.includes("--json")) {
    const { compilePack } = await import("@foundryvtt/foundryvtt-cli");
    fs.rmSync(OUT, { recursive: true, force: true });
    for (const p of PACKS) await compilePack(path.join(SRC, p.name), path.join(OUT, p.name), { log: false });
    console.log(`packs/: ${fs.readdirSync(OUT).join(", ")}`);
  }
}
