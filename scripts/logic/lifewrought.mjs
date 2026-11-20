// Lifewrought inside Foundry, the parts that need no Foundry: replaying a saved life, building the PF2e actor from
// whatever item source is at hand, the Chronicle journal's pages, and the campaign the GM set.
// LW is Lifewrought's engine (lifewrought/engine.js) and D its data (lifewrought/data.json).

// A life is saved as the dice it rolled and the answers given. Replaying them rebuilds the same life, step by step,
// without anyone clicking: every choice comes from the saved answers.
export async function replayLife(LW, D, record) {
  let extraDraws = 0;
  const after = () => { extraDraws++; return Math.random(); };
  const ui = {
    table: async () => {}, number: async () => {}, reveal: async () => {}, stage: async () => {}, outcome: async () => {},
    state: () => {}, now: () => {}, plan: () => {},
    event: async (ctx, options) => {
      if (ctx.replay && options.some((o) => o.id === ctx.replayAnswer)) return ctx.replayAnswer;
      throw new Error(`the saved life ends before "${ctx.title}"`);
    },
  };
  const v = await LW.live(D, { ...record.cfg, saved: record, rng: after }, ui);
  return { v, extraDraws };
}

// A seeded random number generator, so a test life can be lived again exactly.
export function seeded(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// A life lived by nobody, choices at random: for the self-test (does it build here?) and the test fixtures.
// With a way of playing (mode: points, choose or concept) it also spends fate points and picks rows at random.
export async function randomLife(LW, D, { seed = Math.floor(Math.random() * 1e9), year = 351, region = "abanasinia", start = "", mode = "fate", length = "full", concept = null, name = "" } = {}) {
  const pick = seeded(seed * 3 + 1);
  let last = null;
  const table = async (t) => {
    if (t.choose && !t.chosen) return { pick: Math.floor(pick() * t.rows.length) };
    if (t.fate > 0 && pick() < 0.25) return pick() < 0.5 ? { action: "reroll" } : { action: "nudge", dir: pick() < 0.5 ? 1 : -1 };
    return undefined;
  };
  const ui = { table, number: async () => {}, reveal: async () => {}, stage: async () => {}, outcome: async () => {}, state: () => {}, now: () => {}, plan: () => {},
    event: async (c, o) => o[Math.floor(pick() * o.length)].id };
  const v = await LW.live(D, { year, region, start, scope: D.scope.default, recent: [], mode, length, concept, name, rng: seeded(seed), onSave: (r) => { last = r; } }, ui);
  return { v, record: JSON.parse(JSON.stringify({ ...last, done: true, name: v.name.full, stage: "The Road" })) };
}

// The campaign a life is lived in: the GM's settings, with the year from the world's date unless one is fixed.
export function campaignCfg({ yearMode, fixedYear, region, start, scope }, worldYear, D) {
  const ages = (D.ages || []).filter((a) => a.content === "ready" && a.years);
  const min = Math.min(...ages.map((a) => a.years[0])), max = Math.max(...ages.map((a) => a.years[1]));
  const wanted = yearMode === "fixed" ? Number(fixedYear) : worldYear;
  const year = Math.min(max, Math.max(min, Math.round(Number.isFinite(wanted) ? wanted : 381)));
  const regions = D.regions.filter((r) => year >= r.years[0] && year <= r.years[1]);
  const reg = regions.find((r) => r.id === region) ? region : (regions.find((r) => r.id === "abanasinia") || regions[0]).id;
  const sc = D.scope.scopes[scope] ? scope : D.scope.default;
  return { year, region: reg, start: (start || "").trim(), scope: sc, clamped: year !== wanted };
}

// Which people's names the character reads the calendar in (the module's calendar cultures).
const PEOPLE_CULTURE = { kender: "kender", goblin: "goblin", hobgoblin: "goblin", hill_dwarf: "dwarven", mountain_dwarf: "dwarven",
  qualinesti_elf: "elven", silvanesti_elf: "elven", kagonesti_elf: "elven", centaur: "plainsmen" };
const SOLAMNIC_REGIONS = new Set(["solamnia", "kalaman", "sancrist", "neraka", "sanction"]);
export function calendarCultureOf(v) {
  const p = v.ancestry && v.ancestry.id;
  if (PEOPLE_CULTURE[p]) return PEOPLE_CULTURE[p];
  const facts = [...v.facts];
  if (facts.some((f) => /^culture\.(plains|dust|balifor_tribes)$/.test(f))) return "plainsmen";
  if (facts.some((f) => /^culture\.(solamnic|kalaman)$/.test(f))) return "solamnic";
  if (facts.some((f) => /^culture\.(qualinesti|silvanesti|kagonesti)$/.test(f))) return "elven";
  if (facts.some((f) => /^culture\.(thorbardin|hill)$/.test(f))) return "dwarven";
  const region = facts.find((f) => f.startsWith("region."));
  if (region && SOLAMNIC_REGIONS.has(region.slice(7))) return "solamnic";
  return "ergothian";
}

// The PF2e actor, from item sources fetched by UUID (Foundry's compendiums in play, Lifewrought's item files in tests).
// Lifewrought asks for items as it builds; each round fetches the ones it asked for, until it asks for nothing new.
export async function buildActorData(LW, v, D, fetchItem, { rounds = 5 } = {}) {
  const f = LW.buildSheet(v, D);
  const have = {}, missing = new Set();
  let data = null;
  for (let round = 0; round < rounds; round++) {
    const asked = new Set();
    const items = new Proxy(have, { get: (t, k) => { if (typeof k === "string" && !(k in t)) asked.add(k); return t[k]; } });
    try { data = LW.foundryActor(v, D, f, items); } catch (e) { data = null; }
    const fresh = [...asked].filter((u) => !missing.has(u));
    if (!fresh.length) break;
    for (const u of fresh) {
      const src = await fetchItem(u);
      if (src) have[u] = src; else missing.add(u);
    }
  }
  if (!data) throw new Error(`the character could not be built; missing items: ${[...missing].join(", ") || "none"}`);
  data.items = (data.items || []).filter(Boolean);
  return { data, sheet: f, missing: [...missing] };
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const para = (lines) => lines.filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join("");
const list = (lines) => (lines.length ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "");

// The Chronicle of a life: pages for the backstory, the years, the people, and the GM's threads.
// Titles come in as already-translated strings (the module passes them from its language files).
export function chroniclePages(LW, v, D, titles) {
  const sd = LW.sheetData(v, D), b = sd.biography, P = b.personality, C = b.campaign;
  const backstory = `<h2>${esc(sd.header.name)}</h2>${para([LW.summaryText(v, D)])}${para(b.backstory)}`
    + `<h3>${esc(titles.personality)}</h3>${list([P.attitude && `${titles.attitude}: ${P.attitude}`, P.beliefs && `${titles.beliefs}: ${P.beliefs}`,
      P.edicts.length && `${titles.edicts}: ${P.edicts.join("; ")}`, P.anathema.length && `${titles.anathema}: ${P.anathema.join("; ")}`,
      P.likes && `${titles.likes}: ${P.likes}`, P.dislikes && `${titles.dislikes}: ${P.dislikes}`, P.catchphrases && `${titles.catchphrase}: ${P.catchphrases}`].filter(Boolean))}`
    + `<h3>${esc(titles.appearance)}</h3>${para([b.appearance, `${b.height}, ${b.weight}`, b.wounds.length && `${titles.wounds}: ${b.wounds.join(", ")}`])}`;
  const years = `<h2>${esc(titles.years)}</h2>` + b.years.map((r) => `<h3>${esc(`${r.year} AC · ${titles.age} ${r.age}`)}: ${esc(r.title)}</h3><p>${esc(r.outcome)}</p>`).join("");
  const people = v.ties.filter((t) => t.roles.length);
  const peopleHtml = `<h2>${esc(titles.people)}</h2>` + (people.length ? `<ul>${people.map((t) => `<li><strong>${esc(t.name)}</strong>${t.label ? `, ${esc(t.label)}` : ""}: ${esc(t.roles.map((r) => r.replace(/_/g, " ")).join(", "))}</li>`).join("")}</ul>` : `<p>${esc(titles.nobody)}</p>`);
  const campaign = `<h2>${esc(titles.campaign)}</h2>${list(C.notes.filter((n) => !/^Secrets \(for the GM\)/.test(n)))}`
    + (C.allies.length ? `<h3>${esc(titles.allies)}</h3>${list(C.allies)}` : "")
    + (C.enemies.length ? `<h3>${esc(titles.enemies)}</h3>${list(C.enemies)}` : "")
    + (C.organizations.length ? `<h3>${esc(titles.organizations)}</h3>${list(C.organizations)}` : "");
  // For the GM: the threads a life leaves, to pull in play. The player lived them; this page is the GM's to annotate.
  const secrets = C.notes.filter((n) => /^Secrets \(for the GM\)/.test(n)).map((n) => n.replace(/^Secrets \(for the GM\):\s*/, ""));
  const gm = `<h2>${esc(titles.threads)}</h2><p>${esc(titles.threadsHint)}</p>`
    + list([...secrets.map((s) => `${titles.secrets}: ${s}`), ...C.enemies.map((e) => `${titles.enemy}: ${e}`),
      ...C.notes.filter((n) => /^(Bonds and debts|Why you adventure):/.test(n))]);
  return [
    { name: titles.backstoryPage, html: backstory, gmOnly: false },
    { name: titles.yearsPage, html: years, gmOnly: false },
    { name: titles.peoplePage, html: peopleHtml, gmOnly: false },
    { name: titles.campaignPage, html: campaign, gmOnly: false },
    { name: titles.gmPage, html: gm, gmOnly: true },
  ];
}

// The people met in a life, as simple NPC entries.
export function peopleOf(v) {
  return v.ties.filter((t) => t.roles.length).map((t) => ({ name: t.name, roles: t.roles.map((r) => r.replace(/_/g, " ")), label: t.label || "", gender: t.gender || "" }));
}
