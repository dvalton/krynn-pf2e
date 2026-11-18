// Krynn for PF2e: the entry point. It wires the pieces into Foundry's hooks.
import { MODULE_ID } from "./foundry/constants.mjs";
import { registerSettings } from "./foundry/settings.mjs";
import { registerCalendar, now, setDate, skyNow, stateNow, formatDate } from "./foundry/time.mjs";
import { refreshSky, openSky, renderBanner } from "./foundry/sky.mjs";
import { onWorldTime, firstRun } from "./foundry/announce.mjs";
import { selfTest } from "./foundry/selftest.mjs";
import * as ages from "./logic/ages.mjs";
import * as moons from "./logic/moons.mjs";
import * as calendar from "./logic/calendar.mjs";
import { openLife, LifeApp } from "./foundry/lifewrought/app.mjs";
import { openLives, addDirectoryButtons } from "./foundry/lifewrought/lives.mjs";
import { registerSocket, buildPending } from "./foundry/lifewrought/socket.mjs";
import { createCharacter, dryRun } from "./foundry/lifewrought/create.mjs";

Hooks.once("init", () => {
  registerSettings();
  CONFIG.time.formatters ??= {};
  registerCalendar();
  const api = { now, setDate, sky: skyNow, state: stateNow, formatDate, openSky, selfTest, refresh: refreshSky, ages, moons, calendar,
    life: { open: openLife, lives: openLives, create: createCharacter, dryRun, LifeApp } };
  game.modules.get(MODULE_ID).api = api;
  globalThis.krynn = api;
});

Hooks.once("ready", async () => {
  registerSocket();
  await firstRun();
  renderBanner();
  await buildPending();
});

Hooks.on("renderActorDirectory", (app, html) => addDirectoryButtons(app, html));

Hooks.on("updateWorldTime", (worldTime, delta) => {
  refreshSky();
  onWorldTime(worldTime, delta);
});

// Seeing a different character (a player assigned to a Black Robe) changes what the sky shows.
Hooks.on("updateUser", (user, changes) => { if (user.isSelf && "character" in changes) refreshSky(); });
