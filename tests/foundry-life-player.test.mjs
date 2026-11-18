// A player finishing a life: with a GM online the request goes over the socket; with none it waits for one.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const LIVES = JSON.parse(fs.readFileSync(new URL("./fixtures/lives.json", import.meta.url)));
const F = installFoundry({ lang: "pt-BR", isGM: false, worldTime: absoluteDay("classic", 381, 3, 10) * 86400 });
await import("../scripts/krynn.mjs");
await F.start();
const { requestCharacter, buildPending } = await import("../scripts/foundry/lifewrought/socket.mjs");

test("with a GM online, the player's finished life is sent to the GM over the socket", async () => {
  const p = requestCharacter(LIVES[0].record);
  await new Promise((r) => setTimeout(r, 10));
  const [ch, msg] = F.sent.at(-1);
  assert.equal(ch, "module.krynn-pf2e");
  assert.equal(msg.action, "create");
  assert.equal(msg.userId, "pl1");
  // The GM answers.
  for (const [c, fn] of game.socket.handlers) if (c === ch) await fn({ action: "created", requestId: msg.requestId, userId: "pl1", result: { name: "X", actorId: "a", missing: [], extraDraws: 0 } });
  const r = await p;
  assert.equal(r.action, "created");
});

test("with no GM online, the life waits, and the GM builds it on arrival", async () => {
  game.users.activeGM = null;
  const r = await requestCharacter(LIVES[3].record);
  assert.equal(r.action, "queued");
  assert.ok(F.playerUser.getFlag("krynn-pf2e", "pending"));
  // The GM arrives.
  game.users.activeGM = F.gmUser; F.gmUser.isSelf = true; F.playerUser.isSelf = false; game.user = F.gmUser;
  await buildPending();
  assert.equal(F.playerUser.getFlag("krynn-pf2e", "pending"), undefined);
  const created = F.playerUser.getFlag("krynn-pf2e", "created");
  assert.equal(created.name, LIVES[3].name);
  const j = game.journal.get(created.journalId);
  assert.equal(j.name, `A Crônica de ${LIVES[3].name}`, "the Chronicle in the GM's language");
  assert.equal(j.pages.at(-1).name, "Ganchos (só o mestre)");
  assert.equal(F.playerUser.character?.id, created.actorId, "the character becomes the player's");
});
