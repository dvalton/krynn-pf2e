// What happens in the sky and the calendar as days pass: holy days, moons reaching High Sanction, the Night of the Eye.
// Pure logic, no Foundry.
import { moonsOn, isNightOfTheEye } from "./moons.mjs";
import { dateOfDay, holidaysOn } from "./calendar.mjs";
import { moonsPresent } from "./ages.mjs";

const MAX_DAYS = 45; // longer jumps are summarized, not told day by day

// What happened between two absolute days (exclusive of the first, inclusive of the last).
export function eventsBetween(fromDay, toDay, style, eye) {
  const pub = [], dark = [];
  const span = toDay - fromDay;
  if (span <= 0) return { pub, dark };
  const start = span > MAX_DAYS ? toDay - 1 : fromDay; // after a long jump, only the arrival day
  for (let day = start + 1; day <= toDay; day++) {
    const d = dateOfDay(style, day);
    for (const h of holidaysOn(style, d.month, d.day)) pub.push({ kind: "holiday", day, id: h });
    if (!moonsPresent(d.year)) continue;
    if (isNightOfTheEye(day, eye)) { pub.push({ kind: "eye", day }); continue; }
    const today = moonsOn(day, eye), before = moonsOn(day - 1, eye);
    today.forEach((m, i) => {
      if (m.phase === "high" && before[i].phase !== "high") (m.id === "nuitari" ? dark : pub).push({ kind: "high", day, moon: m.id });
    });
  }
  return { pub, dark };
}

