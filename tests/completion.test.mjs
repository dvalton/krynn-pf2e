// 0.9: what the plan still had open: the moons' spell slots, culture feats, the Measure and the standing history,
// more creatures, daylight, the age's affected characters, and a lint of every pack.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildDocs } from "../tools/build-packs.mjs";
import { moonSlots, slotDelta } from "../scripts/logic/magic.mjs";
import { darknessAt, sunTimes, absoluteDay } from "../scripts/logic/calendar.mjs";
import { installFoundry } from "./harness/foundry-mock.mjs";

const D = JSON.parse(fs.readFileSync(new URL("../lifewrought/data.json", import.meta.url)));
const docs = buildDocs();

test("the moons' spell slots in the classic mode", () => {
  assert.deepEqual(moonSlots({ mode: "classic", phase: "high" }, 5, 3), { 3: 1 });
  assert.deepEqual(moonSlots({ mode: "classic", phase: "high" }, 2, 1), {}, "from level 3");
  assert.deepEqual(moonSlots({ mode: "classic", phase: "waxing" }, 1, 1), { 1: 1 });
  assert.deepEqual(moonSlots({ mode: "classic", eye: true, phase: "high" }, 7, 4), { 4: 2 });
  assert.deepEqual(moonSlots({ mode: "light", phase: "high" }, 5, 3), {}, "only the classic mode");
  assert.deepEqual(slotDelta({ 3: 1 }, { 1: 1 }), { 3: -1, 1: 1 });
  assert.deepEqual(slotDelta({ 2: 1 }, { 2: 1 }), {});
});

test("daylight follows Krynn's seasons", () => {
  const summer = sunTimes(170), winter = sunTimes(350);
  assert.ok(summer.sunrise < 5 && summer.sunset > 19, "long summer days");
  assert.ok(winter.sunrise > 7 && winter.sunset < 17, "short winter days");
  assert.equal(darknessAt(170, 12), 0);
  assert.equal(darknessAt(170, 2, 360, 0.9), 0.9);
  const dusk = darknessAt(80, 18);
  assert.ok(dusk > 0 && dusk < 1, "twilight");
});

test("culture feats, more creatures, and every pack passes the lint", () => {
  for (const n of ["Solamnic Upbringing", "Ergothian Seafarer", "Plainsfolk Ways", "Khurish Rider", "Nerakan Hardiness", "Saifhum Sailor", "Ice Folk Endurance", "Kagonesti Tattoos", "Circus Champion", "House Honour", "Dragonarmy Auxiliary"]) {
    const f = docs.peoples.find((d) => d.name === n);
    assert.ok(f, n);
    assert.equal(f.system.category, "ancestry");
  }
  assert.ok(docs.peoples.find((d) => d.name === "Solamnic Upbringing").system.rules.some((r) => r.path === "system.build.languages.max"), "an extra language");
  for (const n of ["Death Knight", "Fetch", "Huldre", "Dargonesti Warrior", "Dimernesti Scout"]) assert.ok(docs.creatures.some((d) => d.name === n), n);
  // Rule elements: only keys PF2e has. Links: every PF2e UUID is one Lifewrought's index knows, every module UUID a built document.
  const KEYS = new Set(["ActiveEffectLike", "ItemAlteration", "GrantItem", "RollOption", "ChoiceSet", "FlatModifier", "Note", "AdjustModifier", "Strike", "Resistance", "AdjustDegreeOfSuccess", "DamageDice", "Aura", "Immunity", "Weakness", "ActorTraits", "Sense", "TokenLight"]);
  const known = new Set(JSON.stringify(D).match(/Compendium\.pf2e\.[\w-]+\.Item\.[A-Za-z0-9]{16}/g));
  known.add("Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL");
  const ids = new Set(Object.entries(docs).flatMap(([pack, list]) => list.map((d) => `Compendium.krynn-pf2e.${pack}.${d.type === "npc" ? "Actor" : d.pages ? "JournalEntry" : d.results ? "RollTable" : "Item"}.${d._id}`)));
  const all = JSON.stringify(docs);
  for (const [pack, list] of Object.entries(docs)) for (const d of list) {
    for (const it of [d, ...(d.items || [])]) for (const r of it.system?.rules || []) assert.ok(KEYS.has(r.key), `${pack}/${d.name}: rule ${r.key}`);
  }
  for (const u of all.match(/Compendium\.pf2e\.[\w-]+\.Item\.[A-Za-z0-9]{16}/g) || []) assert.ok(known.has(u), `PF2e link ${u}`);
  for (const u of all.match(/Compendium\.krynn-pf2e\.[\w-]+\.(Item|Actor|RollTable|JournalEntry)\.[A-Za-z0-9]{16}/g) || []) assert.ok(ids.has(u), `module link ${u}`);
});

