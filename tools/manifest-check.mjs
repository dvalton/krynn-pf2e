// Checks module.json and the files it points at: paths exist, every script parses, every relative import resolves,
// every template a script names exists, and the homebrew registrations have the shape PF2e reads.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const m = JSON.parse(fs.readFileSync(path.join(ROOT, "module.json"), "utf8"));
const errors = [];
const exists = (p) => fs.existsSync(path.join(ROOT, p));

for (const k of ["id", "title", "version", "compatibility", "esmodules", "manifest", "download"]) if (!m[k]) errors.push(`module.json: no ${k}`);
if (m.relationships?.systems?.[0]?.id !== "pf2e") errors.push("module.json: must require the pf2e system");
for (const p of [...(m.scripts || []), ...m.esmodules, ...m.styles, ...m.languages.map((l) => l.path), "lifewrought/index.html", "lifewrought/data.json"]) if (!exists(p)) errors.push(`missing file: ${p}`);
for (const p of m.packs || []) if (!fs.existsSync(path.join(ROOT, "packs-src", p.name)) || !fs.readdirSync(path.join(ROOT, "packs-src", p.name)).length) errors.push(`pack ${p.name} has no source (run tools/build-packs.mjs)`);
for (const f of fs.readdirSync(path.join(ROOT, "scripts/content"))) { const src = fs.readFileSync(path.join(ROOT, "scripts/content", f), "utf8"); for (const im of src.matchAll(/modules\/krynn-pf2e\/(icons\/[a-z-]+\.svg)/g)) if (!exists(im[1])) errors.push(`${f}: icon ${im[1]} not found`); }
if (!m.socket) errors.push("module.json: the socket is needed for players' characters");

const scripts = fs.readdirSync(path.join(ROOT, "scripts"), { recursive: true }).filter((f) => f.endsWith(".mjs")).map((f) => path.join("scripts", f));
for (const f of scripts) {
  try { execFileSync(process.execPath, ["--check", path.join(ROOT, f)], { stdio: "pipe" }); } catch (e) { errors.push(`${f}: ${String(e.stderr).split("\n").slice(0, 4).join(" ")}`); }
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const im of src.matchAll(/(?:import|from)\s*\(?\s*["'](\.[^"']+)["']/g)) {
    const target = path.normalize(path.join(path.dirname(f), im[1]));
    if (!exists(target)) errors.push(`${f}: import ${im[1]} not found`);
  }
  for (const t of src.matchAll(/template\("([a-z-]+)"\)/g)) if (!exists(`templates/${t[1]}.hbs`)) errors.push(`${f}: template ${t[1]} not found`);
}

const hb = m.flags?.[m.id]?.["pf2e-homebrew"];
if (!hb) errors.push("module.json: no pf2e-homebrew flags");
else for (const [rec, entries] of Object.entries(hb)) {
  if (!["languages", "creatureTraits", "featTraits", "spellTraits", "weaponTraits", "equipmentTraits", "classTraits", "damageTypes", "skills"].includes(rec)) errors.push(`homebrew: unknown record ${rec}`);
  for (const [slug, v] of Object.entries(entries)) {
    if (!/^[a-z][a-z0-9-]*$/.test(slug)) errors.push(`homebrew ${rec}: bad slug ${slug}`);
    if (typeof v !== "string" && !(v && typeof v.label === "string")) errors.push(`homebrew ${rec}.${slug}: needs a label`);
  }
}

console.log(`module ${m.id} ${m.version}: ${scripts.length} scripts | errors: ${errors.length}`);
for (const e of errors) console.log("  - " + e);
if (errors.length) process.exit(1);
