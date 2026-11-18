// Pure logic of 0.5: what a draconian's death throes do, the reach and DC of dragonfear, and the legacy dragons'
// names. No Foundry globals.
import { stat } from "../content/creatures.mjs";
import { DRAGON_COLORS, DRAGON_AGES } from "../content/dragons.mjs";

export const DRACONIANS = ["baaz", "kapak", "bozak", "sivak", "aurak"];

// PF2e's level-based DC, and the hard one (+2) the dragons and draconians use.
export const levelDC = (level) => 14 + level + Math.floor(Math.max(level, 0) / 3);
export const hardDC = (level) => levelDC(level) + 2;

// Which draconian an actor is: the module's flag, an item with a death throes slug, or its name.
export function draconianKind({ flag = null, slugs = [], name = "" } = {}) {
  if (DRACONIANS.includes(flag)) return flag;
  for (const s of slugs) { const m = /^death-throes-(\w+)$/.exec(s || ""); if (m && DRACONIANS.includes(m[1])) return m[1]; }
  const n = String(name).toLowerCase();
  return DRACONIANS.find((k) => new RegExp(`\\b${k}\\b`).test(n)) ?? null;
}

// What happens when a draconian of this kind and level drops to 0 HP. `killer` is what the module knows of the last
// creature that hurt it: { name, humanoid, weapon, melee }. Returns the plan the Foundry side carries out.
export function throesPlan(kind, level, killer = null) {
  const dc = stat.dc(Math.max(-1, Math.min(24, level)), "mod");
  const area = stat.area(Math.max(-1, Math.min(24, level)));
  switch (kind) {
    case "baaz":
      return { kind, dc, token: { tint: "#8a8a8a" }, save: killer?.melee ? { type: "reflex", who: killer.name } : null, weapon: killer?.melee ? killer.weapon : null, effect: "krynn-weapon-in-stone" };
    case "kapak":
      return { kind, dc, token: { hidden: true }, area: { radius: 5, rounds: 3, color: "#7fbf3f" }, damage: `${Math.max(1, Math.ceil(level / 2))}d6[acid]`, save: { type: "reflex", basic: true } };
    case "bozak":
      return { kind, dc, token: { hidden: true }, burst: 10, damage: `${area}[piercing]`, save: { type: "reflex", basic: true } };
    case "sivak":
      if (killer?.humanoid) return { kind, dc, shape: killer.name, token: { mimic: true } };
      return { kind, dc, token: { tint: "#e0662b" }, burst: 5, damage: `${area}[fire]`, save: { type: "reflex", basic: true } };
    case "aurak":
      return { kind, dc, frenzy: { rounds: 2, effect: "krynn-aurak-frenzy" }, token: { tint: "#3fbf6a" }, burst: 10, damage: `${stat.area(Math.max(-1, Math.min(24, level)))}[electricity]`, save: { type: "reflex", basic: true }, keepAlive: true };
    default:
      return null;
  }
}

// An inline roll and check for a chat card (PF2e's own enrichers make them buttons).
export function inlineFor(plan) {
  const out = [];
  if (plan.damage) out.push(`@Damage[${plan.damage}]`);
  if (plan.save) out.push(`@Check[${plan.save.type}|dc:${plan.dc}${plan.save.basic ? "|basic" : ""}]`);
  return out.join(" ");
}

// Dragonfear: reach by the dragon's age (from its name), and its DC by level.
export function dragonfearRadius(name = "") {
  const n = String(name).toLowerCase();
  if (/\bancient\b|\bwyrm\b|overlord/.test(n)) return 120;
  if (/\byoung\b|\bwyrmling\b/.test(n)) return 60;
  return 90;
}
export const dragonfearDC = (level) => hardDC(level);

// The legacy bestiaries' chromatic and metallic dragons: "Adult Red Dragon", "Ancient Gold Dragon (Spellcaster)".
const DRAGON_RE = new RegExp(`^(${DRAGON_AGES.join("|")}) (${DRAGON_COLORS.join("|")}) dragon( \\((spellcaster)\\))?$`, "i");
export function parseDragon(name) {
  const m = DRAGON_RE.exec(String(name).trim());
  if (!m) return null;
  const age = m[1].toLowerCase(), color = m[2].toLowerCase();
  return { age, color, spellcaster: !!m[4], chromatic: DRAGON_COLORS.indexOf(color) < 5 };
}

// The legacy dragon an Overlord is built on.
export function overlordBase(color) { return `Ancient ${color[0].toUpperCase()}${color.slice(1)} Dragon`; }

// Which tokens a burst reaches: distances in feet between token centres, minus the source's own half-size.
export function withinFeet(source, others, feet, gridFeet = 5, gridPx = 100) {
  const reach = feet + (source.size ?? 1) * gridFeet / 2;
  return others.filter((o) => o.id !== source.id && Math.hypot(o.x - source.x, o.y - source.y) / gridPx * gridFeet - (o.size ?? 1) * gridFeet / 2 <= reach);
}
