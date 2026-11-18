// Pure helpers of 0.4: the Krynn god of a Lifewrought character, the PF2e choices still to make, and the standing
// of a character with the factions of Krynn. No Foundry globals.

// The gods' deity items come from the module's Krynn Gods pack: the inline deity Lifewrought writes is replaced by
// it (same _id), and any "deity" choice of a class feature points to it.
export function useKrynnDeity(data, deity, uuid) {
  if (!deity || !data?.items) return false;
  const at = data.items.findIndex((i) => i.type === "deity");
  if (at < 0) return false;
  const old = data.items[at];
  data.items[at] = { ...structuredClone(deity), _id: old._id, _stats: { ...(deity._stats || {}), compendiumSource: uuid } };
  delete data.items[at].folder; delete data.items[at].sort; delete data.items[at].ownership;
  for (const it of data.items) for (const r of it.system?.rules || []) {
    if (r.key !== "ChoiceSet" || r.flag !== "deity" || r.selection) continue;
    r.selection = uuid;
    it.flags = it.flags || {}; it.flags.pf2e = it.flags.pf2e || {}; it.flags.pf2e.rulesSelections = { ...(it.flags.pf2e.rulesSelections || {}), deity: uuid };
  }
  return true;
}

// The Krynn heritage of a Lifewrought people (its ancestry id and facts), or null to keep PF2e's.
const CLANS = ["hylar", "daewar", "theiwar", "daergar", "klar"];
export function krynnHeritageOf(v) {
  const id = v?.ancestry?.id, facts = v?.facts instanceof Set ? v.facts : new Set(v?.facts || []);
  if (["qualinesti_elf", "silvanesti_elf", "kagonesti_elf"].includes(id)) return id.replace("_", "-");
  if (id === "hill_dwarf") return "neidar-dwarf";
  if (id === "mountain_dwarf") { const c = CLANS.find((x) => facts.has(`clan.${x}`)); return c ? `${c}-dwarf` : null; }
  if (id === "gnome") return "tinker-gnome";
  if (id === "kender") return "kender";
  return null;
}

// Put a Krynn heritage in place of the PF2e heritage Lifewrought chose (and what that heritage granted).
export function swapHeritage(data, heritage, uuid) {
  const at = data?.items?.findIndex((i) => i.type === "heritage") ?? -1;
  if (!heritage || at < 0) return false;
  const old = data.items[at];
  const drop = new Set(grantTree(data.items, old._id));
  const fresh = { ...structuredClone(heritage), _id: old._id, _stats: { ...(heritage._stats || {}), compendiumSource: uuid } };
  delete fresh.folder; delete fresh.sort; delete fresh.ownership;
  data.items = data.items.flatMap((i) => (i._id === old._id ? [fresh] : drop.has(i._id) ? [] : [i]));
  return true;
}

const camel = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/[^a-zA-Z0-9]/g, "");
export const flagOf = (item, rule) => rule.flag || camel(rule.slug || item.system?.slug || item.name);

// The choices PF2e would ask for that a character doesn't have yet. `applies(predicate)` says whether a rule's
// predicate holds (Foundry passes PF2e's own test; without it, rules with predicates are skipped). Only items the
// player can re-take are listed: feats and heritages from a compendium, and not those another item granted.
export const REDOABLE = ["feat", "heritage"];
export function openChoices(items, applies = null) {
  const list = items.map((i) => (i.toObject ? i.toObject() : i));
  const out = [];
  for (const it of list) {
    if (!REDOABLE.includes(it.type) || it.flags?.pf2e?.grantedBy) continue;
    if (!(it._stats?.compendiumSource || it.flags?.core?.sourceId)) continue;
    const flags = [];
    for (const r of it.system?.rules || []) {
      if (r.key !== "ChoiceSet") continue;
      const flag = flagOf(it, r);
      if (r.selection != null || it.flags?.pf2e?.rulesSelections?.[flag] != null) continue;
      if (r.predicate && !(applies ? applies(r.predicate) : false)) continue;
      flags.push(flag);
    }
    if (flags.length) out.push({ id: it._id, name: it.name, type: it.type, flags, source: it._stats?.compendiumSource || it.flags?.core?.sourceId, location: it.system?.location ?? null });
  }
  return out;
}

// The items to delete before an item is taken again: it, and everything it granted (and they granted).
export function grantTree(items, id) {
  const list = items.map((i) => (i.toObject ? i.toObject() : i));
  const out = new Set([id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const it of list) if (!out.has(it._id) && out.has(it.flags?.pf2e?.grantedBy?.id)) { out.add(it._id); grew = true; }
  }
  return [...out];
}

// Standing: PF2e's attitudes, from hostile (−2) to helpful (+2).
export const STANDINGS = ["hostile", "unfriendly", "indifferent", "friendly", "helpful"];
export const standingKey = (n) => STANDINGS[Math.max(-2, Math.min(2, Math.round(n))) + 2];
export const slugify = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\(.*?\)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Lifewrought's organizations (English names) mapped to the module's factions when they are one of them.
const ORG_FACTION = [
  [/^knights of solamnia/i, "knights-of-solamnia"], [/^knights of (takhisis|neraka)/i, "knights-of-takhisis"],
  [/^orders of high sorcery|^academy of sorcery/i, "orders-of-high-sorcery"], [/^legion of steel/i, "legion-of-steel"],
  [/^citadel of light/i, "citadel-of-light"], [/^the kirath/i, "silvanesti"], [/^the qualinesti resistance/i, "qualinesti"],
  [/mount nevermind/i, "mount-nevermind"], [/^the underworld/i, "thieves-guild"], [/northgate|stonehand/i, "thorbardin"],
];

// A character's factions at the start: every organization of the life, as friendly (they were part of it).
// `factions` is the module's list (id, name {en, pt}); organizations that aren't one of them keep their own name.
export function factionsFromLife(organizations, factions) {
  const byId = Object.fromEntries(factions.map((f) => [f.id, f]));
  const out = {};
  for (const org of organizations || []) {
    const hit = ORG_FACTION.find(([re]) => re.test(org));
    const id = hit ? hit[1] : slugify(org);
    if (out[id]) continue;
    out[id] = { name: hit && byId[id] ? null : org, standing: 1, note: hit ? org : "" };
  }
  return out;
}

// Rows for the window: the module's factions get their name in the reader's language.
export function factionRows(stored, factions, lang = "en") {
  const byId = Object.fromEntries(factions.map((f) => [f.id, f]));
  return Object.entries(stored || {}).map(([id, f]) => ({ id, name: f.name || byId[id]?.name[lang === "pt" ? "pt" : "en"] || id, standing: f.standing ?? 0, key: standingKey(f.standing ?? 0), note: f.note || "" }))
    .sort((a, b) => b.standing - a.standing || a.name.localeCompare(b.name));
}

// A log of what happened to a character's standing or knighthood: newest first, kept to a length.
export function logEntry(log = [], entry, keep = 30) { return [entry, ...(log || [])].slice(0, keep); }
