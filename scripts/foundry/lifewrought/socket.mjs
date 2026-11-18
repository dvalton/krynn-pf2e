// Players can't create actors, so a finished life goes to a GM: the lead GM's client builds the character and answers.
// With no GM online, the life waits in the player's flags and is built when a GM connects.
import { MODULE_ID, T, isLeadGM } from "../constants.mjs";
import { createCharacter } from "./create.mjs";

const CHANNEL = `module.${MODULE_ID}`;
const waiting = new Map();
const TIMEOUT = 180000;

async function built(userId, result) {
  const user = game.users.get(userId);
  if (user) {
    await user.setFlag(MODULE_ID, "created", { actorId: result.actorId, journalId: result.journalId, name: result.name });
    await user.unsetFlag(MODULE_ID, "pending");
  }
  if (result.missing.length || result.extraDraws) {
    await ChatMessage.create({ speaker: { alias: T("Chat.Speaker") }, whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
      content: `<div class="krynn-card"><h3>${T("Life.Built", { name: result.name })}</h3>`
        + (result.missing.length ? `<p>${T("Life.Missing", { n: result.missing.length })}</p><ul>${result.missing.map((m) => `<li><code>${foundry.utils.escapeHTML(m)}</code></li>`).join("")}</ul>` : "")
        + (result.extraDraws ? `<p>${T("Life.ExtraDraws", { n: result.extraDraws })}</p>` : "") + "</div>" });
  }
}

export function registerSocket() {
  game.socket.on(CHANNEL, async (msg) => {
    if (!msg || typeof msg !== "object") return;
    if (msg.action === "create" && isLeadGM()) {
      try {
        const result = await createCharacter(msg.record, msg.userId);
        await built(msg.userId, result);
        game.socket.emit(CHANNEL, { action: "created", requestId: msg.requestId, userId: msg.userId, result });
      } catch (e) {
        console.error(`${MODULE_ID} |`, e);
        game.socket.emit(CHANNEL, { action: "failed", requestId: msg.requestId, userId: msg.userId, error: e.message });
      }
    }
    if ((msg.action === "created" || msg.action === "failed") && msg.userId === game.user.id) {
      const w = waiting.get(msg.requestId);
      if (w) { waiting.delete(msg.requestId); w(msg); }
    }
  });
}

// Ask for the character: directly if this user is a GM, through a GM otherwise.
export async function requestCharacter(record) {
  if (game.user.isGM) {
    const result = await createCharacter(record, game.user.id);
    await built(game.user.id, result);
    return { action: "created", result };
  }
  if (!game.users.activeGM) {
    await game.user.setFlag(MODULE_ID, "pending", record);
    return { action: "queued" };
  }
  return new Promise((resolve) => {
    const requestId = foundry.utils.randomID();
    waiting.set(requestId, resolve);
    game.socket.emit(CHANNEL, { action: "create", requestId, userId: game.user.id, record });
    setTimeout(() => { if (waiting.delete(requestId)) resolve({ action: "failed", error: T("Life.Timeout") }); }, TIMEOUT);
  });
}

// When a GM connects: build every life that waited for one.
export async function buildPending() {
  if (!isLeadGM()) return;
  for (const user of game.users) {
    const record = user.getFlag(MODULE_ID, "pending");
    if (!record) continue;
    try { await built(user.id, await createCharacter(record, user.id)); } catch (e) { console.error(`${MODULE_ID} |`, e); }
  }
}
