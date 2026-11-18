// Draconians' death throes: when one drops to 0 HP, the lead GM's client posts the card (with PF2e's own damage and
// save buttons), changes the token, and places the kapak's acid pool, which dries up after three rounds.
// The last creature that hurt each token is remembered from PF2e's attack and damage messages.
import { MODULE_ID, T, setting, isLeadGM } from "../constants.mjs";
import { draconianKind, throesPlan, inlineFor, withinFeet } from "../../logic/dragons.mjs";
import { toolbeltSave } from "../compat.mjs";

const lastHit = new Map(); // token uuid -> { name, humanoid, weapon, melee, tokenUuid }
const AREA_FLAG = "acidPool";

// From a PF2e attack-roll or damage-roll message: who hit whom, with what.
export function rememberHit(message) {
  const ctx = message.flags?.pf2e?.context;
  if (!ctx || !["attack-roll", "damage-roll", "spell-attack-roll"].includes(ctx.type)) return;
  const target = ctx.target?.token ?? message.target?.token?.uuid;
  const actor = message.actor;
  if (!target || !actor) return;
  const item = message.item;
  const traits = actor.traits instanceof Set ? actor.traits : new Set(actor.system?.traits?.value ?? []);
  const ranged = item?.isRanged ?? (ctx.options ?? []).includes("item:ranged");
  lastHit.set(typeof target === "string" ? target : target.uuid, {
    name: message.token?.name ?? actor.name, humanoid: traits.has("humanoid"), weapon: item?.name ?? null,
    melee: !!item && !ranged && item.type !== "spell", tokenUuid: message.token?.uuid ?? null, img: message.token?.texture?.src ?? actor.prototypeToken?.texture?.src ?? actor.img,
  });
}
export const killerOf = (tokenUuid) => lastHit.get(tokenUuid) ?? null;

function kindOf(actor) {
  return draconianKind({ flag: actor.getFlag?.(MODULE_ID, "draconian"), slugs: actor.items?.map?.((i) => i.system?.slug) ?? [], name: actor.name });
}

// The HP change that sets off the throes: an NPC draconian from above 0 to 0.
export async function onActorUpdate(actor, changes) {
  if (!isLeadGM() || setting("deathThroes") === "off" || actor.type !== "npc") return;
  const hp = foundry.utils.getProperty(changes, "system.attributes.hp.value");
  if (hp === undefined || hp > 0) return;
  const kind = kindOf(actor);
  if (!kind || actor.getFlag(MODULE_ID, "throes")) return;
  await actor.setFlag(MODULE_ID, "throes", Date.now());
  return runThroes(actor, kind);
}

export async function runThroes(actor, kind = kindOf(actor)) {
  const token = actor.token ?? actor.getActiveTokens?.()[0]?.document ?? null;
  const killer = token ? killerOf(token.uuid) : null;
  const plan = throesPlan(kind, actor.level ?? actor.system?.details?.level?.value ?? 1, killer);
  if (!plan) return null;
  const auto = setting("deathThroes") === "auto";
  const reachedTokens = plan.burst && token ? nearby(token, plan.burst) : [];
  const reached = reachedTokens.map((t) => t.name);
  await ChatMessage.create({ speaker: { alias: actor.name }, content: card(actor, plan, killer, reached), flags: { [MODULE_ID]: { throes: kind } } });
  // With Toolbelt: the save for those in reach (or the baaz's killer), in its target helper.
  const targets = plan.kind === "baaz" ? [killer?.tokenUuid].filter(Boolean) : reachedTokens.map((t) => t.uuid).filter(Boolean);
  if (plan.save) await toolbeltSave({ statistic: plan.save.type, dc: plan.dc, basic: !!plan.save.basic, targets, speaker: { alias: actor.name } });
  if (!auto || !token) return plan;
  // The token: stone, gone, the killer's face, or green fire.
  const up = {};
  if (plan.token?.tint) up["texture.tint"] = plan.token.tint;
  if (plan.token?.hidden) up.hidden = true;
  if (plan.token?.mimic && killer?.img) { up["texture.src"] = killer.img; up.name = killer.name; }
  if (Object.keys(up).length) await token.update(up).catch(() => null);
  if (plan.area) await placePool(token, plan);
  if (plan.frenzy) await frenzy(actor, plan);
  return plan;
}

function nearby(token, feet) {
  const tokens = token.parent?.tokens?.contents ?? [];
  const grid = token.parent?.grid ?? { size: 100, distance: 5 };
  const centre = (t) => ({ id: t.id, name: t.name, uuid: t.uuid, x: t.x + (t.width * grid.size) / 2, y: t.y + (t.height * grid.size) / 2, size: t.width });
  return withinFeet(centre(token), tokens.filter((t) => !t.hidden).map(centre), feet, grid.distance, grid.size);
}

