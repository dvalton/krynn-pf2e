// 0.8: the Krynn panel and tab, steel, the feats that draw a table, Toolbelt's saves, and the Portuguese review.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";
import { review } from "../tools/pt-review.mjs";

const LIVES = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
const F = installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 351, 0, 3) * 86400 + 9 * 3600 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;
const { createCharacter } = await import("../scripts/foundry/lifewrought/create.mjs");

test("the Portuguese review finds nothing left in English", () => {
  assert.deepEqual(review(), []);
});

test("the Krynn panel: god and age, knighthood, factions, the life and its Chronicle", async () => {
  const r = await createCharacter(LIVES.find((l) => l.name === "Isaude Proud").record, "pl1");
  const a = game.actors.get(r.actorId);
  const ctx = K.panel.context(a);
  assert.equal(ctx.god.name, "Paladine");
  assert.equal(ctx.god.answers, true, "351: the gods answer");
  assert.ok(ctx.journal?.name.startsWith("The Chronicle of"));
  assert.ok(Array.isArray(ctx.factions));
  await krynn.setDate({ year: 390 });
  assert.equal(K.panel.context(a).god.answers, false, "390: the gods are silent");
  await krynn.setDate({ year: 351, month: 0, day: 3 });
  // A knight of Solamnia in breach of the Measure.
  const pack = game.packs.get("krynn-pf2e.orders");
  const ded = await pack.getDocument(pack.index.find((e) => e.name === "Knight of Solamnia Dedication")._id);
  const breach = await pack.getDocument(pack.index.find((e) => e.name === "Breach of the Measure")._id);
  const d = ded.toObject(); d.flags.pf2e = { rulesSelections: { knightOrder: "rose" } };
  await a.createEmbeddedDocuments("Item", [d, breach.toObject()]);
  const k = K.panel.context(a).knight;
  assert.equal(k.order, "Order of the Rose");
  assert.equal(k.breach, true);
});

test("a mage's panel tells tonight's moon; the tab goes into PF2e's sheet, or the window opens", async () => {
  const mage = await Actor.create({ name: "Red Mage", type: "character" });
  const pack = game.packs.get("krynn-pf2e.magic");
  const feat = (await pack.getDocument(pack.index.find((e) => e.name === "Mage of High Sorcery")._id)).toObject();
  feat.flags.pf2e = { rulesSelections: { order: "red" } };
  await mage.createEmbeddedDocuments("Item", [feat]);
  const ctx = K.panel.context(mage);
  assert.match(ctx.magic.robe, /Red Robes/);
  assert.match(ctx.magic.tonight, /Lunitari/);
  // The sheet as PF2e draws it: a navigation and a content section.
  const html = document.createElement("form");
  html.innerHTML = `<nav class="sheet-navigation"><a class="item" data-tab="character"></a></nav><section class="sheet-content"><div class="tab" data-tab="character"></div></section>`;
  globalThis.renderTemplate = async (path, c) => { const H = (await import("handlebars")).default.create(); H.registerHelper("localize", (k, o) => (o?.hash && Object.keys(o.hash).length ? game.i18n.format(k, o.hash) : game.i18n.localize(k))); return H.compile(fs.readFileSync(new URL(`../${path.replace(/^modules\/krynn-pf2e\//, "")}`, import.meta.url), "utf8"))(c); };
  await Hooks.callAll("renderCharacterSheetPF2e", { actor: mage, render: () => {} }, html);
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(html.querySelector('nav a[data-tab="krynn"]'), "the tab's nav item");
  const tab = html.querySelector('.sheet-content .tab[data-tab="krynn"]');
  assert.ok(tab, "the tab");
  assert.match(tab.textContent, /Red Robes/);
  assert.doesNotMatch(tab.innerHTML, /KRYNN\./);
  // Without PF2e's layout, nothing is forced in; the header button opens the window.
  const odd = document.createElement("div");
  await Hooks.callAll("renderCharacterSheetPF2e", { actor: mage, render: () => {} }, odd);
  assert.equal(odd.querySelector('[data-tab="krynn"]'), null);
  const buttons = [];
  await Hooks.callAll("getActorSheetHeaderButtons", { actor: mage }, buttons);
  buttons[0].onclick();
  const app = foundry.applications.instances.get(`krynn-panel-${mage.id}`);
  await app.render();
  assert.match(app.lastHTML, /Lunitari/);
});

