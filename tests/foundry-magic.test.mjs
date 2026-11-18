// Magic in the (mock) Foundry: moon magic effects on mages' sheets, and the gods' and moons' absence at casting.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";
import { skyOn } from "../scripts/logic/moons.mjs";
import { buildDocs } from "../tools/build-packs.mjs";

const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 360, 0, 1) * 86400 + 12 * 3600 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;
const docs = buildDocs();
const item = (slug) => structuredClone(docs.magic.find((d) => d.system.slug === slug));
const eye = absoluteDay("classic", 351, 0, 1);

// A day in 360 AC when Solinari is in the given phase and stands alone.
function dayWhen(phase) {
  for (let d = absoluteDay("classic", 360, 0, 1); ; d++) {
    const s = skyOn(d, eye), sol = s.moons.find((m) => m.id === "solinari");
    if (sol.phase === phase && !s.eye && !s.alignments.some((p) => p.includes("solinari"))) return d;
  }
}
const goTo = (day) => game.time.set(day * 86400 + 12 * 3600);
const moonEffect = (a) => a.items.find((i) => i.type === "effect" && i.system.slug === "krynn-moons");

const mage = await F.Actor.create({ name: "Raelith", type: "character", system: { details: { level: { value: 5 } } } });
const order = item("mage-of-high-sorcery");
order.flags.pf2e = { rulesSelections: { order: "white" } };
await mage.createEmbeddedDocuments("Item", [order]);

test("a White Robe at High Sanction carries +1 on spells, and the robe is known", async () => {
  await goTo(dayWhen("high"));
  const e = moonEffect(mage);
  assert.ok(e, "the effect is there");
  assert.match(e.name, /Solinari, High Sanction \(\+1\)/);
  assert.deepEqual(e.system.rules[0].selector, ["spell-attack-roll", "spell-dc"]);
  assert.equal(e.system.rules[0].value, 1);
  assert.equal(e.system.rules[0].type, "status");
  assert.equal(mage.getFlag("krynn-pf2e", "robe"), "white");
});

test("at Low Sanction the same effect turns to a penalty", async () => {
  const id = moonEffect(mage).id;
  await goTo(dayWhen("low"));
  const e = moonEffect(mage);
  assert.equal(e.id, id, "updated in place, not duplicated");
  assert.equal(e.system.rules[0].value, -1);
  assert.equal(mage.items.filter((i) => i.system.slug === "krynn-moons").length, 1);
});

test("on the Night of the Eye, +2", async () => {
  await goTo(eye + 504 * 7);
  assert.equal(moonEffect(mage).system.rules[0].value, 2);
  assert.match(moonEffect(mage).img, /eye\.svg$/);
});

test("waning with light moon magic: no effect at all", async () => {
  await game.settings.set("krynn-pf2e", "moonMagic", "light");
  await goTo(dayWhen("waning"));
  assert.equal(moonEffect(mage), undefined);
  await game.settings.set("krynn-pf2e", "moonMagic", "classic");
});

test("a renegade gets nothing from the moons", async () => {
  await goTo(dayWhen("high"));
  assert.ok(moonEffect(mage));
  const [r] = await mage.createEmbeddedDocuments("Item", [item("krynn-renegade")]);
  assert.equal(moonEffect(mage), undefined);
  await mage.deleteEmbeddedDocuments("Item", [r.id]);
  assert.ok(moonEffect(mage), "back when the renegade is accepted again");
});

test("below the level the GM chose, the moons don't touch apprentices", async () => {
  await game.settings.set("krynn-pf2e", "moonMinLevel", 6);
  await K.magic.syncAll();
  assert.equal(moonEffect(mage), undefined);
  await game.settings.set("krynn-pf2e", "moonMinLevel", 1);
  await K.magic.syncAll();
  assert.ok(moonEffect(mage));
});

test("the sky window tells a mage what their moon gives tonight", async () => {
  game.user.character = mage;
  const { SkyApp } = await import("../scripts/foundry/sky.mjs");
  const app = await new SkyApp().render();
  assert.match(app.element.querySelector(".my-magic").textContent, /Solinari, High Sanction/);
  game.user.character = null;
});

test("in the Age of Mortals the moons are gone, and so is the effect", async () => {
  await K.setDate({ year: 400, month: 2, day: 2 });
  assert.equal(moonEffect(mage), undefined);
});

const cleric = await F.Actor.create({ name: "Elistan", type: "character" });
await cleric.createEmbeddedDocuments("Item", [structuredClone(docs.deities.find((d) => d.name === "Paladine"))]);
const divine = new F.SpellcastingEntry(cleric, "divine");
const arcane = new F.SpellcastingEntry(mage, "arcane");
const heal = { name: "Heal" }, missile = { name: "Force Barrage" };

test("the gate is installed on PF2e's spellcasting entries", () => {
  assert.equal(F.SpellcastingEntry.prototype.cast.krynnGate, true);
});

test("strict: no god answers before 351 AC; the spell fails and nothing is cast", async () => {
  await game.settings.set("krynn-pf2e", "godsMode", "strict");
  await K.setDate({ year: 340, month: 0, day: 1 });
  F.casts.length = 0; F.chat.length = 0;
  await divine.cast(heal);
  assert.equal(F.casts.length, 0);
  assert.ok(F.chat.some((m) => /no god answers/.test(m.content) && !m.whisper));
  assert.ok(F.notes.some(([k, m]) => k === "warn" && /no god answers/.test(m)));
});

test("after 351 AC the same prayer is heard", async () => {
  await K.setDate({ year: 360, month: 0, day: 1 });
  F.casts.length = 0;
  await divine.cast(heal);
  assert.equal(F.casts.length, 1);
});

test("warn: the spell works and the GM is told", async () => {
  await game.settings.set("krynn-pf2e", "godsMode", "warn");
  await K.setDate({ year: 400, month: 0, day: 1 });
  F.casts.length = 0; F.chat.length = 0;
  await divine.cast(heal);
  assert.equal(F.casts.length, 1);
  assert.ok(F.chat.some((m) => m.whisper?.includes("gm1") && /when the gods are absent/.test(m.content)));
});

test("a Mystic of the Heart keeps their spells without a god", async () => {
  await game.settings.set("krynn-pf2e", "godsMode", "strict");
  await cleric.createEmbeddedDocuments("Item", [item("mystic-of-the-heart")]);
  F.casts.length = 0;
  await divine.cast(heal);
  assert.equal(F.casts.length, 1);
});

test("strict High Sorcery: without the moons the Orders' magic fails, unless the mage learned primal sorcery", async () => {
  await game.settings.set("krynn-pf2e", "hsMode", "strict");
  F.casts.length = 0;
  await arcane.cast(missile);
  assert.equal(F.casts.length, 0);
  await mage.createEmbeddedDocuments("Item", [item("primal-sorcerer")]);
  await arcane.cast(missile);
  assert.equal(F.casts.length, 1);
});

test("the self-test sees the packs, the gate and tonight's moon magic", async () => {
  const r = await K.selfTest({ seed: 7 });
  for (const k of ["Packs", "CastGate", "MoonMagic", "LifePage"]) assert.ok(r.results.find((x) => x.key === k && x.ok), k);
});
