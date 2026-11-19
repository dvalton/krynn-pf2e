// Test fixtures for the Lifewrought tests: a few finished lives (as Foundry would save them) and the PF2e item
// sources they need, taken from a Lifewrought checkout's item files:
//   node tools/make-fixtures.mjs ../lifewrought
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { buildActorData, randomLife } from "../scripts/logic/lifewrought.mjs";
import { openChoices } from "../scripts/logic/peoples.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.resolve(process.argv[2] || "../lifewrought");
const require = createRequire(import.meta.url);
const LW = require(path.join(ROOT, "lifewrought/engine.js"));
const D = JSON.parse(fs.readFileSync(path.join(ROOT, "lifewrought/data.json"), "utf8"));
const ITEMS = {};
for (const g of ["core", "feats", "features", "spells", "equipment"]) Object.assign(ITEMS, JSON.parse(fs.readFileSync(path.join(src, "web/items", `${g}.json`), "utf8")));

// Lives the tests ask for by role, found by trying seeds in order (so a new Lifewrought keeps the same roles),
// then a few plain lives across the ages.
const ROLES = [
  { role: "champion-paladine", year: 356, region: "solamnia", start: "", want: (v, open) => v.klass === "champion" && v.l1.deity === "paladine" && open.length === 0 },
  { role: "versatile-human", year: 381, region: "abanasinia", start: "", want: (v, open) => v.ancestry.id === "human" && open.join() === "Versatile Human" },
  { role: "versatile-human-2", year: 381, region: "kalaman", start: "Kalaman", want: (v, open) => v.ancestry.id === "human" && open.join() === "Versatile Human" },
  { role: "kender-cleric-mishakal", year: 381, region: "goodlund", start: "", want: (v) => v.ancestry.id === "kender" && v.klass === "cleric" && v.l1.deity === "mishakal" },
  { role: "hill-dwarf", year: 352, region: "thorbardin", start: "", want: (v) => v.ancestry.id === "hill_dwarf" },
];
const PLAIN = [[11, 351, "solamnia", "Vingaard Keep"], [37, 410, "qualinesti", ""], [73, 422, "khur", ""]];
export const SELFTEST_SEED = 7;
const lives = [], needed = new Set();
const fetchFor = async (u) => { needed.add(u); return ITEMS[u] || null; };
const used = new Set();
for (const R of ROLES) {
  let found = null;
  for (let seed = 1; seed < 20000 && !found; seed++) {
    if (used.has(seed)) continue;
    const { v, record } = await randomLife(LW, D, { seed, year: R.year, region: R.region, start: R.start });
    if (!v.l1) continue;
    const { data } = await buildActorData(LW, v, D, async (u) => ITEMS[u] || null).catch(() => ({ data: null }));
    if (!data) continue;
    if (!R.want(v, openChoices(data.items).map((o) => o.name))) continue;
    found = { seed, role: R.role, name: v.name.full, klass: v.klass, ancestry: v.ancestry.id, record };
    used.add(seed);
    await buildActorData(LW, v, D, fetchFor);
  }
  if (!found) throw new Error("no life found for the role " + R.role);
  lives.push(found);
}
for (const [seed, year, region, start] of PLAIN) {
  const { v, record } = await randomLife(LW, D, { seed, year, region, start });
  lives.push({ seed, role: null, name: v.name.full, klass: v.klass, ancestry: v.ancestry.id, record });
  await buildActorData(LW, v, D, fetchFor);
}
// The self-test's life in the tests (seed 7, its defaults) must build from the fixtures too.
{ const { v } = await randomLife(LW, D, { seed: SELFTEST_SEED }); await buildActorData(LW, v, D, async (u) => { needed.add(u); return ITEMS[u] || null; }); }
const subset = Object.fromEntries([...needed].filter((u) => ITEMS[u]).map((u) => [u, ITEMS[u]]));
fs.writeFileSync(path.join(ROOT, "tests/fixtures/lives.json"), JSON.stringify(lives) + "\n");
fs.writeFileSync(path.join(ROOT, "tests/fixtures/pf2e-items.json"), JSON.stringify(subset) + "\n");
console.log(lives.map((l) => `${l.role || "plain"}: ${l.name} (${l.ancestry} ${l.klass}, seed ${l.seed})`).join("; "), `| items: ${Object.keys(subset).length}`);
