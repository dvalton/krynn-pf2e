// The ages of Krynn and what each year means for play: whether the gods answer, whether the moons of magic shine.
// Pure logic, no Foundry: used by the module and by the unit tests (node --test).
// Years are counted as Astinus counts them: 0 AC is the year of the Cataclysm, negative years are PC (1 PC is -1).
// Pre-Cataclysm boundaries are approximate; they follow the usual timeline (the Third Dragon War ends about 1018 PC).

export const AGES = [
  { id: "starbirth", from: -Infinity, to: -9001 },
  { id: "dreams", from: -9000, to: -1019 },
  { id: "might", from: -1018, to: -1 },
  { id: "despair", from: 0, to: 383 },
  { id: "mortals", from: 384, to: Infinity },
];

// Finer periods, the same ones Lifewrought uses (its era.* facts), so the app and the module agree.
export const PERIODS = [
  { id: "before", from: -Infinity, to: -1 },
  { id: "despair", from: 0, to: 347 },
  { id: "war", from: 348, to: 352 },
  { id: "after", from: 353, to: 382 },
  { id: "chaos", from: 383, to: 383 },
  { id: "mortals", from: 384, to: 420 },
  { id: "souls", from: 421, to: Infinity },
];

// A year the GM can jump to for each period (the selector's default).
export const PERIOD_DEFAULT_YEAR = { before: -1, despair: 300, war: 351, after: 370, chaos: 383, mortals: 410, souls: 422 };

const find = (list, year) => list.find((x) => year >= x.from && year <= x.to);

export function ageOf(year) { return find(AGES, year).id; }
export function periodOf(year) { return find(PERIODS, year).id; }

// The true gods grant spells before the Cataclysm, from their return in 351 AC (Goldmoon and the Disks of Mishakal)
// until the end of the Chaos War, and again from the War of Souls (421 AC).
export function godsPresent(year) {
  return year < 0 || (year >= 351 && year <= 383) || year >= 421;
}

// The moons of magic vanish after the Chaos War and return with the gods of magic in 421 AC.
export function moonsPresent(year) {
  return year <= 383 || year >= 421;
}

// High Sorcery depends on the moons; in the Age of Mortals arcane casters use primal sorcery instead.
export function highSorcery(year) { return moonsPresent(year); }

// Everything the year means, in one object: what the sidebar banner and the "age changed" chat card read.
export function stateOf(year) {
  return { year, age: ageOf(year), period: periodOf(year), gods: godsPresent(year), moons: moonsPresent(year), highSorcery: highSorcery(year) };
}

// What changed between two years, as a list of keys the chat card explains.
export function changesBetween(before, after) {
  const a = stateOf(before), b = stateOf(after), out = [];
  if (a.age !== b.age) out.push(`age.${b.age}`);
  if (a.period !== b.period) out.push(`period.${b.period}`);
  if (a.gods !== b.gods) out.push(b.gods ? "gods.return" : "gods.leave");
  if (a.moons !== b.moons) out.push(b.moons ? "moons.return" : "moons.leave");
  return out;
}

// How a year is written: "351 AC", "1018 PC".
export function yearLabel(year) { return year >= 0 ? `${year} AC` : `${-year} PC`; }