test("in Foundry: the moons add and take back spell slots; the Measure; the standing history; the age's card", async () => {
  const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 351, 0, 10) * 86400 + 9 * 3600 });
  await import("../scripts/krynn.mjs");
  await F.start();
  const K = globalThis.krynn;
  // A Red Robe of level 3 with rank 1 and 2 slots.
  const mage = await Actor.create({ name: "Lunitari's Own", type: "character", system: { details: { level: { value: 3 } } } });
  const magic = game.packs.get("krynn-pf2e.magic");
  const feat = (await magic.getDocument(magic.index.find((e) => e.name === "Mage of High Sorcery")._id)).toObject();
  feat.flags.pf2e = { rulesSelections: { order: "red" } };
  await mage.createEmbeddedDocuments("Item", [feat, { name: "Arcane Prepared", type: "spellcastingEntry", system: { tradition: { value: "arcane" }, prepared: { value: "prepared" }, slots: { slot1: { max: 3, value: 3 }, slot2: { max: 2, value: 2 } } } }]);
  const entry = () => mage.items.find((i) => i.type === "spellcastingEntry");
  await krynn.setDate({ year: 351, month: 0, day: 27 }); // Lunitari high, not aligned
  assert.equal(entry().system.slots.slot2.max, 3, "one more of the highest rank");
  assert.deepEqual(entry().flags["krynn-pf2e"].moonSlots, { 2: 1 });
  await krynn.setDate({ year: 351, month: 0, day: 23 }); // waxing
  assert.equal(entry().system.slots.slot2.max, 2, "taken back");
  assert.equal(entry().system.slots.slot1.max, 4, "a rank 1 slot while it waxes");
  await krynn.setDate({ year: 351, month: 0, day: 10 }); // waning
  assert.deepEqual([entry().system.slots.slot1.max, entry().system.slots.slot2.max], [3, 2], "back to the mage's own");
  await krynn.setDate({ year: 352, month: 4, day: 25 }); // 504 days after the Eye: the Night of the Eye again
  assert.equal(entry().system.slots.slot2.max, 4, "two more on the Night of the Eye");
  await krynn.setDate({ year: 351, month: 0, day: 10 });
  // The Measure: a breach and its penance, with the reasons logged.
  const knight = await Actor.create({ name: "Ser Aldric", type: "character" });
  const orders = game.packs.get("krynn-pf2e.orders");
  const ded = (await orders.getDocument(orders.index.find((e) => e.name === "Knight of Solamnia Dedication")._id)).toObject();
  await knight.createEmbeddedDocuments("Item", [ded]);
  const { measure } = await import("../scripts/foundry/sheet/panel.mjs");
  await measure(knight, "breach", "Fled the field at Vingaard");
  assert.equal(K.panel.context(knight).knight.breach, true);
  await measure(knight, "penance", "A year guarding the pilgrims' road");
  const k = K.panel.context(knight).knight;
  assert.equal(k.breach, false);
  assert.deepEqual(k.log.map((e) => e.kind), ["penance", "breach"]);
  assert.match(F.chat.at(-1).content, /has done penance/);
  // The standing history.
  await knight.setFlag("krynn-pf2e", "factions", { "knights-of-solamnia": { standing: 0 } });
  K.factions.open(knight);
  const app = foundry.applications.instances.get(`krynn-factions-${knight.id}`);
  await app.render();
  app.element.querySelector("[name=reason]").value = "Saved the Grand Master's squire";
  await app.options.actions.step.call(app, {}, { dataset: { id: "knights-of-solamnia", by: "1" } });
  const log = knight.getFlag("krynn-pf2e", "factionLog");
  assert.equal(log[0].reason, "Saved the Grand Master's squire");
  assert.deepEqual([log[0].from, log[0].to], [0, 1]);
  await app.render();
  assert.match(app.lastHTML, /Saved the Grand Master/);
  // The gods and moons leave in 384: the card names the mage and points to Primal Sorcerer.
  mage.hasPlayerOwner = true;
  const before = F.chat.length;
  await krynn.setDate({ year: 384 });
  const card = F.chat.slice(before).find((m) => m.content.includes("affected"));
  assert.ok(card, "the age's card lists who is affected");
  assert.match(card.content, /Lunitari's Own/);
  assert.match(card.content, /Primal Sorcerer/);
});

test("in Foundry: daylight on the active scene, when the setting is on", async () => {
  const { syncDaylight } = await import("../scripts/foundry/daylight.mjs");
  const scene = { environment: { darknessLevel: 0 }, getFlag: () => null, async update(ch) { this.environment.darknessLevel = ch["environment.darknessLevel"]; return this; } };
  assert.equal(await syncDaylight(scene), null, "off by default");
  await game.settings.set("krynn-pf2e", "sceneDaylight", true);
  await krynn.setDate({ year: 351, month: 6, day: 1, hour: 23, minute: 0 });
  assert.equal(await syncDaylight(scene), 0.9);
  assert.equal(scene.environment.darknessLevel, 0.9);
  await krynn.setDate({ year: 351, month: 6, day: 1, hour: 12, minute: 0 });
  await syncDaylight(scene);
  assert.equal(scene.environment.darknessLevel, 0);
  await game.settings.set("krynn-pf2e", "sceneDaylight", false);
});
