import { test } from "node:test";
import assert from "node:assert/strict";
import * as A from "../scripts/logic/ages.mjs";
import * as C from "../scripts/logic/calendar.mjs";
import * as M from "../scripts/logic/moons.mjs";

test("ages and periods follow the years Lifewrought uses", () => {
  assert.equal(A.ageOf(-2000), "dreams");
  assert.equal(A.ageOf(-500), "might");
  assert.equal(A.ageOf(0), "despair");
  assert.equal(A.ageOf(383), "despair");
  assert.equal(A.ageOf(384), "mortals");
  assert.deepEqual([347, 348, 352, 353, 382, 383, 384, 420, 421].map(A.periodOf),
    ["despair", "war", "war", "after", "after", "chaos", "mortals", "mortals", "souls"]);
});

test("the gods and the moons come and go with the ages", () => {
  assert.equal(A.godsPresent(-10), true);
  assert.equal(A.godsPresent(0), false);
  assert.equal(A.godsPresent(350), false);
  assert.equal(A.godsPresent(351), true);
  assert.equal(A.godsPresent(383), true);
  assert.equal(A.godsPresent(384), false);
  assert.equal(A.godsPresent(421), true);
  assert.equal(A.moonsPresent(383), true);
  assert.equal(A.moonsPresent(384), false);
  assert.equal(A.moonsPresent(420), false);
  assert.equal(A.moonsPresent(421), true);
  assert.deepEqual(A.changesBetween(383, 384), ["age.mortals", "period.mortals", "gods.leave", "moons.leave"]);
  assert.deepEqual(A.changesBetween(350, 351), ["gods.return"]);
  assert.deepEqual(A.changesBetween(360, 370), []);
  assert.deepEqual(A.changesBetween(340, 351), ["period.war", "gods.return"]);
  assert.equal(A.yearLabel(351), "351 AC");
  assert.equal(A.yearLabel(-1018), "1018 PC");
});

test("every culture has twelve months and seven weekdays, in both languages", () => {
  for (const c of C.CULTURES) {
    assert.equal(C.MONTHS[c].length, 12, c);
    assert.equal(C.WEEKDAYS[c].length, 7, c);
    for (const n of [...C.MONTHS[c], ...C.WEEKDAYS[c]]) { assert.equal(n.length, 2); assert.ok(n[0] && n[1]); }
  }
});

test("dates and absolute days round-trip in both calendar styles", () => {
  for (const style of Object.keys(C.STYLES)) {
    for (const [y, m, d] of [[351, 0, 1], [351, 11, C.STYLES[style].monthDays], [-1018, 5, 15], [0, 0, 3], [421, 8, 22]]) {
      const abs = C.absoluteDay(style, y, m, d);
      const back = C.dateOfDay(style, abs);
      assert.deepEqual([back.year, back.month, back.day], [y, m, d], `${style} ${y}-${m}-${d}`);
    }
    assert.equal(C.daysPerYear(style), 12 * C.STYLES[style].monthDays);
    assert.ok(C.absoluteDay(style, -4999, 0, 1) > 0);
  }
});

test("the calendar config has what Foundry 14 needs", () => {
  const cfg = C.calendarConfig("classic", "solamnic");
  assert.equal(cfg.months.values.length, 12);
  assert.equal(cfg.days.values.length, 7);
  assert.equal(cfg.days.daysPerYear, 360);
  assert.equal(cfg.months.values.reduce((s, m) => s + m.days, 0), cfg.days.daysPerYear);
  assert.equal(cfg.years.yearZero, C.YEAR_ZERO);
  assert.equal(cfg.seasons.values.length, 4);
  assert.equal(C.calendarConfig("kalaman").days.daysPerYear, 336);
});

test("holy days fall on their dates, and on the last day of a short month", () => {
  assert.deepEqual(C.holidaysOn("classic", 0, 3), ["darkDay"]);
  assert.deepEqual(C.holidaysOn("classic", 11, 22), ["yule"]);
  assert.deepEqual(C.holidaysOn("kalaman", 11, 22), ["yule"]);
  assert.deepEqual(C.holidaysOn("classic", 4, 2), []);
});

