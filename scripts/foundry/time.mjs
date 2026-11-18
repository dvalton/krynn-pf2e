// Krynn time on top of Foundry's world time: the calendar registered as the world calendar, the current Krynn date,
// and setting the date. One second of world time is one second in Krynn; a day is 86,400 seconds.
import { MODULE_ID, T, setting } from "./constants.mjs";
import * as C from "../logic/calendar.mjs";
import { stateOf } from "../logic/ages.mjs";
import { skyOn } from "../logic/moons.mjs";

export const style = () => setting("calendarStyle");

// The culture whose month and weekday names this user sees: their own choice, else their character's people
// (a Lifewrought character knows it), else the world's default.
export function cultureForUser() {
  const mine = game.settings.get(MODULE_ID, "userCulture");
  if (mine && mine !== "world") return mine;
  return game.user.character?.getFlag(MODULE_ID, "culture") || setting("worldCulture");
}

// Register the Krynn calendar as Foundry's world calendar. Called during init, before game.time is built.
export function registerCalendar() {
  CONFIG.time.worldCalendarConfig = C.calendarConfig(style(), setting("worldCulture"));
  CONFIG.time.formatters.krynnDate = (calendar, components) => formatDate(dateFromComponents(components));
  CONFIG.time.formatters.krynnDateTime = (calendar, components) => formatDateTime(dateFromComponents(components));
}

function dateFromComponents(c) {
  const abs = (c.year * C.daysPerYear(style())) + c.day;
  return { ...C.dateOfDay(style(), abs), hour: c.hour, minute: c.minute };
}

export function nowAbsDay(worldTime = game.time.worldTime) { return C.absoluteDayOfTime(worldTime); }

export function now(worldTime = game.time.worldTime) {
  const abs = nowAbsDay(worldTime), secs = worldTime - abs * C.SECONDS_PER_DAY;
  return { ...C.dateOfDay(style(), abs), abs, hour: Math.floor(secs / 3600), minute: Math.floor((secs % 3600) / 60) };
}

export function eyeDay() {
  const e = setting("eyeDate");
  return C.absoluteDay(style(), e.year, e.month, e.day);
}

export function skyNow(worldTime = game.time.worldTime) { return skyOn(nowAbsDay(worldTime), eyeDay()); }
export function stateNow(worldTime = game.time.worldTime) { return stateOf(now(worldTime).year); }

export function monthName(month, culture = cultureForUser()) { return game.i18n.localize(`KRYNN.Calendar.Month.${culture}.${month}`); }
export function weekdayName(weekday, culture = cultureForUser()) { return game.i18n.localize(`KRYNN.Calendar.Weekday.${culture}.${weekday}`); }

// "351 AC" in English, "351 DC" in Portuguese (depois do Cataclismo).
export function yearLabel(year) { return year >= 0 ? T("Date.AC", { year }) : T("Date.PC", { year: -year }); }

export function formatDate(d, culture = cultureForUser()) {
  return T("Date.Format", { weekday: weekdayName(d.weekday, culture), day: d.day, month: monthName(d.month, culture), year: yearLabel(d.year) });
}
export function formatDateTime(d, culture = cultureForUser()) {
  return `${formatDate(d, culture)}, ${String(d.hour).padStart(2, "0")}:${String(d.minute).padStart(2, "0")}`;
}

// Set the Krynn date (and optionally the hour), keeping the time of day if no hour is given.
export async function setDate({ year, month = 0, day = 1, hour = null, minute = 0 }) {
  const cur = now();
  const h = hour ?? cur.hour, m = hour === null ? cur.minute : minute;
  const t = C.absoluteDay(style(), year, month, day) * C.SECONDS_PER_DAY + h * 3600 + m * 60;
  return game.time.set(t);
}
