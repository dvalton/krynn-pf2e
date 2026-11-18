// The module running in a (mock) Foundry 14 + PF2e world, as the GM, in English.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFoundry } from "./harness/foundry-mock.mjs";

const F = installFoundry({ lang: "en", isGM: true, worldTime: 0 });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;

test("init registers the settings, the menu and the Krynn calendar", () => {
  assert.ok(F.menus.has("krynn-pf2e.krynn"));
  assert.equal(CONFIG.time.worldCalendarConfig.days.daysPerYear, 360);
  assert.equal(game.time.calendar.months.values.length, 12);
  assert.equal(typeof CONFIG.time.formatters.krynnDate, "function");
  assert.equal(game.modules.get("krynn-pf2e").api, K);
});

test("the first run puts the world in 351 AC and welcomes the GM", () => {
  const d = K.now();
  assert.equal(d.year, 351);
  assert.equal(d.month, 8);
  assert.equal(d.day, 1);
  assert.equal(d.hour, 8);
  assert.ok(game.settings.get("krynn-pf2e", "initialized"));
  const welcome = F.chat.find((m) => m.content.includes("Welcome to Krynn"));
  assert.ok(welcome && welcome.whisper.includes("gm1"));
});

test("the Foundry formatter writes Krynn dates", () => {
  const c = game.time.calendar.timeToComponents(game.time.worldTime);
  const s = CONFIG.time.formatters.krynnDate(game.time.calendar, c);
  assert.match(s, /1 Reorxmont, 351 AC$/);
});

test("the banner shows the date and the moons", () => {
  const el = document.getElementById("krynn-banner");
  assert.ok(el, "banner rendered");
  assert.match(el.textContent, /Reorxmont, 351 AC/);
  assert.equal(el.querySelectorAll("svg.krynn-moon").length, 3, "the GM sees all three moons");
  assert.equal(el.parentElement.id, "ui-top");
});

test("passing days announces High Sanctions and holy days, and the black moon only to those who see it", async () => {
  F.chat.length = 0;
  await K.setDate({ year: 351, month: 8, day: 1 });
  await game.time.advance(86400 * 40);
  const pub = F.chat.filter((m) => !m.whisper), dark = F.chat.filter((m) => m.whisper);
  assert.ok(pub.some((m) => /reaches High Sanction/.test(m.content)), "a public High Sanction");
  assert.ok(pub.some((m) => /Summer's End/.test(m.content)), "22 Reorxmont is Summer's End");
  assert.ok(dark.length && dark.every((m) => /Nuitari/.test(m.content) && m.whisper.includes("gm1") && !m.whisper.includes("pl1")));
});

test("crossing into the Age of Mortals tells that the gods and the moons are gone", async () => {
  F.chat.length = 0;
  await K.setDate({ year: 383, month: 11, day: 30 });
  F.chat.length = 0;
  await game.time.advance(86400);
  const card = F.chat.find((m) => /Age of Mortals/.test(m.content));
  assert.ok(card, "age card");
  assert.match(card.content, /gods are gone/);
  assert.match(card.content, /moons of magic have vanished/);
  assert.equal(K.state().moons, false);
  assert.equal(document.querySelectorAll("#krynn-banner svg.krynn-moon").length, 0);
  assert.ok(document.querySelector("#krynn-banner .pale"));
});

test("the sky window renders the moons, alignments and GM controls", async () => {
  await K.setDate({ year: 351, month: 0, day: 1 }); // the default Night of the Eye
  const { SkyApp } = await import("../scripts/foundry/sky.mjs");
  const app = await new SkyApp().render();
  assert.match(app.lastHTML, /Night of the Eye/);
  assert.equal(app.element.querySelectorAll("li.moon").length, 3);
  assert.ok(app.element.querySelector("footer.gm button[data-seconds='86400']"));
  assert.doesNotMatch(app.lastHTML, /KRYNN\./, "no untranslated keys");
});

test("the settings window renders, and saving moves the date and keeps it across a change of style", async () => {
  const { KrynnSettingsApp } = await import("../scripts/foundry/settings-app.mjs");
  const app = await new KrynnSettingsApp().render();
  assert.doesNotMatch(app.lastHTML, /KRYNN\./, "no untranslated keys");
  assert.ok(app.element.querySelector("select[name=moonMagic] option[value=classic]"));
  const submit = KrynnSettingsApp.DEFAULT_OPTIONS.form.handler;
  globalThis.__reloaded = false;
  await submit.call(app, null, null, { object: { year: 370, month: 4, day: 12, calendarStyle: "kalaman", worldCulture: "ergothian", moonMagic: "light", godsMode: "strict", nuitariSeen: "gm", announce: true, "eye.year": 351, "eye.month": 0, "eye.day": 1 } });
  assert.equal(game.settings.get("krynn-pf2e", "calendarStyle"), "kalaman");
  assert.equal(game.settings.get("krynn-pf2e", "moonMagic"), "light");
  const d = K.now();
  assert.deepEqual([d.year, d.month, d.day], [370, 4, 12]);
  assert.ok(globalThis.__reloaded, "a new calendar style reloads the world");
});

test("the self-test passes in a healthy world", async () => {
  // After the reload Foundry would rebuild the calendar for the new style.
  CONFIG.time.worldCalendarConfig = (await import("../scripts/logic/calendar.mjs")).calendarConfig("kalaman", "ergothian");
  game.time.calendar = new CONFIG.time.worldCalendarClass(CONFIG.time.worldCalendarConfig);
  F.chat.length = 0;
  const r = await K.selfTest();
  assert.deepEqual(r.results.filter((x) => !x.ok), []);
  assert.match(F.chat.at(-1).content, /everything is in place/);
});

test("the self-test notices a missing language registration", async () => {
  delete CONFIG.PF2E.languages.solamnic;
  const r = await K.selfTest();
  assert.equal(r.ok, false);
  assert.ok(r.results.find((x) => x.key === "Languages" && !x.ok && /solamnic/.test(x.detail)));
});
