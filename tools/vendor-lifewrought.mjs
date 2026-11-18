// Copies the Lifewrought web app (page, engine and built data) into lifewrought/, from a Lifewrought checkout:
//   node tools/vendor-lifewrought.mjs ../lifewrought
// The checkout's data must be built (node tools/build.js there). VERSION.json records what was copied.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = path.resolve(process.argv[2] || "../lifewrought");
const out = path.join(ROOT, "lifewrought");
fs.mkdirSync(out, { recursive: true });
for (const f of ["index.html", "engine.js", "data.json"]) fs.copyFileSync(path.join(src, "web", f), path.join(out, f));
// engine.js is a plain script (CommonJS in Node); this package.json keeps Node from reading it as an ES module.
fs.writeFileSync(path.join(out, "package.json"), JSON.stringify({ type: "commonjs" }) + "\n");
const git = (...a) => { try { return execFileSync("git", ["-C", src, ...a], { encoding: "utf8" }).trim(); } catch (e) { return ""; } };
const D = JSON.parse(fs.readFileSync(path.join(out, "data.json"), "utf8"));
const info = { commit: git("rev-parse", "--short", "HEAD"), branch: git("branch", "--show-current"), dirty: !!git("status", "--porcelain"), copied: new Date().toISOString().slice(0, 10),
  events: Object.keys(D.events || {}).length || (D.events || []).length, regions: (D.regions || []).filter((r) => r.content === "ready").length };
fs.writeFileSync(path.join(out, "VERSION.json"), JSON.stringify(info, null, 1) + "\n");
console.log("lifewrought/", info);
