// 0.7: the generators, pure and in the (mock) Foundry.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as Gen from "../scripts/logic/generators.mjs";
import * as C from "../scripts/content/generators.mjs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const D = JSON.parse(fs.readFileSync(new URL("../lifewrought/data.json", import.meta.url)));

test("people: a name from the place's culture, a people from its mix, and the rest in the reader's language", () => {
  const rng = Gen.seeded(5);
  for (let i = 0; i < 60; i++) {
    const p = Gen.makePerson(D, { region: "solamnia", lang: i % 2 ? "pt" : "en", rng });
    assert.ok(p.name && p.given && p.trade && p.want && p.secret && p.quirk, JSON.stringify(p));
    assert.ok(Object.keys(C.PEOPLES).includes(p.people));
    assert.ok(Gen.placesIn(D, "solamnia").some((x) => x.id === p.place));
    if (i % 2) assert.ok(C.TRADES.some((t) => t[1] === p.trade), "trade in Portuguese");
  }
  const kender = Gen.makePerson(D, { region: "goodlund", place: Object.keys(D.origin.places).find((k) => D.origin.places[k].name === "Kendermore"), people: "kender", rng });
  const stock = D.origin.names.kender;
  assert.ok([...stock.female, ...stock.male, ...(stock.npc_female || []), ...(stock.npc_male || [])].some((n) => n.split("|")[0] === kender.given), "a kender name");
  assert.ok(stock.inherited.some((n) => n.split("|")[0] === kender.name.split(" ").slice(1).join(" ")), "a kender family name");
  const sol = Gen.makePerson(D, { region: "solamnia", place: Object.keys(D.origin.places).find((k) => D.origin.places[k].name === "Palanthas"), people: "human", rng, lang: "pt" });
  assert.match(sol.name, /, (filho|filha|cria) de /, "a Solamnic patronym, in Portuguese");
  const c = Gen.roleCreature(sol, "knight", 9, "pt");
  assert.equal(c.level, 9);
  assert.equal(c.roleName, "Cavaleiro");
  assert.ok(c.abilities.str > C.ROLES.knight.abilities[0], "stronger above the role's level");
});

test("encounters: the pool by region, terrain and year, and PF2e's XP budget", () => {
  assert.equal(Gen.xpBudget("moderate", 4), 80);
  assert.equal(Gen.xpBudget("severe", 5), 150);
  assert.equal(Gen.xpBudget("low", 3), 45);
  assert.deepEqual([-4, -1, 0, 2, 4, 6].map((d) => Gen.creatureXP(3 + d, 3)), [10, 30, 40, 80, 160, 160]);
  const names = (r, t, y) => Gen.encounterPool(r, t, y).map((c) => c.name);
  assert.ok(names("solamnia", null, 351).includes("Baaz Draconian"), "draconians in the war");
  assert.ok(!names("solamnia", null, 340).includes("Baaz Draconian"), "not before it");
  assert.ok(names("icereach", null, 351).includes("Thanoi Hunter"));
  assert.ok(names("silvanesti", "forest", 350).includes("Dreamwraith"));
  assert.ok(!names("silvanesti", "forest", 360).includes("Dreamwraith"), "the nightmare is over");
  const candidates = [{ name: "Baaz Draconian", level: 2, weight: 6, uuid: "a" }, { name: "Bozak Draconian", level: 4, weight: 2, uuid: "b" }, { name: "Wolf", level: 1, weight: 3, uuid: "c" }];
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const enc = Gen.buildEncounter({ candidates, partyLevel: 3, partySize: 4, difficulty: "moderate", rng: Gen.seeded(seed) });
    assert.ok(enc.total <= enc.budget && enc.total >= enc.budget - 20, `${enc.total} of ${enc.budget}`);
    assert.ok(enc.creatures.every((c) => c.xp === Gen.creatureXP(c.level, 3)));
  }
});

