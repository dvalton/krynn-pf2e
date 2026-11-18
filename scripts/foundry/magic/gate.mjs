// The gods' and the moons' absence at the moment of casting. PF2e casts through its spellcasting entry's cast();
// this wraps it (the one place the module reaches into PF2e's classes, kept here). A blocked spell spends nothing.
import { MODULE_ID, T, setting } from "../constants.mjs";
import { now, yearLabel } from "../time.mjs";
import { castVerdict } from "../../logic/magic.mjs";

export function judge(entry, spell) {
  const actor = entry.actor;
  if (!actor) return { block: false, warn: false };
  const tradition = entry.tradition ?? spell?.traditions?.first?.() ?? null;
  const options = new Set(actor.getRollOptions?.() ?? []);
  return castVerdict({
    tradition, hasDeity: !!actor.deity, year: now().year, godsMode: setting("godsMode"), hsMode: setting("hsMode"),
    mystic: options.has("krynn:mystic"), highSorcery: options.has("krynn:high-sorcery"), primal: options.has("krynn:primal-sorcery"),
  });
}

async function tell(verdict, entry, spell) {
  const who = entry.actor.name, what = spell?.name ?? "";
  const key = verdict.reason === "gods" ? "Gods" : "Moons";
  const year = yearLabel(now().year);
  if (verdict.block) {
    ui.notifications.warn(T(`Magic.Blocked${key}`, { who, spell: what }));
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker?.({ actor: entry.actor }) ?? { alias: who },
      content: `<div class="krynn-card"><h3>${T(`Magic.Silent${key}`)}</h3><p>${T(`Magic.Blocked${key}`, { who, spell: what })}</p><p class="hint">${year}</p></div>` });
  } else if (verdict.warn) {
    await ChatMessage.create({ speaker: { alias: T("Chat.Speaker") }, whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
      content: `<div class="krynn-card"><h3>${T(`Magic.Silent${key}`)}</h3><p>${T(`Magic.Warn${key}`, { who, spell: what, year })}</p></div>` });
  }
}

export function installCastGate() {
  const Entry = CONFIG.PF2E?.Item?.documentClasses?.spellcastingEntry;
  if (!Entry?.prototype?.cast) return false;
  if (Entry.prototype.cast.krynnGate) return true;
  const original = Entry.prototype.cast;
  const gated = async function (spell, options = {}) {
    let verdict = { block: false, warn: false };
    try { verdict = judge(this, spell); } catch (e) { console.error(`${MODULE_ID} | cast gate`, e); }
    if (verdict.block || verdict.warn) await tell(verdict, this, spell);
    if (verdict.block) return;
    return original.call(this, spell, options);
  };
  gated.krynnGate = true;
  Entry.prototype.cast = gated;
  return true;
}

export function castGateInstalled() { return !!CONFIG.PF2E?.Item?.documentClasses?.spellcastingEntry?.prototype?.cast?.krynnGate; }