function card(actor, plan, killer, reached) {
  const esc = foundry.utils.escapeHTML;
  const lines = [`<p>@Localize[KRYNN.Bestiary.Throes.${plan.kind}]</p>`];
  if (plan.kind === "baaz" && plan.save) lines.push(`<p>${T("Throes.BaazStuck", { who: esc(plan.save.who), weapon: esc(plan.weapon ?? T("Throes.TheWeapon")) })} @Check[reflex|dc:${plan.dc}] · @UUID[${effectUuid("krynn-weapon-in-stone")}]{${T("Throes.StuckEffect")}}</p>`);
  if (plan.kind === "sivak" && plan.shape) lines.push(`<p>${T("Throes.SivakShape", { who: esc(plan.shape) })}</p>`);
  if (plan.damage) lines.push(`<p>${plan.burst ? T("Throes.Burst", { feet: plan.burst, m: Math.round(plan.burst * 0.3) }) : T("Throes.Pool", { rounds: plan.area.rounds })} ${inlineFor(plan)}</p>`);
  if (reached?.length) lines.push(`<p class="hint">${T("Throes.InReach", { names: reached.map(esc).join(", ") })}</p>`);
  if (plan.frenzy) lines.push(`<p>${T("Throes.Frenzy", { rounds: plan.frenzy.rounds })}</p>`);
  return `<div class="krynn-card krynn-throes"><h3>${T("Throes.Title", { name: esc(actor.name) })}</h3>${lines.join("")}</div>`;
}

const effectUuid = (slug) => {
  const pack = game.packs.get(`${MODULE_ID}.dragons`);
  const e = pack?.index?.find?.((x) => x.name === EFFECT_NAMES[slug]);
  return e ? (e.uuid ?? `Compendium.${MODULE_ID}.dragons.Item.${e._id}`) : `Compendium.${MODULE_ID}.dragons`;
};
const EFFECT_NAMES = { "krynn-weapon-in-stone": "Weapon Caught in Stone", "krynn-aurak-frenzy": "Aurak's Final Frenzy", "krynn-faced-dragonfear": "Faced Dragonfear" };

async function effectData(slug) {
  const pack = game.packs.get(`${MODULE_ID}.dragons`);
  const e = pack?.index?.find?.((x) => x.name === EFFECT_NAMES[slug]);
  const doc = e ? await pack.getDocument(e._id).catch(() => null) : null;
  return doc ? doc.toObject() : null;
}

// The aurak doesn't die yet: HP back to 1, and the frenzy effect for two rounds.
async function frenzy(actor, plan) {
  const data = await effectData(plan.frenzy.effect);
  if (data) await actor.createEmbeddedDocuments("Item", [data]);
  await actor.update({ "system.attributes.hp.value": 1 });
}

// The kapak's pool: a template (or a region where templates are gone) that the module removes after its rounds.
async function placePool(token, plan) {
  const scene = token.parent;
  if (!scene) return;
  const grid = scene.grid ?? { size: 100, distance: 5 };
  const x = token.x + (token.width * grid.size) / 2, y = token.y + (token.height * grid.size) / 2;
  const until = (game.combat?.round ?? 0) + plan.area.rounds;
  const flags = { [MODULE_ID]: { [AREA_FLAG]: { until, combat: game.combat?.id ?? null } } };
  try {
    if (globalThis.CONFIG?.MeasuredTemplate?.documentClass) {
      await scene.createEmbeddedDocuments("MeasuredTemplate", [{ t: "circle", x, y, distance: plan.area.radius, fillColor: plan.area.color, borderColor: plan.area.color, flags }]);
    } else {
      const r = (plan.area.radius / grid.distance) * grid.size;
      await scene.createEmbeddedDocuments("Region", [{ name: T("Throes.PoolName"), color: plan.area.color, shapes: [{ type: "circle", x, y, radius: r }], flags }]);
    }
  } catch (e) { console.warn(`${MODULE_ID} | acid pool`, e); }
}

// Each new round: dry up the pools whose time is over.
export async function onCombatRound(combat) {
  if (!isLeadGM()) return;
  const scene = combat.scene ?? game.scenes?.current;
  if (!scene) return;
  for (const type of ["MeasuredTemplate", "Region"]) {
    const coll = type === "MeasuredTemplate" ? scene.templates : scene.regions;
    const done = (coll?.contents ?? []).filter((d) => { const f = d.getFlag?.(MODULE_ID, AREA_FLAG) ?? d.flags?.[MODULE_ID]?.[AREA_FLAG]; return f && combat.round > f.until; }).map((d) => d.id);
    if (done.length) await scene.deleteEmbeddedDocuments(type, done).catch(() => null);
  }
}

export const _test = { lastHit };
