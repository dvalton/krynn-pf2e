// Feats that roll a table: when Kender Pockets or Tinker's Contraption is used (posted to chat), the one who used
// it draws from the Krynn: Tables compendium.
import { MODULE_ID } from "../constants.mjs";

export const FEAT_TABLES = { "kender-pockets": "Kender Pockets", "tinkers-contraption": "Gnomish Contraption" };

export async function drawFor(slug) {
  const name = FEAT_TABLES[slug];
  const pack = game.packs.get(`${MODULE_ID}.tables`);
  const e = name && pack?.index?.find?.((x) => x.name === name);
  const table = e ? await pack.getDocument(e._id).catch(() => null) : null;
  return table?.draw ? table.draw() : null;
}

export async function onFeatMessage(message) {
  const author = message.author ?? message.user;
  if (author && author.id !== game.user.id && !(author.isSelf)) return;
  if (message.flags?.[MODULE_ID]?.drawn) return;
  const item = message.item;
  const slug = item?.system?.slug ?? item?.slug ?? message.flags?.pf2e?.origin?.slug;
  if (!slug || !FEAT_TABLES[slug]) return;
  return drawFor(slug);
}
