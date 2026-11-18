// Test fixtures for the Lifewrought tests: a few finished lives (as Foundry would save them) and the PF2e item
// sources they need, taken from a Lifewrought checkout's item files:
//   node tools/make-fixtures.mjs ../lifewrought
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { buildActorData, randomLife } from "../scripts/logic/lifewrought.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.resolve(process.argv[2] || "../lifewrought");
const require = createRequire(import.meta.url);
const LW = require(path.join(ROOT, "lifewrought/engine.js"));
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "lifewrought/data.json"), "utf8"));
const ITEMS = {};
for (const g of ["core", "feats", "features", "spells", "equipment"]) Object.assign(ITEMS, JSON.parse(fs.readFileSync(path.join(src, "web/items", `${g}.json`), "utf8")));

const SPECS = [[11, 351, "solamnia", "Vingaard Keep"], [23, 381, "abanasinia", ""], [37, 410, "qualinesti", ""], [41, 352, "thorbardin", ""], [59, 381, "kalaman", "Kalaman"], [73, 422, "khur", ""], [159, 356, "solamnia", ""], [150, 356, "solamnia", ""]];
export const SELFTEST_SEED = 7;
const lives = [], needed = new Set();
for (const [seed, year, region, start] of SPECS) {
  const { v, record } = await randomLife(LW, D, { seed, year, region, start });
  lives.push({ seed, name: v.name.full, klass: v.klass, ancestry: v.ancestry.id, record });
  await buildActorData(LW, v, D, async (u) => { needed.add(u); return ITEMS[u] || null; });
}
// The self-test's life in the tests (seed 7, its defaults) must build from the fixtures too.
{ const { v } = await randomLife(LW, D, { seed: SELFTEST_SEED }); await buildActorData(LW, v, D, async (u) => { needed.add(u); return ITEMS[u] || null; }); }
const subset = Object.fromEntries([...needed].filter((u) => ITEMS[u]).map((u) => [u, ITEMS[u]]));
fs.writeFileSync(path.join(ROOT, "tests/fixtures/lives.json"), JSON.stringify(lives) + "\n");
fs.writeFileSync(path.join(ROOT, "tests/fixtures/pf2e-items.json"), JSON.stringify(subset) + "\n");
console.log(lives.map((l) => `${l.name} (${l.ancestry} ${l.klass})`).join("; "), `| items: ${Object.keys(subset).length}`);
