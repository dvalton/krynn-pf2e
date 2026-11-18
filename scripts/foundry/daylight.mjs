// Daylight on the scene (a setting, off by default): the active scene's darkness follows the sun of Krynn's
// calendar, from the season's sunrise and sunset. A scene can opt out (flag krynn-pf2e.noDaylight).
import { MODULE_ID, setting, isLeadGM } from "./constants.mjs";
import { now } from "./time.mjs";
import { darknessAt, daysPerYear } from "../logic/calendar.mjs";

export function darknessNow() {
  const d = now();
  return darknessAt(d.dayOfYear, d.hour + d.minute / 60, daysPerYear(setting("calendarStyle")), setting("daylightNight") ?? 0.9);
}

export async function syncDaylight(scene = game.scenes?.active) {
  if (!isLeadGM() || !setting("sceneDaylight") || !scene || scene.getFlag?.(MODULE_ID, "noDaylight")) return null;
  const level = Math.round(darknessNow() * 100) / 100;
  const current = scene.environment?.darknessLevel ?? scene.darkness ?? 0;
  if (Math.abs(current - level) < 0.05) return null;
  await scene.update(scene.environment ? { "environment.darknessLevel": level } : { darkness: level }, { animateDarkness: 2000 });
  return level;
}
