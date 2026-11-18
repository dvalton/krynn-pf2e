// 0.5 in the (mock) Foundry: death throes at 0 HP, the acid pool drying up, the legacy dragons brought in with
// the Krynn templates, and dragonfear when an encounter begins.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 351, 3, 10) * 86400 + 9 * 3600 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;

// A scene with tokens, regions and a grid of 100 px per 5 feet.
function scene() {
  const s = { grid: { size: 100, distance: 5 }, tokens: F.collection("tokens"), regions: F.collection("regions"), templates: F.collection("templates"),
    async createEmbeddedDocuments(type, list) { const made = list.map((d) => ({ ...d, id: `r${Math.random().toString(36).slice(2, 8)}`, getFlag: (sc, k) => d.flags?.[sc]?.[k] })); for (const m of made) (type === "Region" ? s.regions : s.templates).set(m.id, m); return made; },
    async deleteEmbeddedDocuments(type, ids) { for (const i of ids) (type === "Region" ? s.regions : s.templates).delete(i); } };
  return s;
}
function token(s, actor, { x = 0, y = 0, name = actor?.name ?? "T", disposition = -1, width = 1 } = {}) {
  const t = { id: `t${Math.random().toString(36).slice(2, 8)}`, name, x, y, width, height: width, disposition, hidden: false, texture: { src: "a.webp", tint: null }, parent: s, actor,
    async update(ch) { for (const [k, v] of Object.entries(ch)) { if (k.includes(".")) { const [a, b] = k.split("."); t[a][b] = v; } else t[k] = v; } return t; } };
  t.uuid = `Scene.s.Token.${t.id}`;
  s.tokens.set(t.id, t);
  if (actor) actor.token = t;
  return t;
}
async function fromPack(name) {
  const pack = game.packs.get("krynn-pf2e.creatures");
  const e = pack.index.find((x) => x.name === name);
  const doc = await pack.getDocument(e._id);
  return Actor.create(doc.toObject());
}

