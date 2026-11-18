// Writes module.json (version, URLs and the PF2e homebrew registrations) and, with --zip, dist/module.zip for a release.
// The manifest URL always points at the latest release; the download URL at this version's zip.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { HOMEBREW } from "../scripts/foundry/homebrew.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const REPO = "https://github.com/dvalton/krynn-pf2e";
const version = pkg.version;

const manifest = {
  id: "krynn-pf2e",
  title: "Krynn for PF2e",
  description: "The world of Dragonlance for the Pathfinder Second Edition system: the ages of Krynn, its calendar and the three moons of magic, its gods, peoples and orders, and the lives of its heroes, made with Lifewrought. Unofficial fan content for private play.",
  version,
  authors: [{ name: "dvalton", url: "https://github.com/dvalton" }],
  compatibility: { minimum: "14.360", verified: "14.370" },
  relationships: { systems: [{ id: "pf2e", type: "system", compatibility: { minimum: "8.7.0", verified: "8.7.1" } }] },
  scripts: ["lifewrought/engine.js"],
  esmodules: ["scripts/krynn.mjs"],
  socket: true,
  styles: ["styles/krynn.css"],
  languages: [
    { lang: "en", name: "English", path: "lang/en.json" },
    { lang: "pt-BR", name: "Português (Brasil)", path: "lang/pt-BR.json" },
  ],
  url: REPO,
  manifest: `${REPO}/releases/latest/download/module.json`,
  download: `${REPO}/releases/download/v${version}/module.zip`,
  readme: `${REPO}#readme`,
  bugs: `${REPO}/issues`,
  changelog: `${REPO}/blob/main/CHANGELOG.md`,
  flags: { "krynn-pf2e": { "pf2e-homebrew": HOMEBREW } },
};
fs.writeFileSync(path.join(ROOT, "module.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`module.json ${version}`);

if (process.argv.includes("--zip")) {
  const dist = path.join(ROOT, "dist");
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist);
  const parts = ["module.json", "scripts", "templates", "styles", "lang/en.json", "lang/pt-BR.json", "lifewrought", "README.md", "CHANGELOG.md", "LICENSE"].filter((p) => fs.existsSync(path.join(ROOT, p)));
  execFileSync("zip", ["-r", "-q", path.join(dist, "module.zip"), ...parts], { cwd: ROOT });
  fs.copyFileSync(path.join(ROOT, "module.json"), path.join(dist, "module.json"));
  console.log(`dist/module.zip: ${parts.join(", ")}`);
}
