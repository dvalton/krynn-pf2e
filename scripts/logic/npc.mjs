// The NPC builder: a creature written as tiers (moderate, high...) becomes PF2e NPC data, from the Monster Core's
// building tables. Shared by the pack builder (the module's creatures and iconic people) and the generators
// (an NPC made at the table). Pure: the caller gives the id function.
import { stat } from "../content/creatures.mjs";

const SIZE = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
const ACTION_TYPE = (a) => (typeof a === "number" ? { actionType: { value: "action" }, actions: { value: a } } : { actionType: { value: a }, actions: { value: null } });
export function buildNpc(c, { id, publication = {}, stats = {}, notes = null } = {}) {
  const _id = id(`creature:${c.slug}`), L = c.level;
  const items = [];
  const item = (key, data) => { const iid = id(`creature:${c.slug}:${key}`); items.push({ _id: iid, _key: `!actors.items!${_id}.${iid}`, img: c.img, effects: [], flags: {}, sort: items.length * 100000, _stats: stats, ...data }); };
  for (const [name, t, dmg, type, traits] of c.strikes) {
    const range = traits.map((x) => /^(?:range|thrown)-(\d+)$/.exec(x)).find(Boolean);
    item(`strike:${name}`, { name, type: "melee", system: { slug: null, bonus: { value: stat.atk(L, t) }, damageRolls: { [id(`dmg:${c.slug}:${name}`).toLowerCase()]: { damage: dmg === "dmg" ? stat.dmg(L, t) : dmg, damageType: type } },
      traits: { value: traits.filter((x) => !/^range-\d+$/.test(x)), rarity: "common" }, attack: { value: "" }, attackEffects: { custom: "", value: [] }, description: { value: "" }, range: range ? { increment: Number(range[1]), max: null } : null, rules: [], publication } });
  }
  for (const [slug, name, act, traits, text, rules] of c.actions) {
    const desc = text.raw ?? (text.en.startsWith("@Localize") ? text.en : `@Localize[KRYNN.Bestiary.${c.slug}.${slug}]`);
    item(`action:${slug}`, { name: name.en, type: "action", flags: { "krynn-pf2e": { slug } }, system: { slug, ...ACTION_TYPE(act), category: act === "passive" || act === "reaction" ? "defensive" : "offensive",
      description: { value: desc }, rules: rules || [], traits: { value: traits, rarity: "common" }, publication } });
  }
  const a = c.abilities, sz = SIZE[c.size];
  return {
    _id, _key: `!actors!${_id}`, name: c.name.en, type: "npc", img: c.img, folder: null, sort: 0, ownership: { default: 0 }, _stats: stats,
    flags: { "krynn-pf2e": { slug: c.slug, ...(c.draconian ? { draconian: c.draconian } : {}) } },
    prototypeToken: { name: c.name.en, texture: { src: c.img }, width: sz, height: sz, disposition: c.disposition ?? -1, actorLink: false, displayName: 20, displayBars: 20, bar1: { attribute: "attributes.hp" } },
    items,
    system: {
      abilities: Object.fromEntries(Object.entries(a).map(([k, v]) => [k, { mod: v }])),
      attributes: {
        ac: { value: stat.ac(L, c.ac), details: "" }, allSaves: { value: "" },
        hp: { value: stat.hp(L, c.hp), max: stat.hp(L, c.hp), temp: 0, details: "" },
        speed: { value: c.speed, otherSpeeds: c.other.map(([type, value]) => ({ type, value })) },
        immunities: (c.immunities || []).map((type) => ({ type })),
        resistances: (c.resistances || []).map(([type, value, exceptions]) => ({ type, value, ...(exceptions ? { exceptions } : {}) })),
        weaknesses: (c.weaknesses || []).map(([type, value]) => ({ type, value })),
      },
      details: { level: { value: L }, blurb: "", languages: { value: c.languages, details: "" }, publicNotes: notes ?? `@Localize[KRYNN.Bestiary.${c.slug}.Notes]`, privateNotes: "", publication },
      initiative: { statistic: "perception" },
      perception: { mod: stat.save(L, c.perception), senses: c.senses.map((type) => ({ type })), details: "" },
      saves: Object.fromEntries(Object.entries(c.saves).map(([k, t]) => [k, { value: stat.save(L, t), saveDetail: "" }])),
      skills: Object.fromEntries(Object.entries(c.skills).map(([k, t]) => [k, { base: stat.skill(L, t) }])),
      traits: { rarity: c.rarity || "common", size: { value: c.size }, value: c.traits },
      resources: {},
    },
  };
}
