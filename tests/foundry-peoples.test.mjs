// 0.4 in the (mock) Foundry: a Lifewrought champion gets the Krynn god, a human's open choice is finished by its
// owner, and the GM keeps the factions of a character.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const LIVES = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 356, 3, 10) * 86400 + 9 * 3600 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;
const { createCharacter } = await import("../scripts/foundry/lifewrought/create.mjs");
const life = (name) => LIVES.find((l) => l.name === name).record;

test("the champion's god is the Krynn Gods pack's Paladine", async () => {
  const r = await createCharacter(life("Isaude Proud"), "pl1");
  assert.match(r.deity, /^Compendium\.krynn-pf2e\.deities\.Item\./);
  const a = game.actors.get(r.actorId);
  assert.equal(a.deity.flags["krynn-pf2e"].slug, "paladine");
  assert.equal(a.items.find((i) => i.name === "Deity (Champion)").flags.pf2e.rulesSelections.deity, r.deity);
  assert.deepEqual(r.open, [], "nothing left for the player");
});

test("open choices are told to the player, and the owner finishes them by taking the item again", async () => {
  const before = F.chat.length;
  const r = await createCharacter(life("Halden Tumbler"), "pl1");
  assert.deepEqual(r.open, ["Versatile Human"]);
  const msg = F.chat.slice(before).find((m) => m.content.includes("choices to make"));
  assert.ok(msg && msg.content.includes("Versatile Human"));
  assert.ok(msg.whisper.includes("pl1"));
  const a = game.actors.get(r.actorId);
  assert.equal(K.life.pendingChoices(a).length, 1);
  const old = a.items.find((i) => i.name === "Versatile Human");
  const done = await K.life.finishChoices(a);
  assert.deepEqual(done, ["Versatile Human"]);
  const now = a.items.filter((i) => i.name === "Versatile Human");
  assert.equal(now.length, 1, "taken again once");
  assert.notEqual(now[0].id, old.id, "a fresh item, so PF2e asks");
  assert.equal(now[0]._stats.compendiumSource, old._stats.compendiumSource);
  assert.ok(a.getFlag("krynn-pf2e", "choicesDone"));
});

test("the sheet shows the open choices with a button", async () => {
  const r = await createCharacter(life("Odile Thessarin"), "pl1");
  const a = game.actors.get(r.actorId);
  const { sheetNotice } = await import("../scripts/foundry/lifewrought/finish.mjs");
  const html = document.createElement("div");
  html.innerHTML = `<section class="sheet-body"></section>`;
  sheetNotice({ actor: a, render: () => {} }, html);
  const note = html.querySelector(".krynn-finish");
  assert.ok(note, "the note is there");
  assert.match(note.textContent, /Versatile Human/);
  assert.match(note.textContent, /Finish choices/);
});

test("factions: started from the life, kept by the GM, in PF2e's attitudes", async () => {
  const r = await createCharacter(life("Isaude Proud"), "pl1");
  const a = game.actors.get(r.actorId);
  const start = a.getFlag("krynn-pf2e", "factions");
  assert.equal(typeof start, "object");
  for (const f of Object.values(start)) assert.equal(f.standing, 1, "friendly with what the life belonged to");
  K.factions.open(a);
  const app = foundry.applications.instances.get(`krynn-factions-${a.id}`);
  await app.render();
  const steps = app.options.actions;
  // The GM adds the Knights of Solamnia (if the life didn't), and raises them.
  if (!a.getFlag("krynn-pf2e", "factions")["knights-of-solamnia"]) {
    app.element.querySelector("[name=preset]").value = "knights-of-solamnia";
    await steps.add.call(app, {}, {});
  }
  const was = a.getFlag("krynn-pf2e", "factions")["knights-of-solamnia"].standing;
  await steps.step.call(app, {}, { dataset: { id: "knights-of-solamnia", by: "1" } });
  assert.equal(a.getFlag("krynn-pf2e", "factions")["knights-of-solamnia"].standing, Math.min(2, was + 1));
  await app.render();
  assert.match(app.lastHTML, /Knights of Solamnia/);
  assert.match(app.lastHTML, /Friendly|Helpful|Indifferent/);
  app.element.querySelector("[name=custom]").value = "The Whitestone Council";
  await steps.add.call(app, {}, {});
  assert.equal(a.getFlag("krynn-pf2e", "factions")["the-whitestone-council"].name, "The Whitestone Council");
  await steps.remove.call(app, {}, { dataset: { id: "the-whitestone-council" } });
  assert.equal(a.getFlag("krynn-pf2e", "factions")["the-whitestone-council"], undefined);
  for (let i = 0; i < 5; i++) await steps.step.call(app, {}, { dataset: { id: "knights-of-solamnia", by: "-1" } });
  assert.equal(a.getFlag("krynn-pf2e", "factions")["knights-of-solamnia"].standing, -2, "never below hostile");
});

test("the sheet gets a Factions header button", async () => {
  const a = game.actors.find((x) => x.getFlag("krynn-pf2e", "lifewrought"));
  const buttons = [];
  await F.hooks.callAll("getActorSheetHeaderButtons", { actor: a }, buttons);
  assert.equal(buttons[0].label, "Factions");
});

test("Lifewrought's peoples get the Krynn heritage (a setting): a kender is a kender, not a halfling heritage", async () => {
  const r = await createCharacter(life("Tansy Lightpocket"), "pl1");
  assert.equal(r.heritage, "Kender");
  const a = game.actors.get(r.actorId);
  const hs = a.items.filter((i) => i.type === "heritage");
  assert.equal(hs.length, 1);
  assert.equal(hs[0].flags["krynn-pf2e"].slug, "kender");
  assert.match(hs[0]._stats.compendiumSource, /^Compendium\.krynn-pf2e\.peoples\.Item\./);
  const dwarf = await createCharacter(life("Morra Anvilsong"), "pl1");
  assert.equal(dwarf.heritage, "Neidar (Hill Dwarf)");
  await game.settings.set("krynn-pf2e", "lwKrynnHeritages", false);
  const plain = await createCharacter(life("Tansy Lightpocket"), "pl1");
  assert.equal(plain.heritage, null);
  assert.ok(!game.actors.get(plain.actorId).items.find((i) => i.type === "heritage").flags["krynn-pf2e"], "PF2e's own heritage");
  await game.settings.set("krynn-pf2e", "lwKrynnHeritages", true);
});
