// Pure logic of 0.7: the generators. Each takes Lifewrought's data where it needs it, the reader's language
// ("en" or "pt") and a random function (seedable for tests). No Foundry globals.
import * as G from "../content/generators.mjs";
import { periodOf } from "./ages.mjs";
import { regionNow } from "./atlas.mjs";

export function seeded(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const L = (lang) => (lang === "pt" ? 1 : 0);
export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
export function weighted(rng, list, w = (x) => x[1]) {
  const total = list.reduce((a, x) => a + w(x), 0);
  let r = rng() * total;
  for (const x of list) { r -= w(x); if (r < 0) return x; }
  return list[list.length - 1];
}
const cut = (s) => String(s).split("|")[0];

// ---- People ---------------------------------------------------------------------------------------------------
// The name stock and culture label of a people in a place (as Lifewrought's own NPCs get them).
export function stockFor(D, people, placeId) {
  const O = D.origin, A = O.ancestries[people] || {}, place = O.places[placeId] || {};
  const human = place.culture || (O.birth_regions?.[place.region] || {}).culture || "townsfolk";
  let c = null;
  if ((place.people_culture || {})[people]) c = place.people_culture[people];
  else if (people === "human") c = human;
  else if (people === "half_elf") c = place.elven ? (place.elven === true ? "qualinesti" : place.elven) : human;
  else if (people === "mountain_dwarf") c = place.dwarves || "thorbardin";
  else { const f = (A.facts || []).find((x) => x.startsWith("culture.")); if (f) c = f.slice(8); }
  const C = (O.cultures || {})[c] || {};
  const key = (C.people && C.people !== people ? null : C.names) || A.names || (people === "half_elf" || people === "human" ? C.names : null) || people;
  return O.names[key] || O.names[C.names] || O.names.townsfolk;
}

export function placesIn(D, regionId) {
  return Object.entries(D.origin.places).filter(([, p]) => p.region === regionId).map(([id, p]) => ({ id, name: p.name }));
}

export function makePerson(D, { region, place = null, lang = "en", rng = Math.random, people = null } = {}) {
  const places = placesIn(D, region);
  const pl = place && D.origin.places[place] ? place : (places.length ? pick(rng, places).id : null);
  const mix = (pl && D.origin.places[pl]?.people) || { human: 1 };
  const who = people || weighted(rng, Object.entries(mix))[0];
  const r = rng(), gender = r < 0.48 ? "woman" : r < 0.97 ? "man" : "nonbinary";
  const sex = gender === "woman" ? "female" : gender === "man" ? "male" : rng() < 0.5 ? "female" : "male";
  const stock = stockFor(D, who, pl);
  const given = cut(pick(rng, [...(stock[sex] || []), ...(stock[`npc_${sex}`] || [])].filter(Boolean)) || "Nameless");
  let family = "";
  if (stock.family === "patronym") {
    const father = cut(pick(rng, [...(stock.male || []), ...(stock.npc_male || [])]));
    const rel = G.FAMILY[gender === "woman" ? "daughter" : gender === "man" ? "son" : "child"][L(lang)];
    family = `${rel} ${father}`;
  } else if (["inherited", "clan"].includes(stock.family) && stock.inherited?.length) family = cut(pick(rng, stock.inherited));
  const trade = pick(rng, G.TRADES);
  return {
    name: [given, family].filter(Boolean).join(stock.family === "patronym" ? ", " : " "), given, people: who, peopleLabel: G.PEOPLES[who]?.[L(lang)] ?? who, gender, genderLabel: G.GENDERS[gender][L(lang)],
    place: pl, placeName: pl ? D.origin.places[pl].name : null, trade: trade[L(lang)], tradeKey: trade[0],
    want: pick(rng, G.WANTS)[L(lang)], secret: pick(rng, G.SECRETS)[L(lang)], quirk: pick(rng, G.QUIRKS)[L(lang)], role: G.TRADE_ROLE[trade[0]] ?? "commoner",
  };
}

// A role's stat block (for the NPC builder), for a person, at a level.
export function roleCreature(person, roleId, level, lang = "en") {
  const R = G.ROLES[roleId] ?? G.ROLES.commoner;
  const [str, dex, con, int, wis, cha] = R.abilities, lv = Math.max(-1, Math.min(24, level ?? R.level));
  const bump = Math.max(0, Math.floor((lv - R.level) / 4));
  const traits = { human: ["human", "humanoid"], half_elf: ["elf", "human", "humanoid"], hill_dwarf: ["dwarf", "humanoid"], mountain_dwarf: ["dwarf", "humanoid"], gnome: ["gnome", "humanoid"],
    goblin: ["goblin", "humanoid"], hobgoblin: ["goblin", "hobgoblin", "humanoid"], centaur: ["beast", "centaur"], minotaur: ["humanoid", "minotaur"], kender: ["halfling", "kender", "humanoid"] }[person.people] ?? ["elf", "humanoid"];
  return { slug: `npc-${roleId}`, level: lv, size: person.people === "kender" || person.people === "gnome" || person.people === "goblin" ? "sm" : person.people === "centaur" || person.people === "minotaur" ? "lg" : "med",
    traits, img: "modules/krynn-pf2e/icons/hero.svg", name: { en: person.name, pt: person.name },
    abilities: { str: str + bump, dex: dex + bump, con: con + bump, int, wis, cha }, ac: R.ac, hp: 1, saves: { fortitude: R.saves[0], reflex: R.saves[1], will: R.saves[2] }, perception: R.perception,
    skills: R.skills, speed: person.people === "centaur" ? 40 : 25, other: [], senses: [], languages: ["common"], strikes: R.strikes, actions: [], disposition: 0,
    roleName: R.name[L(lang)] };
}

// ---- Encounters -----------------------------------------------------------------------------------------------
const BUDGET = { trivial: [40, 10], low: [60, 15], moderate: [80, 20], severe: [120, 30], extreme: [160, 40] };
export function xpBudget(difficulty, partySize = 4) { const [base, per] = BUDGET[difficulty] ?? BUDGET.moderate; return base + per * (partySize - 4); }
const XP = { "-4": 10, "-3": 15, "-2": 20, "-1": 30, 0: 40, 1: 60, 2: 80, 3: 120, 4: 160 };
export const creatureXP = (level, partyLevel) => XP[Math.max(-4, Math.min(4, level - partyLevel))] ?? 0;

// The creature names that can be met in a region, terrain and year, with their weights.
export function encounterPool(region, terrain, year) {
  const terrains = terrain ? [terrain] : (G.REGION_TERRAIN[region] ?? ["plains"]);
  const ok = (x) => (x[2] == null || year >= x[2]) && (x[3] == null || year <= x[3]);
  const out = new Map();
  for (const t of ["any", ...terrains]) for (const x of (G.POOLS[t] ?? []).filter(ok)) out.set(x[0], (out.get(x[0]) ?? 0) + x[1]);
  return [...out].map(([name, weight]) => ({ name, weight }));
}

// Build an encounter from candidates found in the world ({ name, level, weight, uuid }): within the XP budget,
// a creature at a time, never more than 8.
export function buildEncounter({ candidates, partyLevel, partySize = 4, difficulty = "moderate", rng = Math.random }) {
  const budget = xpBudget(difficulty, partySize);
  const fit = candidates.filter((c) => c.level >= partyLevel - 4 && c.level <= partyLevel + (difficulty === "extreme" ? 4 : 3));
  let left = budget;
  const picked = new Map();
  for (let i = 0; i < 12 && left >= 10 && [...picked.values()].reduce((a, x) => a + x.count, 0) < 8; i++) {
    const can = fit.filter((c) => creatureXP(c.level, partyLevel) <= left);
    if (!can.length) break;
    const c = weighted(rng, can, (x) => x.weight * (picked.has(x.name) ? 3 : 1));
    const xp = creatureXP(c.level, partyLevel);
    const p = picked.get(c.name) ?? { ...c, count: 0, xp };
    p.count += 1;
    picked.set(c.name, p);
    left -= xp;
  }
  const creatures = [...picked.values()].sort((a, b) => b.level - a.level);
  const total = creatures.reduce((a, c) => a + c.xp * c.count, 0);
  return { budget, total, difficulty, creatures, partyLevel, partySize };
}

// ---- Rumours --------------------------------------------------------------------------------------------------
export function rumours(D, { region, year, lang = "en", rng = Math.random, count = 3 }) {
  const out = [];
  const now = regionNow(D, region, year, lang);
  if (now?.lines.length) out.push({ kind: "news", text: now.lines[0] });
  const local = (G.REGION_RUMOURS[region] ?? []).filter((r) => year >= r[0] && year <= r[1]).map((r) => r[2 + L(lang)]);
  const period = (G.PERIOD_RUMOURS[periodOf(year)] ?? []).map((r) => r[L(lang)]);
  const pool = [...local.map((text) => ({ kind: "local", text })), ...period.map((text) => ({ kind: "talk", text }))];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  return out;
}

// ---- Treasure -------------------------------------------------------------------------------------------------
// size: "encounter" (an eighth of the level's party treasure) or "hoard" (a third). Values in steel pieces.
export function treasure({ level, size = "encounter", partySize = 4, lang = "en", rng = Math.random, items = [] }) {
  const lv = Math.max(1, Math.min(20, level));
  const total = Math.round((G.PARTY_TREASURE[lv] * (partySize / 4)) / (size === "hoard" ? 3 : 8));
  let coins = Math.round(total * 0.5), left = total - coins;
  const valuables = [];
  for (const list of [G.GEMS, G.ART, G.GEMS]) {
    const can = list.filter(([v]) => v <= left);
    if (!can.length) continue;
    const [v, en, pt] = can.sort((a, b) => b[0] - a[0])[Math.floor(rng() * Math.min(3, can.length))];
    valuables.push({ value: v, text: lang === "pt" ? pt : en });
    left -= v;
  }
  coins += left;
  const can = items.filter((i) => i.level <= lv + 1 && i.level >= lv - 3);
  const item = can.length && rng() < (size === "hoard" ? 0.6 : 0.2) ? pick(rng, can) : null;
  return { total, coins, valuables, item };
}

// ---- Travel and weather ---------------------------------------------------------------------------------------
export function weather(region, season, { lang = "en", rng = Math.random } = {}) {
  const climate = G.REGION_CLIMATE[region] ?? "temperate";
  const w = pick(rng, G.WEATHER[climate][season] ?? G.WEATHER[climate].spring);
  return { climate, season, text: w[L(lang)], effect: w[2 + L(lang)] || "" };
}
export const roadEvent = ({ lang = "en", rng = Math.random } = {}) => pick(rng, G.ROAD)[L(lang)];

// ---- Inns, ships, gnome inventions ----------------------------------------------------------------------------
export function innName({ lang = "en", rng = Math.random } = {}) {
  if (lang === "pt") { const [n, g] = pick(rng, G.INN.pt.noun), a = pick(rng, G.INN.pt.adj); return `${g === "f" ? "A" : "O"} ${n} ${g === "f" ? a[1] : a[0]}`; }
  return G.INN.en.pattern(pick(rng, G.INN.en.adj), pick(rng, G.INN.en.noun));
}
export function inn(D, opts) {
  const { lang = "en", rng = Math.random, region, year } = opts;
  return { name: innName({ lang, rng }), keeper: makePerson(D, { region, lang, rng }), dish: pick(rng, G.DISHES)[L(lang)], rumour: rumours(D, { region, year, lang, rng, count: 1 })[0]?.text ?? "" };
}
export function shipName({ lang = "en", rng = Math.random } = {}) { const S = G.SHIP[lang === "pt" ? "pt" : "en"]; return S.pattern(pick(rng, S.a), pick(rng, S.b)); }
export function invention({ lang = "en", rng = Math.random } = {}) {
  const I = G.INVENTION[lang === "pt" ? "pt" : "en"];
  const name = lang === "pt" ? `${pick(rng, I.thing)} ${pick(rng, I.power)}` : `${pick(rng, I.power)} ${pick(rng, I.thing)}`;
  return { name, use: pick(rng, I.use), flaw: pick(rng, I.flaw) };
}

// The season of a day of the year, from the calendar's seasons.
export function seasonOfDay(seasons, dayOfYear) {
  for (const s of seasons) {
    if (s.dayStart <= s.dayEnd ? dayOfYear >= s.dayStart && dayOfYear <= s.dayEnd : dayOfYear >= s.dayStart || dayOfYear <= s.dayEnd) return s.id;
  }
  return seasons[0]?.id ?? "spring";
}
