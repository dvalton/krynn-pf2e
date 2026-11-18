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
import { syncAll, syncActor, onItemChange, magicFor, robeOf } from "./foundry/magic/moons.mjs";
import { installCastGate } from "./foundry/magic/gate.mjs";

Hooks.once("init", () => {
  registerSettings();
  CONFIG.time.formatters ??= {};
  registerCalendar();
  const api = { now, setDate, sky: skyNow, state: stateNow, formatDate, openSky, selfTest, refresh: refreshSky, ages, moons, calendar,
    life: { open: openLife, lives: openLives, create: createCharacter, dryRun, LifeApp },
    magic: { syncAll, syncActor, magicFor, robeOf } };
  game.modules.get(MODULE_ID).api = api;
  globalThis.krynn = api;
  // Portuguese names and texts for the compendiums, through Babele when it is active.
  const babele = (b) => b?.register?.({ module: MODULE_ID, lang: "pt-BR", dir: "babele/pt-BR" });
  if (globalThis.Babele?.get) babele(globalThis.Babele.get()); else Hooks.once("babele.init", babele);
});

// After PF2e has set up its classes: the gods' and moons' absence at the moment of casting.
Hooks.once("setup", () => installCastGate());

Hooks.once("ready", async () => {
  registerSocket();
  await firstRun();
  renderBanner();
  await buildPending();
  await syncAll();
});

for (const hook of ["createItem", "updateItem", "deleteItem"]) Hooks.on(hook, (item) => onItemChange(item));

Hooks.on("renderActorDirectory", (app, html) => addDirectoryButtons(app, html));

Hooks.on("updateWorldTime", async (worldTime, delta) => {
  refreshSky();
  await onWorldTime(worldTime, delta);
  await syncAll();
});

// Seeing a different character (a player assigned to a Black Robe) changes what the sky shows.
Hooks.on("updateUser", (user, changes) => { if (user.isSelf && "character" in changes) refreshSky(); });
