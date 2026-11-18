// The Portuguese review: every Portuguese text of the module (lang/pt-BR.json and the Babele files) checked for
// English left behind, distances in feet, and PF2e terms that differ from the Brazilian translation's.
//   node tools/pt-review.mjs          lists the problems (exit 1 if any)
import fs from "node:fs";
import path from "node:path";
import * as G from "../scripts/content/generators.mjs";
import { STATUS_PT } from "../scripts/content/atlas.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };
// Proper names and words the same in both languages, which the checks don't count as English.
const NAMES = /\b(Lord Soth|Mount Nevermind|Pax Tharkas|Xak Tsaroth|Que-Shu|Que-Kiri|Que-Teh|Darken Wood|Hylo|Sikk'et Hul|Daltigoth|Gwynned|Kendermore|Flotsam|Nethosak|Icewall|Khuri-Khan|Hogan Bight|Inn of the Last Home|Tower of High Sorcery|Ancient \w+ Dragon|Young Red Dragon|Speedrun Strats|Whitestone|Lore|Knighthood Lore|Silvanesti Lore|Plains Lore|Engineering Lore|Legion Lore|Mysticism Lore|False Gods Lore|Warfare Lore|Gnome Lore|Sailing Lore|Hefty Hauler|Experienced Tracker|Train Animal|Specialty Crafting|Lie to Me|Student of the Canon|Deceptive Worship|Intimidating Glare|Quick Repair|Underwater Marauder|Kender Pockets|Gnomish Contraption|Breach of the Measure|Dragon Overlord|Skull Totem|Faced Dragonfear|Weapon Caught in Stone|Aurak's Final Frenzy|Dragonfear|Krynn)\b/g;
// Word boundaries that know accented letters ("Heróis" doesn't end in "is").
const word = (list) => new RegExp(`(?<![\\p{L}])(${list.join("|")})(?![\\p{L}])`, "iu");
const ENGLISH = word(["the", "and", "with", "you", "your", "they", "their", "is", "are", "was", "from", "which", "when", "while", "each", "every", "creature", "creatures", "damage", "save", "saving throw",
  "feet", "foot", "off-guard", "frightened", "fatigued", "immobilized", "restrained", "prone", "stunned", "slowed", "clumsy", "blinded", "fleeing", "bonus", "penalty", "check", "steel", "gods", "moon", "knight", "dragon"]);
const FEET = /\d+\s*(feet|foot|ft\.?|pés)(?![\p{L}])/iu;

function strip(s) {
  return String(s).replace(/<[^>]+>/g, " ").replace(/@(UUID|Check|Damage|Localize|KrynnNow|KrynnYear|Template)\[[^\]]*\](\{[^}]*\})?/g, " ").replace(/\{[a-zA-Z]+\}/g, " ").replace(NAMES, " ").replace(/\s+/g, " ").trim();
}

export function review() {
  const problems = [];
  const en = flat(JSON.parse(fs.readFileSync(path.join(ROOT, "lang/en.json"), "utf8")));
  const pt = flat(JSON.parse(fs.readFileSync(path.join(ROOT, "lang/pt-BR.json"), "utf8")));
  const check = (where, text, english = null) => {
    const t = strip(text);
    if (!t) return;
    const m = ENGLISH.exec(t);
    if (m) problems.push(`${where}: English "${m[0]}" in: ${t.slice(0, 110)}`);
    if (FEET.test(t)) problems.push(`${where}: a distance in feet: ${t.slice(0, 110)}`);
    if (english && t.length > 18 && t === strip(english)) problems.push(`${where}: the same as the English: ${t.slice(0, 110)}`);
  };
  for (const [k, v] of Object.entries(pt)) {
    if (/^KRYNN\.Calendar\.(Month|Weekday)\./.test(k) || /\.(Abbr)$/.test(k)) continue;
    check(`lang ${k}`, v, en[k]);
  }
  const dir = path.join(ROOT, "babele/pt-BR");
  for (const f of fs.readdirSync(dir)) {
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const [name, e] of Object.entries(b.entries || {})) {
      check(`${f} ${name} (name)`, e.name ?? "");
      if (e.description) check(`${f} ${name}`, e.description);
      for (const [pg, p] of Object.entries(e.pages || {})) check(`${f} ${name} / ${pg}`, `${p.name ?? ""} ${p.text ?? ""}`);
      for (const [range, text] of Object.entries(e.results || {})) check(`${f} ${name} ${range}`, text);
    }
  }
  // The generators' tables and the Atlas's status lines (Portuguese kept in the code).
  const pairs = { TRADES: G.TRADES, WANTS: G.WANTS, SECRETS: G.SECRETS, QUIRKS: G.QUIRKS, ROAD: G.ROAD, DISHES: G.DISHES };
  for (const [name, list] of Object.entries(pairs)) list.forEach(([e, p], i) => check(`generators ${name}[${i}]`, p, e));
  for (const [name, list] of Object.entries({ GEMS: G.GEMS, ART: G.ART })) list.forEach(([, e, p], i) => check(`generators ${name}[${i}]`, p, e));
  for (const [period, list] of Object.entries(G.PERIOD_RUMOURS)) list.forEach(([e, p], i) => check(`rumours ${period}[${i}]`, p, e));
  for (const [region, list] of Object.entries(G.REGION_RUMOURS)) list.forEach(([, , e, p], i) => check(`rumours ${region}[${i}]`, p, e));
  for (const [climate, seasons] of Object.entries(G.WEATHER)) for (const [season, list] of Object.entries(seasons)) list.forEach(([e, p, fe, fp], i) => { check(`weather ${climate}.${season}[${i}]`, p, e); if (fp) check(`weather ${climate}.${season}[${i}] effect`, fp, fe); });
  for (const [e, p] of Object.entries(STATUS_PT)) check(`status "${e}"`, p, e);
  for (const part of ["use", "flaw", "thing", "power"]) G.INVENTION.pt[part].forEach((p, i) => check(`invention ${part}[${i}]`, p));
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const p = review();
  for (const x of p) console.log("  - " + x);
  console.log(`Portuguese review: ${p.length} problem(s)`);
  if (p.length) process.exit(1);
}
