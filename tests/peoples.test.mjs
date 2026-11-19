// 0.4 without Foundry: the peoples, backgrounds, orders and tables packs, and the helpers for gods, open choices
// and factions.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { buildDocs, buildBabele, PACKS } from "../tools/build-packs.mjs";
import { krynnHeritageOf, swapHeritage, useKrynnDeity, openChoices, grantTree, factionsFromLife, factionRows, standingKey, flagOf } from "../scripts/logic/peoples.mjs";
import { replayLife, buildActorData } from "../scripts/logic/lifewrought.mjs";
import { FACTIONS } from "../scripts/content/orders.mjs";
import { HERITAGES, BACKGROUNDS, TABLES } from "../scripts/content/peoples.mjs";

const D = JSON.parse(fs.readFileSync(new URL("../lifewrought/data.json", import.meta.url)));
const LW = createRequire(import.meta.url)(new URL("../lifewrought/engine.js", import.meta.url).pathname);
const ITEMS = JSON.parse(fs.readFileSync(new URL("./fixtures/pf2e-items.json", import.meta.url)));
const LIVES = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
const docs = buildDocs(), bab = buildBabele();
const build = async (name) => { const { v } = await replayLife(LW, D, LIVES.find((l) => l.role === name || l.name === name).record); return { v, ...(await buildActorData(LW, v, D, async (u) => (ITEMS[u] ? structuredClone(ITEMS[u]) : null))) }; };

