// Lifewrought inside the (mock) Foundry: lives turned into characters, the window's messages, players and the GM.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const LIVES = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 381, 3, 10) * 86400 + 9 * 3600 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;
const { createCharacter } = await import("../scripts/foundry/lifewrought/create.mjs");

test("every fixture life replays exactly and becomes a PF2e character with its Chronicle", async () => {
  for (const life of LIVES) {
    const r = await createCharacter(life.record, "pl1");
    assert.equal(r.name, life.name, "the replayed life is the same life");
    assert.equal(r.extraDraws, 0, `${life.name}: no rolls past the saved life`);
    assert.deepEqual(r.missing, [], `${life.name}: every item found`);
    const a = game.actors.get(r.actorId);
    assert.equal(a.type, "character");
    const types = new Set(a.items.map((i) => i.type));
    for (const t of ["ancestry", "background", "class"]) assert.ok(types.has(t), `${life.name} has an ${t}`);
    assert.equal(a.ownership.pl1, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER, "the player owns the character");
    const flags = a.flags["krynn-pf2e"];
    assert.ok(["ergothian", "solamnic", "plainsmen", "dwarven", "elven", "kender", "goblin"].includes(flags.culture), flags.culture);
    assert.equal(flags.lifewrought.record.draws.length, life.record.draws.length);
    const j = game.journal.get(r.journalId);
    assert.equal(j.name, `The Chronicle of ${life.name}`);
    assert.equal(j.pages.length, 5);
    assert.equal(j.ownership.pl1, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER);
    const gm = j.pages.find((p) => p.name === "Threads (GM only)");
    assert.equal(gm.ownership.default, CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE, "the GM page is hidden from players");
    assert.ok(j.pages.every((p) => p.ownership.default !== undefined));
    assert.match(j.pages[0].text.content, new RegExp(life.name.split(" ")[0]));
    assert.ok(j.pages[1].text.content.includes(" AC · age "), "year by year");
  }
  assert.equal(game.folders.filter((f) => f.name === "Lifewrought").length, 2, "one actor folder and one journal folder");
});

test("the dwarf reads the dwarven calendar, the Solamnian the Solamnic one", async () => {
  const dwarf = LIVES.find((l) => l.ancestry === "hill_dwarf");
  const a = game.actors.find((x) => x.name === dwarf.name);
  assert.equal(a.flags["krynn-pf2e"].culture, "dwarven");
});

