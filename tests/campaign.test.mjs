// 1.0: the campaign rehearsal. Six sessions, one per age, in the (mock) Foundry: the world is brought to the year,
// and what the table would meet is checked: the gods and moons, the cast gate, moon magic, the Atlas's line, an
// encounter, a draconian's death, a character made by Lifewrought, and the self-test, green in every age.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";
import { buildDocs } from "../tools/build-packs.mjs";

const LIVES = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 351, 8, 1) * 86400 + 8 * 3600 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;
const docs = buildDocs();
const { createCharacter } = await import("../scripts/foundry/lifewrought/create.mjs");
await game.settings.set("krynn-pf2e", "godsMode", "strict");
await game.settings.set("krynn-pf2e", "hsMode", "strict");

// The party: a cleric of Paladine and a Red Robe.
const cleric = await F.Actor.create({ name: "Elistan", type: "character" });
await cleric.createEmbeddedDocuments("Item", [structuredClone(docs.deities.find((d) => d.name === "Paladine"))]);
const mage = await F.Actor.create({ name: "Justarius", type: "character", system: { details: { level: { value: 5 } } } });
const robe = structuredClone(docs.magic.find((d) => d.name === "Mage of High Sorcery"));
robe.flags.pf2e = { rulesSelections: { order: "red" } };
await mage.createEmbeddedDocuments("Item", [robe]);
const divine = new F.SpellcastingEntry(cleric, "divine"), arcane = new F.SpellcastingEntry(mage, "arcane");
const cast = async (entry) => { F.casts.length = 0; await entry.cast({ name: "a spell" }); return F.casts.length === 1; };

const SESSIONS = [
  { year: -100, region: "istar", gods: true, moons: true, draconians: false, now: null, title: "before the Cataclysm" },
  { year: 351, region: "solamnia", gods: true, moons: true, draconians: true, now: /Blue Dragonarmy/, title: "the War of the Lance" },
  { year: 358, region: "solamnia", gods: true, moons: true, draconians: true, now: /no great upheaval/, title: "the years after" },
  { year: 383, region: "solamnia", gods: true, moons: true, draconians: true, now: /Knights of Takhisis/, title: "the Summer of Chaos" },
  { year: 400, region: "solamnia", gods: false, moons: false, draconians: true, now: /blue overlord/, title: "the Age of Mortals" },
  { year: 421, region: "qualinesti", gods: true, moons: true, draconians: true, now: /drowned/, title: "the War of Souls" },
];

for (const s of SESSIONS) {
  test(`session: ${s.title} (${s.year})`, async () => {
    await K.setDate({ year: s.year, month: 0, day: 27, hour: 20, minute: 0 });
    const state = K.state();
    assert.equal(state.gods, s.gods, "the gods");
    assert.equal(state.moons, s.moons, "the moons");
    // The cleric's and the mage's spells, through the gate.
    assert.equal(await cast(divine), s.gods, "a cleric's prayer");
    assert.equal(await cast(arcane), s.moons, "a mage's spell");
    // Moon magic on the mage's sheet.
    const effect = mage.items.find((i) => i.system?.slug === "krynn-moons");
    assert.equal(!!effect, s.moons, "the moons' effect");
    // The Atlas's line for the region.
    if (s.now) {
      const el = await CONFIG.TextEditor.enrichers.find((e) => e.id === "krynnNow").enricher(["", s.region]);
      assert.match(el.textContent, s.now);
    }
    // An encounter in the region.
    const enc = await K.generators.run("encounter", { region: s.region === "istar" ? "solamnia" : s.region, place: "", year: s.year, terrain: "", level: 3, size: 4, difficulty: "moderate", role: "", npcLevel: "", hoard: "encounter" });
    const names = enc.flags["krynn-pf2e"].gen.encounter.map((c) => c.name);
    if (!s.draconians) assert.ok(!names.some((n) => /Draconian/.test(n)), "no draconians before the war");
    // A draconian falls (where draconians walk).
    if (s.draconians) {
      const pack = game.packs.get("krynn-pf2e.creatures");
      const baaz = await F.Actor.create((await pack.getDocument(pack.index.find((e) => e.name === "Baaz Draconian")._id)).toObject());
      const before = F.chat.length;
      await baaz.update({ "system.attributes.hp.value": 0 });
      assert.ok(F.chat.slice(before).some((m) => m.flags?.["krynn-pf2e"]?.throes === "baaz"), "the baaz turns to stone");
    }
    // A character made by Lifewrought.
    const life = LIVES[SESSIONS.indexOf(s) % LIVES.length];
    const r = await createCharacter(life.record, "pl1");
    assert.equal(r.extraDraws, 0);
    assert.deepEqual(r.missing, []);
    // The self-test, green.
    const t = await K.selfTest({ seed: 7 });
    assert.deepEqual(t.results.filter((x) => !x.ok).map((x) => x.key), [], "every check green");
  });
}

test("the campaign check in Foundry: each age, and the throwaway actors deleted", async () => {
  await game.settings.set("krynn-pf2e", "hsMode", "warn");
  await game.settings.set("krynn-pf2e", "godsMode", "warn");
  const before = game.actors.size;
  const r = await K.campaignCheck();
  assert.equal(r.ok, true);
  assert.equal(r.rows.length, 6);
  assert.equal(game.actors.size, before, "nothing left behind");
  const card = F.chat.at(-1);
  assert.match(card.content, /The campaign check/);
  assert.match(card.content, /warn the GM/, "the Age of Mortals warns");
  assert.doesNotMatch(card.content, /KRYNN\./);
});

test("the guides are there, and the welcome card points to the GM's Guide", () => {
  assert.ok(docs.guides.some((j) => j.name === "Krynn for PF2e: Player's Guide"));
  assert.ok(docs["gm-guides"].some((j) => j.name === "Krynn for PF2e: GM's Guide"));
  assert.ok(docs["gm-guides"].find((j) => j.name === "Krynn for PF2e: GM's Guide").pages.length >= 6);
});
