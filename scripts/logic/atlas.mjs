// Pure logic of 0.6: what is happening in a region in a given year, its named places and peoples (from Lifewrought's
// data), and the labels of years. No Foundry globals.
import { STATUS_PT } from "../content/atlas.mjs";

// The region's status lines that cover the year, in the reader's language.
export function regionNow(D, regionId, year, lang = "en") {
  const r = (D.regions || []).find((x) => x.id === regionId);
  if (!r) return null;
  const lines = (r.status || []).filter((s) => year >= s.years[0] && year <= s.years[1]).map((s) => (lang === "pt" ? STATUS_PT[s.text] ?? s.text : s.text));
  return { id: r.id, name: r.name, year, lines };
}

// The age and period of a year, from Lifewrought's ages (ids match logic/ages.mjs).
export function periodText(D, year) {
  const age = (D.ages || []).find((a) => a.years && year >= a.years[0] && year <= a.years[1]);
  const p = age?.periods?.find((x) => year >= x.years[0] && year <= x.years[1]);
  return { age: age?.id ?? null, period: p?.text ?? null };
}

// Named places (those with a proper name) of a region, with their main peoples.
export function placesOf(D, regionId, top = 3) {
  return Object.entries(D.origin?.places || {}).filter(([, p]) => p.region === regionId && /^[A-Z]/.test(p.name))
    .map(([id, p]) => {
      const total = Object.values(p.people || {}).reduce((a, b) => a + b, 0) || 1;
      const peoples = Object.entries(p.people || {}).sort((a, b) => b[1] - a[1]).slice(0, top).map(([k, v]) => ({ id: k, pct: Math.round((v / total) * 100) }));
      return { id, name: p.name, pop: p.pop ?? 0, peoples };
    }).sort((a, b) => b.pop - a.pop || a.name.localeCompare(b.name));
}

// "351 AC" / "1018 PC" in English; "351 DC" / "1018 AC" in Portuguese (depois / antes do Cataclismo).
export function yearLabel(year, lang = "en") {
  if (year == null) return "";
  if (lang === "pt") return year > 0 ? `${year} DC` : `${-year} AC`;
  return year > 0 ? `${year} AC` : `${-year} PC`;
}

// The size of a place from Lifewrought's population weight.
export const sizeOf = (pop) => (pop >= 15 ? "city" : pop >= 8 ? "town" : pop >= 3 ? "village" : "hamlet");