test("with the setting on, the people of the life become NPCs in a folder of their own", async () => {
  await game.settings.set("krynn-pf2e", "lwNpcActors", true);
  const r = await createCharacter(LIVES[0].record, "pl1");
  assert.ok(r.npcs > 0);
  const npcs = game.actors.filter((a) => a.type === "npc" && a.folder === game.folders.find((f) => f.name === `The people of ${r.name}`).id);
  assert.equal(npcs.length, r.npcs);
  assert.match(npcs[0].system.details.publicNotes, /@UUID\[Actor\./);
  await game.settings.set("krynn-pf2e", "lwNpcActors", false);
});

test("an unfinished life is refused", async () => {
  await assert.rejects(() => createCharacter({ ...LIVES[0].record, done: false }, "pl1"), /not finished/);
});

test("the window speaks to the Lifewrought page: init, saves, and the character on finish", async () => {
  const { LifeApp } = K.life;
  F.gmUser.flags = {};
  const app = new LifeApp({ userId: "gm1" });
  await app.render();
  const frame = app.frame;
  assert.ok(frame && frame.srcdoc.includes('window.LW_EMBED = "foundry"'), "the page is written into the frame");
  assert.ok(frame.srcdoc.includes('<base href="http://localhost:30000/modules/krynn-pf2e/lifewrought/">'), "its files load from the module folder");
  const got = [];
  frame.contentWindow.addEventListener("message", (e) => got.push(e.data));
  const say = (data) => window.dispatchEvent(new window.MessageEvent("message", { data: { source: "lifewrought", ...data }, origin: window.location.origin, source: frame.contentWindow }));
  say({ type: "ready" });
  await new Promise((r) => setTimeout(r, 30));
  const init = got.find((m) => m.type === "init");
  assert.ok(init, "init sent");
  assert.deepEqual([init.state.cfg.year, init.state.cfg.region, init.state.cfg.scope], [381, "abanasinia", "favoured"]);
  assert.equal(init.state.saved, null);
  say({ type: "save", record: { cfg: init.state.cfg, draws: [0.1, 0.2], answers: [], name: "Someone" } });
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(F.gmUser.getFlag("krynn-pf2e", "life").draws, [0.1, 0.2]);
  say({ type: "recent", recent: [["ev.x"]] });
  await new Promise((r) => setTimeout(r, 10));
  assert.deepEqual(F.gmUser.getFlag("krynn-pf2e", "recent"), [["ev.x"]]);
  // A message from anywhere else is ignored.
  window.dispatchEvent(new window.MessageEvent("message", { data: { source: "lifewrought", type: "clear" }, origin: "http://evil.example", source: frame.contentWindow }));
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(F.gmUser.getFlag("krynn-pf2e", "life"), "a foreign origin can't clear the life");
  const before = game.actors.size;
  say({ type: "finish", record: LIVES[1].record });
  await new Promise((r) => setTimeout(r, 300));
  assert.equal(game.actors.size, before + 1);
  assert.ok(got.find((m) => m.type === "created" && m.name === LIVES[1].name));
  assert.equal(F.gmUser.getFlag("krynn-pf2e", "created").name, LIVES[1].name);
});

test("watching is read-only: the page gets the player's life and nothing is saved", async () => {
  F.playerUser.flags = { "krynn-pf2e": { life: LIVES[2].record } };
  const app = new K.life.LifeApp({ userId: "pl1", readonly: true });
  await app.render();
  const got = [];
  app.frame.contentWindow.addEventListener("message", (e) => got.push(e.data));
  const say = (data) => window.dispatchEvent(new window.MessageEvent("message", { data: { source: "lifewrought", ...data }, origin: window.location.origin, source: app.frame.contentWindow }));
  say({ type: "ready" });
  await new Promise((r) => setTimeout(r, 30));
  const init = got.find((m) => m.type === "init");
  assert.equal(init.state.readonly, true);
  assert.equal(init.state.saved.name, LIVES[2].name);
  say({ type: "clear" });
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(F.playerUser.getFlag("krynn-pf2e", "life"), "watching can't clear the player's life");
});

test("the Lives window lists the table and the characters made", async () => {
  const { LivesApp } = await import("../scripts/foundry/lifewrought/lives.mjs");
  const app = await new LivesApp().render();
  assert.doesNotMatch(app.lastHTML, /KRYNN\./);
  assert.ok(app.element.querySelector('button[data-action="watch"][data-user="pl1"]'));
  assert.ok(app.element.querySelectorAll(".made li").length >= LIVES.length);
});

test("the Actors sidebar gets the buttons", async () => {
  const html = document.createElement("section");
  html.innerHTML = `<header class="directory-header"><div class="header-actions"></div></header>`;
  await Hooks.callAll("renderActorDirectory", {}, html);
  const buttons = html.querySelectorAll(".krynn-life-buttons button");
  assert.equal(buttons.length, 4, "Live a life, and Lives, Dragons and Generators for the GM");
  await Hooks.callAll("renderActorDirectory", {}, html);
  assert.equal(html.querySelectorAll(".krynn-life-buttons").length, 1, "not added twice");
});

test("the settings window has the Lifewrought campaign, and saving it sets the campaign", async () => {
  const { KrynnSettingsApp } = await import("../scripts/foundry/settings-app.mjs");
  const app = await new KrynnSettingsApp().render();
  assert.doesNotMatch(app.lastHTML, /KRYNN\./);
  assert.ok(app.element.querySelector("select[name='lw.region'] option[value=solamnia]"));
  const d = K.now();
  await KrynnSettingsApp.DEFAULT_OPTIONS.form.handler.call(app, null, null, { object: { year: d.year, month: d.month, day: d.day, calendarStyle: "classic", worldCulture: "ergothian",
    moonMagic: "classic", godsMode: "warn", nuitariSeen: "blackRobes", announce: true, "eye.year": 351, "eye.month": 0, "eye.day": 1,
    "lw.yearMode": "fixed", "lw.year": 352, "lw.region": "solamnia", "lw.start": " Vingaard Keep ", "lw.scope": "strict", "lw.who": "gm", "lw.npcActors": true } });
  const c = await (await import("../scripts/foundry/lifewrought/engine.mjs")).campaign();
  assert.deepEqual([c.year, c.region, c.start, c.scope], [352, "solamnia", "Vingaard Keep", "strict"]);
  assert.equal(game.settings.get("krynn-pf2e", "lwWho"), "gm");
});

test("the self-test builds a life from the compendiums", async () => {
  const r = await K.selfTest({ seed: 7 });
  const bad = r.results.filter((x) => !x.ok);
  assert.deepEqual(bad, []);
  assert.ok(r.results.find((x) => x.key === "LifeBuild"));
});
