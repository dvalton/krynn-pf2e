// 0.6: the Atlas of Ansalon, the Timeline, the Powers of Krynn and the iconic people; the live lines in Foundry.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildDocs, buildBabele } from "../tools/build-packs.mjs";
import { REGIONS, STATUS_PT, POWERS } from "../scripts/content/atlas.mjs";
import { TIMELINE } from "../scripts/content/timeline.mjs";
import { ICONIC } from "../scripts/content/iconic.mjs";
import { regionNow, placesOf, yearLabel, periodText } from "../scripts/logic/atlas.mjs";
import { stat } from "../scripts/content/creatures.mjs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const D = JSON.parse(fs.readFileSync(new URL("../lifewrought/data.json", import.meta.url)));
const docs = buildDocs(), bab = buildBabele();
const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };
const LANG = { en: flat(JSON.parse(fs.readFileSync(new URL("../lang/en.json", import.meta.url)))), pt: flat(JSON.parse(fs.readFileSync(new URL("../lang/pt-BR.json", import.meta.url)))) };

test("every ready Lifewrought region, and Istar, has its Atlas journal, translated page by page", () => {
  const ready = D.regions.filter((r) => r.content === "ready").map((r) => r.id);
  for (const id of ready) assert.ok(REGIONS.some((r) => r.id === id), `${id} in the Atlas`);
  assert.ok(REGIONS.some((r) => r.id === "istar"));
  const regionDocs = docs.atlas.filter((j) => j.flags["krynn-pf2e"].slug.startsWith("atlas-"));
  assert.equal(regionDocs.length, REGIONS.length);
  for (const j of docs.atlas) {
    const pt = bab.atlas.entries[j.name];
    assert.ok(pt?.name, `${j.name} has a Portuguese name`);
    for (const pg of j.pages) assert.ok(pt.pages[pg.name]?.text && pt.pages[pg.name].text !== pg.text.content, `${j.name} / ${pg.name} translated`);
  }
  const sol = regionDocs.find((j) => j.name === "Solamnia");
  assert.deepEqual(sol.pages.map((p) => p.name), ["Land and People", "Through the Ages", "Places", "Palanthas", "Hooks"]);
  assert.match(sol.pages[1].text.content, /@KrynnNow\[solamnia\]/);
  assert.match(sol.pages[2].text.content, /<strong>Palanthas<\/strong> \(city\) — humans \d+%/);
  for (const city of ["Solace", "Tarsis", "Kalaman", "Sanction", "Neraka", "Qualinost", "Silvanost", "Thorbardin", "Mount Nevermind", "Kendermore", "Flotsam", "Nethosak", "Palanthas"])
    assert.ok(regionDocs.some((j) => j.pages.some((p) => p.name === city)), `${city} has its page`);
});

test("every status line of Lifewrought has its Portuguese", () => {
  for (const r of D.regions) for (const s of r.status || []) assert.ok(STATUS_PT[s.text], `${r.id}: "${s.text}"`);
  assert.deepEqual(regionNow(D, "solamnia", 351, "en").lines, ["invaded by the Blue Dragonarmy"]);
  assert.deepEqual(regionNow(D, "solamnia", 351, "pt").lines, ["invadida pelo Exército Dracônico Azul"]);
  assert.deepEqual(regionNow(D, "solamnia", 360, "en").lines, []);
  assert.equal(regionNow(D, "nowhere", 351), null);
  assert.equal(periodText(D, 350).age, "despair");
  assert.ok(placesOf(D, "abanasinia").every((p) => /^[A-Z]/.test(p.name)), "only named places");
  assert.deepEqual([yearLabel(351), yearLabel(-1018), yearLabel(351, "pt"), yearLabel(-1018, "pt")], ["351 AC", "1018 PC", "351 DC", "1018 AC"]);
});

test("the Timeline and the Powers of Krynn", () => {
  const tl = docs.atlas.find((j) => j.name === "The Timeline of Krynn");
  assert.equal(tl.pages.length, 5);
  assert.equal(TIMELINE.filter((t) => t.year != null).length, (tl.pages.map((p) => p.text.content).join("").match(/@KrynnYear\[/g) || []).length);
  assert.ok(TIMELINE.every((t) => t.en && t.pt && t.en !== t.pt));
  const pw = docs.atlas.find((j) => j.name === "The Powers of Krynn");
  assert.equal(pw.pages.length, POWERS.length);
  assert.ok(pw.pages.some((p) => p.name === "The Hammer of Kharas"));
});

test("the iconic people: heroes of 351 and later ages, villains, the Age of Mortals", () => {
  assert.equal(docs.iconic.length, ICONIC.length);
  for (const n of ["Tanis Half-Elven (351)", "Raistlin Majere (351)", "Raistlin, Master of Past and Present", "Laurana, the Golden General", "Lord Soth", "Kitiara uth Matar", "Mina", "Avatar of Takhisis"])
    assert.ok(docs.iconic.some((d) => d.name === n), n);
  for (const c of ICONIC) {
    const d = docs.iconic.find((x) => x.flags["krynn-pf2e"].slug === c.slug);
    assert.equal(d.system.traits.rarity, "unique");
    assert.equal(d.system.attributes.ac.value, stat.ac(c.level, c.ac));
    assert.equal(d.prototypeToken.disposition, c.disposition);
    assert.ok(LANG.pt[`KRYNN.Bestiary.${c.slug}.Notes`].includes("<em>"), `${c.slug}: its age, in Portuguese`);
    for (const a of d.items.filter((i) => i.type === "action")) {
      const key = /@Localize\[([^\]]+)\]/.exec(a.system.description.value)[1];
      assert.ok(LANG.en[key] && LANG.pt[key] && !/\{(dc|area|attack)\}/.test(LANG.en[key] + LANG.pt[key]), `${c.slug}/${a.name}`);
    }
  }
  assert.equal(docs.iconic.find((d) => d.name === "Sturm Brightblade (351)").prototypeToken.disposition, 1, "a hero");
  assert.equal(docs.iconic.find((d) => d.name === "Verminaard").prototypeToken.disposition, -1, "a villain");
});

test("in Foundry: the live line follows the world's year, and a GM's click on a year moves the world", async () => {
  installFoundry({ lang: "en", isGM: true, worldTime: absoluteDay("classic", 351, 3, 10) * 86400 });
  await import("../scripts/krynn.mjs");
  const F = globalThis.__krynnTestF;
  await Hooks.callAll("init"); await Hooks.callAll("setup");
  game.time.calendar = new CONFIG.time.worldCalendarClass(CONFIG.time.worldCalendarConfig);
  await Hooks.callAll("ready");
  const now = CONFIG.TextEditor.enrichers.find((e) => e.id === "krynnNow");
  const el = await now.enricher(["@KrynnNow[solamnia]", "solamnia"]);
  assert.match(el.textContent, /Now, 351 AC/);
  assert.match(el.textContent, /invaded by the Blue Dragonarmy/);
  await krynn.setDate({ year: 365 });
  assert.match((await now.enricher(["", "solamnia"])).textContent, /no great upheaval/);
  const year = CONFIG.TextEditor.enrichers.find((e) => e.id === "krynnYear");
  const a = await year.enricher(["@KrynnYear[383]{383 AC}", "383", "383 AC"]);
  document.body.append(a);
  a.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(krynn.now().year, 383, "the world is in 383");
  void F;
});
