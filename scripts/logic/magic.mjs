// The magic of Krynn: what the moons do to a mage of High Sorcery tonight, and whether a spell finds its source
// (a god who answers, a moon that shines). Pure logic, no Foundry.
import { godsPresent, moonsPresent } from "./ages.mjs";

export const MOON_OF_ROBE = { white: "solinari", red: "lunitari", black: "nuitari" };
export const ROBES = Object.keys(MOON_OF_ROBE);

const CLASSIC = { high: 1, waxing: 0, waning: 0, low: -1 };

// The moons' effect on one mage. Returns null when the moons do nothing for them (no order, a renegade, the moons gone,
// below the level the GM chose, or moon magic off). `value` is a status bonus (or penalty) to spell attack rolls and
// spell DCs; `notes` are the phase's other gifts and strains, told in the effect's description.
export function moonMagic({ mode, robe, sky, moons = true, level = 1, minLevel = 1, renegade = false }) {
  if (mode === "off" || !ROBES.includes(robe) || renegade || !moons || !sky || level < minLevel) return null;
  const moonId = MOON_OF_ROBE[robe];
  const moon = sky.moons.find((m) => m.id === moonId);
  if (!moon) return null;
  const eye = !!sky.eye;
  const aligned = !eye && sky.alignments.some((pair) => pair.includes(moonId));
  let value = 0;
  const notes = [];
  if (mode === "classic") {
    value = eye ? 2 : Math.min(2, CLASSIC[moon.phase] + (aligned ? 1 : 0));
    if (eye) notes.push("eye");
    else {
      notes.push(`phase.${moon.phase}`);
      if (aligned) notes.push("aligned");
    }
  } else if (mode === "light") {
    value = eye ? 2 : moon.phase === "high" ? 1 : 0;
    if (eye) notes.push("eye"); else if (moon.phase === "high") notes.push("phase.high");
  } else if (mode === "narrative") {
    notes.push(eye ? "eye" : `phase.${moon.phase}`);
  }
  if (mode !== "narrative" && value === 0 && !notes.length) return null;
  return { robe, moon: moonId, phase: moon.phase, aligned, eye, value, notes, mode, key: [mode, robe, moon.phase, aligned, eye, value].join(":") };
}

// Whether a spell is cast, warned about, or fails, for the year and the GM's settings.
// - Divine spells of a caster with a god fail (strict) or warn while the gods are absent, unless the caster is a mystic.
// - Arcane spells of a mage of High Sorcery fail or warn while the moons are gone, unless they learned primal sorcery.
export function castVerdict({ tradition, hasDeity, year, godsMode, hsMode, mystic = false, highSorcery = false, primal = false }) {
  if (tradition === "divine" && hasDeity && !mystic && !godsPresent(year) && godsMode !== "off") {
    return { block: godsMode === "strict", warn: godsMode === "warn", reason: "gods" };
  }
  if (tradition === "arcane" && highSorcery && !primal && !moonsPresent(year) && hsMode !== "off") {
    return { block: hsMode === "strict", warn: hsMode === "warn", reason: "moons" };
  }
  return { block: false, warn: false, reason: null };
}
