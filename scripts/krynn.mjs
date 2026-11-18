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
import { openFactions, FactionsApp } from "./foundry/peoples/factions.mjs";
import { finishChoices, pendingChoices, sheetNotice } from "./foundry/lifewrought/finish.mjs";
import { injectTab, headerButtons, openPanel, panelContext, KrynnPanelApp } from "./foundry/sheet/panel.mjs";
import { applySteel } from "./foundry/steel.mjs";
import { companions } from "./foundry/compat.mjs";
import { onFeatMessage } from "./foundry/peoples/tables.mjs";
import { syncDaylight } from "./foundry/daylight.mjs";
import { rememberHit, onActorUpdate, onCombatRound, runThroes } from "./foundry/dragons/throes.mjs";
import { openDragons, importDragon, findDragons, onCombatStart, DragonsApp } from "./foundry/dragons/dragons.mjs";
import { registerEnrichers, installYearClicks, refreshNowLines } from "./foundry/atlas.mjs";
import { openGenerators, GeneratorsApp, onChatCard, makeNpc, placeEncounter, creatureIndex } from "./foundry/generators/app.mjs";

Hooks.once("init", () => {
  registerSettings();
  CONFIG.time.formatters ??= {};
  registerCalendar();
  const api = { now, setDate, sky: skyNow, state: stateNow, formatDate, openSky, selfTest, refresh: refreshSky, ages, moons, calendar,
    life: { open: openLife, lives: openLives, create: createCharacter, dryRun, LifeApp, finishChoices, pendingChoices },
    factions: { open: openFactions, FactionsApp },
    panel: { open: openPanel, context: panelContext, KrynnPanelApp },
    companions,
    atlas: { refresh: refreshNowLines },
    generators: { open: openGenerators, run: (kind, state) => GeneratorsApp.run(kind, state), makeNpc, placeEncounter, creatureIndex, GeneratorsApp },
    dragons: { open: openDragons, import: importDragon, find: findDragons, throes: runThroes, DragonsApp },
    magic: { syncAll, syncActor, magicFor, robeOf } };
  game.modules.get(MODULE_ID).api = api;
  // Journals: @KrynnNow[region] and @KrynnYear[351] (the Atlas and the Timeline).
  registerEnrichers();
  globalThis.krynn = api;
  // Portuguese names and texts for the compendiums, through Babele when it is active.
  const babele = (b) => b?.register?.({ module: MODULE_ID, lang: "pt-BR", dir: "babele/pt-BR" });
  if (globalThis.Babele?.get) babele(globalThis.Babele.get()); else Hooks.once("babele.init", babele);
});

// After PF2e has set up its classes: the gods' and moons' absence at the moment of casting.
Hooks.once("setup", () => installCastGate());

Hooks.once("ready", async () => {
  registerSocket();
  installYearClicks();
  syncDaylight();
  await firstRun();
  renderBanner();
  await buildPending();
  await syncAll();
});

for (const hook of ["createItem", "updateItem", "deleteItem"]) Hooks.on(hook, (item) => onItemChange(item));

Hooks.on("renderActorDirectory", (app, html) => addDirectoryButtons(app, html, { openDragons, openGenerators }));
// The generators' chat cards: reveal, make the NPC, place the encounter.
Hooks.on("renderChatMessageHTML", (message, html) => onChatCard(message, html));

// Dragons and draconians: who hit whom, the death throes at 0 HP, dragonfear when an encounter begins, the acid
// pools drying up as rounds pass.
Hooks.on("createChatMessage", (message) => { rememberHit(message); onFeatMessage(message); });
Hooks.on("updateActor", (actor, changes) => onActorUpdate(actor, changes));
// An unlinked token's HP lives in its delta: the same check, from the token's side (the flag keeps it to once).
Hooks.on("updateToken", (token, changes) => { if (changes.delta?.system && token.actor) onActorUpdate(token.actor, changes.delta); });
Hooks.on("combatStart", (combat) => onCombatStart(combat));
Hooks.on("combatRound", (combat) => onCombatRound(combat));

// The character sheet: a Factions button, and a note while PF2e choices are still open.
Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => headerButtons(sheet, buttons));
Hooks.on("renderCharacterSheetPF2e", async (app, html) => { sheetNotice(app, html); try { await injectTab(app, html); } catch (e) { console.warn("krynn-pf2e | Krynn tab", e); } });

// Steel as the coin of account, once the languages are loaded.
Hooks.once("i18nInit", () => applySteel());
// A scene made active takes the hour's daylight.
Hooks.on("updateScene", (scene, changes) => { if (changes.active) syncDaylight(scene); });

Hooks.on("updateWorldTime", async (worldTime, delta) => {
  refreshSky();
  refreshNowLines();
  await syncDaylight();
  await onWorldTime(worldTime, delta);
  await syncAll();
});

// Seeing a different character (a player assigned to a Black Robe) changes what the sky shows.
Hooks.on("updateUser", (user, changes) => { if (user.isSelf && "character" in changes) refreshSky(); });
