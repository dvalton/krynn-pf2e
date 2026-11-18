// The lit part of a moon as an SVG path, for a phase position (0 full, 0.25 last quarter, 0.5 new, 0.75 first quarter).
// The disc is centred on (0, 0) with radius r. Pure logic, no Foundry.
export function litPath(r, position) {
  const p = ((position % 1) + 1) % 1;
  if (p < 1e-9) return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r} Z`; // full
  if (Math.abs(p - 0.5) < 1e-9) return ""; // new
  const k = Math.cos(2 * Math.PI * p), rx = Math.abs(k) * r;
  const waning = p < 0.5; // lit on the left, shrinking from the right
  const outer = waning ? 0 : 1; // sweep of the limb: left half (counter-clockwise) or right half (clockwise)
  // The terminator: back up the other side when more than half is lit (gibbous), the same side when less (crescent).
  const inner = waning ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  return `M 0 ${-r} A ${r} ${r} 0 0 ${outer} 0 ${r} A ${rx} ${r} 0 0 ${inner} 0 ${-r} Z`;
}

// Roughly how much of the disc is lit (0 new, 1 full), for labels and accessibility text.
export function illumination(position) { return (1 + Math.cos(2 * Math.PI * position)) / 2; }
