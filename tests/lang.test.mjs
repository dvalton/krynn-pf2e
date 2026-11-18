import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { AGES, PERIODS, changesBetween } from "../scripts/logic/ages.mjs";
import { CULTURES, HOLIDAYS, STYLES, seasonsFor } from "../scripts/logic/calendar.mjs";
import { HOMEBREW } from "../scripts/foundry/homebrew.mjs";

const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };

for (const lang of ["en", "pt-BR"]) {
  test(`every key built from data exists in ${lang}`, () => {
    const L = flat(JSON.parse(fs.readFileSync(new URL(`../lang/${lang}.json`, import.meta.url))));
    const need = [];
    for (const a of AGES) need.push(`Age.${a.id}.Name`, `Chat.Change.age.${a.id}`);
    for (const p of PERIODS) need.push(`Period.${p.id}.Name`, `Period.${p.id}.Years`, `Period.${p.id}.Text`, `Chat.Change.period.${p.id}`);
    for (const c of ["gods.return", "gods.leave", "moons.return", "moons.leave"]) need.push(`Chat.Change.${c}`);
    for (const c of CULTURES) need.push(`Calendar.Culture.${c}`);
    for (const s of Object.keys(STYLES)) need.push(`Calendar.Style.${s}`);
    for (const s of seasonsFor("classic")) need.push(`Calendar.Season.${s.id}`);
    for (const [, , h] of HOLIDAYS) need.push(`Holiday.${h}.Name`, `Holiday.${h}.Text`);
    for (const k of ["classic", "light", "narrative", "off"]) need.push(`Settings.MoonMagic.${k}`);
    for (const k of ["strict", "warn", "off"]) need.push(`Settings.Gods.${k}`);
    for (const k of ["blackRobes", "everyone", "gm"]) need.push(`Settings.Nuitari.${k}`);
    for (const k of ["Foundry", "System", "Calendar", "CalendarAgrees", "Names", "Moons", "Languages", "Traits", "Banner", "LifeEngine", "LifeData", "LifeBuild"]) need.push(`SelfTest.Check.${k}`);
    for (const rec of Object.values(HOMEBREW)) for (const v of Object.values(rec)) {
      for (const key of typeof v === "string" ? [v] : [v.label, v.description]) need.push(key.replace(/^KRYNN\./, ""));
    }
    const missing = need.filter((k) => !(`KRYNN.${k}` in L));
    assert.deepEqual(missing, []);
    // Every change the age logic can report has its sentence.
    for (let y = -1100; y < 440; y += 1) for (const c of changesBetween(y, y + 1)) assert.ok(`KRYNN.Chat.Change.${c}` in L, c);
  });
}
