// The Atlas made live: two text enrichers for journals.
//   @KrynnNow[region]       what is happening in the region in the world's current year (it follows the date)
//   @KrynnYear[351]{label}  a year of the Timeline; a GM's click brings the world to it, a player's shows the age
import { MODULE_ID, T } from "./constants.mjs";
import { now, setDate } from "./time.mjs";
import { lwData } from "./lifewrought/engine.mjs";
import { regionNow } from "../logic/atlas.mjs";
import { stateOf } from "../logic/ages.mjs";

const lang = () => (game.i18n.lang?.startsWith("pt") ? "pt" : "en");
let D = null;

async function nowLine(regionId) {
  try { D ??= await lwData(); } catch (e) { return null; }
  const y = now().year, r = regionNow(D, regionId, y, lang());
  if (!r) return null;
  const span = document.createElement("span");
  span.className = "krynn-now";
  span.dataset.region = regionId;
  const ageName = T(`Age.${stateOf(y).age}.Name`);
  span.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> <strong>${T("Atlas.NowIn", { year: y })}</strong> (${foundry.utils.escapeHTML(ageName)}): ${r.lines.length ? foundry.utils.escapeHTML(r.lines.join("; ")) : T("Atlas.Quiet")}`;
  return span;
}

function yearLink(year, label) {
  const a = document.createElement("a");
  a.className = "krynn-year";
  a.dataset.year = String(year);
  a.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${foundry.utils.escapeHTML(label || String(year))}`;
  return a;
}

export function registerEnrichers() {
  const enrichers = CONFIG.TextEditor?.enrichers;
  if (!enrichers) return false;
  enrichers.push(
    { id: "krynnNow", pattern: /@KrynnNow\[([\w-]+)\]/g, enricher: async (m) => nowLine(m[1]) },
    { id: "krynnYear", pattern: /@KrynnYear\[(-?\d+)\](?:\{([^}]*)\})?/g, enricher: async (m) => yearLink(Number(m[1]), m[2]) },
  );
  return true;
}

// Clicks on a year: the GM moves the world there (after asking); a player sees what that year is.
export function installYearClicks(root = document.body) {
  root.addEventListener("click", async (ev) => {
    const a = ev.target.closest?.("a.krynn-year");
    if (!a) return;
    ev.preventDefault();
    const year = Number(a.dataset.year);
    const s = stateOf(year);
    const what = `${T(`Age.${s.age}.Name`)}${s.period ? ` · ${T(`Period.${s.period}.Name`)}` : ""}`;
    if (!game.user.isGM) return ui.notifications.info(T("Atlas.YearIs", { year, what }));
    const ok = await (foundry.applications.api.DialogV2?.confirm?.({ window: { title: T("Atlas.GoTitle") }, content: `<p>${T("Atlas.GoText", { year, what })}</p>` }) ?? true);
    if (ok) await setDate({ year, month: 0, day: 1 });
  });
}

// When the date changes, every open journal showing a "now" line is drawn again.
export function refreshNowLines() {
  for (const app of foundry.applications.instances?.values?.() ?? []) if (app.element?.querySelector?.(".krynn-now")) app.render?.();
  for (const w of Object.values(globalThis.ui?.windows ?? {})) if (w.element?.[0]?.querySelector?.(".krynn-now")) w.render?.();
}

export const _test = { nowLine, yearLink, reset: () => { D = null; } };
export { MODULE_ID };
