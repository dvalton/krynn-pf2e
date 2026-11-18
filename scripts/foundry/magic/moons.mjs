// Moon magic on the sheets: every mage of High Sorcery carries one effect, "Moons of Magic", rewritten whenever their
// moon's phase, an alignment or the Night of the Eye changes what it gives. Only the lead GM's client writes it.
import { MODULE_ID, T, setting, isLeadGM } from "../constants.mjs";
import { skyNow, stateNow } from "../time.mjs";
import { moonMagic } from "../../logic/magic.mjs";

export const ORDER_SLUG = "mage-of-high-sorcery";
const EFFECT_SLUG = "krynn-moons";
const slugOf = (i) => i.system?.slug || i.flags?.[MODULE_ID]?.slug;
const WATCHED = new Set([ORDER_SLUG, "krynn-renegade", "primal-sorcerer"]);

// The order a character belongs to, from the choice made on the Mage of High Sorcery feat.
export function robeOf(actor) {
  const feat = actor.items.find((i) => i.type === "feat" && slugOf(i) === ORDER_SLUG);
  return feat?.flags?.pf2e?.rulesSelections?.order ?? null;
}

export function magicFor(actor, sky = skyNow(), state = stateNow()) {
  const robe = robeOf(actor);
  if (!robe) return null;
  const renegade = actor.items.some((i) => slugOf(i) === "krynn-renegade");
  const primal = actor.items.some((i) => slugOf(i) === "primal-sorcerer");
  return moonMagic({ mode: setting("moonMagic"), robe, sky, moons: state.moons && !primal, level: actor.level ?? 1, minLevel: setting("moonMinLevel"), renegade });
}

export function effectData(m) {
  const moon = T(`Moon.${m.moon}`), phase = m.eye ? T("Magic.Eye") : T(`Phase.${m.phase}`);
  const sign = m.value > 0 ? `+${m.value}` : String(m.value);
  const name = T("Magic.EffectName", { moon, phase }) + (m.value ? ` (${sign})` : "");
  const lines = [];
  if (m.value) lines.push(T(m.value > 0 ? "Magic.Bonus" : "Magic.Penalty", { value: Math.abs(m.value) }));
  for (const n of m.notes) lines.push(T(`Magic.Note.${n.replace("phase.", "")}`));
  lines.push(T(`Magic.Mode.${m.mode}`));
  return {
    name, type: "effect", img: `modules/${MODULE_ID}/icons/${m.eye ? "eye" : m.moon}.svg`,
    flags: { [MODULE_ID]: { slug: EFFECT_SLUG, key: m.key } },
    system: {
      slug: EFFECT_SLUG, description: { value: lines.map((l) => `<p>${l}</p>`).join("") },
      rules: m.value ? [{ key: "FlatModifier", selector: ["spell-attack-roll", "spell-dc"], type: "status", value: m.value, slug: EFFECT_SLUG, label: name }] : [],
      duration: { value: -1, unit: "unlimited", expiry: null, sustained: false }, start: { value: 0, initiative: null },
      tokenIcon: { show: true }, level: { value: 1 }, traits: { value: [], rarity: "common", otherTags: [] }, badge: null,
    },
  };
}

export async function syncActor(actor, sky = skyNow(), state = stateNow()) {
  if (actor.type !== "character") return;
  const robe = robeOf(actor);
  if ((actor.getFlag(MODULE_ID, "robe") ?? null) !== robe) await (robe ? actor.setFlag(MODULE_ID, "robe", robe) : actor.unsetFlag(MODULE_ID, "robe"));
  const m = magicFor(actor, sky, state);
  const current = actor.items.find((i) => i.type === "effect" && slugOf(i) === EFFECT_SLUG);
  if (!m) { if (current) await actor.deleteEmbeddedDocuments("Item", [current.id]); return; }
  if (current?.flags?.[MODULE_ID]?.key === m.key) return;
  const data = effectData(m);
  if (current) await actor.updateEmbeddedDocuments("Item", [{ _id: current.id, name: data.name, img: data.img, flags: data.flags, "system.description": data.system.description, "system.rules": data.system.rules }]);
  else await actor.createEmbeddedDocuments("Item", [data]);
}

export async function syncAll() {
  if (!isLeadGM()) return;
  const sky = skyNow(), state = stateNow();
  for (const actor of game.actors.filter((a) => a.type === "character")) {
    try { await syncActor(actor, sky, state); } catch (e) { console.error(`${MODULE_ID} | moon magic for ${actor.name}`, e); }
  }
}

// Re-check one character when one of the items that matter is added, changed or removed.
export function onItemChange(item) {
  const actor = item.parent;
  if (!actor || actor.type !== "character" || !isLeadGM() || !WATCHED.has(slugOf(item))) return;
  syncActor(actor);
}
