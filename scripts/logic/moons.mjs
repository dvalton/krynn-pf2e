// The three moons of magic: Solinari (white, 36 days), Lunitari (red, 28 days), Nuitari (black, 8 days).
// Pure logic, no Foundry. Each moon passes through four phases of a quarter of its cycle each:
// High Sanction (full), Waning, Low Sanction (new), Waxing. The Night of the Eye is the night all three are full
// together, every 504 days (the least common multiple of 36, 28 and 8). The GM sets the date of one such night;
// every phase and alignment follows from it.

export const MOONS = [
  { id: "solinari", period: 36, robe: "white", color: "#f2f2f7" },
  { id: "lunitari", period: 28, robe: "red", color: "#c8372d" },
  { id: "nuitari", period: 8, robe: "black", color: "#17151f" },
];
export const PHASES = ["high", "waning", "low", "waxing"];
export const EYE_CYCLE = 504;
// Two moons are aligned when they stand within this fraction of a full circle of each other in the sky.
export const ALIGN_TOLERANCE = 1 / 16;

const mod = (a, n) => ((a % n) + n) % n;

// Where a moon is on a given day: position 0 is full (High Sanction at its height), 0.5 is new.
// High Sanction covers the quarter centred on full: 9 days of Solinari, 7 of Lunitari, 2 of Nuitari.
export function moonOn(moon, day, eyeDay) {
  const P = moon.period, since = mod(day - eyeDay, P);
  const position = since / P;
  const q = Math.floor(mod(since + P / 8, P) / (P / 4));
  const phase = PHASES[q];
  // Days until this moon's next High Sanction begins (0 when it is in High Sanction now).
  const highStart = mod(-Math.floor(P / 8), P); // first day of High Sanction, counted from full
  let toHigh = 0;
  if (phase !== "high") { toHigh = mod(highStart - since, P); }
  return { id: moon.id, robe: moon.robe, period: P, position, phase, toHigh, full: since === 0 };
}

export function moonsOn(day, eyeDay) { return MOONS.map((m) => moonOn(m, day, eyeDay)); }

function apart(a, b) { const d = Math.abs(a - b) % 1; return Math.min(d, 1 - d); }

// Pairs of moons standing together in the sky that day.
export function alignmentsOn(day, eyeDay) {
  const s = moonsOn(day, eyeDay), out = [];
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (apart(s[i].position, s[j].position) <= ALIGN_TOLERANCE) out.push([s[i].id, s[j].id]);
  return out;
}

export function isNightOfTheEye(day, eyeDay) { return mod(day - eyeDay, EYE_CYCLE) === 0; }
export function daysToNextEye(day, eyeDay) { return mod(eyeDay - day, EYE_CYCLE); }

// The sky for one day, in one object: what the widget draws and what moon magic reads.
export function skyOn(day, eyeDay) {
  return { day, moons: moonsOn(day, eyeDay), alignments: alignmentsOn(day, eyeDay), eye: isNightOfTheEye(day, eyeDay), toEye: daysToNextEye(day, eyeDay) };
}

// The moon that powers a wizard of each robe.
export function moonOfRobe(robe) { return MOONS.find((m) => m.robe === robe) || null; }
