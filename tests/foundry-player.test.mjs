// The module as a player, in Portuguese: names by culture, the black moon hidden, nothing posted to chat.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const start = absoluteDay("classic", 352, 9, 12) * 86400 + 20 * 3600;
const F = installFoundry({ lang: "pt-BR", isGM: false, worldTime: start });
await import("../scripts/krynn.mjs");
await F.start();
const K = globalThis.krynn;

test("a player's first run changes nothing and posts nothing", () => {
  assert.equal(K.now().year, 352);
  assert.equal(F.chat.length, 0);
});

test("dates read in Portuguese, with DC for years after the Cataclysm", () => {
  assert.match(K.formatDate(K.now()), /12 de Hiddumont de 352 DC$/);
  assert.match(K.formatDate({ ...K.now(), year: -1018 }), /1018 AC$/);
});

test("each player can read the months in their own people's names", async () => {
  await game.settings.set("krynn-pf2e", "userCulture", "elven");
  assert.match(K.formatDate(K.now()), /Crepúsculo de Outono/);
  assert.match(document.getElementById("krynn-banner").textContent, /Crepúsculo de Outono/);
});

test("a player who is not a Black Robe sees two moons", () => {
  assert.equal(document.querySelectorAll("#krynn-banner svg.krynn-moon").length, 2);
  assert.ok(!document.querySelector("#krynn-banner svg.nuitari"));
});

test("a player's time change posts nothing (only the GM announces)", async () => {
  await game.time.advance(86400 * 30);
  assert.equal(F.chat.length, 0);
});

test("the banner can be hidden", async () => {
  await game.settings.set("krynn-pf2e", "showBanner", false);
  assert.equal(document.getElementById("krynn-banner"), null);
});
