// Chat cards when time passes: a new age or period, the gods leaving or returning, a moon reaching High Sanction,
// the Night of the Eye, and holy days. Only the lead GM's client posts them, so each is posted once.
import { MODULE_ID, T, setting, isLeadGM } from "./constants.mjs";
import { now, eyeDay, formatDate, yearLabel } from "./time.mjs";
import { changesBetween } from "../logic/ages.mjs";
import { dateOfDay } from "../logic/calendar.mjs";
import { eventsBetween } from "../logic/events.mjs";
import { canSeeNuitari } from "./sky.mjs";

function line(e, style) {
  const date = formatDate(dateOfDay(style, e.day));
  if (e.kind === "holiday") return `<li><i class="fa-solid fa-star"></i> <strong>${T(`Holiday.${e.id}.Name`)}</strong> (${date}): ${T(`Holiday.${e.id}.Text`)}</li>`;
  if (e.kind === "eye") return `<li><i class="fa-solid fa-eye"></i> <strong>${T("Chat.Eye")}</strong> (${date})</li>`;
  return `<li><i class="fa-solid fa-moon"></i> ${T("Chat.High", { moon: T(`Moon.${e.moon}`), robe: T(`Robe.${({ solinari: "white", lunitari: "red", nuitari: "black" })[e.moon]}`), date })}</li>`;
}

async function post(content, whisper = null) {
  return ChatMessage.create({ content: `<div class="krynn-card">${content}</div>`, speaker: { alias: T("Chat.Speaker") }, ...(whisper ? { whisper } : {}) });
}

// When the gods or the moons leave (or return): the characters it touches, and the feats that answer it.
function featLink(name, label) {
  const pack = game.packs.get(`${MODULE_ID}.magic`);
  const e = pack?.index?.find?.((x) => x.name === name);
  return e ? `@UUID[${e.uuid ?? `Compendium.${MODULE_ID}.magic.Item.${e._id}`}]{${label}}` : label;
}
export function affected(change) {
  const pcs = game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner !== false);
  const slug = (i) => i.system?.slug || i.flags?.[MODULE_ID]?.slug;
  const divine = (a) => a.items.some((i) => i.type === "spellcastingEntry" && i.system?.tradition?.value === "divine") && (a.deity || a.items.some((i) => i.type === "deity"));
  const mage = (a) => a.items.some((i) => slug(i) === "mage-of-high-sorcery");
  const esc = (s) => foundry.utils.escapeHTML(s);
  if (change === "gods.leave") { const who = pcs.filter((a) => divine(a) && !a.items.some((i) => slug(i) === "mystic-of-the-heart")); return who.length ? T("Chat.Affected.godsLeave", { names: who.map((a) => esc(a.name)).join(", "), feat: featLink("Mystic of the Heart", T("Chat.Affected.Mystic")) }) : ""; }
  if (change === "moons.leave") { const who = pcs.filter((a) => mage(a) && !a.items.some((i) => slug(i) === "primal-sorcerer")); return who.length ? T("Chat.Affected.moonsLeave", { names: who.map((a) => esc(a.name)).join(", "), feat: featLink("Primal Sorcerer", T("Chat.Affected.Primal")) }) : ""; }
  if (change === "gods.return") { const who = pcs.filter(divine); return who.length ? T("Chat.Affected.godsReturn", { names: who.map((a) => esc(a.name)).join(", ") }) : ""; }
  if (change === "moons.return") { const who = pcs.filter(mage); return who.length ? T("Chat.Affected.moonsReturn", { names: who.map((a) => esc(a.name)).join(", ") }) : ""; }
  return "";
}

export async function onWorldTime(worldTime, delta) {
  if (!isLeadGM() || !setting("announce") || !delta) return;
  const style = setting("calendarStyle");
  const before = now(worldTime - delta), after = now(worldTime);
  const parts = [];
  // A new age, period, or the gods and moons coming or going.
  for (const c of changesBetween(before.year, after.year)) {
    parts.push(`<li class="change"><i class="fa-solid fa-hourglass-half"></i> ${T(`Chat.Change.${c}`)}</li>`);
    const who = affected(c);
    if (who) parts.push(`<li class="affected"><i class="fa-solid fa-users"></i> ${who}</li>`);
  }
  const { pub, dark } = eventsBetween(before.abs, after.abs, style, eyeDay());
  parts.push(...pub.map((e) => line(e, style)));
  if (parts.length) {
    const head = parts.some((p) => p.includes('class="change"')) ? `<h3>${T("Chat.NewTimes", { year: yearLabel(after.year) })}</h3>` : `<h3>${formatDate(after)}</h3>`;
    await post(`${head}<ul>${parts.join("")}</ul>`);
  }
  if (dark.length) {
    const whisper = game.users.filter((u) => u.active && canSeeNuitari(u)).map((u) => u.id);
    await post(`<h3>${T("Chat.DarkMoon")}</h3><ul>${dark.map((e) => line(e, style)).join("")}</ul>`, whisper);
  }
}

// The first time the module runs in a world, put the clock in Krynn: 351 AC, the year the gods return.
export async function firstRun() {
  if (!game.user.isGM || setting("initialized")) return;
  const { setDate } = await import("./time.mjs");
  if (now().year < -4000) await setDate({ year: 351, month: 8, day: 1, hour: 8, minute: 0 });
  await game.settings.set(MODULE_ID, "initialized", true);
  await post(`<h3>${T("Chat.Welcome.Title")}</h3><p>${T("Chat.Welcome.Text", { date: formatDate(now()) })}</p>`, game.users.filter((u) => u.isGM).map((u) => u.id));
}