test("the 0.4 packs are built, every link resolved, every text in both languages", () => {
  for (const p of ["peoples", "backgrounds", "orders", "tables"]) assert.ok(PACKS.some((x) => x.name === p), p);
  assert.equal(docs.peoples.filter((d) => d.type === "heritage").length, HERITAGES.length);
  assert.equal(docs.backgrounds.length, 10);
  assert.equal(docs.tables.length, 2);
  const all = JSON.stringify([docs.peoples, docs.backgrounds, docs.orders, docs.tables, bab]);
  assert.ok(!/@UUID\[(TABLE|FEAT):/.test(all), "no link left unresolved");
  const ancestries = new Set(Object.values(D.rules.ancestries).map((a) => a.uuid));
  for (const h of docs.peoples.filter((d) => d.type === "heritage")) assert.ok(ancestries.has(h.system.ancestry.uuid), `${h.name}: a real PF2e ancestry`);
  const feats = new Set(D.build.skill_feats.map((f) => f.uuid));
  for (const b of docs.backgrounds) {
    const [granted] = Object.values(b.system.items);
    assert.ok(feats.has(granted.uuid), `${b.name}: grants a real skill feat`);
    assert.equal(b.system.boosts[0].value.length, 2);
    assert.equal(b.system.trainedSkills.lore.length, 1);
  }
  for (const t of docs.tables) {
    const src = TABLES.find((x) => x.name.en === t.name);
    assert.equal(t.results.length, Number(src.formula.slice(2)), `${t.name}: one result per face`);
    assert.deepEqual(t.results.at(-1).range, [t.results.length, t.results.length]);
  }
  for (const [pack, list] of Object.entries({ peoples: docs.peoples, backgrounds: docs.backgrounds, orders: docs.orders, tables: docs.tables })) {
    for (const d of list) {
      const pt = bab[pack].entries[d.name];
      assert.ok(pt?.name, `${pack}/${d.name} has a Portuguese name`);
      if (pack !== "tables") assert.notEqual(pt.description, d.system.description.value, `${d.name}: translated`);
      else assert.equal(Object.keys(pt.results).length, d.results.length);
    }
  }
  assert.ok(docs.peoples.find((d) => d.name === "Kender Pockets").system.description.value.includes("Compendium.krynn-pf2e.tables.RollTable."));
  assert.equal(new Set(Object.values(docs).flat().map((d) => d._id)).size, Object.values(docs).flat().length, "ids are unique");
});

test("the knightly orders are archetypes with a choice of order", () => {
  const sol = docs.orders.find((d) => d.system.slug === "knight-of-solamnia-dedication");
  assert.equal(sol.system.category, "class");
  assert.equal(sol.system.level.value, 2);
  assert.ok(sol.system.traits.value.includes("dedication"));
  const cs = sol.system.rules.find((r) => r.key === "ChoiceSet");
  assert.deepEqual(cs.choices.map((c) => c.value), ["crown", "sword", "rose"]);
  assert.ok(docs.orders.find((d) => d.system.slug === "knight-of-takhisis-dedication").system.traits.value.includes("dark-knight"));
  assert.ok(docs.orders.some((d) => d.type === "effect" && d.system.slug === "krynn-breach-of-the-measure"));
});

test("the deity Lifewrought writes is replaced by the Krynn Gods pack's, and the champion's choice points to it", async () => {
  const { data } = await build("champion-paladine");
  const paladine = docs.deities.find((d) => d.name === "Paladine");
  const uuid = `Compendium.krynn-pf2e.deities.Item.${paladine._id}`;
  const oldId = data.items.find((i) => i.type === "deity")._id;
  assert.ok(useKrynnDeity(data, paladine, uuid));
  const deity = data.items.find((i) => i.type === "deity");
  assert.equal(deity._id, oldId, "same item id");
  assert.equal(deity.flags["krynn-pf2e"].slug, "paladine");
  assert.match(deity.system.spells[1], /^Compendium\.pf2e\.spells-srd\.Item\.[A-Za-z0-9]{16}$/, "the god's spell is a real PF2e spell");
  const champ = data.items.find((i) => i.name === "Deity (Champion)");
  assert.equal(champ.flags.pf2e.rulesSelections.deity, uuid);
  assert.equal(champ.flags.pf2e.rulesSelections.sanctification, "holy", "Paladine's champion is holy");
  assert.equal(useKrynnDeity({ items: [] }, paladine, uuid), false);
});

test("Lifewrought makes the cleric's divine font from her god", async () => {
  const { data } = await build("kender-cleric-mishakal");
  const font = data.items.find((i) => i.name === "Divine Font");
  assert.equal(font?.flags.pf2e.rulesSelections.divineFont, "heal", "Mishakal heals");
});

test("open choices: only those PF2e must still ask for, on items the player can take again", async () => {
  const { data } = await build("versatile-human");
  const open = openChoices(data.items);
  assert.deepEqual(open.map((o) => [o.name, o.flags]), [["Versatile Human", ["versatileHeritage"]]]);
  assert.match(open[0].source, /^Compendium\.pf2e\.heritages\.Item\./);
  for (const life of LIVES) {
    const { data: d } = await build(life.name);
    for (const it of d.items) for (const r of it.system?.rules || []) {
      if (r.key !== "ChoiceSet" || r.selection != null || it.flags?.pf2e?.rulesSelections?.[flagOf(it, r)] != null) continue;
      const choices = r.choices;
      assert.ok(choices && !Array.isArray(choices) && (choices.filter || choices.itemType || choices.pack), `${life.name}: ${it.name} leaves only a compendium choice open (${flagOf(it, r)})`);
    }
  }
  const tree = grantTree([{ _id: "a" }, { _id: "b", flags: { pf2e: { grantedBy: { id: "a" } } } }, { _id: "c", flags: { pf2e: { grantedBy: { id: "b" } } } }, { _id: "d" }], "a");
  assert.deepEqual(tree.sort(), ["a", "b", "c"]);
});

test("factions start from the life's organizations, and standing uses PF2e's attitudes", () => {
  const f = factionsFromLife(["Knights of Solamnia (squire)", "The kirath", "The town watch", "The town watch"], FACTIONS);
  assert.deepEqual(Object.keys(f), ["knights-of-solamnia", "silvanesti", "the-town-watch"]);
  assert.equal(f["knights-of-solamnia"].name, null, "the module's faction, named in the reader's language");
  assert.equal(f["the-town-watch"].name, "The town watch");
  const rows = factionRows({ ...f, "dragonarmies": { standing: -2 } }, FACTIONS, "pt");
  assert.equal(rows[0].standing, 1);
  assert.equal(rows.at(-1).name, "Os Exércitos Dracônicos");
  assert.equal(rows.at(-1).key, "hostile");
  assert.equal(standingKey(5), "helpful");
  assert.equal(standingKey(0), "indifferent");
});

test("Krynn heritages by people and clan, swapped in with what the old heritage granted", async () => {
  assert.equal(krynnHeritageOf({ ancestry: { id: "qualinesti_elf" }, facts: [] }), "qualinesti-elf");
  assert.equal(krynnHeritageOf({ ancestry: { id: "mountain_dwarf" }, facts: new Set(["people.dwarf", "clan.theiwar"]) }), "theiwar-dwarf");
  assert.equal(krynnHeritageOf({ ancestry: { id: "mountain_dwarf" }, facts: [] }), null);
  assert.equal(krynnHeritageOf({ ancestry: { id: "human" }, facts: [] }), null);
  for (const slug of ["qualinesti-elf", "silvanesti-elf", "kagonesti-elf", "neidar-dwarf", "hylar-dwarf", "klar-dwarf", "tinker-gnome", "kender"]) assert.ok(HERITAGES.some((h) => h.slug === slug), slug);
  const data = { items: [{ _id: "h", type: "heritage", name: "Old" }, { _id: "g", type: "feat", flags: { pf2e: { grantedBy: { id: "h" } } } }, { _id: "x", type: "feat" }] };
  const k = docs.peoples.find((d) => d.system.slug === "kender");
  assert.ok(swapHeritage(data, k, "U"));
  assert.deepEqual(data.items.map((i) => [i._id, i.name]), [["h", "Kender"], ["x", undefined]]);
  assert.equal(data.items[0]._stats.compendiumSource, "U");
});
