// "Krynn: the campaign check": throwaway actors (a Red Robe of level 5, a cleric of Mishakal, a baaz) taken through
// each age of the campaign, and what happens to each, in one GM card. The actors are deleted at the end.
import { MODULE_ID, T, setting } from "./constants.mjs";
import { eyeDay } from "./time.mjs";
import { stateOf } from "../logic/ages.mjs";
import { absoluteDay } from "../logic/calendar.mjs";
import { skyOn } from "../logic/moons.mjs";
import { castVerdict, moonSlots } from "../logic/magic.mjs";
import { throesPlan } from "../logic/dragons.mjs";
import { encounterPool } from "../logic/generators.mjs";
import { magicFor } from "./magic/moons.mjs";

export const CAMPAIGN_YEARS = [-100, 351, 358, 383, 400, 421];

async function packDoc(pack, name) {
  const p = game.packs.get(`${MODULE_ID}.${pack}`);
  const e = p?.index?.find?.((x) => x.name === name);
  const d = e ? await p.getDocument(e._id) : null;
  return d ? d.toObject() : null;
}

// One age, for the throwaway mage: the sky on the Night of the Eye of that year's span and on an ordinary day.
export function ageReport(year, mage) {
  const s = stateOf(year), style = setting("calendarStyle");
  const day = absoluteDay(style, year, 0, 27);
  const sky = skyOn(day, eyeDay());
  const m = mage ? magicFor(mage, sky, s) : null;
  const verdict = (tradition, opts) => castVerdict({ tradition, year, godsMode: setting("godsMode"), hsMode: setting("hsMode"), ...opts });
  const word = (v) => (v.block ? T("Campaign.Fails") : v.warn ? T("Campaign.Warns") : T("Campaign.Works"));
  return {
    year, age: T(`Age.${s.age}.Name`), gods: s.gods, moons: s.moons,
    moon: m ? `${m.value > 0 ? "+" : ""}${m.value}${Object.keys(moonSlots(m, 5, 3)).length ? `, +${Object.values(moonSlots(m, 5, 3))[0]} ${T("Campaign.Slots")}` : ""}` : "—",
    cleric: word(verdict("divine", { hasDeity: true })), mage: word(verdict("arcane", { highSorcery: true })),
    draconians: encounterPool("solamnia", null, year).some((c) => c.name === "Baaz Draconian"),
  };
}

export async function campaignCheck({ post = true } = {}) {
  if (!game.user.isGM) throw new Error(T("Life.NeedGM"));
  const made = [];
  try {
    const mage = await Actor.create({ name: "Krynn check: Red Robe", type: "character", system: { details: { level: { value: 5 } } } });
    made.push(mage);
    const feat = await packDoc("magic", "Mage of High Sorcery");
    if (feat) { feat.flags = { ...(feat.flags || {}), pf2e: { rulesSelections: { order: "red" } } }; await mage.createEmbeddedDocuments("Item", [feat]); }
    const baazData = await packDoc("creatures", "Baaz Draconian");
    const baaz = baazData ? await Actor.create({ ...baazData, name: "Krynn check: Baaz" }) : null;
    if (baaz) made.push(baaz);
    const rows = CAMPAIGN_YEARS.map((y) => ageReport(y, mage));
    const throes = throesPlan("baaz", baaz?.level ?? 2, { name: "Sturm", melee: true, weapon: "Longsword" });
    const yes = (b) => (b ? T("Campaign.Yes") : T("Campaign.No"));
    const label = (y) => (y > 0 ? T("Date.AC", { year: y }) : T("Date.PC", { year: -y }));
    const table = `<table class="krynn-campaign"><thead><tr><th>${T("Campaign.Year")}</th><th>${T("Campaign.Gods")}</th><th>${T("Campaign.Moons")}</th><th>${T("Campaign.RedRobe")}</th><th>${T("Campaign.Cleric")}</th><th>${T("Campaign.Mage")}</th><th>${T("Campaign.Draconians")}</th></tr></thead><tbody>`
      + rows.map((r) => `<tr><td><strong>${label(r.year)}</strong><br><span class="hint">${r.age}</span></td><td>${yes(r.gods)}</td><td>${yes(r.moons)}</td><td>${r.moon}</td><td>${r.cleric}</td><td>${r.mage}</td><td>${yes(r.draconians)}</td></tr>`).join("")
      + `</tbody></table>`;
    const ok = rows.every((r) => (r.gods ? r.cleric === T("Campaign.Works") : true) && (r.moons ? r.mage === T("Campaign.Works") : true)) && !!throes && !!feat && !!baaz;
    const content = `<div class="krynn-card selftest"><h3>${T("Campaign.Title")}</h3>${table}<p>${T("Campaign.Throes", { dc: throes?.dc ?? "?" })}</p><p class="hint">${T(ok ? "Campaign.AllGood" : "Campaign.Problems")}</p></div>`;
    if (post) await ChatMessage.create({ speaker: { alias: T("Chat.Speaker") }, whisper: game.users.filter((u) => u.isGM).map((u) => u.id), content });
    return { ok, rows };
  } finally {
    // The throwaway actors go, whatever happened.
    for (const a of made) await a.delete?.().catch?.(() => null);
  }
}
