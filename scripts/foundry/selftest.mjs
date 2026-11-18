// "Krynn: check this world": checks that the module is wired into this Foundry and PF2e, and reports in a GM chat card.
// Later versions add their own checks here (moon magic modifiers, the gods' absence, Lifewrought actors).
import { MODULE_ID, T, setting } from "./constants.mjs";
import { now, skyNow } from "./time.mjs";
import { daysPerYear, CULTURES } from "../logic/calendar.mjs";
import { KRYNN_LANGUAGES, KRYNN_CREATURE_TRAITS } from "./homebrew.mjs";

const newer = (have, need) => foundry.utils.isNewerVersion(have, need) || have === need;

export async function selfTest() {
  const results = [];
  const check = (key, ok, detail = "") => results.push({ key, ok: !!ok, detail });
  const style = setting("calendarStyle");

  check("Foundry", newer(game.release.version, "14.360"), game.release.version);
  check("System", game.system.id === "pf2e" && newer(game.system.version, "8.7.0"), `${game.system.id} ${game.system.version}`);

  const cal = game.time.calendar;
  check("Calendar", cal?.days?.daysPerYear === daysPerYear(style) && cal.months.values.length === 12, `${cal?.days?.daysPerYear} / ${daysPerYear(style)}`);
  const d = now(), c = cal.timeToComponents(game.time.worldTime);
  check("CalendarAgrees", c.year + cal.years.yearZero === d.year && c.day === d.dayOfYear, `${c.year + cal.years.yearZero}/${c.day} · ${d.year}/${d.dayOfYear}`);
  check("Names", CULTURES.every((x) => game.i18n.has(`KRYNN.Calendar.Month.${x}.11`) && game.i18n.has(`KRYNN.Calendar.Weekday.${x}.6`)));

  const sky = skyNow();
  check("Moons", sky.moons.length === 3 && sky.toEye >= 0 && sky.toEye < 504, `${sky.toEye}`);

  const langs = CONFIG.PF2E?.languages ?? {};
  const missingL = Object.keys(KRYNN_LANGUAGES).filter((k) => !(k in langs));
  check("Languages", !missingL.length, missingL.join(", "));
  const traits = CONFIG.PF2E?.creatureTraits ?? {};
  const missingT = Object.keys(KRYNN_CREATURE_TRAITS).filter((k) => !(k in traits));
  check("Traits", !missingT.length, missingT.join(", "));

  check("Banner", !game.settings.get(MODULE_ID, "showBanner") || document.getElementById("krynn-banner"));

  const ok = results.every((r) => r.ok);
  const rows = results.map((r) => `<li class="${r.ok ? "ok" : "bad"}"><i class="fa-solid ${r.ok ? "fa-check" : "fa-xmark"}"></i> ${T(`SelfTest.Check.${r.key}`)}${r.detail ? ` <span class="detail">${foundry.utils.escapeHTML(String(r.detail))}</span>` : ""}</li>`);
  await ChatMessage.create({
    content: `<div class="krynn-card selftest"><h3>${T(ok ? "SelfTest.AllGood" : "SelfTest.Problems")}</h3><ul>${rows.join("")}</ul><p class="hint">${T("SelfTest.Version", { version: game.modules.get(MODULE_ID).version })}</p></div>`,
    speaker: { alias: T("Chat.Speaker") }, whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
  });
  return { ok, results };
}
