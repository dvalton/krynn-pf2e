// Builds lang/en.json and lang/pt-BR.json from the hand-written strings (lang/strings/*) and the calendar names
// (scripts/logic/calendar.mjs). With --check, it also fails if the two languages differ, or a key used in the code
// or templates is missing.
import fs from "node:fs";
import path from "node:path";
import { calendarStrings } from "../scripts/logic/calendar.mjs";
import { bestiaryStrings } from "../scripts/content/creatures.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const LANGS = ["en", "pt-BR"];
const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };
const nest = (f) => { const o = {}; for (const [k, v] of Object.entries(f)) { const parts = k.split("."); let n = o; parts.slice(0, -1).forEach((p) => { n = n[p] ??= {}; }); n[parts.at(-1)] = v; } return o; };

const built = {};
for (const lang of LANGS) {
  const hand = flat(JSON.parse(fs.readFileSync(path.join(ROOT, "lang/strings", `${lang}.json`), "utf8")));
  built[lang] = { ...hand, ...calendarStrings(lang), ...bestiaryStrings(lang) };
  fs.writeFileSync(path.join(ROOT, "lang", `${lang}.json`), JSON.stringify(nest(built[lang]), null, 1) + "\n");
}

if (process.argv.includes("--check")) {
  const errors = [];
  const [a, b] = LANGS.map((l) => new Set(Object.keys(built[l])));
  for (const k of a) if (!b.has(k)) errors.push(`missing in pt-BR: ${k}`);
  for (const k of b) if (!a.has(k)) errors.push(`missing in en: ${k}`);
  // Keys used in code (T("X.Y") means KRYNN.X.Y) and templates ("KRYNN.X.Y").
  const files = (dir) => fs.readdirSync(path.join(ROOT, dir), { recursive: true }).map((f) => path.join(ROOT, dir, f)).filter((f) => /\.(mjs|hbs)$/.test(f));
  const used = new Set();
  for (const f of [...files("scripts"), ...files("templates")]) {
    const s = fs.readFileSync(f, "utf8");
    for (const m of s.matchAll(/\bT\("([A-Za-z0-9.]+)"/g)) used.add(`KRYNN.${m[1]}`);
    for (const m of s.matchAll(/"(KRYNN\.[A-Za-z0-9.]+)"/g)) used.add(m[1]);
  }
  for (const k of used) if (!a.has(k)) errors.push(`used but not defined: ${k}`);
  // Template-literal keys (T(`Moon.${id}`)) are checked by the families they come from.
  const families = { "Moon": ["solinari", "lunitari", "nuitari"], "Robe": ["white", "red", "black"], "Phase": ["high", "waning", "low", "waxing"] };
  for (const [fam, ids] of Object.entries(families)) for (const id of ids) if (!a.has(`KRYNN.${fam}.${id}`)) errors.push(`missing ${fam}.${id}`);
  console.log(`strings: ${a.size} per language, ${used.size} used directly | errors: ${errors.length}`);
  for (const e of errors) console.log("  - " + e);
  if (errors.length) process.exit(1);
}