test("steel: off by default; on, PF2e's gold reads as steel", async () => {
  assert.equal(game.i18n.translations.PF2E.CurrencyAbbreviations.gp, "gp");
  await game.settings.set("krynn-pf2e", "steelCurrency", true);
  const { applySteel } = await import("../scripts/foundry/steel.mjs");
  assert.equal(applySteel(), true);
  assert.equal(game.i18n.translations.PF2E.CurrencyAbbreviations.gp, "stl");
  assert.equal(game.i18n.translations.PF2E.Currency.gp, "Steel");
  await game.settings.set("krynn-pf2e", "steelCurrency", false);
});

test("using Kender Pockets draws the table", async () => {
  const pack = game.packs.get("krynn-pf2e.tables");
  const id = pack.index.find((e) => e.name === "Kender Pockets")._id;
  const drawn = [];
  const original = pack.getDocument;
  pack.getDocument = async (i) => ({ ...(await original(i)), draw: async () => { drawn.push(i); return { results: [] }; } });
  await Hooks.callAll("createChatMessage", { author: game.user, item: { system: { slug: "kender-pockets" } }, flags: {} });
  await Hooks.callAll("createChatMessage", { author: game.user, item: { system: { slug: "kender-taunt" } }, flags: {} });
  pack.getDocument = original;
  assert.deepEqual(drawn, [id]);
});

test("with Toolbelt active, a death throes save goes to its target helper", async () => {
  game.modules.set("pf2e-toolbelt", { id: "pf2e-toolbelt", active: true });
  const s = { grid: { size: 100, distance: 5 }, tokens: F.collection("tokens"), createEmbeddedDocuments: async () => [] };
  const pack = game.packs.get("krynn-pf2e.creatures");
  const bozak = await Actor.create((await pack.getDocument(pack.index.find((e) => e.name === "Bozak Draconian")._id)).toObject());
  const tok = (actor, x, name) => { const t = { id: name, uuid: `Scene.s.Token.${name}`, name, x, y: 0, width: 1, height: 1, hidden: false, texture: {}, parent: s, actor, update: async () => t }; s.tokens.set(t.id, t); return t; };
  bozak.token = tok(bozak, 0, "bozak");
  tok(null, 100, "Tanis");
  const before = F.chat.length;
  await bozak.update({ "system.attributes.hp.value": 0 });
  const tb = F.chat.slice(before).find((m) => m.flags?.["pf2e-toolbelt"]);
  assert.ok(tb, "a message for Toolbelt");
  assert.equal(tb.content, "<p>@Check[reflex|dc:18|basic]</p>");
  assert.deepEqual(tb.flags["pf2e-toolbelt"].targetHelper.targets, ["Scene.s.Token.Tanis"]);
  assert.equal(tb.flags["pf2e-toolbelt"].targetHelper.saveVariants.null.dc, 18);
  game.modules.delete("pf2e-toolbelt");
});

test("the settings show the steel option and the companion modules", async () => {
  const { KrynnSettingsApp } = await import("../scripts/foundry/settings-app.mjs");
  const app = await new KrynnSettingsApp().render();
  assert.ok(app.element.querySelector("input[name=steelCurrency]"));
  assert.match(app.lastHTML, /PF2e Workbench/);
  assert.match(app.lastHTML, /PF2e Toolbelt/);
  assert.doesNotMatch(app.lastHTML, /KRYNN\./);
});
