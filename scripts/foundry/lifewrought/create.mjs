// Turning a finished life into a character: replay it, build the PF2e actor from this world's compendiums, write the
// Chronicle journal, and optionally the people of the life as NPCs. Runs on a GM's client.
import { MODULE_ID, T, setting } from "../constants.mjs";
import { LW, lwData } from "./engine.mjs";
import { replayLife, buildActorData, chroniclePages, calendarCultureOf, peopleOf, randomLife } from "../../logic/lifewrought.mjs";

const OWN = () => CONST.DOCUMENT_OWNERSHIP_LEVELS;

async function folderFor(type, name, parent = null) {
  return game.folders.find((f) => f.type === type && f.name === name && (f.folder?.id ?? null) === (parent?.id ?? null))
    ?? Folder.create({ name, type, folder: parent?.id ?? null });
}

async function fetchItem(uuid) {
  try { const doc = await fromUuid(uuid); return doc ? doc.toObject() : null; } catch (e) { return null; }
}

export function pageTitles() {
  const t = (k) => T(`Life.Page.${k}`);
  return {
    backstoryPage: t("Backstory"), yearsPage: t("Years"), peoplePage: t("People"), campaignPage: t("Campaign"), gmPage: t("GM"),
    personality: t("Personality"), appearance: t("Appearance"), wounds: t("Wounds"), years: t("Years"), age: t("Age"), people: t("People"),
    nobody: t("Nobody"), campaign: t("Campaign"), allies: t("Allies"), enemies: t("Enemies"), organizations: t("Organizations"),
    threads: t("Threads"), threadsHint: t("ThreadsHint"), secrets: t("Secrets"), enemy: t("Enemy"),
    attitude: t("Attitude"), beliefs: t("Beliefs"), edicts: t("Edicts"), anathema: t("Anathema"), likes: t("Likes"), dislikes: t("Dislikes"), catchphrase: t("Catchphrase"),
  };
}

// Build everything; create the documents. Returns what was made, and anything the compendiums lacked.
export async function createCharacter(record, userId) {
  if (!game.user.isGM) throw new Error(T("Life.NeedGM"));
  if (!record || !record.done) throw new Error(T("Life.NotFinished"));
  const D = await lwData(), lw = LW();
  const { v, extraDraws } = await replayLife(lw, D, record);
  const { data, missing } = await buildActorData(lw, v, D, fetchItem);
  const user = game.users.get(userId);
  const root = await folderFor("Actor", T("Life.Folder"));
  const actor = await Actor.create({ name: data.name, type: "character", folder: root.id });
  await actor.importFromJSON(JSON.stringify(data));
  const O = OWN();
  const ownership = { default: O.NONE, ...(user && !user.isGM ? { [user.id]: O.OWNER } : {}) };
  const culture = calendarCultureOf(v);

  const jfolder = await folderFor("JournalEntry", T("Life.Folder"));
  const pages = chroniclePages(lw, v, D, pageTitles());
  const journal = await JournalEntry.create({
    name: T("Life.ChronicleOf", { name: data.name }), folder: jfolder.id,
    ownership: { default: O.NONE, ...(user && !user.isGM ? { [user.id]: O.OBSERVER } : {}) },
    pages: pages.map((p, i) => ({ name: p.name, type: "text", sort: (i + 1) * 100000, text: { content: p.html, format: 1 }, ownership: p.gmOnly ? { default: O.NONE } : { default: O.INHERIT } })),
  });

  let npcIds = [];
  if (setting("lwNpcActors")) {
    const sub = await folderFor("Actor", T("Life.PeopleOf", { name: data.name }), root);
    const npcs = await Actor.createDocuments(peopleOf(v).map((p) => ({ name: p.name, type: "npc", folder: sub.id,
      system: { details: { publicNotes: `<p>${foundry.utils.escapeHTML([p.label, p.roles.join(", ")].filter(Boolean).join(" · "))}</p><p>@UUID[${actor.uuid}]{${foundry.utils.escapeHTML(data.name)}}</p>` } } })));
    npcIds = npcs.map((n) => n.id);
  }

  await actor.update({ folder: root.id, ownership, [`flags.${MODULE_ID}`]: {
    culture,
    lifewrought: { record, journal: journal.id, npcs: npcIds, user: userId, built: game.modules.get(MODULE_ID).version, at: Date.now() },
  } });
  if (user && !user.isGM && !user.character) await user.update({ character: actor.id });
  // An arcane caster on Krynn belongs to an order, or is a renegade: point the player to the feat.
  const arcane = (data.items || []).some((i) => i.type === "spellcastingEntry" && i.system?.tradition?.value === "arcane");
  if (arcane) await suggestOrder(actor, user);
  return { actorId: actor.id, journalId: journal.id, name: data.name, missing, extraDraws, npcs: npcIds.length, arcane };
}

async function suggestOrder(actor, user) {
  const pack = game.packs.get(`${MODULE_ID}.magic`);
  const entry = pack?.index?.find?.((e) => e.name === "Mage of High Sorcery");
  const link = entry ? `@UUID[${entry.uuid ?? `Compendium.${MODULE_ID}.magic.Item.${entry._id}`}]{${T("Life.OrderFeat")}}` : T("Life.OrderFeat");
  await ChatMessage.create({ speaker: { alias: T("Chat.Speaker") }, whisper: [...game.users.filter((u) => u.isGM).map((u) => u.id), ...(user && !user.isGM ? [user.id] : [])],
    content: `<div class="krynn-card"><h3>${T("Life.ArcaneTitle", { name: actor.name })}</h3><p>${T("Life.ArcaneText", { link })}</p></div>` });
}

// A random life lived without anyone, built against this world's compendiums but not created: the self-test's check
// that Lifewrought and the installed PF2e agree.
export async function dryRun({ seed } = {}) {
  const D = await lwData(), lw = LW();
  const { v } = await randomLife(lw, D, { seed });
  const { data, missing } = await buildActorData(lw, v, D, fetchItem);
  return { name: data.name, items: data.items.length, missing };
}
