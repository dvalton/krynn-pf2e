// 1.1 without Foundry: Lifewrought v0.13's ways of playing (pure fate, fate points, choosing, a concept) and quick
// lives. A life saved in any of them must replay to exactly the same character, with no new dice: that is what
// "Create the character" does in Foundry.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { replayLife, randomLife } from "../scripts/logic/lifewrought.mjs";

const D = JSON.parse(fs.readFileSync(new URL("../lifewrought/data.json", import.meta.url)));
const LW = createRequire(import.meta.url)(new URL("../lifewrought/engine.js", import.meta.url).pathname);

const same = (v) => JSON.stringify([v.name.full, v.ancestry.id, v.l1 && v.l1.heritage && v.l1.heritage.name, v.klass, v.background, v.l1 && v.l1.deity, v.age, v.log.map((r) => [r.id, r.choice, r.outcome])]);
const SPECS = [[3, 381, "abanasinia"], [8, 410, "solamnia"], [15, 356, "kalaman"], [21, 425, "khur"]];

for (const mode of LW.MODES) {
  for (const length of ["full", "quick"]) {
    test(`a life in ${mode} mode (${length}) replays exactly`, async () => {
      for (const [seed, year, region] of SPECS) {
        const concept = mode === "concept" ? { people: seed % 2 ? "kender" : "hill_dwarf", cls: seed % 2 ? "rogue" : null } : null;
        const { v, record } = await randomLife(LW, D, { seed, year, region, mode, length, concept });
        assert.equal(record.cfg.mode, mode);
        assert.equal(record.cfg.length, length);
        const { v: again, extraDraws } = await replayLife(LW, D, record);
        assert.equal(extraDraws, 0, `${mode} ${length} seed ${seed}: the replay rolled new dice`);
        assert.equal(same(again), same(v), `${mode} ${length} seed ${seed}: the replay is a different character`);
        if (concept) assert.equal(v.ancestry.id, concept.people);
        if (mode === "points") assert.ok(v.fate >= 0 && v.fate <= LW.FATE_POINTS);
      }
    });
  }
}

test("a quick life is about half as long, and every event happens at a sensible age", async () => {
  let full = 0, quick = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const a = await randomLife(LW, D, { seed, year: 381, region: "abanasinia" });
    const b = await randomLife(LW, D, { seed, year: 381, region: "abanasinia", length: "quick" });
    full += a.v.log.length; quick += b.v.log.length;
    for (const { v } of [a, b]) for (const r of v.log) {
      const ev = D.events.find((e) => e.id === r.id);
      assert.ok(r.age >= LW.minAge(D, ev), `${r.id} at age ${r.age}`);
    }
  }
  assert.ok(quick < full * 0.65, `quick ${quick} events against full ${full}`);
});

test("lives saved before v0.13 (no mode in the record) still replay as pure fate", async () => {
  const lives = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
  const rec = structuredClone(lives[0].record);
  delete rec.cfg.mode; delete rec.cfg.length; delete rec.cfg.concept;
  const { v, extraDraws } = await replayLife(LW, D, rec);
  assert.equal(extraDraws, 0);
  assert.equal(v.mode, "fate");
  assert.equal(v.name.full, lives[0].name);
});