test("rumours, treasure, weather, inns, ships and gnome inventions", () => {
  const r = Gen.rumours(D, { region: "solamnia", year: 351, lang: "pt", rng: Gen.seeded(2) });
  assert.equal(r[0].kind, "news");
  assert.equal(r[0].text, "invadida pelo Exército Dracônico Azul");
  assert.equal(r.length, 3);
  assert.ok(Gen.rumours(D, { region: "qualinesti", year: 400, rng: Gen.seeded(3) }).some((x) => x.text.includes("dark knights")), "the occupation's talk");
  const t = Gen.treasure({ level: 5, size: "hoard", rng: Gen.seeded(4), items: [{ name: "Dragon Saddle", level: 4, uuid: "s" }] });
  assert.equal(t.total, Math.round(1350 / 3));
  assert.equal(t.coins + t.valuables.reduce((a, v) => a + v.value, 0), t.total, "everything adds up");
  const w = Gen.weather("icereach", "winter", { rng: Gen.seeded(1), lang: "pt" });
  assert.equal(w.climate, "arctic");
  assert.ok(["Nevasca", "Neve caindo"].includes(w.text));
  assert.equal(Gen.seasonOfDay([{ id: "spring", dayStart: 80, dayEnd: 169 }, { id: "winter", dayStart: 351, dayEnd: 79 }], 10), "winter");
  assert.match(Gen.innName({ lang: "en", rng: Gen.seeded(7) }), /^The \S+(-\S+)? \S+$/);
  assert.match(Gen.innName({ lang: "pt", rng: Gen.seeded(7) }), /^(O|A) /);
  const inn = Gen.inn(D, { lang: "en", rng: Gen.seeded(8), region: "abanasinia", year: 351 });
  assert.ok(inn.keeper.name && inn.dish);
  assert.ok(Gen.shipName({ rng: Gen.seeded(9) }).length > 3);
  const inv = Gen.invention({ lang: "pt", rng: Gen.seeded(10) });
  assert.ok(C.INVENTION.pt.flaw.includes(inv.flaw));
  for (const region of Object.keys(C.REGION_TERRAIN)) assert.ok(C.REGION_CLIMATE[region], `${region} has a climate`);
  for (const [k, v] of Object.entries(C.REGION_RUMOURS)) for (const x of v) assert.ok(x[2] && x[3] && x[2] !== x[3], `${k} rumour in both languages`);
});

test("in Foundry: the window, the cards, the NPC and the encounter on the scene", async () => {
  const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 351, 3, 10) * 86400 });
  await import("../scripts/krynn.mjs");
  await Hooks.callAll("init"); await Hooks.callAll("setup");
  game.time.calendar = new CONFIG.time.worldCalendarClass(CONFIG.time.worldCalendarConfig);
  await Hooks.callAll("ready");
  const K = globalThis.krynn;
  K.generators.open();
  const app = foundry.applications.instances.get("krynn-generators");
  await app.render();
  assert.match(app.lastHTML, /Solamnia/);
  assert.doesNotMatch(app.lastHTML, /KRYNN\./);
  const state = { region: "solamnia", place: "", year: 351, terrain: "", level: 3, size: 4, difficulty: "moderate", role: "", npcLevel: "4", hoard: "encounter" };
  for (const kind of ["person", "rumours", "treasure", "travel", "inn", "ship", "invention"]) {
    const msg = await K.generators.run(kind, state);
    assert.ok(msg?.content?.includes("krynn-gen"), kind);
    assert.ok(msg.whisper.length, `${kind}: whispered to the GM`);
  }
  const person = F.chat.find((m) => m.flags?.["krynn-pf2e"]?.gen?.kind === "person");
  const npc = await K.generators.makeNpc(person.flags["krynn-pf2e"].gen);
  assert.equal(npc.type, "npc");
  assert.equal(npc.system.details.level.value, 4);
  assert.match(npc.system.details.privateNotes, /Secret/);
  assert.equal(npc.folder, game.folders.find((f) => f.name === "Krynn NPCs").id);
  // The reveal button reposts the card without the secret.
  const html = document.createElement("div");
  html.innerHTML = person.content;
  await Hooks.callAll("renderChatMessageHTML", person, html);
  const before = F.chat.length;
  html.querySelector('[data-krynn-gen="reveal"]').click();
  await new Promise((r) => setTimeout(r, 10));
  const shown = F.chat[before];
  assert.ok(shown && !shown.whisper && !shown.content.includes("Secret") && !shown.content.includes("data-krynn-gen"), "public, without secrets or buttons");
  // An encounter from the module's creatures and the Monster Core, placed on the scene.
  const enc = await K.generators.run("encounter", state);
  const list = enc.flags["krynn-pf2e"].gen.encounter;
  assert.ok(list.length > 0, enc.content);
  assert.match(enc.content, /@UUID\[Compendium\./);
  const created = [];
  globalThis.canvas = { scene: { width: 4000, height: 3000, grid: { size: 100 }, createEmbeddedDocuments: async (t, docs) => { created.push(...docs); return docs; } }, stage: { pivot: { x: 1000, y: 800 } } };
  const n = await K.generators.placeEncounter(list);
  assert.equal(n, list.reduce((a, c) => a + c.count, 0));
  assert.equal(created.length, n);
  assert.ok(game.folders.find((f) => f.name === "Krynn Encounters"));
  const again = await K.generators.placeEncounter(list);
  assert.equal(game.actors.filter((a) => a.folder === game.folders.find((f) => f.name === "Krynn Encounters").id).length, list.length, "each creature brought in once");
  void again;
});