test("a baaz turns to stone around the sword that killed it", async () => {
  const s = scene();
  const baaz = await fromPack("Baaz Draconian");
  const tok = token(s, baaz, { x: 0 });
  const sturm = await Actor.create({ name: "Sturm", type: "character", system: { traits: { value: ["human", "humanoid"] } } });
  K; // the hooks remember who hit whom from PF2e's damage messages
  await Hooks.callAll("createChatMessage", { flags: { pf2e: { context: { type: "damage-roll", target: { token: tok.uuid } } } }, actor: { name: "Sturm", traits: new Set(["human", "humanoid"]) }, item: { name: "Longsword", type: "weapon", isRanged: false }, token: { name: "Sturm" } });
  const before = F.chat.length;
  await baaz.update({ "system.attributes.hp.value": 0 });
  const msg = F.chat.slice(before).find((m) => m.flags?.["krynn-pf2e"]?.throes === "baaz");
  assert.ok(msg, "the death throes card");
  assert.match(msg.content, /Sturm's Longsword is caught in the stone/);
  assert.match(msg.content, /@Check\[reflex\|dc:15\]/);
  assert.match(msg.content, /@UUID\[Compendium\.krynn-pf2e\.dragons\.Item\.[A-Za-z0-9]{16}\]\{Weapon Caught in Stone\}/);
  assert.equal(tok.texture.tint, "#8a8a8a", "the token turns to stone");
  await baaz.update({ "system.attributes.hp.value": 0 });
  assert.equal(F.chat.filter((m) => m.flags?.["krynn-pf2e"]?.throes === "baaz").length, 1, "only once");
  void sturm;
});

test("a kapak melts into an acid pool that dries up after three rounds", async () => {
  const s = scene();
  game.combat = { id: "c1", round: 2, scene: s };
  const kapak = await fromPack("Kapak Draconian");
  const tok = token(s, kapak, { x: 200 });
  await kapak.update({ "system.attributes.hp.value": 0 });
  assert.equal(tok.hidden, true, "the body is gone");
  assert.equal(s.regions.size, 1, "the pool is on the map");
  const pool = [...s.regions.values()][0];
  assert.equal(pool.flags["krynn-pf2e"].acidPool.until, 5);
  assert.equal(pool.shapes[0].radius, 100, "10 feet across");
  for (const round of [3, 4, 5]) { game.combat.round = round; await Hooks.callAll("combatRound", game.combat); }
  assert.equal(s.regions.size, 1, "still there on round 5");
  game.combat.round = 6; await Hooks.callAll("combatRound", game.combat);
  assert.equal(s.regions.size, 0, "dried up");
  game.combat = null;
});

test("a bozak's bones burst at those in reach; a sivak killed by a human takes his face", async () => {
  const s = scene();
  const bozak = await fromPack("Bozak Draconian");
  token(s, bozak, { x: 0 });
  token(s, null, { x: 100, name: "Caramon" });
  token(s, null, { x: 900, name: "Far Away" });
  const before = F.chat.length;
  await bozak.update({ "system.attributes.hp.value": 0 });
  const msg = F.chat.slice(before).find((m) => m.flags?.["krynn-pf2e"]?.throes === "bozak");
  assert.match(msg.content, /@Damage\[5d6\[piercing\]\]/);
  assert.match(msg.content, /In reach: Caramon\./);
  const sivak = await fromPack("Sivak Draconian");
  const st = token(s, sivak, { x: 0 });
  await Hooks.callAll("createChatMessage", { flags: { pf2e: { context: { type: "attack-roll", target: { token: st.uuid } } } }, actor: { name: "Tanis", traits: new Set(["humanoid", "elf"]) }, item: { name: "Longsword", type: "weapon" }, token: { name: "Tanis", texture: { src: "tanis.webp" } } });
  await sivak.update({ "system.attributes.hp.value": 0 });
  assert.equal(st.name, "Tanis");
  assert.equal(st.texture.src, "tanis.webp", "the body looks like its killer");
});

test("an aurak doesn't die yet: its final frenzy", async () => {
  const s = scene();
  const aurak = await fromPack("Aurak Draconian");
  token(s, aurak);
  await aurak.update({ "system.attributes.hp.value": 0 });
  assert.equal(aurak.system.attributes.hp.value, 1, "back to 1 HP for the frenzy");
  assert.ok(aurak.items.find((i) => i.name === "Aurak's Final Frenzy"), "the frenzy effect");
});

test("with the setting on card only, the token is left alone; off does nothing", async () => {
  await game.settings.set("krynn-pf2e", "deathThroes", "card");
  const s = scene();
  const baaz = await fromPack("Baaz Draconian");
  const tok = token(s, baaz);
  await baaz.update({ "system.attributes.hp.value": 0 });
  assert.equal(tok.texture.tint, null);
  await game.settings.set("krynn-pf2e", "deathThroes", "off");
  const k2 = await fromPack("Kapak Draconian");
  token(s, k2);
  const before = F.chat.length;
  await k2.update({ "system.attributes.hp.value": 0 });
  assert.equal(F.chat.length, before);
  await game.settings.set("krynn-pf2e", "deathThroes", "auto");
});

test("the Dragons of Krynn window finds the legacy dragons and brings them in with Dragonfear", async () => {
  const found = K.dragons.find();
  assert.deepEqual(found.map((d) => d.name), ["Ancient Blue Dragon", "Adult Bronze Dragon", "Young Red Dragon", "Adult Red Dragon", "Ancient Red Dragon"]);
  K.dragons.open();
  const app = foundry.applications.instances.get("krynn-dragons");
  await app.render();
  assert.match(app.lastHTML, /Young Red Dragon/);
  assert.match(app.lastHTML, /Malystryx/);
  assert.doesNotMatch(app.lastHTML, /KRYNN\./);
  const young = await K.dragons.import(found.find((d) => d.name === "Young Red Dragon").uuid);
  const fear = young.items.find((i) => i.system?.slug === "krynn-dragonfear");
  assert.ok(fear, "Dragonfear added");
  assert.equal(fear.system.rules.find((r) => r.key === "Aura").radius, 60, "a young dragon's reach");
  assert.equal(young.folder, game.folders.find((f) => f.name === "Dragons of Krynn").id);
  assert.equal(young.flags["krynn-pf2e"].dragon.color, "red");
});

test("an Overlord is an ancient dragon made elite and Gargantuan, with the Overlord's powers", async () => {
  const s = (await import("../scripts/foundry/dragons/dragons.mjs")).overlordSource("malystryx");
  assert.equal(s.base.name, "Ancient Red Dragon");
  const malys = await K.dragons.import(s.base.uuid, { overlord: s.overlord });
  assert.equal(malys.name, "Malystryx");
  assert.equal(malys.system.traits.size.value, "grg");
  assert.ok(malys.items.find((i) => i.system?.slug === "krynn-overlord"));
  assert.equal(malys.items.find((i) => i.system?.slug === "krynn-dragonfear").system.rules[0].radius, 120);
  assert.equal((await import("../scripts/foundry/dragons/dragons.mjs")).overlordSource("gellidus"), null, "no Ancient White Dragon in this bestiary");
});

test("when an encounter begins, Dragonfear's save is posted for the enemies in reach", async () => {
  const s = scene();
  const dragon = game.actors.find((a) => a.name === "Young Red Dragon");
  const dt = token(s, dragon, { x: 0, width: 3, disposition: -1 });
  const near = token(s, { level: 3, items: { some: () => false } }, { x: 600, name: "Riverwind", disposition: 1 });
  const far = token(s, { level: 3, items: { some: () => false } }, { x: 2400, name: "Goldmoon", disposition: 1 });
  const strong = token(s, { level: 15, items: { some: () => false } }, { x: 500, name: "Fizban", disposition: 1 });
  const before = F.chat.length;
  await Hooks.callAll("combatStart", { scene: s, combatants: { contents: [dt, near, far, strong].map((token) => ({ token })) } });
  const msg = F.chat.slice(before).find((m) => m.content.includes("Dragonfear"));
  assert.ok(msg);
  assert.match(msg.content, /Riverwind/);
  assert.doesNotMatch(msg.content, /Goldmoon/, "out of reach");
  assert.match(msg.content, /Fizban <span class="hint">\(immune\)/, "higher level than the dragon");
  assert.match(msg.content, /@Check\[will\|dc:29\|/, "young red dragon (level 10): hard DC 29");
});

test("the self-test sees the new packs and the legacy dragons", async () => {
  const r = await K.selfTest({ post: false });
  for (const k of ["Packs", "Dragons"]) assert.ok(r.results.find((x) => x.key === k)?.ok, k);
});