test("calendar strings exist for every name, in both languages", () => {
  const en = C.calendarStrings("en"), pt = C.calendarStrings("pt-BR");
  assert.equal(Object.keys(en).length, Object.keys(pt).length);
  assert.equal(en["KRYNN.Calendar.Month.elven.9"], "Autumn Twilight");
  assert.equal(pt["KRYNN.Calendar.Month.elven.9"], "Crepúsculo de Outono");
  assert.equal(en["KRYNN.Calendar.Weekday.solamnic.0"], "Linaras");
});

test("each moon spends a quarter of its cycle in each phase", () => {
  for (const moon of M.MOONS) {
    const count = { high: 0, waning: 0, low: 0, waxing: 0 };
    for (let d = 0; d < moon.period; d++) count[M.moonOn(moon, d, 0).phase]++;
    for (const p of M.PHASES) assert.equal(count[p], moon.period / 4, `${moon.id} ${p}`);
  }
});

test("the Night of the Eye comes every 504 days, with all three moons at High Sanction", () => {
  const eye = 1000;
  for (const k of [-2, -1, 0, 1, 2]) {
    const day = eye + k * M.EYE_CYCLE, sky = M.skyOn(day, eye);
    assert.equal(sky.eye, true);
    assert.ok(sky.moons.every((m) => m.phase === "high" && m.full));
    assert.equal(sky.alignments.length, 3);
  }
  let eyes = 0;
  for (let d = eye; d < eye + M.EYE_CYCLE * 3; d++) if (M.isNightOfTheEye(d, eye)) eyes++;
  assert.equal(eyes, 3);
  assert.equal(M.daysToNextEye(eye + 1, eye), 503);
  assert.equal(M.daysToNextEye(eye, eye), 0);
});

test("days to the next High Sanction count down to the first day of it", () => {
  for (const moon of M.MOONS) {
    for (let d = 0; d < moon.period * 2; d++) {
      const s = M.moonOn(moon, d, 0);
      if (s.phase === "high") assert.equal(s.toHigh, 0);
      else assert.equal(M.moonOn(moon, d + s.toHigh, 0).phase, "high", `${moon.id} day ${d}`);
      if (s.phase !== "high") assert.notEqual(M.moonOn(moon, d + s.toHigh - 1, 0).phase, "high");
    }
  }
});

test("moons align now and then, not always", () => {
  let any = 0, days = 2000;
  for (let d = 0; d < days; d++) if (M.alignmentsOn(d, 0).length) any++;
  assert.ok(any > 50 && any < days * 0.6, `aligned on ${any} of ${days} days`);
  assert.equal(M.moonOfRobe("black").id, "nuitari");
});

import { litPath, illumination } from "../scripts/logic/moon-svg.mjs";
test("moon drawings: full, new and quarters", () => {
  assert.match(litPath(10, 0), /^M 0 -10 A 10 10 0 1 1 0 10/);
  assert.equal(litPath(10, 0.5), "");
  assert.match(litPath(10, 0.25), /A 0\.0* 10|A [0-9.e-]+ 10/);
  assert.notEqual(litPath(10, 0.1), litPath(10, 0.9));
  assert.ok(Math.abs(illumination(0) - 1) < 1e-9 && Math.abs(illumination(0.5)) < 1e-9);
});
import { eventsBetween } from "../scripts/logic/events.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";
test("passing days tells holy days, High Sanctions and the Eye; long jumps only the arrival", () => {
  const eye = absoluteDay("classic", 351, 0, 1);
  const r = eventsBetween(eye - 1, eye + 40, "classic", eye);
  assert.ok(r.pub.some((e) => e.kind === "eye" && e.day === eye));
  assert.ok(r.pub.some((e) => e.kind === "holiday" && e.id === "darkDay"));
  assert.ok(r.pub.some((e) => e.kind === "high" && e.moon === "lunitari"));
  assert.ok(r.dark.length >= 3 && r.dark.every((e) => e.moon === "nuitari"));
  assert.ok(!r.pub.some((e) => e.kind === "high" && e.day === eye), "the Eye replaces that day's High Sanctions");
  const long = eventsBetween(eye, eye + 400, "classic", eye);
  assert.ok([...long.pub, ...long.dark].every((e) => e.day === eye + 400));
  const mortals = absoluteDay("classic", 400, 0, 1);
  assert.ok(eventsBetween(mortals, mortals + 60, "classic", eye).pub.every((e) => e.kind === "holiday"));
  assert.equal(eventsBetween(eye, eye, "classic", eye).pub.length, 0);
});
