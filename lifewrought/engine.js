// Lifewrought engine (v0.4). One engine for the page and for the simulation tools. No AI, no network.
// LW.live(D, cfg, ui) plays a whole life; "ui" decides how tables are shown and how choices are made.
const LW = (() => {
  const ATTR = ["str", "dex", "con", "int", "wis", "cha"];
  const DOMAIN_NAMES = { arms: "Arms", craft: "Craft", wild: "Wild", street: "Street", faith: "Faith", arcane: "Arcane",
    court: "Court", sea: "Sea", stage: "Stage", healing: "Healing", learning: "Learning", trade: "Trade",
    vigor: "Vigor", agility: "Agility", intellect: "Intellect", instinct: "Instinct", presence: "Presence" };
  const STAGE_NAMES = { origin: "Origin", childhood: "Childhood", youth: "Youth", training: "Training",
    long_years: "The Long Years", old_road: "The Old Road", settled: "Settled Years", threshold: "Threshold", calling: "Calling", becoming: "Who You Became", road: "The Road", sheet: "The Character" };
  const ORIGIN_GROUPS = { birth_region: "Where", birthplace: "Where", ancestry: "Who", age: "Who", sex: "Who", birth: "Who",
    family: "Family", parents: "Family", siblings: "Family", war_legacy: "Family", naming: "Name",
    skin: "Looks", hair: "Looks", eyes: "Looks", feature: "Looks", trait: "Looks", inclination: "Nature" };
  const ORIGIN_STEPS = ["Where", "Who", "Family", "Name", "Looks", "Nature"];
  const LOOKS = new Set(["skin", "hair", "eyes", "feature", "trait"]);
  const MARK_WORDS = { tall_for_their_people: "your height", small_for_their_people: "being small for your people",
    strong_frame: "your strong frame", slight_frame: "your slight frame", knows_who_they_are: "knowing who you are" };
  const an = (w) => (/^[aeiou]/i.test(w) ? "an " : "a ") + w;
  const human = (s) => String(s).replace(/^motive_/, "").replace(/^path_/, "").replace(/_/g, " ");

  // ---------------- dice ----------------
  function defaultRng() {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint32Array(1);
      return () => { crypto.getRandomValues(buf); return buf[0] / 4294967296; };
    }
    return Math.random;
  }
  // Weights -> whole bands on a d100 (largest remainders). Every line that can happen gets at least 1%, so a line
  // rarer than that is rounded up (v0.14). Only a table with more than 100 possible lines uses a d1000.
  function bands(weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    const size = weights.filter((w) => w > 0).length > 100 ? 1000 : 100;
    const raw = weights.map((w) => (size * w) / total);
    const pct = raw.map((r, i) => (weights[i] > 0 ? Math.max(1, Math.floor(r)) : 0));
    let gap = size - pct.reduce((s, p) => s + p, 0);
    const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
    for (let k = 0; gap !== 0 && k < 1000; k++) {
      const i = order[k % order.length];
      if (weights[i] > 0 && (gap > 0 || pct[i] > 1)) { pct[i] += Math.sign(gap); gap -= Math.sign(gap); }
    }
    let lo = 1;
    return pct.map((p) => { const r = p > 0 ? [lo, lo + p - 1] : null; lo += p; return { pct: +((100 * p) / size).toFixed(1), range: r, size }; });
  }

  // ---------------- state ----------------
  function newLife(rng) {
    return {
      rng, facts: new Set(), marks: new Set(), domains: {}, ties: [], used: new Set(), log: [], origin: [],
      historyCount: 0, luck: {}, appearance: {}, personality: {}, siblings: [],
      d100() { return Math.floor(this.rng() * 100) + 1; },
      int(a, b) { return a + Math.floor(this.rng() * (b - a + 1)); },
      pick(list) { return list[Math.floor(this.rng() * list.length)]; },
      dom(d) { return this.domains[d] || 0; },
    };
  }
  function attachTracking(v, ui, cfg) {
    const saved = cfg.saved || { draws: [], answers: [] };
    const rec = { cfg: { year: cfg.year, region: cfg.region, start: cfg.start, recent: cfg.recent || [], scope: cfg.scope, mode: cfg.mode || "fate", length: cfg.length || "full", concept: cfg.concept || null, name: cfg.name || "" }, draws: [], answers: [] };
    const base = cfg.rng || defaultRng();
    let di = 0, ai = 0;
    v.rng = () => { const x = di < saved.draws.length ? saved.draws[di] : base(); di++; rec.draws.push(x); return x; };
    v.seen = () => di <= saved.draws.length && saved.draws.length > 0;
    v.savedAnswer = () => (ai < saved.answers.length ? saved.answers[ai] : null);
    v.answer = (a) => { rec.answers.push(a); ai++; };
    v.save = () => { if (cfg.onSave) cfg.onSave(rec, v); };
    v.at = { stage: "origin", step: "Ancestry", index: 0, total: 0 };
    v.nowInfo = () => ({ ...v.at, year: v.curYear ?? null, age: v.curAge ?? null, born: v.born ?? null, fate: v.mode === "points" ? v.fate : v.mode === "free" ? "free" : null });
    v.now = (patch) => { Object.assign(v.at, patch); ui.now && ui.now(v.nowInfo()); };
  }

  // The ages of Krynn the content can test: era.despair (to 347), era.war (348-352), era.after (353-382),
  // era.chaos (383), era.mortals (384-420, the gods gone), era.souls (421 on, the gods back).
  const ERAS = [["despair", -Infinity, 347], ["war", 348, 352], ["after", 353, 382], ["chaos", 383, 383], ["mortals", 384, 420], ["souls", 421, Infinity]];
  const ERA_WORDS = { despair: "the Age of Despair", war: "the War of the Lance", after: "the years after the war", chaos: "the Summer of Chaos",
    mortals: "the Age of Mortals, with the gods gone", souls: "the gods' return" };
  function eraOf(year) { const e = ERAS.find(([, a, b]) => year >= a && year <= b); return e ? e[0] : "after"; }
  function holds(v, c, year) {
    c = String(c).trim();
    if (c.startsWith("era.")) return eraOf(year ?? v.curYear ?? v.year) === c.slice(4);
    let m = c.match(/^domain\.([a-z_]+)>=(\d+)$/);
    if (m) return v.dom(m[1]) >= +m[2];
    m = c.match(/^year(>=|<=)(\d+)$/);
    if (m) return m[1] === ">=" ? year >= +m[2] : year <= +m[2];
    m = c.match(/^age(>=|<=)(\d+)$/);
    if (m) { const age = (year ?? v.curYear ?? v.year) - v.born; return m[1] === ">=" ? age >= +m[2] : age <= +m[2]; }
    m = c.match(/^born(>|<)(\d+)$/);
    if (m) return m[1] === ">" ? v.born > +m[2] : v.born < +m[2];
    if (c.startsWith("mark.")) return v.marks.has(c.slice(5));
    return v.facts.has(c);
  }
  function requiresOk(v, r, year) {
    r = r || {};
    return (r.all || []).every((c) => holds(v, c, year))
      && (!(r.any && r.any.length) || r.any.some((c) => holds(v, c, year)))
      && !(r.none || []).some((c) => holds(v, c, year));
  }
  // Plain-language reason for a condition, shown to the player next to the numbers it changed.
  function describe(v, D, c) {
    c = String(c);
    let m = c.match(/^domain\.([a-z_]+)>=(\d+)$/);
    if (m) return `your ${DOMAIN_NAMES[m[1]]} ${v.dom(m[1])}`;
    if (c.startsWith("era.")) return ERA_WORDS[c.slice(4)] || human(c.slice(4));
    m = c.match(/^year(>=|<=)(\d+)$/);
    if (m) return m[1] === ">=" ? `after ${m[2]} AC` : `up to ${m[2]} AC`;
    if (c === "mark.stands_out") return v.appearance.rare && v.appearance.rare.length ? `your ${v.appearance.rare[0].text}` : "the way you look";
    if (MARK_WORDS[c.slice(5)]) return MARK_WORDS[c.slice(5)];
    if (c.startsWith("mark.")) return human(c.slice(5));
    m = c.match(/^place\.(.+)$/);
    if (m) return `living in ${(D.origin.places[m[1]] || {}).name || human(m[1])}`;
    m = c.match(/^(people|culture|status|family|kin|region|clan)\.(.+)$/);
    if (m) return { people: "being ", culture: "your ", status: "your family being ", family: "a family of ", kin: "", region: "living in ", clan: "Clan " }[m[1]] + (m[1] === "clan" ? m[2][0].toUpperCase() + m[2].slice(1) : human(m[2])) + (m[1] === "culture" ? " upbringing" : "");
    return human(c);
  }

  // ---------------- names and people ----------------
  // Name stock entries are "Name|meaning|kind"; plain strings also work.
  function parseName(x) { const [name, means, kind] = String(x).split("|"); return { name, means: means || "", kind: kind || "any" }; }
  // The culture someone grew up in (content/origin.yaml "cultures") decides names and looks;
  // a clan inside it can narrow both. Peoples whose ways don't depend on the place set their own.
  function cultureId(v, D) {
    const C = D.origin.cultures || {};
    const f = [...v.facts].find((x) => x.startsWith("culture.") && C[x.slice(8)]);
    return f ? f.slice(8) : null;
  }
  function clanOf(v, D) {
    const c = (D.origin.cultures || {})[cultureId(v, D)] || {};
    const f = [...v.facts].find((x) => x.startsWith("clan."));
    return f && c.clans ? c.clans[f.slice(5)] || null : null;
  }
  function stockKey(v, D) {
    const A = D.origin.ancestries[v.ancestry.id] || {}, c = (D.origin.cultures || {})[cultureId(v, D)] || {}, k = clanOf(v, D) || {};
    return k.names || c.names || A.names || v.ancestry.id;
  }
  function nameStock(v, D) { return D.origin.names[stockKey(v, D)] || D.origin.names.townsfolk; }
  function givenList(stock, sex, npc) {
    const f = [...stock.female, ...(npc ? stock.npc_female || [] : [])], m = [...stock.male, ...(npc ? stock.npc_male || [] : [])];
    if (sex === "female") return f;
    if (sex === "male") return m;
    return [...f, ...m];
  }
  function drawName(v, stock, sex, kind, avoid, npc) {
    const all = givenList(stock, sex, npc).map(parseName).filter((n) => !(avoid || []).includes(n.name));
    const fit = kind && kind !== "any" ? all.filter((n) => n.kind === kind) : all;
    return v.pick(fit.length ? fit : all);
  }
  // ---------------- the people in a life ----------------
  // Every NPC is someone: a people, a culture, a gender and pronouns. Family comes from the character's own culture;
  // everyone else, by default, from the place the character lives in now. Names never repeat within a life
  // and avoid the names of the last lives. Romantic roles follow the character's gender and orientation.
  const FAMILY_IDS = /^(sibling\d*|parent|mother|father|grandparent|relative|cousin|child|aunt|uncle)$/;
  const ROMANTIC_IDS = /^(love|spouse|conjuge|old_love|partner|lover|beloved|betrothed|sweetheart)$/;
  const PRONOUNS = { woman: ["she", "her", "her"], man: ["he", "him", "his"], nonbinary: ["they", "them", "their"] };
  function partnerGender(v) {
    const own = v.gender || (v.raisedAs === "female" ? "woman" : "man"), r = v.rng();
    const f = v.facts;
    if (f.has("drawn.enby")) return "nonbinary";
    if (f.has("drawn.both") || f.has("drawn.unsure") || f.has("drawn.none")) return r < 0.45 ? "woman" : r < 0.9 ? "man" : "nonbinary";
    if (r < 0.05) return "nonbinary";
    if (f.has("drawn.women")) return "woman";
    if (f.has("drawn.men")) return "man";
    if (own === "nonbinary") return r < 0.5 ? "woman" : "man";
    if (f.has("drawn.same")) return own;
    return own === "woman" ? "man" : "woman";
  }
  // Which people, culture and name stock an NPC of a given people has, in a given place.
  function npcOrigin(D, pid, place) {
    const O = D.origin, A = O.ancestries[pid] || {}, p = O.places[place] || {};
    const human = p.culture || (O.birth_regions[p.region] || {}).culture || "townsfolk";
    let c = null;
    if ((p.people_culture || {})[pid]) c = p.people_culture[pid];
    else if (pid === "human") c = human;
    else if (pid === "half_elf") c = p.elven ? (p.elven === true ? "qualinesti" : p.elven) : human;
    else if (pid === "mountain_dwarf") c = p.dwarves || "thorbardin";
    else { const f = (A.facts || []).find((x) => x.startsWith("culture.")); if (f) c = f.slice(8); }
    const C = (O.cultures || {})[c] || {};
    const key = (C.people && C.people !== pid ? null : C.names) || A.names || (pid === "half_elf" || pid === "human" ? C.names : null) || pid;
    const stock = O.names[key] || O.names[C.names] || O.names.townsfolk;
    const label = pid === "human" || C.people === pid ? C.text || A.text : pid === "half_elf" ? A.text : A.text || C.text;
    return { stock, label: label || "" };
  }
  function recentNames(v) { return new Set((v.recent || []).flat().filter((x) => String(x).startsWith("name:")).map((x) => x.slice(5))); }
  function tieFor(v, D, id, spec) {
    let t = v.ties.find((x) => x.id === id);
    if (t) return t;
    spec = { ...((v.npcSpec || {})[id] || {}), ...(spec || {}) };
    const own = spec.origin === "own" || (!spec.origin && FAMILY_IDS.test(id));
    let gender = spec.gender && spec.gender !== "love" ? spec.gender : null;
    if (!gender) gender = ROMANTIC_IDS.test(id) || spec.gender === "love" ? partnerGender(v) : (() => { const r = v.rng(); return r < 0.495 ? "woman" : r < 0.99 ? "man" : "nonbinary"; })();
    const sex = gender === "woman" ? "female" : gender === "man" ? "male" : "any";
    let stock, label = "", people = v.ancestry ? v.ancestry.id : "human";
    if (own) stock = nameStock(v, D);
    else {
      const here = D.origin.places[v.place] || {};
      let peoples = spec.people && spec.people !== "other" ? { [spec.people]: 1 } : here.people || { human: 1 };
      if (spec.people === "other") { // someone of another people than the character's own
        const mine = v.ancestry ? v.ancestry.id : "human";
        const rest = Object.fromEntries(Object.entries(peoples).filter(([k]) => k !== mine));
        peoples = Object.keys(rest).length ? rest : Object.fromEntries(["human", "half_elf", "qualinesti_elf", "hill_dwarf", "kender"].filter((k) => k !== mine).map((k) => [k, 1]));
      }
      const ids = Object.keys(peoples), total = ids.reduce((a, k) => a + peoples[k], 0);
      let x = v.rng() * total; people = ids[ids.length - 1];
      for (const k of ids) { x -= peoples[k]; if (x < 0) { people = k; break; } }
      const o = npcOrigin(D, people, spec.culture_place || v.place);
      if (spec.culture && (D.origin.cultures || {})[spec.culture]) { const C = D.origin.cultures[spec.culture]; stock = D.origin.names[C.names] || o.stock; label = C.text || o.label; }
      else { stock = o.stock; label = o.label; }
      if (label === v.cultureLabel || label === (v.ancestry && v.ancestry.text)) label = "";
    }
    const taken = new Set(v.ties.map((x) => x.name).concat([v.name && v.name.given], [...(v.siblings || []).map((x) => x.name)]));
    const avoid = [...taken, ...recentNames(v)];
    // Fresh names first; if the stock runs out, allow names from earlier lives, then any name at all.
    let n = drawName(v, stock, sex, null, avoid, true) || drawName(v, stock, sex, null, [...taken], true) || drawName(v, stock, "any", null, [...taken], true) || drawName(v, stock, sex, null, [], true);
    let name = n.name;
    t = { id, name, sex: sex === "any" ? (v.rng() < 0.5 ? "female" : "male") : sex, gender, people, label, roles: [] };
    v.ties.push(t);
    if (v.used) v.used.add("name:" + name);
    return t;
  }
  function makeName(v, D, sex) { return drawName(v, nameStock(v, D), sex).name; }
  // Who the character is drawn to can be found out through a life: setting one drawn.* fact replaces the others.
  const DRAWN_TEXT = { other: null, same: null, both: "More than one gender", none: "Nobody, not in that way", unsure: "You won't know for years" };
  function setDrawn(v, which) {
    for (const f of [...v.facts]) if (f.startsWith("drawn.")) v.facts.delete(f);
    const g = v.gender || "man";
    v.facts.add("drawn." + which);
    if (which === "other" && g !== "nonbinary") v.facts.add(g === "woman" ? "drawn.men" : "drawn.women");
    if (which === "same" && g !== "nonbinary") v.facts.add(g === "woman" ? "drawn.women" : "drawn.men");
    if (which === "women" || which === "men") { if (g !== "nonbinary") v.facts.add((g === "woman") === (which === "women") ? "drawn.same" : "drawn.other"); }
    const text = { women: "Women", men: "Men", other: g === "woman" ? "Men" : "Women", same: g === "woman" ? "Women" : "Men", enby: "Other nonbinary people" }[which] || DRAWN_TEXT[which];
    const o = v.origin.find((x) => x.title === "Drawn to");
    if (o && text) o.text = text + " (found out later in life)";
  }
  // Adults only: romance needs the character to be of age (18, and their people's own age of adulthood) and to know who they are drawn to.
  function ofAge(v, D, year) {
    const st = D.origin.stages[peopleKey(v, D)] || {};
    return year - v.born >= Math.max(18, st.romance_age || 18);
  }
  function romanceOk(v, D, e, year) {
    if (!e.romance) return true;
    if (!ofAge(v, D, year)) return false;
    if (![...v.facts].some((f) => f.startsWith("drawn."))) return false;
    return e.romance === "all" || !v.facts.has("drawn.none");
  }
  function fill(v, D, s) {
    return String(s || "").replace(/\s+/g, " ").trim().replace(/\{([a-z_]+)\.(name|they|them|their|They|Their)\}/g, (_, id, w) => {
      const t = tieFor(v, D, id);
      if (w === "name") return t.name;
      const p = PRONOUNS[t.gender] || PRONOUNS.nonbinary, k = { they: 0, them: 1, their: 2 }[w.toLowerCase()];
      return w[0] === "T" ? p[k][0].toUpperCase() + p[k].slice(1) : p[k];
    });
  }

  function setPlace(v, D, id) {
    const P = D.origin.places;
    const R = D.origin.random_places || {};
    if (id === "random_abanasinia") id = v.pick(["haven", "solace", "gateway", "new_ports", "crossing", "countryside"]);
    else if (id === "random_city") id = v.pick(["haven", "solace", "gateway", "new_ports", "crossing"]);
    else if (id === "random_home") id = v.pick((R[regionNow(v)] || R.abanasinia).home);
    else if (id === "random_home_city") id = v.pick((R[regionNow(v)] || R.abanasinia).cities);
    [...v.facts].filter((f) => f.startsWith("place.") || f.startsWith("region.")).forEach((f) => v.facts.delete(f));
    v.place = id;
    v.facts.add("place." + id);
    // The kind of place you live in (town, coast, plains, mountain, forest, cold), for events that fit some homes only.
    [...v.facts].filter((f) => f.startsWith("setting.")).forEach((f) => v.facts.delete(f));
    v.facts.add("setting." + ((P[id] || {}).kind || "town"));
    v.facts.add("region." + ((P[id] || {}).region || "abanasinia"));
  }

  function apply(v, D, e) {
    e = e || {};
    const got = { domains: {}, marks: [], ties: [] };
    for (const [d, n] of Object.entries(e.domains || {})) { v.domains[d] = v.dom(d) + n; got.domains[d] = n; }
    for (const m of e.marks || e.add || []) { if (!v.marks.has(m)) got.marks.push(m); v.marks.add(m); }
    for (const x of e.marks_if || []) if (holds(v, x.if, v.born)) for (const m of x.marks) { if (!v.marks.has(m)) got.marks.push(m); v.marks.add(m); }
    for (const m of e.remove || []) v.marks.delete(m);
    for (const f of e.facts || []) { if (f.startsWith("drawn.")) setDrawn(v, f.slice(6)); else v.facts.add(f); }
    for (const t of e.ties || []) {
      const tie = tieFor(v, D, t.id, t);
      if (!tie.roles.includes(t.role)) { tie.roles.push(t.role); got.ties.push({ name: tie.name, role: t.role }); }
    }
    if (e.place) setPlace(v, D, e.place);
    if (e.move) setPlace(v, D, e.move);
    if (e.siblings) {
      for (let i = 0; i < e.siblings; i++) {
        const id = i === 0 ? "sibling" : "sibling" + (i + 1);
        const t = tieFor(v, D, id);
        t.roles.push(v.rng() < 0.5 ? "older sibling" : "younger sibling");
        v.siblings.push(t);
      }
      v.facts.add("kin.siblings");
    }
    if (e.twin) { const t = tieFor(v, D, "twin"); t.roles.push("twin"); v.facts.add("kin.siblings"); if (!v.siblings.length) { t.id = "sibling"; } v.siblings.push(t); }
    return got;
  }

  // ---------------- visible tables ----------------
  function weightOf(v, D, row, year) {
    let w = row.w ?? row.base_chance ?? 0;
    const why = [...(row.fixedWhy || [])];
    for (const m of row.mods || []) {
      if (!holds(v, m.if, year)) continue;
      const before = w;
      if (m.times !== undefined) w *= m.times;
      if (m.add !== undefined) w += m.add;
      if (w !== before) why.push({ text: m.why || describe(v, D, m.if), up: w > before });
    }
    return { w: Math.max(0, w), why };
  }
  // A visible roll on a table. The ways of playing (cfg.mode) change what the player may do with it:
  // - "fate" (pure fate): the roll stands.
  // - "points": three fate points a life; on any table but an event's outcome, one point rerolls it (the new result
  //   stands) or nudges it one row up or down.
  // - "choose": on the character tables (info.character), the player picks one of the rows the life offers.
  // What the player did is kept in the life's answers, so the same life always replays to the same result.
  async function rollTable(v, D, ui, info, rows, year) {
    const all = rows;
    rows = rows.filter((r) => requiresOk(v, r.requires, year));
    if (!rows.length) rows = all.filter((r) => !r.requires);
    if (!rows.length) rows = all;
    if (info.only) { const only = rows.filter((r) => r.id === info.only); if (only.length) rows = only; }
    const ws = rows.map((r) => weightOf(v, D, r, year));
    const fx = bands(ws.map((x) => x.w));
    const size = fx[0].size;
    const rep = v.seen();
    const at = (n) => fx.findIndex((f) => f.range && n >= f.range[0] && n <= f.range[1]);
    const card = (n, idx, extra = {}) => ui.table({ ...info, die: size, rows: rows.map((r, i) => ({ text: fill(v, D, r.text), note: r.note || (typeof r.why === "string" ? r.why : "") || "", why: ws[i].why, ...fx[i] })),
      rolled: n, idx, replay: rep || extra.replay, result: idx >= 0 && info.result ? info.result(rows[idx], fx[idx]) : null, now: v.nowInfo(), auto: !!info.auto && v.length === "quick", ...extra });
    const choose = v.mode === "choose" && info.character && rows.length > 1;
    const points = (v.mode === "points" || v.mode === "free") && info.kind !== "outcome" && rows.length > 1;
    const prior = choose || points ? v.savedAnswer() : null;
    const saved = Array.isArray(prior) ? prior : null;
    let n = null, idx = -1;
    const acts = [];
    if (choose) {
      // The player picks; no die is rolled. The card knows every row's result, to show the one picked.
      const results = info.result ? rows.map((r, i) => info.result(r, fx[i])) : null;
      let pick = saved && saved[0] ? saved[0].pick : undefined;
      if (pick === undefined) { const a = await card(null, -1, { choose: true, results }); pick = a && Number.isInteger(a.pick) ? a.pick : 0; }
      else await card(null, Math.max(0, Math.min(rows.length - 1, pick)), { choose: true, chosen: true, results });
      idx = Math.max(0, Math.min(rows.length - 1, pick));
      acts.push({ pick: idx });
    } else {
      n = v.int(1, size); idx = at(n);
      if (points) {
        for (let k = 0; ; k++) {
          const left = v.mode === "free" ? Infinity : v.fate;
          let a;
          const again = k ? acts[k - 1].action : null;
          if (saved) { a = saved[k]; await card(n, idx, { fate: left, again, replay: true, final: !a || !a.action || a.action === "keep" }); }
          else a = left > 0 ? await card(n, idx, { fate: left, again }) : (await card(n, idx, { fate: 0, again }), null);
          if (!a || !a.action || a.action === "keep" || left <= 0 || k >= 200) { acts.push({ action: "keep" }); break; }
          if (v.mode !== "free") v.fate--;
          acts.push(a);
          if (a.action === "reroll") { n = v.int(1, size); idx = at(n); }
          else if (a.action === "nudge") {
            let j = idx;
            do { j += a.dir > 0 ? 1 : -1; } while (j >= 0 && j < fx.length && !fx[j].range);
            if (j >= 0 && j < fx.length) { idx = j; n = fx[j].range[0]; }
          }
        }
      } else await card(n, idx);
    }
    if (choose || points) v.answer(acts);
    v.lastPct = fx[idx].pct;
    v.save();
    return rows[idx];
  }

  // Regional versions of a table follow the region where the character is growing up.
  function regionNow(v) {
    const f = [...v.facts].find((x) => x.startsWith("region."));
    return f ? f.slice(7) : v.campaign;
  }
  function tableFor(v, D, name) {
    const t = D.origin.tables[name];
    const o = (t.regions || {})[regionNow(v)];
    return o ? { ...t, ...o } : t;
  }
  function tableRows(v, D, name) {
    const t = tableFor(v, D, name);
    const key = !t.by ? null : looksKeys(v, D).find((k) => t.by[k] || D.origin.tables[name].by[k]);
    const rows = !t.by ? t.rows : (key && (t.by[key] || D.origin.tables[name].by[key])) || t.rows;
    return [...rows, ...(t.extra_rows || [])];
  }
  // Looks, most particular first: the people's own (half-elves look half-elven anywhere), the clan, the culture.
  function looksKeys(v, D) {
    const A = D.origin.ancestries[v.ancestry.id] || {}, c = (D.origin.cultures || {})[cultureId(v, D)] || {}, k = clanOf(v, D) || {};
    return [A.looks, k.looks, c.looks, v.ancestry.id].filter(Boolean);
  }
  function peopleKey(v, D) {
    const A = D && D.origin.ancestries[v.ancestry.id];
    if (A && A.kin) return A.kin;
    return { human: "human", half_elf: "half_elf", qualinesti_elf: "elf", kagonesti_elf: "elf", silvanesti_elf: "elf", hill_dwarf: "dwarf", mountain_dwarf: "dwarf" }[v.ancestry.id] || v.ancestry.id;
  }


  // ---------------- level 1: what the life chose ----------------
  // Words in a rules text that a life's domains pull towards.
  const KEYWORDS = {
    arms: /\b(weapon|strike|attack|shield|armou?r|melee|blade|sword|axe|combat|battle|fight)/gi,
    craft: /\b(craft|repair|forge|tool|build|smith|alchem|invent|construct)/gi,
    wild: /\b(animal|beast|nature|forest|plant|wild|track|survival|terrain|primal)/gi,
    street: /\b(thie|steal|hid|sneak|stealth|lock|trick|decep|feint|ambush)/gi,
    faith: /\b(deity|divine|holy|sanctif|prayer|faith|god|religion|blessing)/gi,
    arcane: /\b(magic|spell|arcane|occult|rune|cantrip|eldritch)/gi,
    court: /\b(noble|society|diplomacy|leader|ally|allies|command|banner)/gi,
    sea: /\b(water|swim|aquatic|sea|boat|ship|tide)/gi,
    stage: /\b(perform|music|song|inspir|audience|composition)/gi,
    healing: /\b(heal|medicine|wound|cure|recover|vitality|restor)/gi,
    learning: /\b(knowledge|recall|lore|study|research|investigat|scholar)/gi,
    trade: /\b(trade|bargain|merchant|coin|gold|price)/gi,
    vigor: /\b(fortitude|endur|tough|hit points|resilien|poison|disease)/gi,
    agility: /\b(reflex|acrobat|speed|dodge|quick|nimble|climb)/gi,
    intellect: /\b(intelligence|clever|analy|deduc|calculat)/gi,
    instinct: /\b(perception|senses|notice|initiative|instinct|darkvision|scent)/gi,
    presence: /\b(charisma|persua|intimidat|demorali|confiden)/gi,
  };
  function textFit(v, t) {
    const parts = [];
    for (const [d, re] of Object.entries(KEYWORDS)) {
      const hits = Math.min(2, (String(t).match(re) || []).length);
      if (hits && v.dom(d) > 0) parts.push([hits * v.dom(d), `your ${DOMAIN_NAMES[d]} ${v.dom(d)}`]);
    }
    return { s: parts.reduce((a, x) => a + x[0], 0), why: parts.sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, w]) => ({ text: w, up: true })) };
  }
  const firstSentence = (t) => { const m = String(t || "").match(/^.{20,160}?[.!?](\s|$)/); return m ? m[0].trim() : String(t || "").slice(0, 140); };
  // The options this life fits best, weighted by how well (never zero, so the dice keep a say).
  function fitRows(v, options, n, extra) {
    return options.map((o) => {
      const f = textFit(v, `${o.name} ${o.text || ""}`), x = extra ? extra(o) : { s: 0, why: [] };
      return { o, s: f.s + x.s, why: [...x.why, ...f.why].slice(0, 3) };
    }).sort((a, b) => b.s - a.s).slice(0, n)
      .map(({ o, s, why }) => ({ id: o.uuid || o.value || o.id, w: Math.max(1, Math.round(s)), text: o.name, note: firstSentence(o.text), fixedWhy: why, opt: o }));
  }
  function pfAncestry(v, D) { return D.adapter.ancestries[v.ancestry.id].ancestry; }
  const PLACE_KIND = { forest: ["qualinost", "qualinesti", "gateway", "darken_wood", "wilds", "solace"], mountain: ["thorbardin", "hills", "kayolin", "garnet"],
    coast: ["new_ports", "crossing", "ankatavaka", "coastlund", "caergoth", "palanthas"], plains: ["que_shu", "que_kiri", "que_teh", "trail", "countryside", "solamnic_farm", "vingaard"] };
  const KIND_WORDS = { forest: /woodland|wildwood|forest|tree|whisper/i, mountain: /cavern|rock|stone|mountain|forge|ancient|underground|iron/i, coast: /aquatic|water|swim|sea|wellspring/i,
    plains: /fleet|roaming|plains|runner|ponygait|nomadic|hillock/i, cold: /arctic|cold|ice|snow|frost/i, town: /hillock|seer|versatile|skilled/i };
  async function heritageStep(v, D, ui) {
    const map = D.adapter.ancestries[v.ancestry.id];
    v.l1 = v.l1 || {};
    if (map.heritage) { v.l1.heritage = { uuid: D.rules.heritages[map.heritage].uuid, name: D.rules.heritages[map.heritage].name }; return; }
    const bp = D.origin.places[v.birthplace] || {};
    const kind = bp.kind || Object.keys(PLACE_KIND).find((k) => PLACE_KIND[k].includes(v.birthplace));
    const where = bp.name;
    const rows = D.build.heritages[pfAncestry(v, D)].map((h) => {
      const fits = kind && KIND_WORDS[kind] && KIND_WORDS[kind].test(`${h.name} ${h.text}`);
      const pref = (map.prefer || {})[h.name];
      const why = [...(fits ? [{ text: `born in ${where}`, up: true }] : []), ...(pref ? [{ text: pref[1], up: true }] : [])];
      return { id: h.uuid, w: (fits ? 30 : 10) * (pref ? pref[0] : 1), text: h.name, note: firstSentence(h.text), fixedWhy: why, opt: h };
    });
    const row = await rollTable(v, D, ui, { character: true, kind: "origin", title: "Heritage", ask: "Which line of your people do you come from? Where you were born tips the odds.",
      result: (r) => ({ label: "Heritage", text: r.text, sub: r.note, changes: [] }) }, rows, v.born);
    v.l1.heritage = { uuid: row.id, name: row.text };
    v.origin.push({ title: "Heritage", text: row.text });
  }
  // Prerequisites the engine can check: "trained in X". Anything else rules the feat out.
  function prereqOk(f, trained) {
    return (f.prereq || []).every((p) => { const m = String(p).match(/^trained in (\w+)/i); return m && trained.includes(m[1].toLowerCase()); });
  }
  async function ancestryFeatStep(v, D, ui) {
    v.l1 = v.l1 || {};
    const pool = D.build.ancestry_feats[pfAncestry(v, D)].filter((f) => !(f.prereq || []).length);
    const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "A gift of your people", ask: "Growing up, which of your people's ways did you take to? (Ancestry feat)",
      result: (r) => ({ label: "Ancestry feat", text: r.text, sub: r.note, changes: [] }) }, fitRows(v, pool, 5), v.curYear);
    v.l1.ancestryFeat = { uuid: row.id, name: row.text };
  }
  function deityFit(v, D, g) {
    const why = [];
    let s = 1;
    for (const [m, b] of Object.entries(g.marks || {})) if (v.marks.has(m)) { s += b; if (b > 0) why.push([b, human(m)]); }
    for (const [f, b] of Object.entries(g.facts || {})) if (v.facts.has(f)) { s += b; why.push([b, describe(v, D, f)]); }
    for (const [d, w] of Object.entries(g.domains_life || {})) if (v.dom(d) > 0) { s += w * v.dom(d); why.push([w * v.dom(d), `your ${DOMAIN_NAMES[d]} ${v.dom(d)}`]); }
    return { s: Math.max(0.5, s), why: why.sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, t]) => ({ text: t, up: true })) };
  }
  async function deityStep(v, D, ui, filter) {
    const gods = Object.entries(D.deities).filter(([, g]) => !filter || filter(g));
    const mine = v.faith && v.faith.stance === "follow" ? v.faith.god : null;
    let rows = gods.map(([id, g]) => { const f = deityFit(v, D, g); return { id, w: Math.max(1, Math.round(f.s * f.s)), text: g.name, note: g.title, fixedWhy: f.why }; })
      .sort((a, b) => b.w - a.w);
    const top = rows.slice(0, 5);
    if (mine && !top.some((r) => r.id === mine) && rows.some((r) => r.id === mine)) top.push(rows.find((r) => r.id === mine));
    rows = top.map((r) => (r.id === mine ? { ...r, w: r.w * 6, fixedWhy: [{ text: "your faith (×6)", up: true }, ...r.fixedWhy.slice(0, 2)] } : r));
    const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "Your god", ask: "Which god answered when you called? The ones your life leaned towards:",
      result: (r) => ({ label: "Your god", text: r.text, sub: r.note, changes: [] }) }, rows, v.year);
    v.l1.deity = row.id;
  }
  // ---------------- faith (v0.14) ----------------
  // On Krynn everyone stands somewhere towards the gods. After Known As, the character decides (keep the faith they
  // were raised in, seek a god of their own, or turn against the gods), then a roll says which god.
  const godsSilent = (y) => !((y >= 351 && y <= 383) || y >= 421);
  const AGAINST = { chemosh: ["lost_kin_young", "buried_a_child", "met_death_early", "widowed"], morgion: ["survived_the_fever", "fled_the_plague", "frail_health", "nursed_the_sick"],
    zeboim: ["survived_a_shipwreck", "fear_of_water", "sailors_blood"], takhisis: ["lived_under_the_blue_army", "lived_through_the_occupation", "resisted_the_occupation", "lived_under_the_overlords"],
    hiddukel: ["family_swindled", "was_robbed", "heavy_debt"], sargonnas: ["has_a_rival", "home_burned"], paladine: ["doubts_the_gods", "heard_the_seekers", "family_scorned"] };
  async function faithStep(v, D, ui) {
    const year = v.curYear ?? v.year, silent = godsSilent(year);
    v.now({ stage: v.at.stage, step: "Faith", index: 0, total: 0 });
    const opts = silent
      ? [{ id: "keep", text: "Keep faith with the gods your family honoured, though they are silent" },
        { id: "seek", text: "Choose a god of your own, and wait for an answer that may never come" },
        { id: "against", text: "Turn your back on gods who left the world" }]
      : [{ id: "keep", text: "Keep the faith you were raised in" },
        { id: "seek", text: "Seek a god of your own" },
        { id: "against", text: "Turn against the gods, or one of them" }];
    const scene = silent
      ? "No prayer has been answered in your lifetime; the gods are silent, or gone. Still, everyone on Krynn stands somewhere towards them: the old shrines, the oaths your family swears by, the god whose name you curse. Where do you stand?"
      : "The gods of Krynn answer prayers again, and their clerics walk the roads. Everyone stands somewhere towards them, even those who never pray. Where do you stand?";
    const ctx = { stage: v.at.stage, year, age: year - v.born, id: "faith", title: "Your Faith", scene, history: false, opportunity: false, faith: true, echoes: [] };
    const prior = v.savedAnswer();
    const stance = await ui.event({ ...ctx, replay: prior !== null, replayAnswer: prior, now: v.nowInfo() }, opts);
    v.answer(stance); v.save();
    let rows;
    if (stance === "against") {
      rows = [{ id: "all", w: 30 + (v.marks.has("doubts_the_gods") ? 20 : 0) + (silent ? 20 : 0), text: silent ? "All of them, for leaving" : "All of them, for the Cataclysm", note: "No god will have your prayers" }];
      for (const [g, ms] of Object.entries(AGAINST)) {
        const hits = ms.filter((m) => v.marks.has(m)).length;
        rows.push({ id: g, w: 8 + 14 * hits, text: D.deities[g].name, note: D.deities[g].title, fixedWhy: ms.filter((m) => v.marks.has(m)).slice(0, 2).map((m) => ({ text: human(m), up: true })) });
      }
    } else {
      rows = Object.entries(D.deities).map(([id, g]) => {
        const f = stance === "keep" ? deityFit(v, D, g) : deityFit(v, D, { ...g, facts: {} });
        return { id, w: Math.max(1, Math.round(f.s * f.s)), text: g.name, note: g.title, fixedWhy: f.why };
      }).sort((a, b) => b.w - a.w).slice(0, 6);
    }
    const ask = stance === "against" ? "Against whom?" : stance === "keep" ? "Which god did your family honour? The ones your people and your life lean towards:" : "Which god do you choose? The ones your own life leans towards:";
    const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "Your faith", ask,
      result: (r) => ({ label: stance === "against" ? "Against" : "Your god", text: r.text, sub: r.note, changes: [] }) }, rows, year);
    v.faith = { stance: stance === "against" ? "against" : "follow", god: row.id === "all" ? null : row.id, silent };
    v.facts.add("faith." + v.faith.stance);
    if (v.faith.god) v.facts.add("faith.god." + v.faith.god);
    if (v.faith.stance === "against") v.marks.add("turned_from_the_gods"); else v.marks.add(stance === "keep" ? "keeps_the_family_faith" : "chose_a_god");
    v.origin.push({ title: "Faith", text: faithText(v, D) });
    ui.state(v);
  }
  function faithText(v, D) {
    const F = v.faith;
    if (!F) return "";
    if (F.stance === "against") return F.god ? `Against ${D.deities[F.god].name}` : "Against all the gods";
    return `Follows ${D.deities[F.god].name}${F.silent ? ", though the gods are silent" : ""}`;
  }
  async function classChoices(v, D, ui) {
    const cls = v.klass, choices = D.build.class_choices[cls] || [];
    v.l1.choices = [];
    if (["cleric", "champion"].includes(cls)) await deityStep(v, D, ui, cls === "champion" ? (g) => g.sanct !== "none" : null);
    else if (v.faith && v.faith.stance === "follow" && v.faith.god) v.l1.deity = v.faith.god; // a follower: the god goes on the sheet
    const seen = new Set();
    for (const c of choices) {
      if (!Array.isArray(c.options) || !c.options.length) continue;
      let opts = c.options.filter((o) => o.uuid && !seen.has(o.uuid));
      if (cls === "champion" && c.feature === "Cause" && v.l1.deity) {
        const unholy = D.deities[v.l1.deity].sanct === "unholy";
        const fit = opts.filter((o) => /unholy/i.test(o.text) === unholy);
        if (fit.length) opts = fit;
      }
      if (!opts.length) continue;
      const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: c.feature, ask: `Your ${D.rules.classes[cls].name.toLowerCase()} way: which ${c.feature.toLowerCase()} did your life lead to?`,
        result: (r) => ({ label: c.feature, text: r.text, sub: r.note, changes: [] }) }, fitRows(v, opts, 5), v.year);
      seen.add(row.id);
      v.l1.choices.push({ feature: c.feature, featureUuid: c.featureUuid, flag: c.flag, uuid: row.id, name: row.text, text: row.opt.text });
    }
    if ((D.build.feat_levels[cls] || {}).classFeat) {
      const pool = (D.build.class_feats[cls] || []).filter((f) => !(f.prereq || []).length);
      if (pool.length) {
        const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "Class feat", ask: "The first thing your training made you good at:",
          result: (r) => ({ label: "Class feat", text: r.text, sub: r.note, changes: [] }) }, fitRows(v, pool, 5), v.year);
        v.l1.classFeat = { uuid: row.id, name: row.text };
      }
    }
  }
  // How you fight: for classes that can fight more than one way, a visible roll the life weighs.
  // It decides the key attribute (Strength for strength in melee, Dexterity for finesse or ranged) and the weapons offered.
  const STYLE_TEXT = { strength: "Strength in close combat: heavy blows and a weapon with weight to it", finesse: "Finesse: speed, precision and a light blade",
    ranged: "At range: a bow, a sling or a crossbow, and distance between you and the trouble" };
  function styleOptions(v, D) {
    const S = (D.adapter.styles || {})[v.klass];
    return S ? S.options : null;
  }
  async function styleStep(v, D, ui) {
    const opts = styleOptions(v, D);
    if (!opts) return;
    const Wt = D.adapter.style_weights || {};
    const rows = opts.map((id) => {
      const w = Wt[id] || {}; let s = 1; const why = [];
      for (const [d, x] of Object.entries(w.domains || {})) if (v.dom(d) > 0) { s += x * v.dom(d); why.push([x * v.dom(d), `your ${DOMAIN_NAMES[d]} ${v.dom(d)}`]); }
      for (const [m, x] of Object.entries(w.marks || {})) if (v.marks.has(m)) { s += x; why.push([x + 10, human(m)]); }
      const bias = ((D.adapter.styles[v.klass] || {}).bias || {})[id] || 1;
      return { id, w: Math.max(1, Math.round(bias * s * s / 4)), text: STYLE_TEXT[id], fixedWhy: why.sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, t]) => ({ text: t, up: true })) };
    });
    const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "How you fight", ask: "When it comes to a fight, what did your life teach your hands?",
      result: (r) => ({ label: "How you fight", text: r.text, changes: [] }) }, rows, v.year);
    v.l1.style = row.id;
    const keys = D.rules.classes[v.klass].key;
    v.l1.key = row.id === "strength" && keys.includes("str") ? "str" : keys.includes("dex") ? "dex" : keys[0];
  }
  async function spellStep(v, D, ui, f) {
    const c = D.casting[v.klass];
    if (!c) return;
    let trad = c.tradition;
    if (c.from) { const ch = (v.l1.choices || []).find((x) => x.feature === c.from); const m = ch && String(ch.text).match(/\b(arcane|divine|occult|primal)\b/i); trad = m ? m[1].toLowerCase() : "arcane"; }
    const pool = D.build.spells.filter((sp) => sp.traditions.includes(trad));
    const pick = async (rank, n, title) => {
      const opts = pool.filter((sp) => sp.rank === rank).map((sp) => ({ ...sp, text: sp.text }));
      const rows = fitRows(v, opts, 6);
      const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title, ask: rank === 0 ? "The first cantrip you ever cast, the one that comes most naturally:" : "Your first real spell:",
        result: (r) => ({ label: title, text: r.text, sub: r.note, changes: [] }) }, rows, v.year);
      const rest = fitRows(v, opts.filter((sp) => sp.uuid !== row.id), opts.length).map((r) => r.opt);
      // The rest by fit, with a little chance so two similar lives don't know the same list.
      const chosen = [row.opt], left = [...rest];
      while (chosen.length < n && left.length) { const i = Math.min(left.length - 1, Math.floor(v.rng() * Math.min(4, left.length))); chosen.push(left.splice(i, 1)[0]); }
      return chosen;
    };
    const cantrips = await pick(0, c.cantrips, "First cantrip");
    const spells = await pick(1, c.known, "First spell");
    v.l1.spells = { tradition: trad, type: c.type, attr: c.attr, slots: c.slots, book: !!c.book, check: !!c.check, cantrips, spells };
    await ui.reveal({ title: "Your spells", text: `${trad[0].toUpperCase() + trad.slice(1)} magic`, note: `Cantrips: ${cantrips.map((x) => x.name).join(", ")}. Rank 1: ${spells.map((x) => x.name).join(", ")}.`, replay: v.seen(), now: v.nowInfo() });
  }
  // Keepsakes: what the life left in your pack, as story items.
  const KEEPSAKES = { keeps_an_enemy_blade: "An enemy's blade, kept", roadside_find: "Something found by the roadside", relic_in_the_family: "The family relic",
    carries_an_old_map: "An old map, never followed", keepsake_of_a_friend: "A friend's keepsake", keepsake_of_a_mentor: "Your mentor's keepsake", keepsake_of_a_sibling: "A sibling's keepsake",
    inherited_a_mystery: "A locked box with your name on it", carries_something_dangerous: "Something warm and heavy that shouldn't be", keeps_a_forbidden_book: "A forbidden book",
    keeps_an_ancient_relic: "An ancient relic", debtors_token: "A debtor's token", relic_taken: "The empty case of a stolen heirloom" };
  async function gearStep(v, D, ui, f) {
    const G = D.gear, cg = G.classes[v.klass] || { weapons: "simple", armour: "light" };
    const eq = D.build.equipment, by = (n) => eq.find((e) => e.name === n);
    let cp = G.budget_cp; const bought = [];
    const buy = (e, q = 1) => { if (e && e.cp * q <= cp) { cp -= e.cp * q; bought.push({ uuid: e.uuid, name: e.name, qty: q, type: e.type }); return true; } return false; };
    // Weapon: a visible roll among the three that fit this life best.
    const cats = cg.weapons === "martial" ? ["simple", "martial"] : ["simple"];
    // The weapons that fit how you fight. Classes without a style roll follow their attributes: Dexterity above Strength reaches for range or finesse.
    let style = v.l1.style;
    if (!style) { const f0 = buildSheet(v, D); style = f0.mod.dex > f0.mod.str ? (v.dom("wild") + v.dom("agility") > v.dom("street") ? "ranged" : "finesse") : "strength"; }
    v.l1.weaponStyle = style;
    const fits = (e) => style === "ranged" ? !!e.range && !(e.traits || []).some((t) => /^thrown/.test(t))
      : style === "finesse" ? !e.range && (e.traits || []).includes("finesse") : !e.range && !(e.traits || []).includes("finesse");
    let weapons = eq.filter((e) => e.type === "weapon" && cats.includes(e.category) && e.cp <= 1000 && G.weapon_groups[e.group]);
    if (weapons.some(fits)) weapons = weapons.filter(fits);
    const wRows = weapons.map((e) => {
      let s = 0; const why = [];
      for (const [d, w] of Object.entries(G.weapon_groups[e.group])) if (v.dom(d) > 0) { s += w * v.dom(d); why.push([w * v.dom(d), `your ${DOMAIN_NAMES[d]} ${v.dom(d)}`]); }
      for (const wm of Object.entries(G.weapon_marks || {})) { const [m, x] = wm; if (v.marks.has(m) && x.groups[e.group]) { s += x.groups[e.group]; why.push([x.groups[e.group] + 10, x.why]); } }
      return { id: e.uuid, w: Math.max(1, Math.round(s)), text: `${e.name} (${e.group})`, note: `${(e.cp / 100).toFixed(e.cp % 100 ? 1 : 0)} gp`, fixedWhy: why.sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, t]) => ({ text: t, up: true })), opt: e };
    }).sort((a, b) => b.w - a.w).slice(0, 3);
    if (wRows.length) {
      const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "Your weapon", ask: "What do you carry for when it comes to that?",
        result: (r) => ({ label: "Your weapon", text: r.text, changes: [] }) }, wRows, v.year);
      buy(row.opt);
    }
    // Armour: the best the class wears that the money allows, lighter if the life made you quick.
    const order = { none: [], light: ["light"], medium: ["medium", "light"], heavy: ["medium", "light"] }[cg.armour] || [];
    const quick = v.dom("agility") >= 4;
    const armours = eq.filter((e) => e.type === "armor" && order.includes(e.category)).sort((a, b) => (quick ? a.cp - b.cp : b.cp - a.cp));
    for (const a of armours) if (a.cp <= cp - 200 && buy(a)) break;
    const twoHanded = bought.some((b) => b.type === "weapon" && /two/.test(String((eq.find((e) => e.uuid === b.uuid) || {}).hands)));
    if (cg.shield && !twoHanded && style !== "ranged") buy(by("Wooden Shield"));
    buy(by(G.pack));
    for (const t of G.tools) if (v.dom(t.domain) >= t.min && !bought.some((b) => b.name === t.name)) buy(by(t.name));
    if (v.klass === "cleric" || v.klass === "champion") buy(by("Religious Symbol (Wooden)"));
    const keepsakes = [...v.marks].filter((m) => KEEPSAKES[m]).map((m) => KEEPSAKES[m]);
    v.l1.gear = { bought, coins: { gp: Math.floor(cp / 100), sp: Math.floor((cp % 100) / 10), cp: cp % 10 }, keepsakes };
    const coins = [v.l1.gear.coins.gp && `${v.l1.gear.coins.gp} gp`, v.l1.gear.coins.sp && `${v.l1.gear.coins.sp} sp`, v.l1.gear.coins.cp && `${v.l1.gear.coins.cp} cp`].filter(Boolean).join(", ") || "nothing";
    await ui.reveal({ title: "What you carry", text: bought.map((b) => b.name).join(", "),
      note: `${keepsakes.length ? "Keepsakes: " + keepsakes.join("; ") + ". " : ""}Left in your purse: ${coins}.`, replay: v.seen(), now: v.nowInfo() });
  }

  // ---------------- origin ----------------
  // Concept mode with a chosen ancestry: only the regions and places where that people is born.
  function conceptPlaces(v, D) {
    const want = v.concept && v.concept.people;
    if (!want) return null;
    const ok = Object.entries(D.origin.places).filter(([, p]) => p.pop > 0 && (p.people || {})[want] > 0).map(([id]) => id);
    return ok.length ? new Set(ok) : null;
  }
  async function birthRegion(v, D, ui) {
    const B = D.origin.birth_regions;
    const cp = conceptPlaces(v, D);
    const inRegion = (k) => !cp || [...cp].some((id) => D.origin.places[id].region === k);
    const regs = Object.entries(B).filter(([k]) => k !== "share_home" && inRegion(k));
    const home = regs.find(([k]) => k === v.campaign), others = regs.filter(([k]) => k !== v.campaign);
    const sum = others.reduce((s, [, r]) => s + r.births, 0);
    const share = home && others.length ? B.share_home : home ? 100 : 0;
    const rows = [];
    if (home) rows.push({ id: home[0], w: share, text: home[1].text, fixedWhy: [{ text: "where the campaign begins", up: true }] });
    for (const [k, r] of others) rows.push({ id: k, w: ((100 - share) * r.births) / sum, text: r.text });
    const row = await rollTable(v, D, ui, { kind: "origin", title: "Where you were born", ask: "Which part of Ansalon did you come into the world in?",
      result: (r) => ({ label: "Born in", text: r.text, changes: [] }) }, rows, v.year);
    v.birthRegion = row.id;
    v.facts.add("born." + row.id);
  }
  async function birthplace(v, D, ui) {
    const P = D.origin.places;
    const cp = conceptPlaces(v, D);
    const rows = Object.entries(P).filter(([id, p]) => p.region === v.birthRegion && p.pop > 0 && (!cp || cp.has(id)))
      .map(([id, p]) => ({ id, w: p.pop, mods: p.pop_mods, text: p.born || p.name, note: p.note || "" }));
    const row = await rollTable(v, D, ui, { kind: "origin", title: "Birthplace", ask: "Where exactly? The more people live in a place, the more are born there.",
      result: (r) => ({ label: "Birthplace", text: r.text, changes: [] }) }, rows, v.year);
    setPlace(v, D, row.id);
    v.birthplace = row.id;
    v.origin.push({ title: "Birthplace", text: row.text });
  }
  function cultureFacts(v, D, id) {
    const p = D.origin.places[v.birthplace] || {}, out = [];
    const humanCulture = p.culture || (D.origin.birth_regions[p.region] || {}).culture || "townsfolk";
    if (id === "human") out.push("culture." + humanCulture);
    if (id === "half_elf") out.push(...(p.elven ? ["raised.elven", "culture." + (p.elven === true ? "qualinesti" : p.elven)] : ["culture." + humanCulture]));
    if (id === "mountain_dwarf") { out.push("culture." + (p.dwarves || "thorbardin")); if (p.clan) out.push("clan." + p.clan); }
    if ((p.people_culture || {})[id]) out.push("culture." + p.people_culture[id]); // e.g. minotaurs of Mithas and of Kothas
    return out;
  }
  const RARE = "__rare", RARE_PCT = 3;
  // The peoples not living in a place, weighted by how many of them the world's places hold.
  function rareHere(v, D, p) {
    const A = D.origin.ancestries, count = {};
    for (const q of Object.values(D.origin.places)) {
      if (!(q.pop > 0)) continue;
      const tot = Object.values(q.people || {}).reduce((t, w) => t + w, 0) || 1;
      for (const [id, w] of Object.entries(q.people || {})) count[id] = (count[id] || 0) + (q.pop * w) / tot;
    }
    return Object.keys(A).filter((id) => !((p.people || {})[id] > 0) && count[id] > 0)
      .map((id) => ({ id, w: Math.sqrt(count[id]), text: A[id].text }));
  }
  async function ancestryStep(v, D, ui) {
    const p = D.origin.places[v.birthplace], A = D.origin.ancestries;
    const want = v.concept && v.concept.people && (p.people || {})[v.concept.people] > 0 ? v.concept.people : null;
    const rows = Object.entries(p.people).filter(([id]) => !want || id === want).map(([id, w]) => ({ id, w, text: A[id].text, fixedWhy: want ? [{ text: "your concept", up: true }] : [] }));
    // A few are born where their people is rarely seen: travellers' children, the shipwrecked, the fostered (v0.14).
    const elsewhere = want ? [] : rareHere(v, D, p);
    if (elsewhere.length) {
      const sum = rows.reduce((t, r) => t + r.w, 0);
      rows.push({ id: RARE, w: (sum * RARE_PCT) / (100 - RARE_PCT), text: "Someone rarely seen here", note: `One of a people that doesn't live in ${p.name}` });
    }
    let row = await rollTable(v, D, ui, { kind: "origin", title: "Ancestry", ask: `Who is born in ${p.name}? The chances follow who lives there.`,
      result: (r) => (r.id === RARE ? { label: "Ancestry", text: "Someone rarely seen here", sub: "Which people, then?", changes: [] } : { label: "Ancestry", text: r.text, changes: [] }) }, rows, v.year);
    if (row.id === RARE) {
      row = await rollTable(v, D, ui, { kind: "origin", title: "Far from your people", ask: `Your family is not of the peoples of ${p.name}. Which people are you? The more of them there are in the world, the likelier.`,
        result: (r) => ({ label: "Ancestry", text: r.text, sub: "Born where your people is rarely seen", changes: [{ kind: "O", text: "rare among the neighbours" }] }) }, elsewhere, v.year);
      v.marks.add("rare_among_neighbours");
      v.facts.add("origin.rare_here");
    }
    const facts = [...A[row.id].facts, ...cultureFacts(v, D, row.id)];
    facts.forEach((f) => v.facts.add(f));
    const where = { thorbardin: "of Thorbardin", kayolin: "of Kayolin" }[(p.dwarves || "thorbardin")];
    v.ancestry = { id: row.id, text: row.id === "mountain_dwarf" ? `Mountain dwarf ${where}` : A[row.id].text };
    const clan = clanOf(v, D);
    if (clan && clan.text) v.ancestry.text = clan.text;
    const c = (D.origin.cultures || {})[cultureId(v, D)];
    v.cultureLabel = c && c.text && (row.id === "human" || c.people === row.id) ? c.text : v.ancestry.text;
    await heritageStep(v, D, ui);
  }
  function standsOut(v, table, row, pct) {
    if (!LOOKS.has(table)) return false;
    return !!row.rare || (!["trait", "feature"].includes(table) && pct <= 7) || (table === "feature" && !!row.byname);
  }
  function rareText(table, row) {
    if (row.rare) return row.rare;
    const t = row.text.toLowerCase().replace(/^horns: /, "horns ");
    const noun = { skin: "skin", hair: "hair", eyes: "eyes" }[table];
    return /[;:,]/.test(t) || t.split(" ").length > 2 || /^horns /.test(t) ? t : `${t} ${noun}`;
  }
  async function naming(v, D, ui) {
    const T = D.origin.tables.naming, key = stockKey(v, D), stock = nameStock(v, D);
    const row = await rollTable(v, D, ui, { kind: "origin", title: T.title, ask: T.ask }, (T.by && T.by[key]) || T.rows, v.born);
    const g = { ...(drawName(v, stock, v.raisedAs, row.kind, v.ties.map((t) => t.name)) || drawName(v, stock, v.raisedAs, row.kind)) };
    let family = "", famMeans = "", full;
    const house = stock.inherited && (["inherited", "clan"].includes(stock.family) || ["status.wealthy", "family.gentry", "family.knightly", "family.guild", "family.noble_house"].some((f) => v.facts.has(f)));
    const clan = clanOf(v, D);
    if (stock.family === "clan" && clan && clan.family) { const f = parseName(clan.family); family = f.name; famMeans = f.means; v.nameKind = "house"; }
    else if (stock.family === "tribe") { family = (stock.family_by_place || {})[v.place] || "of the plains"; v.nameKind = "tribe"; }
    else if (house) {
      // Some peoples name the household itself (the Houses of Silvanesti); the rest draw an old family name.
      const own = Object.entries(stock.by_household || {}).find(([h]) => v.facts.has("family." + h));
      const f = parseName(own ? own[1] : v.pick(stock.inherited)); family = f.name; famMeans = f.means; v.nameKind = "house";
    }
    else if (stock.family === "patronym" && !v.facts.has("family.fostered")) {
      const byMother = ["kin.father_gone", "kin.father_dead"].some((f) => v.facts.has(f)) || (!v.facts.has("kin.mother_dead") && v.rng() < 0.25);
      const parent = drawName(v, stock, byMother ? "female" : "male", "any", [g.name]).name;
      family = `${parent}'s ${v.raisedAs === "female" ? "daughter" : "son"}`;
      v.parentName = { name: parent, role: byMother ? "mother" : "father" };
      v.nameKind = "patronym";
    } else v.nameKind = "none";
    // A name the player typed (choose and concept modes): the first word is the given name; the rest, if any, the family name.
    const typed = (v.typedName || "").trim().replace(/\s+/g, " ");
    if (typed) {
      const [given, ...rest] = typed.split(" ");
      g.name = given; g.means = "";
      if (rest.length) { family = rest.join(" "); famMeans = ""; if (v.nameKind === "patronym") v.nameKind = "house"; }
    }
    full = !family ? g.name : v.nameKind === "patronym" ? `${g.name}, ${family}` : `${g.name} ${family}`;
    v.name = { given: g.name, means: g.means, family, full, tongue: stock.tongue };
    for (const s of v.siblings) { if (s.name === g.name) s.name = makeName(v, D, s.sex); }
    if (row.tie === "grandparent") v.ties.push({ id: "grandparent", name: g.name, sex: v.raisedAs, roles: ["grandparent"] });
    if (row.marks) apply(v, D, { marks: row.marks });
    v.nameStory = [`Born ${full}`];
    const meaning = g.means ? `${g.name}: "${g.means}" in ${stock.tongue}. ` : "";
    const fam = famMeans ? ` ${family}: ${famMeans}.` : v.nameKind === "patronym" ? " Commoners have no family name; you would earn one." : "";
    v.origin.push({ title: "Name", text: `${full}. ${meaning}${row.text}.${fam}` });
    await ui.reveal({ title: "They named you", text: full, note: `${meaning}${row.text}.${fam}`, replay: v.seen(), now: v.nowInfo() });
    ui.state(v);
  }
  async function chosenName(v, D, ui) {
    const stock = nameStock(v, D);
    const sex = v.gender === "woman" ? "female" : v.gender === "man" ? "male" : "any";
    const g = drawName(v, stock, sex, "any", [v.name.given, ...v.ties.map((t) => t.name)]) || drawName(v, stock, sex, "any", [v.name.given]);
    v.name.given = g.name; v.name.means = g.means;
    v.name.full = !v.name.family ? g.name : v.nameKind === "patronym" ? `${g.name}, ${v.name.family}` : `${g.name} ${v.name.family}`;
    v.nameStory.push(`chose the name ${g.name}`);
    await ui.reveal({ title: "The name you chose", text: v.name.full, note: g.means ? `${g.name}: "${g.means}" in ${stock.tongue}. Nobody gave you this one.` : "Nobody gave you this one.", replay: v.seen(), now: v.nowInfo() });
    ui.state(v);
  }
  // Inverse of the standard normal distribution (Acklam), for exact heights from a percentile.
  function invNorm(p) {
    const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
    const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
    const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
    const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
    const q = Math.min(p, 1 - p), t = Math.sqrt(-2 * Math.log(q));
    if (q < 0.02425) { const x = (((((c[0] * t + c[1]) * t + c[2]) * t + c[3]) * t + c[4]) * t + c[5]) / ((((d[0] * t + d[1]) * t + d[2]) * t + d[3]) * t + 1); return p < 0.5 ? x : -x; }
    const r = p - 0.5, r2 = r * r;
    return (((((a[0] * r2 + a[1]) * r2 + a[2]) * r2 + a[3]) * r2 + a[4]) * r2 + a[5]) * r / (((((b[0] * r2 + b[1]) * r2 + b[2]) * r2 + b[3]) * r2 + b[4]) * r2 + 1);
  }
  function metric(cm, kg) {
    const inches = Math.round(cm / 2.54);
    return { height: `${(cm / 100).toFixed(2)} m (${Math.floor(inches / 12)} ft ${inches % 12} in)`, weight: `${kg} kg (${Math.round(kg * 2.2046)} lb)` };
  }
  async function bodyStep(v, D, ui) {
    const b = D.origin.body[peopleKey(v, D)];
    const mean = v.sex === "female" ? b.female : v.sex === "male" ? b.male : (b.female + b.male) / 2;
    const [lo, hi] = { short: [0.05, 0.25], average: [0.25, 0.75], tall: [0.75, 0.95] }[v.appearance.heightId];
    const cm = Math.round(mean + invNorm(lo + v.rng() * (hi - lo)) * b.sd);
    const build = v.appearance.buildId;
    let kg;
    if (b.kg) kg = Math.round(b.kg * { slight: 0.85, lean: 0.93, average: 1, sturdy: 1.1, heavy: 1.25 }[build] * (cm / ((b.female + b.male) / 2)) ** 3);
    else kg = Math.round((b.bmi + { slight: -3, lean: -1.5, average: 0, sturdy: 2.5, heavy: 5 }[build] * b.bmi / 22) * (cm / 100) ** 2);
    v.body = { cm, kg };
    const m = metric(cm, kg);
    await ui.reveal({ title: "Grown", text: `${m.height}, ${m.weight}`, note: `${v.appearance.build} build, ${v.appearance.height.toLowerCase()}. Measured against other ${v.ancestry.text.toLowerCase()}s of your sex.`, replay: v.seen(), now: v.nowInfo() });
    ui.state(v);
  }
  function placeShort(D, id) {
    const p = D.origin.places[id] || {};
    if (p.short) return p.short;
    return /^[A-Z]/.test(p.name || "") ? p.name : null;
  }
  // Commoners, goblins and wild elves earn the name the world knows them by.
  async function byname(v, D, ui) {
    if (!["patronym", "none"].includes(v.nameKind) || v.ancestry.id === "gnome") return;
    const B = D.origin.bynames, g = v.name.given, rows = [];
    const trade = B.trade[v.background];
    if (trade) rows.push({ id: "trade", w: 30, by: trade, reason: "for your trade", text: `${g} ${trade}, for your trade as ${an(D.rules.backgrounds[v.background].name.toLowerCase())}` });
    const here = placeShort(D, v.place);
    if (here) rows.push({ id: "place", w: 20, by: `of ${here}`, reason: "for where you made your name", text: `${g} of ${here}, for where you made your name` });
    for (const [m, [by, why]] of Object.entries(B.deed)) if (v.marks.has(m)) rows.push({ id: "deed", w: 25, by, reason: why, text: `${g} ${by}, ${why}`, fixedWhy: [{ text: describe(v, D, "mark." + m), up: true }] });
    for (const r of v.appearance.rare || []) if (r.byname) rows.push({ id: "look", w: 15, by: r.byname, reason: `for your ${r.text}`, text: `${g} ${r.byname}, for your ${r.text}`, fixedWhy: [{ text: `your ${r.text}`, up: true }] });
    for (const [m, by] of Object.entries(B.look)) if (v.marks.has(m)) rows.push({ id: "look", w: 12, by, reason: `for ${describe(v, D, "mark." + m)}`, text: `${g} ${by}, for ${describe(v, D, "mark." + m)}`, fixedWhy: [{ text: describe(v, D, "mark." + m), up: true }] });
    rows.push({ id: "keep", w: 10, by: null, text: v.nameKind === "patronym" ? `Still ${v.name.full}: nothing stuck` : `Just ${g}: nothing stuck` });
    const deeds = rows.filter((r) => r.id === "deed");
    if (deeds.length > 3) deeds.slice(3).forEach((r) => rows.splice(rows.indexOf(r), 1));
    v.now({ stage: "training", step: "Known As" });
    const row = await rollTable(v, D, ui, { kind: "origin", title: "What they call you", ask: "Commoners earn their second name. Which one stuck?",
      result: (r) => ({ label: "Your name now", text: r.by ? `${g} ${r.by}` : v.name.full, changes: [] }) }, rows, v.curYear);
    if (!row.by) return;
    v.name.family = row.by; v.name.full = `${g} ${row.by}`; v.nameKind = "earned";
    v.nameStory.push(`called ${v.name.full} ${row.reason}`);
    ui.state(v);
  }

  async function originStep(v, D, ui, step) {
    const T = D.origin.tables;
    if (step.when && ![].concat(step.when).every((c) => holds(v, c, v.born))) return;
    if (step.when_not && holds(v, step.when_not, v.born)) return;
    if (step.when_any && !step.when_any.some((c) => holds(v, c, v.born))) return;
    const key = step.table || Object.keys(step).find((k) => step[k] === true);
    if (v.at.stage === "origin") v.now({ step: ORIGIN_GROUPS[key] || v.at.step });
    if (step.birth_region) return birthRegion(v, D, ui);
    if (step.birthplace) return birthplace(v, D, ui);
    if (step.ancestry) return ancestryStep(v, D, ui);
    if (step.naming) return naming(v, D, ui);
    if (step.body) return bodyStep(v, D, ui);
    if (step.ancestry_feat) return ancestryFeatStep(v, D, ui);
    if (step.age) {
      const st = D.origin.stages[peopleKey(v, D)];
      v.stages = st;
      // Bands that would mean a birth before the Cataclysm wait for the calendar of that age.
      const fits = (band) => st.start_age[band][0] <= v.year - 1;
      const bandRow = await rollTable(v, D, ui, { kind: "origin", title: T.age_band.title, ask: T.age_band.ask, result: (r) => ({ label: "Age", text: r.text, changes: [] }) },
        T.age_band.rows.filter((r) => fits(r.id)), v.year);
      v.band = bandRow.id;
      v.facts.add("age." + v.band);
      const a = st.start_age[v.band][0], b = Math.min(st.start_age[v.band][1], v.year - 1);
      v.age = v.int(a, b);
      v.born = v.year - v.age;
      v.curYear = v.born; v.curAge = 0;
      await ui.number({ title: "Age when the campaign begins", ask: `Between ${a} and ${b} years, all equally likely.`, value: v.age, min: a, max: b,
        after: `You were born in ${v.born} AC, and will be ${v.age} when the adventure begins in ${v.year} AC.`, replay: v.seen(), now: v.nowInfo() });
      v.save();
      const p0 = D.origin.places[v.birthplace];
      if (p0.exile && v.born < p0.exile.before) {
        const from = D.origin.places[p0.exile.from];
        setPlace(v, D, p0.exile.from);
        v.birthplace = p0.exile.from;
        const o = v.origin.find((x) => x.title === "Birthplace");
        if (o) o.text = p0.exile.text;
        await ui.reveal({ title: "Born before the exile", text: from.born || from.name, note: p0.exile.text, replay: v.seen(), now: v.nowInfo() });
      }
      const p = D.origin.places[v.birthplace];
      apply(v, D, p.set);
      apply(v, D, (p.people_set || {})[v.ancestry.id]);
      buildPlan(v, D, ui);
      return;
    }
    const name = step.table;
    const t = tableFor(v, D, name);
    const looks = (r, f) => (standsOut(v, name, r, f.pct) ? [{ kind: "O", text: "stands out" }] : []);
    // In a quick life the looks tables (skin, hair, eyes, build, height, feature) roll together, without a click each;
    // so do the personality tables and an event's outcome, once the choice is made.
    const auto = ["skin", "hair", "eyes", "build", "height", "feature"].includes(name);
    const row = await rollTable(v, D, ui, { kind: "origin", title: t.title, ask: t.ask, auto, result: (r, f) => ({ label: t.title, text: r.text, changes: [...changesOf(v, D, r.set), ...looks(r, f)] }) },
      tableRows(v, D, name), v.year && v.curYear ? v.curYear : v.born);
    if (name === "sex") { v.sex = row.id.startsWith("intersex") ? "intersex" : row.id; v.raisedAs = row.id === "intersex_f" ? "female" : row.id === "intersex_m" ? "male" : row.id; }
    if (name === "family") v.facts.add("family." + row.id);
    if (["skin", "hair", "eyes", "build", "height", "feature"].includes(name)) v.appearance[name] = row.text;
    if (name === "build") v.appearance.buildId = row.id;
    if (name === "height") v.appearance.heightId = row.id;
    if (standsOut(v, name, row, v.lastPct)) {
      v.marks.add("stands_out");
      (v.appearance.rare = v.appearance.rare || []).push({ text: rareText(name, row), byname: row.byname || null });
    }
    apply(v, D, row.set);
    if (name === "identity") {
      v.gender = v.facts.has("gender.nonbinary") ? "nonbinary" : v.facts.has("gender.woman") ? "woman" : v.facts.has("gender.man") ? "man" : v.raisedAs === "female" ? "woman" : "man";
      v.facts.add("gender." + v.gender);
      if (row.id !== "cis" && (v.facts.has("identity.trans") || v.facts.has("identity.nonbinary"))) await chosenName(v, D, ui);
    }
    if (!["skin", "hair", "eyes", "feature", "build", "height", "identity"].includes(name) && !(name === "siblings" && !v.siblings.length)) v.origin.push({ title: t.title, text: row.text });
    ui.state(v);
  }

  // ---------------- the life ----------------
  function spans(v) {
    const e = v.stages, age = v.age;
    // Childhood events begin at 4 (an earlier childhood is too young to remember); see origin.min_age.
    const s = { childhood: [Math.max(4, Math.min(e.youth - 1, Math.floor(e.youth / 2))), Math.max(4, e.youth - 1)], youth: [e.youth, e.training - 1] };
    if (v.band && v.band !== "young") {
      // Older lives: training ends at adulthood; then the long years (long-lived peoples), perhaps the old road, and the settled years.
      let cur;
      if (e.long_years !== undefined) {
        s.training = [e.training, e.long_years - 1];
        const L = e.long_years + Math.floor((age - 2 - e.long_years) * 0.5);
        s.long_years = [e.long_years, L]; cur = L + 1;
      } else { s.training = [e.training, e.adult - 1]; cur = e.adult; }
      if (v.veteran) { const yrs = Math.max(2, Math.round((age - 2 - cur) * 0.3)); s.old_road = [cur, cur + yrs - 1]; cur += yrs; }
      s.settled = [cur, Math.max(cur, age - 2)];
    } else if (e.long_years !== undefined) { s.training = [e.training, e.long_years - 1]; s.long_years = [e.long_years, Math.max(e.long_years, age - 2)]; }
    else s.training = [e.training, Math.max(e.training, age - 2)];
    const last = Object.values(s).pop()[1];
    s.threshold = [Math.min(Math.max(last + 1, age - 1), age), age];
    return s;
  }
  function eventWeight(v, ev, year) {
    let p = ev.base_weight;
    for (const m of ev.weight_mods || []) if (holds(v, m.if, year)) { p *= m.times ?? 1; p += m.add ?? 0; }
    return Math.max(p, 0);
  }
  function echoes(v, D, ev, year) {
    const out = [];
    const r = ev.requires || {};
    for (const c of [...(r.all || []), ...(r.any || [])]) if (c.startsWith("mark.") && holds(v, c, year)) out.push(describe(v, D, c));
    for (const m of ev.weight_mods || []) if (((m.times ?? 1) > 1 || (m.add ?? 0) > 0) && holds(v, m.if, year)) out.push(describe(v, D, m.if));
    return [...new Set(out)];
  }

  async function playEvent(v, D, ui, ev, year, stage) {
    const choices = ev.choices.filter((c) => requiresOk(v, c.requires, year));
    if (!choices.length) return;
    v.curYear = year; v.curAge = year - v.born;
    v.npcSpec = ev.npcs || {}; // who the event's people are, before the scene names them
    v.stepCount[stage] = (v.stepCount[stage] || 0) + 1;
    const planned = v.plan.find((p) => p.stage === stage);
    const evTotal = Math.max(v.stepCount[stage], (planned ? planned.events : 0));
    v.now({ stage, step: ev.type === "opportunity" ? "Opportunity" : ev.history ? "History" : "Event", index: v.stepCount[stage], total: evTotal });
    let scene = ev.scene;
    for (const [c, layer] of Object.entries(ev.layers || {})) if (holds(v, c, year) && layer.scene) { scene = layer.scene; break; }
    const ctx = { stage, year, age: year - v.born, id: ev.id, title: ev.title, scene: fill(v, D, scene), history: !!ev.history,
      opportunity: ev.type === "opportunity", echoes: echoes(v, D, ev, year) };
    const prior = v.savedAnswer();
    const pickedId = await ui.event({ ...ctx, replay: prior !== null, replayAnswer: prior, now: v.nowInfo() }, choices.map((c) => ({ id: c.id, text: fill(v, D, c.text) })));
    v.answer(pickedId);
    v.save();
    const choice = choices.find((c) => c.id === pickedId);
    const out = await rollTable(v, D, ui, { kind: "outcome", auto: true, title: "What could happen", ask: fill(v, D, choice.text) },
      choice.outcomes.map((o) => ({ ...o, w: o.base_chance })), year);
    const got = apply(v, D, out.effects);
    got.motive = (out.effects.add || []).filter((m) => m.startsWith("motive_"));
    v.used.add(ev.id);
    const rec = { ...ctx, choice: fill(v, D, choice.text), outcome: fill(v, D, out.text), got };
    v.log.push(rec);
    ui.state(v);
    await ui.outcome({ ...rec, replay: v.seen(), now: v.nowInfo() });
  }

  // The youngest age an event can happen at: its own min_age, else the floor for its kind (data: origin.min_age).
  // Below it the event does not fire; a history event instead reaches the character once they are old enough.
  function minAge(D, ev) {
    if (ev.min_age !== undefined) return ev.min_age;
    const M = D.origin.min_age || {};
    if (ev.history) return (M.history || {})[ev.history.exposure] ?? 0;
    if (ev.type === "opportunity") return M.opportunity ?? 0;
    if (ev.phases.includes("childhood")) return M.childhood ?? 0;
    if (ev.phases.includes("youth")) return M.youth ?? 0;
    return 0;
  }
  // ---------------- a new chapter (v0.14) ----------------
  // Each stage opens with a chapter card: what the character carries into it, and three directions to be drawn to
  // (the strongest domain, one in the middle, one life hasn't touched). The one chosen gets +1, and in this stage the
  // events that train it are 1.6 times likelier.
  const PULL = {
    arms: "Towards a fight worth winning: sticks, then blades, and who stands their ground",
    craft: "Towards things made by hand: tools, wood, metal, the pleasure of a good joint",
    wild: "Towards the open land: tracks, weather, animals, and nights outside",
    street: "Towards the crowd and its corners: who owes whom, and how to get by",
    faith: "Towards the holy: shrines, old prayers, and what the priests won't say",
    arcane: "Towards the strange: odd lights, old books, and the feeling of something more",
    court: "Towards the people who decide: rank, manners, and the rooms where it happens",
    sea: "Towards the water: boats, ropes, tides, and the edge of the map",
    stage: "Towards an audience: songs, stories, and being looked at",
    healing: "Towards the hurt: fevers, wounds, herbs, and steady hands",
    learning: "Towards what is written: letters, maps, and the past",
    trade: "Towards the market: prices, bargains, and a full purse",
    vigor: "Towards hard work and hard weather: the body as a tool",
    agility: "Towards speed: climbing, running, and never being caught",
    intellect: "Towards puzzles: how things work, and why",
    instinct: "Towards what others miss: faces, lies, and danger before it comes",
    presence: "Towards people: friends, followers, and being heard",
  };
  const CHAPTER_ASK = { childhood: "What draws the child now?", youth: "What draws you, half-grown?", training: "What draws you as you come of age?",
    long_years: "What draws you through the long years?", old_road: "What draws you on the road?", settled: "What draws you in the settled years?", threshold: "What draws you, at the edge of a new life?" };
  const affinityCache = new Map();
  function affinity(ev) {
    if (!affinityCache.has(ev.id)) {
      const ds = new Set();
      for (const c of ev.choices || []) for (const o of c.outcomes || []) for (const d of Object.keys((o.effects || {}).domains || {})) ds.add(d);
      affinityCache.set(ev.id, ds);
    }
    return affinityCache.get(ev.id);
  }
  const pullOf = (v, stage, ev) => (v.pull && v.pull.stage === stage && affinity(ev).has(v.pull.domain) ? PULL_TIMES : 1);
  const PULL_TIMES = 1.6;
  async function chapter(v, D, ui, stage, a0, a1, i0, i1) {
    v.curYear = a0; v.curAge = i0;
    v.now({ stage, step: "A new chapter", index: 0, total: 0 });
    const doms = Object.keys(PULL);
    const byVal = doms.map((d) => [d, v.dom(d)]).sort((a, b) => b[1] - a[1] || doms.indexOf(a[0]) - doms.indexOf(b[0]));
    const top = byVal[0][0];
    const zero = byVal.filter(([d, n]) => n === 0 && d !== top).map(([d]) => d);
    const fresh = zero.length ? zero[Math.floor(v.rng() * zero.length)] : byVal[byVal.length - 1][0];
    const middle = byVal.filter(([d]) => d !== top && d !== fresh).slice(1, 6).map(([d]) => d);
    const mid = middle[Math.floor(v.rng() * middle.length)];
    const opts = [top, mid, fresh].map((d) => ({ id: d, text: PULL[d] }));
    const carry = byVal.filter(([, n]) => n > 0).slice(0, 2).map(([d, n]) => `${DOMAIN_NAMES[d]} ${n}`);
    const ages = i0 === i1 ? `Age ${i0}, ${a0} AC` : `Ages ${i0} to ${i1}, ${a0} to ${a1} AC`;
    const scene = `${ages}. ${carry.length ? "You carry into it " + carry.join(" and ") + "." : "Everything is still ahead of you."} ${CHAPTER_ASK[stage] || "What draws you now?"}`;
    const ctx = { stage, year: a0, age: i0, id: "chapter." + stage, title: `A New Chapter: ${STAGE_NAMES[stage]}`, scene, history: false, opportunity: false, chapter: true, echoes: [] };
    const prior = v.savedAnswer();
    const d = await ui.event({ ...ctx, replay: prior !== null, replayAnswer: prior, now: v.nowInfo() }, opts);
    v.answer(d); v.save();
    v.domains[d] = (v.domains[d] || 0) + 1;
    v.pull = { stage, domain: d };
    ui.state(v);
    await ui.reveal({ title: "This chapter", text: `Drawn ${PULL[d].charAt(0).toLowerCase() + PULL[d].slice(1)}`, note: `${DOMAIN_NAMES[d]} +1. In these years, what trains it comes more often.`, inline: true, replay: v.seen(), now: v.nowInfo() });
  }

  async function playStage(v, D, ui, stage, i0, i1) {
    const O = D.origin;
    const a0 = v.born + i0, a1 = v.born + i1;
    const n = v.counts[stage];
    const years = Array.from({ length: n }, () => v.int(a0, a1)).sort((x, y) => x - y);
    v.now({ stage, step: "", index: 0, total: (v.plan.find((p) => p.stage === stage) || {}).events || n });
    await ui.stage(stage, a0, a1, i0, i1);
    await chapter(v, D, ui, stage, a0, a1, i0, i1);
    v.now({ stage, step: "", index: 0, total: (v.plan.find((p) => p.stage === stage) || {}).events || n });
    for (const step of (O.stage_steps || {})[stage] || []) { v.curYear = a0; v.curAge = i0; v.now({ step: "Coming of age" }); await originStep(v, D, ui, step); }

    const regular = D.events.filter((e) => !e.history), historic = D.events.filter((e) => e.history);
    let first = true, now = a0;
    for (;;) {
      let cand = [];
      for (const h of historic) {
        if (v.used.has(h.id) || !h.phases.includes(stage)) continue;
        const hi = h.history;
        if (v.historyCount >= (v.length === "quick" && O.quick ? O.quick.history_limit : O.history_limit) && !hi.continues) continue;
        const y0 = Math.max(hi.years[0], now, v.born + minAge(D, h)), y1 = Math.min(hi.years[1], a1);
        if (y0 <= y1 && requiresOk(v, h.requires, y0) && romanceOk(v, D, h, y0)) {
          if (!(h.id in v.luck)) v.luck[h.id] = v.rng() * 100 < (hi.chance ?? 100);
          if (v.luck[h.id]) cand.push([y0, h]);
        }
      }
      const next = years.length ? years[0] : null;
      cand = cand.filter((c) => next === null || c[0] <= next);
      if (cand.length) {
        const y0 = Math.min(...cand.map((c) => c[0]));
        const pool = cand.filter((c) => c[0] === y0).map((c) => c[1]);
        const h = weighted(v, pool, (e) => eventWeight(v, e, y0));
        await playEvent(v, D, ui, h, y0, stage);
        if (!h.history.continues) v.historyCount++;
        now = y0;
        continue;
      }
      if (next === null) break;
      const year = Math.max(years.shift(), now);
      let ok = regular.filter((e) => e.phases.includes(stage) && !v.used.has(e.id) && year - v.born >= minAge(D, e) && requiresOk(v, e.requires, year) && romanceOk(v, D, e, year));
      const hasPath = [...v.marks].some((m) => m.startsWith("path_"));
      if (first && stage === "training" && !hasPath) { const op = ok.filter((e) => e.type === "opportunity" && eventWeight(v, e, year) > 0); ok = op.length ? op : ok; }
      first = false;
      ok = ok.filter((e) => eventWeight(v, e, year) > 0);
      if (!ok.length) continue;
      await playEvent(v, D, ui, weighted(v, ok, (e) => eventWeight(v, e, year) * novelty(v, e.id) * pullOf(v, stage, e)), year, stage);
      now = year;
    }
  }
  // Events your last lives already used come up less: each recent use multiplies the weight by 0.15.
  function novelty(v, id) { return 0.15 ** (v.recent || []).filter((ids) => ids.includes(id)).length; }
  function weighted(v, items, fw) {
    const ws = items.map(fw);
    let x = v.rng() * ws.reduce((s, w) => s + w, 0);
    for (let i = 0; i < items.length; i++) { x -= ws[i]; if (x < 0) return items[i]; }
    return items[items.length - 1];
  }

  // ---------------- what emerges: background, class, personality ----------------
  // How well an option fits a life. Domains count relative to how high they usually run (faith rarely climbs, street often does),
  // and every option's domain weights add up to the same total, so focused options are not outscored by broad ones.
  function score(v, r, D) {
    const B = (D && D.balance) || {}, means = B.domain_means || {};
    const all = Object.values(means), M = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 1;
    const ws = Object.values(r.domains || {}).reduce((a, b) => a + Math.abs(b), 0);
    const k = B.breadth && ws ? B.breadth / ws : 1, mw = B.mark_weight ?? 1;
    let p = 0;
    const pow = B.domain_power ?? 1;
    for (const [d, w] of Object.entries(r.domains || {})) p += w * k * v.dom(d) * (means[d] ? (M / means[d]) ** pow : 1);
    for (const [m, b] of Object.entries(r.marks || {})) if (v.marks.has(m)) p += b * mw;
    for (const [f, b] of Object.entries(r.facts || {})) if (v.facts.has(f)) p += b * mw;
    return p;
  }
  // The Dragonlance canon scope: which classes may emerge, and how much the classics are favoured.
  function scopeOf(v, D) { const S = D.scope || { scopes: {}, classes: {} }; return S.scopes[v.scope] || S.scopes[S.default] || { allow: ["classic", "canon", "adaptation"], factors: {}, off_era: 1 }; }
  function classScope(v, D, c) {
    const S = D.scope || { classes: {} }, sc = scopeOf(v, D), x = S.classes[c] || { tier: "adaptation" };
    let tier = x.tier, why = [];
    if (x.requires && !requiresOk(v, x.requires, v.year)) tier = "adaptation"; // canon only for some peoples (gnome tinkers)
    if (!sc.allow.includes(tier)) return null;
    let f = (sc.factors || {})[tier] ?? 1;
    if (f !== 1 && (S.tier_words || {})[tier]) why.push({ text: S.tier_words[tier], up: f > 1 });
    if (x.years && !x.years.some(([a, b]) => v.year >= a && v.year <= b)) {
      if (!sc.off_era) return null;
      if (sc.off_era !== 1) { f *= sc.off_era; why = [{ text: x.off_era, up: false }]; }
    }
    const corr = ((D.balance || {}).corrections || {})[c] ?? 1;
    return { f: f * corr, why };
  }
  function backgroundScope(v, D, b) {
    const S = D.scope || {}, sc = scopeOf(v, D), classic = (S.background_classics || []).includes(b);
    const f = classic ? sc.background_classic ?? 1 : 1, corr = ((D.balance || {}).corrections || {})[b] ?? 1;
    return { f: f * corr, why: classic && f > 1 ? [{ text: (S.tier_words || {}).classic || "a Dragonlance classic", up: true }] : [] };
  }
  // The two or three things in this life that pull hardest towards an option, in plain words.
  function reasons(v, D, r, n = 3) {
    const parts = [], means = ((D.balance || {}).domain_means) || {};
    for (const [d, w] of Object.entries(r.domains || {})) if (v.dom(d) > 0) parts.push([w * v.dom(d) / (means[d] || 1), `your ${DOMAIN_NAMES[d]} ${v.dom(d)}`]);
    for (const [m, b] of Object.entries(r.marks || {})) if (v.marks.has(m)) parts.push([b, human(m)]);
    for (const [f, b] of Object.entries(r.facts || {})) if (v.facts.has(f)) parts.push([b, describe(v, D, f)]);
    return parts.sort((a, b) => b[0] - a[0]).slice(0, n).map(([, t]) => ({ text: t, up: true }));
  }
  function backgroundOffers(v, D) {
    return Object.entries(D.adapter.backgrounds).map(([b, r]) => { const s = backgroundScope(v, D, b); return [b, score(v, r, D) * s.f, s.why]; })
      .sort((a, b) => b[1] - a[1]).slice(0, 3);
  }
  function classOffers(v, D) {
    const pc = Object.entries(D.classes.classes).map(([c, r]) => { const s = classScope(v, D, c); return s && [c, score(v, r, D) * s.f, s.why]; })
      .filter(Boolean).sort((a, b) => b[1] - a[1]);
    const th = (D.balance || {}).class_threshold ?? D.classes.threshold;
    const open = pc.filter((x) => x[1] >= th);
    return (open.length >= 3 ? open : pc.slice(0, 3)).slice(0, 6);
  }
  const fitWeight = (s) => Math.max(1, Math.round(Math.max(s, 0.5) ** 2));
  // Older lives: after training, either settle down (a late calling) or take to the road (a rusty veteran).
  async function laterYears(v, D, ui) {
    const T = D.origin.tables.later_years;
    v.now({ stage: "training", step: "After your training", index: 0, total: 0 });
    const row = await rollTable(v, D, ui, { kind: "origin", title: T.title, ask: T.ask, result: (r) => ({ label: T.title, text: r.text, changes: changesOf(v, D, r.set) }) }, T.rows, v.curYear);
    apply(v, D, row.set);
    v.veteran = row.id === "road";
    v.origin.push({ title: "After training", text: row.text });
    buildPlan(v, D, ui);
    ui.state(v);
  }
  async function knownAs(v, D, ui) {
    v.now({ stage: v.at.stage, step: "Known As", index: 0, total: 0 });
    const rows = backgroundOffers(v, D).map(([b, s, why]) => ({ id: b, w: fitWeight(s), text: D.rules.backgrounds[b].name, note: D.lifeshape.background_lives[b], fixedWhy: [...why, ...reasons(v, D, D.adapter.backgrounds[b], 3 - why.length)] }));
    const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "Known As", ask: "By now people knew you for something. The three that fit your life best, weighted by how well they fit:",
      result: (r) => ({ label: "Known As", text: r.text, sub: r.note, changes: [] }) }, rows, v.curYear);
    v.background = row.id;
    v.facts.add("background." + row.id);
    v.origin.push({ title: "Known as", text: D.rules.backgrounds[row.id].name });
    ui.state(v);
    await byname(v, D, ui);
  }
  async function calling(v, D, ui) {
    v.curYear = v.year; v.curAge = v.age;
    v.now({ stage: "calling", step: "Calling", index: 0, total: 0 });
    const offers = classOffers(v, D);
    // Concept mode with a chosen class: it is always among the doors, at three times its weight.
    const want = v.concept && v.concept.cls && classScope(v, D, v.concept.cls) ? v.concept.cls : null;
    if (want && !offers.some(([c]) => c === want)) {
      const s = classScope(v, D, want);
      offers.push([want, score(v, D.classes.classes[want], D) * s.f, s.why]);
    }
    const rows = offers.map(([c, s, why]) => ({ id: c, w: fitWeight(s) * (c === want ? CONCEPT_TIMES : 1), text: D.rules.classes[c].name, note: D.lifeshape.class_calls[c],
      fixedWhy: [...(c === want ? [{ text: "your concept (×" + CONCEPT_TIMES + ")", up: true }] : []), ...why, ...reasons(v, D, D.classes.classes[c], 3 - why.length)] }));
    const row = await rollTable(v, D, ui, { character: true, kind: "emerge", title: "The Calling", ask: "Everything you lived points somewhere. These are the doors your life opened, weighted by how wide:",
      result: (r) => ({ label: "Your calling", text: r.text, sub: r.note, changes: [] }) }, rows, v.year);
    v.klass = row.id;
    ui.state(v);
  }
  async function becoming(v, D, ui) {
    const cats = Object.entries(D.lifeshape.personality).sort((a, b) => (a[0] === "catchphrases") - (b[0] === "catchphrases"));
    let k = 0;
    const total = cats.reduce((s, [, c]) => s + c.pick, 0);
    for (const [key, cat] of cats) {
      const picked = [];
      for (let p = 0; p < cat.pick; p++) {
        k++;
        v.now({ stage: "becoming", step: cat.title, index: k, total });
        const scored = cat.items.filter((it) => !picked.includes(it.text)).map((it) => {
          let s = 0.5;
          for (const m of it.marks || []) if (v.marks.has(m)) s += 3;
          for (const [d, w] of Object.entries(it.domains || {})) s += w * v.dom(d) * 0.6;
          return [it, s];
        }).sort((a, b) => b[1] - a[1]).slice(0, 4);
        const rows = scored.map(([it, s]) => ({ w: fitWeight(s), text: it.text,
          fixedWhy: (it.marks || []).filter((m) => v.marks.has(m)).slice(0, 3).map((m) => ({ text: human(m), up: true })) }));
        const row = await rollTable(v, D, ui, { kind: "emerge", auto: true, title: cat.title, ask: cat.pick === 2 ? (p === 0 ? "The first of two:" : "And the second:") : "What the life made of you:",
          result: (r) => ({ label: cat.title, text: r.text, changes: [] }) }, rows, v.year);
        picked.push(row.text);
      }
      v.personality[key] = cat.pick === 2 ? picked : picked[0];
      ui.state(v);
    }
  }
  function realmOf(D, place) {
    const p = D.origin.places[place] || {};
    return p.realm || p.region || "abanasinia";
  }
  async function theRoad(v, D, ui, cfg) {
    const O = D.origin, T = O.tables;
    const regionName = (D.regions.find((r) => r.id === cfg.region) || {}).name || cfg.region;
    let where = (cfg.start || "").trim();
    const R = (O.random_places || {})[cfg.region];
    if (!where) where = cfg.region === "abanasinia" ? O.places[v.pick(O.start_places)].name : R ? O.places[v.pick(R.cities)].name : `a town in ${regionName}`;
    v.startName = where; v.startRegion = regionName;
    await ui.stage("road", v.year, v.year, v.age, v.age);
    const pl = D.origin.places[v.place] || {};
    const near = realmOf(D, v.place) === cfg.region || pl.region === cfg.region || (cfg.region === "abanasinia" && pl.region === "abanasinia");
    v.now({ stage: "road", step: "How", index: 1, total: 3 });
    const fromName = O.places[v.place] ? O.places[v.place].name : "where you were";
    const how = near
      ? await rollTable(v, D, ui, { kind: "origin", title: T.road_near.title, ask: `${where}, ${regionName}. ${T.road_near.ask}`, result: (r) => ({ label: "The road", text: r.text, changes: [] }) }, T.road_near.rows, v.year)
      : await rollTable(v, D, ui, { kind: "origin", title: T.road_how.title, ask: `From ${fromName} to ${where}, ${regionName}. How did you get there?`, result: (r) => ({ label: "The road", text: r.text, changes: [] }) }, T.road_how.rows, v.year);
    v.now({ stage: "road", step: "What it gave you", index: 2, total: 3 });
    const what = await rollTable(v, D, ui, { kind: "origin", title: T.road_what.title, ask: T.road_what.ask, result: (r) => ({ label: "On the way", text: r.text, changes: changesOf(v, D, r.set) }) }, T.road_what.rows, v.year);
    apply(v, D, what.set);
    v.road = [how.text, what.text];
    ui.state(v);
    v.now({ stage: "road", step: "Arrival", index: 3, total: 3 });
    await ui.reveal({ title: "The beginning", text: `${where}, ${regionName}. ${v.year} AC.`, note: `${v.name.full} is ${v.age}. This is where the adventure starts.`, replay: v.seen(), now: v.nowInfo() });
  }

  function changesOf(v, D, set) {
    set = set || {};
    const out = [];
    for (const [d, n] of Object.entries(set.domains || {})) out.push({ kind: "domain", text: `${DOMAIN_NAMES[d]} +${n}` });
    for (const m of [...(set.marks || []), ...(set.add || [])]) out.push({ kind: D.marks[m] || "O", text: human(m) });
    for (const x of set.marks_if || []) if (holds(v, x.if, v.born)) for (const m of x.marks) out.push({ kind: D.marks[m] || "O", text: human(m) });
    for (const t of set.ties || []) out.push({ kind: "tie", text: t.role.replace(/_/g, " ") });
    if (set.place || set.move) out.push({ kind: "place", text: (D.origin.places[set.place || set.move] || {}).name || "a new home" });
    if (set.siblings) out.push({ kind: "tie", text: `${set.siblings} sibling${set.siblings > 1 ? "s" : ""}` });
    if (set.twin) out.push({ kind: "tie", text: "a twin" });
    return out;
  }

  // The shape of the whole life, known once the age is rolled: stages and their steps, for the progress bar.
  function buildPlan(v, D, ui) {
    const O = D.origin;
    const sp = spans(v);
    v.counts = v.counts || {};
    for (const st of Object.keys(sp)) {
      if (v.counts[st] !== undefined) continue;
      const n = (v.length === "quick" && O.quick ? O.quick.events_per_stage : O.events_per_stage)[st];
      v.counts[st] = !Array.isArray(n) ? n : st === "settled" ? (v.band === "old" ? n[1] : n[0]) : v.int(n[0], n[1]);
    }
    v.plan = [{ stage: "origin", steps: ORIGIN_STEPS, events: 0, from: v.born, to: v.born }];
    const knownAt = v.band && v.band !== "young" ? "settled" : "training";
    for (const st of Object.keys(sp)) {
      const n = v.counts[st];
      const steps = ["A new chapter", ...(st === "training" ? ["Coming of age"] : []), ...Array.from({ length: n }, (_, i) => `Event ${i + 1}`),
        ...(st === "training" && v.band && v.band !== "young" ? ["After your training"] : []), ...(st === knownAt ? ["Known As", "Faith"] : [])];

      v.plan.push({ stage: st, steps, events: n, from: v.born + sp[st][0], to: v.born + sp[st][1] });
    }
    const total = Object.values(D.lifeshape.personality).reduce((s, c) => s + c.pick, 0);
    v.plan.push({ stage: "calling", steps: ["Calling", "Class choices", "Spells"], events: 0, from: v.year, to: v.year });
    v.plan.push({ stage: "becoming", steps: Object.values(D.lifeshape.personality).flatMap((c) => Array(c.pick).fill(c.title)), events: 0, from: v.year, to: v.year });
    v.plan.push({ stage: "road", steps: ["Gear", "How", "What it gave you", "Arrival"], events: 0, from: v.year, to: v.year });
    v.plan.push({ stage: "sheet", steps: ["The Character"], events: 0, from: v.year, to: v.year });
    v.stepCount = {};
    if (ui.plan) ui.plan(v.plan, total);
  }

  // The ways of playing a life, and how long it is. See rollTable, ancestryStep and calling.
  const MODES = ["fate", "points", "free", "choose", "concept"];
  const FATE_POINTS = 3, CONCEPT_TIMES = 3;
  async function live(D, cfg, ui) {
    const v = newLife(Math.random);
    attachTracking(v, ui, cfg);
    v.year = cfg.year;
    v.plan = []; v.stepCount = {}; v.counts = {};
    v.campaign = cfg.region || "abanasinia";
    v.facts.add("campaign." + v.campaign);
    v.recent = cfg.recent || [];
    v.scope = cfg.scope || (D.scope || {}).default || "favoured";
    v.mode = MODES.includes(cfg.mode) ? cfg.mode : "fate";
    v.length = cfg.length === "quick" ? "quick" : "full";
    v.typedName = ["choose", "concept"].includes(v.mode) && typeof cfg.name === "string" ? cfg.name.slice(0, 60) : "";
    v.concept = v.mode === "concept" && cfg.concept ? { people: cfg.concept.people || null, cls: cfg.concept.cls || null } : null;
    v.fate = v.mode === "points" ? FATE_POINTS : 0;
    await ui.stage("origin");
    for (const step of D.origin.origin_steps) await originStep(v, D, ui, step);
    const older = v.band !== "young";
    for (const stage of ["childhood", "youth", "training", "long_years", "old_road", "settled", "threshold"]) {
      const sp = spans(v)[stage];
      if (!sp) continue;
      await playStage(v, D, ui, stage, sp[0], sp[1]);
      if (stage === "training" && older) await laterYears(v, D, ui);
      if (stage === (older ? "settled" : "training")) { await knownAs(v, D, ui); await faithStep(v, D, ui); }
    }
    await ui.stage("calling", v.year, v.year, v.age, v.age);
    await calling(v, D, ui);
    v.now({ stage: "calling", step: "Class choices", index: 0, total: 0 });
    await classChoices(v, D, ui);
    v.now({ stage: "calling", step: "How you fight", index: 0, total: 0 });
    await styleStep(v, D, ui);
    v.now({ stage: "calling", step: "Spells", index: 0, total: 0 });
    await spellStep(v, D, ui);
    await ui.stage("becoming", v.year, v.year, v.age, v.age);
    await becoming(v, D, ui);
    v.now({ stage: "road", step: "Gear", index: 0, total: 0 });
    await gearStep(v, D, ui);
    await theRoad(v, D, ui, cfg);
    v.now({ stage: "sheet", step: "The Character", index: 0, total: 0 });
    return v;
  }

  // ---------------- the sheet ----------------
  function pull(v, table) {
    const o = {};
    for (const [k, ws] of Object.entries(table)) o[k] = Object.entries(ws).reduce((s, [d, w]) => s + w * v.dom(d), 0);
    return o;
  }
  function buildSheet(v, D) {
    const R = D.rules, A = D.adapter;
    const mapA = A.ancestries[v.ancestry.id];
    const anc = R.ancestries[mapA.ancestry], bg = R.backgrounds[v.background], cl = R.classes[v.klass];
    const want = pull(v, A.attributes);
    const keys = cl.key.length ? cl.key : A.extra_key_attribute[v.klass];
    // The key attribute: the one the fighting style chose, else the one the life leans towards among the class's options.
    const key = v.l1 && v.l1.key && keys.includes(v.l1.key) ? v.l1.key : keys.reduce((m, a) => (want[a] > want[m] ? a : m), keys[0]);
    const mod = Object.fromEntries(ATTR.map((a) => [a, 0]));
    // Build priority: what the class needs after its key (pf2e advice: Constitution, then defences and the class's own needs),
    // adjusted by how the character fights; the life's leanings (scaled to at most 1.5) choose among near-equals.
    const P0 = { ...(A.build_priority.default || {}), ...(A.build_priority[v.klass] || {}) };
    const st = (v.l1 && (v.l1.style || v.l1.weaponStyle)) || null;
    if (st === "strength" && key !== "str") P0.str = Math.max(P0.str || 0, 1.2);
    if (st === "ranged") P0.str = Math.min(P0.str || 0, 0.2);
    if (v.l1 && v.l1.spells && v.l1.spells.attr !== key) P0[v.l1.spells.attr] = Math.max(P0[v.l1.spells.attr] || 0, 1.6);
    const wmax = Math.max(1, ...Object.values(want));
    const val = (a) => (a === key ? 100 : 0) + 3 * (P0[a] || 0) + 1.5 * (want[a] / wmax) - 2.2 * mod[a];
    const best = (ops, used) => ops.filter((a) => !used.has(a) && mod[a] < 4).reduce((m, a) => (m === null || val(a) > val(m) ? a : m), null);
    const steps = {};
    const source = (boosts) => {
      const used = new Set(), sel = [];
      for (const ops of [...boosts].filter((o) => o.length).sort((x, y) => x.length - y.length)) {
        const a = ops.length === 1 ? ops[0] : best(ops, used);
        mod[a]++; used.add(a); sel.push([ops, a]);
      }
      return sel;
    };
    steps.ancestry = source(anc.boosts);
    for (const ops of anc.flaws) mod[ops[0]]--;
    steps.background = source(bg.boosts);
    mod[key]++; steps.klass = key;
    const used = new Set(); steps.free = [];
    for (let i = 0; i < 4; i++) { const a = best(ATTR, used); mod[a]++; used.add(a); steps.free.push(a); }
    const fixed = [];
    // Some backgrounds let you choose their skill: take the one this life leans towards most.
    const bgChoice = ((D.build || {}).background_choices || {})[bg.uuid];
    const likeAll = pull(v, A.skills);
    const bgSkill = !bg.skills.length && bgChoice ? [...bgChoice.skills].sort((a, b) => (likeAll[b] || 0) - (likeAll[a] || 0))[0] : null;
    // Some classes train one skill of two (the fighter and the monk: Acrobatics or Athletics): the attribute that fights decides, then the life.
    const pairs = (A.class_skill_choice || {})[v.klass] || [];
    const clChoice = pairs.length ? [...pairs].sort((a, b) => (mod[SKILL_ATTR[b]] - mod[SKILL_ATTR[a]]) || ((likeAll[b] || 0) - (likeAll[a] || 0)))[0] : null;
    const given = [...bg.skills, ...(bgSkill ? [bgSkill] : []), ...cl.skills, ...(clChoice ? [clChoice] : [])];
    for (const s of given) if (!fixed.includes(s)) fixed.push(s);
    // A skill trained twice gives a free one instead (Player Core).
    const nFree = cl.free_skills + Math.max(mod.int, 0) + (given.length - fixed.length);
    const like = pull(v, A.skills);
    // The life leads; a good attribute for the skill counts too, so a quick rogue trains Acrobatics before Crafting.
    const skillWant = (s) => (like[s] || 0) + 1.2 * mod[SKILL_ATTR[s]];
    const chosen = Object.keys(like).sort((a, b) => skillWant(b) - skillWant(a)).filter((s) => !fixed.includes(s)).slice(0, nFree);
    return {
      ancestry: anc, heritage: mapA.heritage ? R.heritages[mapA.heritage] : null, background: bg, bgSkill, clChoice, klass: cl, mod, steps, key,
      hp: anc.hp + cl.hp + mod.con, fixed, chosen, nFree, lores: [...bg.lores, ...(cl.fixed_lore ? [cl.fixed_lore] : [])], priority: P0,
      notes: [mapA.adaptation, (eraOf(v.year) === "mortals" && (A.krynn_notes_mortals || {})[v.klass]) || A.krynn_notes[v.klass],
        v.marks.has("afflicted_kender") ? A.afflicted_kender : null].filter(Boolean),
    };
  }
  function checkSheet(f) {
    const e = [], exp = Object.fromEntries(ATTR.map((a) => [a, 0]));
    for (const k of ["ancestry", "background"]) {
      const seen = f.steps[k].map((x) => x[1]);
      if (new Set(seen).size !== seen.length) e.push("repeated boost in " + k);
      for (const [ops, a] of f.steps[k]) { if (!ops.includes(a)) e.push("boost outside the options in " + k); exp[a]++; }
    }
    for (const ops of f.ancestry.flaws) exp[ops[0]]--;
    exp[f.steps.klass]++;
    if (new Set(f.steps.free).size !== 4) e.push("repeated free boosts");
    f.steps.free.forEach((a) => exp[a]++);
    if (ATTR.some((a) => exp[a] !== f.mod[a])) e.push("boosts don't add up");
    if (Math.max(...Object.values(f.mod)) > 4) e.push("modifier above +4");
    if (f.chosen.length !== f.nFree) e.push("wrong number of free skills");
    return e;
  }


  // ---------------- stat block ----------------
  const SKILL_ATTR = { acrobatics: "dex", arcana: "int", athletics: "str", crafting: "int", deception: "cha", diplomacy: "cha", intimidation: "cha",
    medicine: "wis", nature: "wis", occultism: "int", performance: "cha", religion: "wis", society: "int", stealth: "dex", survival: "wis", thievery: "dex" };
  const prof = (rank) => (rank > 0 ? 1 + 2 * rank : 0);
  const sgn = (n) => (n >= 0 ? "+" : "") + n;
  function statBlock(v, D, f) {
    const g = (v.l1 && v.l1.gear) || { bought: [] }, eq = D.build.equipment;
    const item = (b) => eq.find((e) => e.uuid === b.uuid) || {};
    const armour = g.bought.map(item).find((e) => e.type === "armor");
    const shield = g.bought.map(item).find((e) => e.type === "shield");
    const dex = f.mod.dex, str = f.mod.str;
    const atk = f.klass.attacks || { simple: 1, martial: 1, advanced: 0, unarmed: 1 }, def = f.klass.defenses || { unarmored: 1, light: 1, medium: 1, heavy: 1 };
    const armourRank = def[armour ? armour.category : "unarmored"] ?? 1;
    const ac = 10 + Math.min(dex, armour && armour.dexCap != null ? armour.dexCap : 99) + prof(armourRank) + (armour ? armour.ac || 0 : 0);
    const sv = f.klass.saves;
    const saves = { fortitude: f.mod.con + prof(sv.fortitude), reflex: dex + prof(sv.reflex), will: f.mod.wis + prof(sv.will) };
    const trained = [...f.fixed, ...f.chosen];
    const skills = Object.fromEntries(Object.entries(SKILL_ATTR).map(([k, a]) => [k, f.mod[a] + (trained.includes(k) ? prof(1) : 0)]));
    const strike = (w, rank) => {
      const tr = w.traits || [], ranged = !!w.range && !tr.some((t) => /^thrown/.test(t)), thrown = tr.some((t) => /^thrown/.test(t)), finesse = tr.includes("finesse");
      const att = (ranged ? dex : finesse ? Math.max(dex, str) : str) + prof(rank);
      const dmgBonus = ranged ? (tr.some((t) => /^propulsive/.test(t)) ? Math.floor(Math.max(str, 0) / 2) : 0) : str;
      const agile = tr.includes("agile");
      return { name: w.name, attack: att, map: [att - (agile ? 4 : 5), att - (agile ? 8 : 10)], rank, ranged: ranged || thrown, range: w.range || null,
        damage: `${(w.damage || {}).dice || 1}${(w.damage || {}).die || "d4"}${dmgBonus ? sgn(dmgBonus) : ""} ${(w.damage || {}).damageType || ""}`.trim(), traits: tr };
    };
    const attacks = g.bought.map(item).filter((e) => e.type === "weapon").map((w) => strike(w, atk[w.category] ?? 0));
    attacks.push(strike({ name: "Fist", traits: ["agile", "finesse", "nonlethal", "unarmed"], damage: { dice: 1, die: "d4", damageType: "bludgeoning" } }, atk.unarmed ?? 1));
    const key = f.mod[f.key];
    return { ac, armourRank, armour: armour ? armour.name : null, shield: !!shield, hp: f.hp, perception: f.mod.wis + prof(f.klass.perception), saves, skills, attacks, classDC: 10 + key + prof(1),
      ranks: { perception: f.klass.perception, saves: sv, attacks: atk, defenses: def, skills: Object.fromEntries(Object.keys(SKILL_ATTR).map((k) => [k, trained.includes(k) ? 1 : 0])), classDC: 1 },
      spell: v.l1 && v.l1.spells ? { attack: f.mod[v.l1.spells.attr] + prof(1), dc: 10 + f.mod[v.l1.spells.attr] + prof(1) } : null, speed: f.ancestry.speed };
  }
  // Languages: your people's, then as many more as Intelligence allows, from the peoples your life met.
  function languages(v, D, f) {
    const known = [...f.ancestry.languages];
    const pull = { elven: ["people.half_elf", "raised.elven", "place.gateway", "culture.qualinesti", "culture.kagonesti", "culture.silvanesti", "region.qualinesti", "region.southern_ergoth"],
      dwarven: ["culture.hill", "culture.thorbardin", "culture.kayolin", "place.garnet", "place.hills", "region.thorbardin"], halfling: ["people.kender", "region.goodlund"],
      gnomish: ["people.gnome"], goblin: ["people.goblin", "people.hobgoblin", "place.wilds", "place.solamnic_wilds"], draconic: ["mark.library_reader", "mark.reads_an_ancient_tongue", "mark.wizard_apprentice"], jotun: ["mark.saw_combat"] };
    const extra = Object.entries(pull).filter(([l]) => !known.includes(l)).map(([l, cs]) => [l, cs.filter((c) => holds(v, c, v.year)).length]).sort((a, b) => b[1] - a[1]);
    const n = Math.max(0, f.mod.int) + (f.ancestry.additional || 0) * 0;
    return [...known, ...extra.slice(0, n).map(([l]) => l)];
  }

  // ---------------- Foundry actor (pf2e) ----------------
  // Builds the actor the way the pf2e system stores a finished level-1 character: the ancestry, heritage, background
  // and class with their choices, what they grant at level 1, the feats, spells and gear. "items" maps UUID -> source.
  // A stable pick for a choice with no better reason: the same life, the same answer.
  function stableIndex(text, n) { let h = 2166136261; for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h) % n; }
  const dromedary = (t) => String(t).toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
  function resolveChoices(v, D, f, out) {
    const like = pull(v, D.adapter.skills);
    const trained = new Set([...f.fixed, ...f.chosen]);
    const want = (s) => (like[s] || 0) + 1.2 * (f.mod[SKILL_ATTR[s]] || 0);
    const isSkill = (x) => typeof x === "string" && x in SKILL_ATTR;
    for (const d of out) {
      const rules = (d.system && d.system.rules) || [];
      for (const r of rules) {
        if (r.key !== "ChoiceSet" || r.selection !== undefined) continue;
        const flag = r.flag || dromedary(r.slug || d.system.slug || d.name);
        d.flags = d.flags || {}; d.flags.pf2e = d.flags.pf2e || {}; d.flags.pf2e.rulesSelections = d.flags.pf2e.rulesSelections || {};
        if (d.flags.pf2e.rulesSelections[flag] !== undefined) { r.selection = d.flags.pf2e.rulesSelections[flag]; continue; }
        let value;
        const ch = r.choices;
        if (ch && !Array.isArray(ch) && ch.config === "skills") {
          const best = Object.keys(SKILL_ATTR).filter((s) => !trained.has(s)).sort((a, b) => want(b) - want(a))[0];
          if (best) { value = best; trained.add(best); }
        } else if (Array.isArray(ch) && ch.length) {
          const vals = ch.map((o) => (o && typeof o === "object" && "value" in o ? o : { value: o }));
          const god = v.l1 && v.l1.deity ? D.deities[v.l1.deity] : null;
          const has = (x) => vals.some((o) => o.value === x);
          if (flag === "fighterSkill" && f.clChoice) value = f.clChoice;
          else if (flag === "sanctification") value = god && has(god.sanct) ? god.sanct : has("none") ? "none" : undefined;
          else if (flag === "divineFont") value = god ? (god.font || []).find(has) : undefined;
          else if (vals.some((o) => JSON.stringify(o.predicate || "").includes("deity:"))) value = undefined; // depends on a god we don't have
          else if (vals.every((o) => isSkill(o.value))) value = [...vals].sort((a, b) => (trained.has(a.value) - trained.has(b.value)) || (want(b.value) - want(a.value)))[0].value;
          else { const open = vals.filter((o) => !o.predicate); const pool = open.length ? open : vals; value = pool[stableIndex(`${v.name.full}:${d.name}:${flag}`, pool.length)].value; }
        }
        if (value !== undefined) { r.selection = value; d.flags.pf2e.rulesSelections[flag] = value; }
      }
    }
  }

  function foundryActor(v, D, f, items) {
    const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const newId = () => Array.from({ length: 16 }, () => ABC[Math.floor(Math.random() * ABC.length)]).join("");
    const clone = (x) => JSON.parse(JSON.stringify(x));
    const copy = (uuid, extra) => {
      const src = items[uuid];
      if (!src) return null;
      const d = clone(src);
      d._id = newId();
      d._stats = { ...(d._stats || {}), compendiumSource: uuid };
      delete d.folder; delete d.sort; delete d.ownership;
      if (extra) extra(d);
      return d;
    };
    const out = [];
    const markBoosts = (d, steps) => {
      const slots = Object.values(d.system.boosts || {});
      for (const [ops, pick] of steps) {
        const slot = slots.find((b) => !b.selected && b.value.length === ops.length && ops.every((o) => b.value.includes(o)));
        if (slot) slot.selected = pick;
      }
    };
    // A granted item whose granter preset its choice (a background's Assurance in Athletics): the choice goes on the
    // granted item's flags, where PF2e reads it ({item|flags.pf2e.rulesSelections.<flag>}).
    const presets = (granter, uuid) => {
      const rule = (granter.system.rules || []).find((r) => r.key === "GrantItem" && r.uuid === uuid && r.preselectChoices);
      if (!rule) return null;
      const sel = {};
      for (const [k, val] of Object.entries(rule.preselectChoices)) {
        const m = String(val).match(/^\{item\|flags\.(?:system|pf2e)\.rulesSelections\.(\w+)\}$/);
        const v = m ? (((granter.flags || {}).pf2e || {}).rulesSelections || {})[m[1]] : val;
        if (v !== undefined && v !== null) sel[k] = v;
      }
      return { sel, flag: rule.flag };
    };
    const grant = (granter, list, level) => {
      for (const u of list || []) {
        const pre = presets(granter, u);
        const g = copy(u, (d) => {
          d.system.location = granter._id;
          if (d.system.level && d.system.category === "classfeature") d.system.level.value = d.system.level.value || 1;
          if (pre) {
            d.flags = { ...(d.flags || {}), pf2e: { ...((d.flags || {}).pf2e || {}), rulesSelections: { ...((((d.flags || {}).pf2e) || {}).rulesSelections || {}), ...pre.sel }, grantedBy: { id: granter._id, onDelete: "cascade" } } };
            for (const r of d.system.rules || []) if (r.key === "ChoiceSet" && pre.sel[r.flag] !== undefined) r.selection = pre.sel[r.flag];
          }
        });
        if (g) {
          out.push(g);
          if (pre) { granter.flags = granter.flags || {}; granter.flags.pf2e = granter.flags.pf2e || {}; granter.flags.pf2e.itemGrants = { ...(granter.flags.pf2e.itemGrants || {}), [pre.flag || g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")]: { id: g._id, onDelete: "detach" } }; }
        }
      }
    };
    const R = D.rules, mapA = D.adapter.ancestries[v.ancestry.id];
    const anc = copy(f.ancestry.uuid, (d) => markBoosts(d, f.steps.ancestry));
    out.push(anc); grant(anc, D.build.grants[f.ancestry.uuid]);
    const her = v.l1 && v.l1.heritage ? copy(v.l1.heritage.uuid) : null;
    if (her) { out.push(her); grant(her, D.build.grants[v.l1.heritage.uuid]); }
    const bg = copy(f.background.uuid, (d) => markBoosts(d, f.steps.background));
    out.push(bg); grant(bg, D.build.grants[f.background.uuid]);
    // A background that lets you choose its skill: record the choice, and grant its feat already set to that skill.
    if (f.bgSkill) {
      bg.flags = { ...(bg.flags || {}), pf2e: { ...((bg.flags || {}).pf2e || {}), rulesSelections: {}, itemGrants: {} } };
      for (const r of bg.system.rules || []) {
        if (r.key === "ChoiceSet") { r.selection = f.bgSkill; bg.flags.pf2e.rulesSelections[r.flag || "skill"] = f.bgSkill; }
        if (r.key === "GrantItem" && items[r.uuid]) {
          const g = copy(r.uuid, (d) => {
            for (const rr of d.system.rules || []) if (rr.key === "ChoiceSet") rr.selection = f.bgSkill;
            d.flags = { ...(d.flags || {}), pf2e: { ...((d.flags || {}).pf2e || {}), grantedBy: { id: bg._id, onDelete: "cascade" }, rulesSelections: Object.fromEntries(Object.keys(r.preselectChoices || {}).map((k) => [k, f.bgSkill])) } };
            d.system.location = null;
          });
          if (g) { out.push(g); bg.flags.pf2e.itemGrants[g.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")] = { id: g._id, onDelete: "detach" }; }
        }
      }
    }
    const cls = copy(f.klass.uuid, (d) => { d.system.keyAbility.selected = f.key; });
    out.push(cls);
    const before = out.length;
    grant(cls, D.build.grants[f.klass.uuid]);
    // Class choices: set the ChoiceSet's selection on the feature, and add the chosen item as granted by it.
    for (const ch of (v.l1 && v.l1.choices) || []) {
      const feat = out.slice(before).find((x) => x._stats.compendiumSource === ch.featureUuid);
      if (!feat) continue;
      const rule = (feat.system.rules || []).find((r) => r.key === "ChoiceSet" && (r.flag || "choice") === ch.flag && r.selection === undefined)
        || (feat.system.rules || []).find((r) => r.key === "ChoiceSet" && r.selection === undefined);
      if (rule) rule.selection = ch.uuid;
      feat.flags = feat.flags || {}; feat.flags.pf2e = feat.flags.pf2e || {};
      feat.flags.pf2e.rulesSelections = { ...(feat.flags.pf2e.rulesSelections || {}), [ch.flag]: ch.uuid };
      const opt = copy(ch.uuid, (d) => { d.system.location = d.system.category === "classfeature" ? cls._id : null; d.flags = { ...(d.flags || {}), pf2e: { ...((d.flags || {}).pf2e || {}), grantedBy: { id: feat._id, onDelete: "cascade" } } }; });
      if (opt) {
        out.push(opt);
        const grantRule = (feat.system.rules || []).find((r) => r.key === "GrantItem" && String(r.uuid).includes(ch.flag));
        const key = (grantRule && grantRule.flag) || ch.flag;
        feat.flags.pf2e.itemGrants = { ...(feat.flags.pf2e.itemGrants || {}), [key]: { id: opt._id, onDelete: "detach" } };
      }
    }
    const feat = (u, location) => { const d = copy(u, (x) => { x.system.location = location; x.system.level = { ...(x.system.level || {}), taken: 1 }; }); if (d) out.push(d); };
    if (v.l1 && v.l1.ancestryFeat) feat(v.l1.ancestryFeat.uuid, "ancestry-1");
    if (v.l1 && v.l1.classFeat) feat(v.l1.classFeat.uuid, "class-1");
    // A Krynn god, as a deity item of its own.
    if (v.l1 && v.l1.deity) {
      const g = D.deities[v.l1.deity];
      const spell = D.build.spells.find((x) => x.name === g.spell);
      out.push({ _id: newId(), name: g.name, type: "deity", img: "icons/svg/sun.svg", system: {
        category: "deity", attribute: g.attribute, domains: { primary: g.domains, alternate: [] }, font: g.font, skill: [g.skill], weapons: [g.weapon],
        sanctification: g.sanct === "none" ? null : { modal: "must", what: [g.sanct] }, spells: spell ? { 1: spell.uuid } : {}, rules: [], traits: {},
        description: { value: `<p><strong>${esc(g.name)}</strong>, ${esc(g.title)}.</p><p><strong>Edicts</strong> ${esc(g.edicts)}</p><p><strong>Anathema</strong> ${esc(g.anathema)}</p><p><em>Lifewrought adaptation of a Krynn god; the game numbers are not official.</em></p>` },
        publication: { title: "Lifewrought (Krynn adaptation)", license: "ORC", remaster: true }, _migration: { version: 0.961, previous: null } } });
    }
    // Spells: one spellcasting entry, its cantrips and rank-1 spells.
    const S = v.l1 && v.l1.spells;
    if (S) {
      const entry = { _id: newId(), name: `${S.tradition[0].toUpperCase() + S.tradition.slice(1)} ${S.type === "prepared" ? "Prepared" : "Spontaneous"} Spells`, type: "spellcastingEntry",
        system: { tradition: { value: S.tradition }, prepared: { value: S.type }, ability: { value: S.attr }, proficiency: { value: 1 },
          slots: { slot0: { max: S.type === "prepared" ? Math.min(5, S.cantrips.length) : 0, value: 0, prepared: [] }, slot1: { max: S.slots, value: S.slots, prepared: [] } },
          showSlotlessLevels: { value: false }, _migration: { version: 0.961, previous: null } } };
      out.push(entry);
      for (const sp of [...S.cantrips, ...S.spells]) { const d = copy(sp.uuid, (x) => { x.system.location = { value: entry._id }; }); if (d) out.push(d); }
    }
    // Gear, coins and keepsakes.
    const G = (v.l1 && v.l1.gear) || { bought: [], coins: {}, keepsakes: [] };
    // A kit is opened into its contents (pf2e doesn't keep kits in an inventory); containers hold what was in them.
    const unpack = (entries, containerId) => {
      for (const e of Object.values(entries || {})) {
        const d = copy(e.uuid, (x) => { x.system.quantity = e.quantity || 1; if (containerId) x.system.containerId = containerId; });
        if (!d) continue;
        out.push(d);
        if (e.isContainer) unpack(e.items, d._id);
      }
    };
    for (const b of G.bought) {
      if (b.type === "kit") { unpack((items[b.uuid] || { system: {} }).system.items); continue; }
      const d = copy(b.uuid, (x) => {
        x.system.quantity = b.qty || 1;
        if (b.type === "armor") x.system.equipped = { carryType: "worn", inSlot: true };
        if (b.type === "weapon" || b.type === "shield") x.system.equipped = { carryType: "held", handsHeld: /two/.test(String((x.system.usage || {}).value)) ? 2 : 1 };
      });
      if (d) out.push(d);
    }
    for (const [k, n] of Object.entries({ gold: G.coins.gp, silver: G.coins.sp, copper: G.coins.cp })) if (n) { const d = copy(D.build.coins[k], (x) => { x.system.quantity = n; }); if (d) out.push(d); }
    for (const k of G.keepsakes) out.push({ _id: newId(), name: k, type: "equipment", img: "icons/svg/item-bag.svg",
      system: { description: { value: "<p>A keepsake from the life you lived.</p>" }, quantity: 1, bulk: { value: 0 }, price: { value: {} }, traits: { value: [], rarity: "common" }, _migration: { version: 0.961, previous: null } } });
    for (const l of f.lores) out.push({ _id: newId(), name: l, type: "lore", img: "systems/pf2e/icons/default-icons/lore.svg", system: { proficient: { value: 1 }, _migration: { version: 0.961, previous: null } } });

    const body = bodyNumbers(v), P = v.personality, SD = sheetData(v, D);
    const trained = [...f.fixed, ...f.chosen];
    // Choices PF2e would ask for when an item is added (a skill, an energy type, one of a list): made here from the
    // life, so the imported character has them. Choices among compendium items (a feat, a deity) are left for the
    // player to make in Foundry. No dice: the same life always gives the same answers.
    resolveChoices(v, D, f, out);
    return {
      name: v.name.full, type: "character", img: "systems/pf2e/icons/default-icons/character.svg",
      system: {
        details: { level: { value: 1 }, age: { value: String(v.age) }, gender: { value: genderText(v) }, ethnicity: { value: cultureText(v) }, nationality: { value: nationOf(v, D) },
          height: { value: body.height }, weight: { value: body.weight }, languages: { value: languages(v, D, f), details: "" },
          biography: { appearance: `<p>${esc(appearanceText(v))}</p>`, backstory: backstoryHtml(v, D), birthPlace: (D.origin.places[v.birthplace] || {}).name || "",
            attitude: P.attitude || "", beliefs: P.beliefs || "", edicts: P.edicts || [], anathema: P.anathema || [], likes: P.likes || "", dislikes: P.dislikes || "",
            allies: v.ties.filter((t) => t.roles.some((r) => ALLY_ROLES.includes(r))).map((t) => `<p>${esc(tieLine(t))}</p>`).join(""),
            enemies: v.ties.filter((t) => t.roles.some((r) => ENEMY_ROLES.includes(r))).map((t) => `<p>${esc(tieLine(t))}</p>`).join(""),
            catchphrases: P.catchphrases || "",
            campaignNotes: SD.biography.campaign.notes.map((n) => `<p>${esc(n)}</p>`).join("") + (SD.proficiencies.knowhow.length ? `<p>Know-how: ${esc(SD.proficiencies.knowhow.join(", "))}.</p>` : ""),
            organizations: SD.biography.campaign.organizations.map((o) => `<p>${esc(o)}</p>`).join("") } },
        build: { attributes: { boosts: { 1: f.steps.free } } },
        skills: Object.fromEntries(trained.map((k) => [k, { rank: 1 }])),
        attributes: { hp: { value: f.hp, temp: 0 } },
        _migration: { version: 0.961, previous: null },
      },
      items: out.filter(Boolean),
      prototypeToken: { name: v.name.given, actorLink: true },
      flags: { lifewrought: { version: "0.5", born: v.born, campaign: v.year } },
    };
  }

  // ---------------- the character sheet (v0.12) ----------------
  // One model of the sheet, laid out like the pf2e sheet, that works at any point of the life: fields fill in as the life reaches them.
  // Every mark, fact and domain the life holds ends up somewhere in it (tools/sheet_check.js proves it).
  const SIZE_WORD = { tiny: "Tiny", sm: "Small", med: "Medium", lg: "Large" };
  const RANK_WORD = ["Untrained", "Trained", "Expert", "Master", "Legendary"];
  const cap = (t) => (t ? String(t)[0].toUpperCase() + String(t).slice(1) : "");
  const markText = (m) => cap(human(m));
  function organizationsOf(v, D) {
    const out = [];
    for (const o of D.organizations || []) if (requiresOk(v, o.when, v.year)) out.push(o.name);
    const clan = [...v.facts].find((f) => f.startsWith("clan.")); if (clan) out.push("Clan " + cap(clan.slice(5)));
    if (v.facts.has("culture.silvanesti") && v.name && /^of House /.test(v.name.family || "")) out.push(v.name.family.replace(/^of /, ""));
    return [...new Set(out)];
  }
  function sheetData(v, D) {
    const R = D.rules, A = D.adapter, B = D.build;
    const mapA = v.ancestry ? A.ancestries[v.ancestry.id] : null, anc = mapA ? R.ancestries[mapA.ancestry] : null;
    const cls = v.klass ? R.classes[v.klass] : null, bg = v.background ? R.backgrounds[v.background] : null;
    let f = null, sb = null;
    if (cls && bg) { try { f = buildSheet(v, D); sb = statBlock(v, D, f); } catch (e) { f = null; sb = null; } }
    const names = B.item_names || {};
    const by = {}; for (const m of v.marks) (by[D.marks[m] || "O"] = by[D.marks[m] || "O"] || []).push(m);
    const kind = (k) => (by[k] || []).map(markText);
    const orgs = v.ancestry ? organizationsOf(v, D) : [];
    const orgMarks = new Set((D.organizations || []).filter((o) => requiresOk(v, o.when, v.year)).flatMap((o) => [...((o.when || {}).any || []), ...((o.when || {}).all || [])]).filter((c) => c.startsWith("mark.")).map((c) => c.slice(5)));
    const choices = (v.l1 && v.l1.choices) || [];
    const header = {
      name: v.name ? v.name.full : "Not yet named", level: 1, heroPoints: 1,
      traits: anc ? [SIZE_WORD[anc.size] || "Medium", v.ancestry.text, "Humanoid"] : [],
    };
    const strip = {
      hp: sb ? sb.hp : anc ? `${anc.hp} + class` : "",
      ac: sb ? sb.ac : "", perception: sb ? sgn(sb.perception) : "", speed: anc ? `${anc.speed} ft` : "",
      fortitude: sb ? sgn(sb.saves.fortitude) : "", reflex: sb ? sgn(sb.saves.reflex) : "", will: sb ? sgn(sb.saves.will) : "",
      classDC: sb ? sb.classDC : "",
    };
    const bodyN = bodyNumbers(v);
    const character = {
      ancestry: anc ? `${anc.name}${v.ancestry.text !== anc.name ? " (" + v.ancestry.text + ")" : ""}` : "",
      heritage: (v.l1 && v.l1.heritage && v.l1.heritage.name) || "",
      background: bg ? bg.name : "", klass: cls ? cls.name : "",
      classChoices: choices.map((c) => `${c.feature}: ${c.name}`),
      style: v.l1 && (v.l1.style || v.l1.weaponStyle) ? ({ strength: "Strength (heavy melee weapons)", finesse: "Finesse (quick, light weapons)", ranged: "Ranged (bows, slings, crossbows)" })[v.l1.style || v.l1.weaponStyle] || cap(v.l1.style || v.l1.weaponStyle) : "",
      deity: v.l1 && v.l1.deity ? D.deities[v.l1.deity].name : "",
      faith: faithText(v, D),
      gender: genderText(v), age: v.age != null ? String(v.age) : "", born: v.born != null ? `${v.born} AC` : "",
      ethnicity: v.ancestry ? cultureText(v) : "", nationality: v.ancestry ? nationOf(v, D) : "",
      drawnTo: (v.origin.find((o) => o.title === "Drawn to") || {}).text || "",
      languages: f ? languages(v, D, f) : anc ? anc.languages : [],
      speeds: anc ? { land: anc.speed } : {},
      attributes: f ? ATTR.map((a) => ({ id: a, mod: f.mod[a], key: a === f.key })) : null,
      boosts: f ? { ancestry: f.steps.ancestry.map((x) => x[1]), flaws: f.ancestry.flaws.map((x) => x[0]), background: f.steps.background.map((x) => x[1]), klass: f.steps.klass, free: f.steps.free } : null,
      ancestryBoosts: anc ? anc.boosts.map((o) => (o.length === 1 ? o[0] : "free")) : [],
    };
    const actions = { strikes: sb ? sb.attacks.map((a) => ({ name: a.name, attack: sgn(a.attack), map: a.map.map(sgn), damage: a.damage, traits: a.traits, rank: RANK_WORD[a.rank] })) : [], actions: [], reactions: [], free: [] };
    if (cls) {
      for (const x of ((A.sheet_actions || {})[v.klass] || [])) (actions[x.kind || "actions"] = actions[x.kind || "actions"] || []).push({ name: x.name, cost: x.cost || "", text: x.text || "" });
      if (sb && sb.shield) actions.actions.push({ name: "Raise a Shield", cost: "1 action", text: "+2 circumstance bonus to AC until your next turn." });
    }
    const lifeTraining = Object.entries(v.domains).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).map(([d, n]) => ({ name: DOMAIN_NAMES[d], value: n }));
    const proficiencies = {
      skills: Object.keys(SKILL_ATTR).map((k) => ({ id: k, name: cap(k), attr: SKILL_ATTR[k], mod: sb ? sgn(sb.skills[k]) : "", rank: sb ? RANK_WORD[sb.ranks.skills[k]] : "" })),
      lores: f ? f.lores.map((l) => ({ name: l, mod: sgn(f.mod.int + 3), rank: "Trained" })) : [],
      knowhow: kind("K"),
      attacks: sb ? ["simple", "martial", "advanced", "unarmed"].map((k) => ({ name: cap(k), rank: RANK_WORD[sb.ranks.attacks[k] || 0] })) : [],
      defenses: sb ? ["unarmored", "light", "medium", "heavy"].map((k) => ({ name: cap(k), rank: RANK_WORD[sb.ranks.defenses[k] || 0] })) : [],
      perception: sb ? RANK_WORD[sb.ranks.perception] : "", saves: sb ? Object.fromEntries(Object.entries(sb.ranks.saves).map(([k, r]) => [k, RANK_WORD[r]])) : {},
      classDC: sb ? `${sb.classDC} (Trained)` : "",
      spell: sb && sb.spell ? `attack ${sgn(sb.spell.attack)}, DC ${sb.spell.dc} (Trained)` : "",
      lifeTraining,
    };
    const featName = (u) => (names[u] || {}).name || "";
    const feats = {
      ancestry: [v.l1 && v.l1.ancestryFeat ? v.l1.ancestryFeat.name : "", ...((anc && B.grants[anc.uuid]) || []).map(featName)].filter(Boolean),
      heritage: (v.l1 && v.l1.heritage && v.l1.heritage.name) || "",
      classFeatures: cls ? (B.grants[cls.uuid] || []).map(featName).filter(Boolean) : [],
      classChoices: choices.map((c) => `${c.feature}: ${c.name}`),
      classFeat: v.l1 && v.l1.classFeat ? v.l1.classFeat.name : "",
      skillFeats: bg ? (B.grants[bg.uuid] || []).map(featName).filter(Boolean) : [],
    };
    const S = v.l1 && v.l1.spells;
    const spells = S ? { tradition: cap(S.tradition), type: cap(S.type), attr: S.attr, slots: S.slots, cantrips: S.cantrips.map((x) => x.name), rank1: S.spells.map((x) => x.name), book: S.book } : null;
    const G = (v.l1 && v.l1.gear) || null;
    const inventory = G ? { items: G.bought.map((b) => ({ name: b.name, qty: b.qty || 1, type: b.type })), coins: G.coins, keepsakes: G.keepsakes } : null;
    const P = v.personality || {};
    const allies = v.ties.filter((t) => t.roles.some((r) => ALLY_ROLES.includes(r))).map(tieLine);
    const enemies = v.ties.filter((t) => t.roles.some((r) => ENEMY_ROLES.includes(r))).map(tieLine);
    const others = v.ties.filter((t) => t.roles.length && !t.roles.some((r) => ALLY_ROLES.includes(r) || ENEMY_ROLES.includes(r))).map(tieLine);
    const shaped = lifeTraining.map((x) => `${x.name} ${x.value}`).join(", ");
    const backstory = [
      ...(v.klass && v.background ? [summaryText(v, D)] : []),
      ...v.origin.map((o) => `${o.title}: ${o.text}`),
      ...(shaped ? [`Shaped most by: ${shaped}.`] : []),
      ...(by.P ? [`Paths taken: ${kind("P").join(", ")}.`] : []),
      ...(by.S ? [`What made you: ${kind("S").join(", ")}.`] : []),
      ...(by.H ? [`What you lived through: ${kind("H").join(", ")}.`] : []),
      ...(by.O ? [`From birth: ${kind("O").join(", ")}.`] : []),
    ];
    const reputation = kind("R").filter((t) => !orgMarks.has(t.toLowerCase().replace(/ /g, "_")));
    const notes = [
      ...(by.M ? [`Why you adventure: ${kind("M").join(", ")}.`] : []),
      ...(by.T ? [`Bonds and debts: ${kind("T").join(", ")}.`] : []),
      ...(reputation.length ? [`Reputation: ${reputation.join(", ")}.`] : []),
      ...(by.X ? [`Secrets (for the GM): ${kind("X").join(", ")}.`] : []),
      ...(others.length ? [`Others in your life: ${others.join("; ")}.`] : []),
      ...Object.keys(by).filter((k) => !"PSHOMTRXKW".includes(k)).map((k) => kind(k).join(", ")),
    ];
    const biography = {
      appearance: v.ancestry ? appearanceText(v) : "", wounds: kind("W"), height: bodyN.height, weight: bodyN.weight,
      birthPlace: (D.origin.places[v.birthplace] || {}).name || "", backstory, years: v.log.map((r) => ({ year: r.year, age: r.age, title: r.title, outcome: r.outcome, history: !!r.history })),
      road: v.road || [],
      personality: { attitude: P.attitude || "", beliefs: P.beliefs || "", edicts: [].concat(P.edicts || []), anathema: [].concat(P.anathema || []), likes: P.likes || "", dislikes: P.dislikes || "", catchphrases: P.catchphrases || "" },
      campaign: { notes, allies, enemies, organizations: [...orgs, ...kind("R").filter((t) => orgMarks.has(t.toLowerCase().replace(/ /g, "_")))] },
    };
    return { header, strip, character, actions, proficiencies, feats, spells, inventory, biography, final: !!sb, notes: f ? f.notes : [], problems: f ? checkSheet(f) : [] };
  }
  // The whole sheet as plain text: for "Copy the sheet", and for the coverage check.
  function sheetText(v, D) {
    const s = sheetData(v, D), L = [];
    const c = s.character, b = s.biography;
    L.push(`${s.header.name}: level ${s.header.level}`, s.header.traits.join(", "));
    L.push(`HP ${s.strip.hp} | AC ${s.strip.ac} | Perception ${s.strip.perception} | Speed ${s.strip.speed} | Fort ${s.strip.fortitude}, Ref ${s.strip.reflex}, Will ${s.strip.will} | Class DC ${s.strip.classDC}`);
    L.push("", "CHARACTER", `Ancestry: ${c.ancestry}; heritage: ${c.heritage}`, `Background: ${c.background}`, `Class: ${c.klass}${c.classChoices.length ? " (" + c.classChoices.join("; ") + ")" : ""}`,
      ...(c.style ? [`How you fight: ${c.style}`] : []), ...(c.deity ? [`Deity: ${c.deity}`] : []), ...(c.faith ? [`Faith: ${c.faith}`] : []), `Gender/pronouns: ${c.gender}`, `Age: ${c.age} (born ${c.born})`, `Ethnicity: ${c.ethnicity}`, `Nationality: ${c.nationality}`,
      ...(c.drawnTo ? [`Drawn to: ${c.drawnTo}`] : []), `Languages: ${(c.languages || []).join(", ")}`);
    if (c.attributes) L.push(`Attributes: ${c.attributes.map((a) => `${a.id.toUpperCase()} ${sgn(a.mod)}${a.key ? " (key)" : ""}`).join(", ")}`);
    L.push("", "ACTIONS", ...s.actions.strikes.map((a) => `Strike: ${a.name} ${a.attack} (${a.map.join("/")}), ${a.damage}${a.traits.length ? "; " + a.traits.join(", ") : ""}`),
      ...["actions", "reactions", "free"].flatMap((k) => (s.actions[k] || []).map((x) => `${x.name} (${x.cost}): ${x.text}`)));
    const P = s.proficiencies;
    L.push("", "PROFICIENCIES", ...P.skills.filter((k) => k.rank).map((k) => `${k.name} ${k.mod} ${k.rank}`), ...P.lores.map((l) => `${l.name} ${l.mod} ${l.rank}`),
      ...(P.knowhow.length ? [`Know-how: ${P.knowhow.join(", ")}`] : []), ...P.attacks.map((a) => `${a.name} weapons: ${a.rank}`), ...P.defenses.map((a) => `${a.name} armour: ${a.rank}`),
      ...(P.lifeTraining.length ? [`What life trained: ${P.lifeTraining.map((x) => x.name + " " + x.value).join(", ")}`] : []));
    const F = s.feats;
    L.push("", "FEATS", `Ancestry: ${F.ancestry.join(", ")}`, `Class features: ${F.classFeatures.join(", ")}`, ...F.classChoices, ...(F.classFeat ? [`Class feat: ${F.classFeat}`] : []), ...(F.skillFeats.length ? [`Skill feats: ${F.skillFeats.join(", ")}`] : []));
    if (s.spells) L.push("", "SPELLS", `${s.spells.tradition} ${s.spells.type}; cantrips: ${s.spells.cantrips.join(", ")}; rank 1 (${s.spells.slots}/day): ${s.spells.rank1.join(", ")}`);
    if (s.inventory) L.push("", "INVENTORY", s.inventory.items.map((i) => i.name + (i.qty > 1 ? ` ×${i.qty}` : "")).join(", "), `Coins: ${s.inventory.coins.gp || 0} gp, ${s.inventory.coins.sp || 0} sp, ${s.inventory.coins.cp || 0} cp`, ...(s.inventory.keepsakes.length ? [`Keepsakes: ${s.inventory.keepsakes.join("; ")}`] : []));
    const p = b.personality;
    L.push("", "BIOGRAPHY", `Appearance: ${b.appearance}`, ...(b.wounds.length ? [`Scars and wounds: ${b.wounds.join(", ")}`] : []), `Height ${b.height}, weight ${b.weight}`, `Birthplace: ${b.birthPlace}`,
      ...b.backstory, "", `Attitude: ${p.attitude}`, `Beliefs: ${p.beliefs}`, `Edicts: ${p.edicts.join("; ")}`, `Anathema: ${p.anathema.join("; ")}`, `Likes: ${p.likes}`, `Dislikes: ${p.dislikes}`, `Catchphrase: ${p.catchphrases}`,
      "", "CAMPAIGN", ...b.campaign.notes, `Allies: ${b.campaign.allies.join("; ")}`, `Enemies: ${b.campaign.enemies.join("; ")}`, `Organizations: ${b.campaign.organizations.join("; ")}`);
    return L.join("\n");
  }

  // ---------------- what goes out ----------------
  function bodyNumbers(v) {
    return v.body ? metric(v.body.cm, v.body.kg) : { height: "", weight: "" };
  }
  function appearanceText(v) {
    const a = v.appearance;
    const scars = [...v.marks].filter((m) => ["scar", "burn_scar", "marked_by_magic", "birthmark", "physical_limitation"].includes(m)).map(human);
    const rare = (a.rare || []).map((r) => r.text);
    const feat = a.feature && !/^(Nothing|No marks)/.test(a.feature) ? `${a.feature}.` : "";
    const aged = { middle: { elf: "", dwarf: "Grey in the beard and braids.", goblin: "Wrinkled, and slower than the young ones.", hobgoblin: "Scarred and greying.",
        minotaur: "Grey in the muzzle.", centaur: "Grey in the mane.", gnome: "Deep lines from years of squinting.", kender: "The fine web of lines kender think so handsome.", default: "Grey coming in at the temples." },
      old: { elf: "The stillness of a very old elf.", dwarf: "Beard and braids gone white.", goblin: "Ancient, for a goblin.", hobgoblin: "Old, and still standing.",
        minotaur: "A muzzle gone white.", centaur: "A mane gone white.", gnome: "Bent, and still tinkering.", kender: "Wizened as an old apple, and still bright-eyed.", default: "White-haired and weathered." } }[v.band] || {};
    const ageLook = aged[peopleKey(v)] ?? aged.default ?? "";
    return [a.build ? `${a.build} build, ${a.height ? a.height.toLowerCase() : ""}.` : "", `Skin: ${a.skin}.`, `Hair: ${a.hair}.`, `Eyes: ${a.eyes}.`, feat, ageLook,
      rare.length ? `People notice: ${rare.join(", ")}.` : "", scars.length ? `Marks: ${scars.join(", ")}.` : ""].filter(Boolean).join(" ");
  }
  function genderText(v) {
    return { woman: "Woman (she/her)", man: "Man (he/him)", nonbinary: "Non-binary (they/them)" }[v.gender] || "";
  }
  function nameStoryText(v) { return (v.nameStory || []).join("; ") + "."; }
  function nationOf(v, D) {
    const r = regionNow(v), reg = (D.regions || []).find((x) => x.id === r) || {};
    return reg.nation || { abanasinia: "Abanasinian", solamnia: "Solamnic" }[r] || reg.name || "Foreign";
  }
  function cultureText(v) {
    if (v.cultureLabel) return v.cultureLabel;
    const a = v.ancestry.id;
    if (a === "human") return v.facts.has("culture.plains") ? "Abanasinian plainsfolk" : v.facts.has("culture.solamnic") ? "Solamnic" : v.facts.has("culture.foreign") ? "Foreign-born" : "Abanasinian townsfolk";
    return v.ancestry.text;
  }
  const ALLY_ROLES = ["ally", "mentor", "protector", "spouse", "love", "old_love", "companion", "ward", "older sibling", "younger sibling", "twin", "absent_sibling", "debtor", "grandparent", "child"];
  const ENEMY_ROLES = ["rival", "creditor"];
  function tieLine(t) { return `${t.name}${t.label ? ", " + t.label : ""}${t.gender === "nonbinary" ? " (they/them)" : ""} (${t.roles.map((r) => r.replace(/_/g, " ")).join(", ")})`; }

  function backstoryText(v, D) {
    const L = [v.name.full, `${cultureText(v)}, born ${v.born} AC in ${(D.origin.places[v.birthplace] || {}).name || ""}. ${v.age} years old in ${v.year} AC.`, `Name: ${nameStoryText(v)}`, ""];
    for (const o of v.origin) L.push(`${o.title}: ${o.text}`);
    let st = null;
    for (const r of v.log) {
      if (r.stage !== st) { st = r.stage; L.push("", STAGE_NAMES[st].toUpperCase()); }
      L.push("", `${r.year} AC, age ${r.age}. ${r.title}${r.history ? " (history of Krynn)" : ""}`, r.scene, `Choice: ${r.choice}`, r.outcome);
    }
    L.push("", "THE ROAD", ...v.road);
    if (v.ties.length) L.push("", "PEOPLE", ...v.ties.filter((t) => t.roles.length).map((t) => "- " + tieLine(t)));
    return L.join("\n");
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function backstoryHtml(v, D) {
    const SD = sheetData(v, D);
    const extra = SD.biography.backstory.filter((l) => /^(Shaped most by|Paths taken|What made you|What you lived through|From birth):/.test(l));
    if (SD.biography.wounds.length) extra.push(`Scars and wounds: ${SD.biography.wounds.join(", ")}.`);
    return `<p>${esc(nameStoryText(v))}</p><p>${esc(v.origin.map((o) => o.text).join(" "))}</p>` + extra.map((l) => `<p>${esc(l)}</p>`).join("")
      + v.log.map((r) => `<p><strong>${r.year} AC, age ${r.age}: ${esc(r.title)}.</strong> ${esc(r.scene)} <em>${esc(r.choice)}.</em> ${esc(r.outcome)}</p>`).join("")
      + `<p><strong>The road.</strong> ${esc(v.road.join(" "))}</p>`;
  }
  function foundryMacro(v, D, f) {
    const body = bodyNumbers(v, D);
    const P = v.personality;
    const F = {
      name: v.name.full, age: String(v.age), gender: genderText(v),
      ethnicity: cultureText(v), nationality: nationOf(v, D),
      height: body.height, weight: body.weight,
      biography: {
        appearance: `<p>${esc(appearanceText(v))}</p>`, backstory: backstoryHtml(v, D),
        birthPlace: (D.origin.places[v.birthplace] || {}).name || "", attitude: P.attitude || "", beliefs: P.beliefs || "",
        edicts: P.edicts || [], anathema: P.anathema || [], likes: P.likes || "", dislikes: P.dislikes || "",
        allies: v.ties.filter((t) => t.roles.some((r) => ALLY_ROLES.includes(r))).map((t) => `<p>${esc(tieLine(t))}</p>`).join(""),
        enemies: v.ties.filter((t) => t.roles.some((r) => ENEMY_ROLES.includes(r))).map((t) => `<p>${esc(tieLine(t))}</p>`).join(""),
      },
      ancestry: f.ancestry.uuid, heritage: f.heritage ? f.heritage.uuid : null, background: f.background.uuid, klass: f.klass.uuid,
      ancestryBoosts: f.steps.ancestry.map((x) => x[1]), ancestryOptions: f.steps.ancestry.map((x) => x[0]),
      backgroundBoosts: f.steps.background.map((x) => x[1]), backgroundOptions: f.steps.background.map((x) => x[0]),
      key: f.key, free: f.steps.free, skills: [...f.fixed, ...f.chosen],
    };
    return `// Lifewrought -> Foundry VTT (pf2e system). Paste into a macro of type "script" and run it.
// NOT YET TESTED in a real Foundry: the data paths were checked against the system's source code.
(async () => {
  const F = ${JSON.stringify(F, null, 2)};
  const skills = Object.fromEntries(F.skills.map((s) => [s, { rank: 1 }]));
  const actor = await Actor.create({
    name: F.name, type: "character",
    system: {
      details: { age: { value: F.age }, gender: { value: F.gender }, ethnicity: { value: F.ethnicity },
        nationality: { value: F.nationality }, height: { value: F.height }, weight: { value: F.weight }, biography: F.biography },
      build: { attributes: { boosts: { 1: F.free } } },
      skills,
    },
  });
  const mark = (src, options, picks) => {
    const slots = Object.entries(src.system.boosts);
    options.forEach((ops, i) => {
      const slot = slots.find(([, b]) => !b.selected && b.value.length === ops.length && ops.every((o) => b.value.includes(o)));
      if (slot) slot[1].selected = picks[i];
    });
  };
  const drop = async (uuid, prepare) => {
    if (!uuid) return;
    const doc = await fromUuid(uuid);
    if (!doc) return ui.notifications.error("Lifewrought: " + uuid + " was not found in the compendiums.");
    const src = doc.toObject();
    prepare?.(src);
    await actor.createEmbeddedDocuments("Item", [src]);
  };
  await drop(F.ancestry, (s) => mark(s, F.ancestryOptions, F.ancestryBoosts));
  await drop(F.heritage);
  await drop(F.background, (s) => mark(s, F.backgroundOptions, F.backgroundBoosts));
  await drop(F.klass, (s) => { s.system.keyAbility.selected = F.key; });
  actor.sheet.render(true);
  ui.notifications.info("Lifewrought: character created. Finish the choices the sheet asks for.");
})();
`;
  }

  function summaryText(v, D) {
    const bp = D.origin.places[v.birthplace] || {};
    const born = bp.name ? `${bp.at || "in"} ${bp.name}` : "somewhere";
    const motives = [...v.marks].filter((m) => m.startsWith("motive_")).map(human);
    const turning = v.log.filter((r) => r.history || r.opportunity).map((r) => r.title.toLowerCase());
    const bg = D.rules.backgrounds[v.background].name.toLowerCase(), kl = D.rules.classes[v.klass].name.toLowerCase();
    const wounds = [...v.marks].filter((m) => D.marks[m] === "W").slice(0, 2).map(human);
    const strengths = [...v.marks].filter((m) => D.marks[m] === "S").slice(0, 2).map(human);
    return [
      `${v.name.full}, ${cultureText(v).replace(/^(Half-elf|Gnome|Goblin|Hobgoblin|Centaur|Minotaur|Hill|Mountain|Foreign-born|Kender)/, (w) => w.toLowerCase())}, was born ${born} in ${v.born} AC.`,
      `People came to know them as ${an(bg)}; the life they lived made them ${an(kl)}.`,
      v.band && v.band !== "young" ? (v.veteran ? "They adventured once, long ago, gave it up, and are learning it all again." : "A late calling: they lived a whole life before this one.") : "",
      turning.length ? `Turning points: ${turning.slice(0, 4).join("; ")}.` : "",
      strengths.length ? `Strengths: ${strengths.join(", ")}.` : "",
      wounds.length ? `Wounds: ${wounds.join(", ")}.` : "",
      `${v.age} years old in ${v.year} AC, they arrive in ${v.startName}` + (motives.length ? `, driven by ${motives.join(" and ")}.` : "."),
    ].filter(Boolean).join(" ");
  }

  return { MODES, FATE_POINTS, CONCEPT_TIMES, minAge, live, sheetData, sheetText, organizationsOf, summaryText, buildSheet, checkSheet, backstoryText, foundryMacro, foundryActor, statBlock, languages, appearanceText, bodyNumbers, cultureText, tieLine, genderText, nameStoryText,
    bands, ATTR, DOMAIN_NAMES, STAGE_NAMES, human, ALLY_ROLES, ENEMY_ROLES };
})();
if (typeof module !== "undefined") module.exports = LW;
if (typeof window !== "undefined") window.LW = LW;
