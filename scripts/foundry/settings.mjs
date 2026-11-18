// The module's settings. Everything a GM changes lives in one menu ("Krynn"), built in settings-app.mjs;
// the individual settings stay hidden from Foundry's long settings list.
import { MODULE_ID } from "./constants.mjs";
import { CULTURES, STYLES } from "../logic/calendar.mjs";
import { KrynnSettingsApp } from "./settings-app.mjs";

const choices = (ids, prefix) => Object.fromEntries(ids.map((id) => [id, `KRYNN.${prefix}.${id}`]));

export const MOON_MAGIC = ["classic", "light", "narrative", "off"];
export const GODS_MODE = ["strict", "warn", "off"];
export const NUITARI_SEEN = ["blackRobes", "everyone", "gm"];
export const THROES_MODE = ["auto", "card", "off"];

export function registerSettings() {
  const world = (key, type, def, extra = {}) => game.settings.register(MODULE_ID, key, { scope: "world", config: false, type, default: def, ...extra });

  world("calendarStyle", String, "classic", { choices: choices(Object.keys(STYLES), "Calendar.Style") });
  world("worldCulture", String, "ergothian", { choices: choices(CULTURES, "Calendar.Culture") });
  world("eyeDate", Object, { year: 351, month: 0, day: 1 });
  world("moonMagic", String, "classic", { choices: choices(MOON_MAGIC, "Settings.MoonMagic"), onChange: () => globalThis.krynn?.magic?.syncAll() });
  world("godsMode", String, "warn", { choices: choices(GODS_MODE, "Settings.Gods") });
  world("nuitariSeen", String, "blackRobes", { choices: choices(NUITARI_SEEN, "Settings.Nuitari") });
  world("hsMode", String, "warn", { choices: choices(GODS_MODE, "Settings.HighSorcery") });
  world("moonMinLevel", Number, 1);
  world("announce", Boolean, true);
  world("deathThroes", String, "auto", { choices: choices(THROES_MODE, "Settings.Throes") });
  world("dragonfearCards", Boolean, true);
  world("initialized", Boolean, false);

  // Lifewrought: the campaign every life is lived towards, set once by the GM.
  world("lwYearMode", String, "world", { choices: { world: "KRYNN.Settings.Life.YearWorld", fixed: "KRYNN.Settings.Life.YearFixed" } });
  world("lwYear", Number, 351);
  world("lwRegion", String, "abanasinia");
  world("lwStart", String, "");
  world("lwScope", String, "favoured");
  world("lwNpcActors", Boolean, false);
  world("lwKrynnHeritages", Boolean, true);
  world("lwWho", String, "everyone", { choices: { everyone: "KRYNN.Settings.Life.WhoEveryone", gm: "KRYNN.Settings.Life.WhoGM" } });

  // Per user: whose names for the months and days, and whether the sky banner shows.
  game.settings.register(MODULE_ID, "userCulture", {
    name: "KRYNN.Settings.UserCulture.Name", hint: "KRYNN.Settings.UserCulture.Hint",
    scope: "client", config: true, type: String, default: "world",
    choices: { world: "KRYNN.Settings.UserCulture.World", ...choices(CULTURES, "Calendar.Culture") },
    onChange: () => globalThis.krynn?.refresh?.(),
  });
  game.settings.register(MODULE_ID, "showBanner", {
    name: "KRYNN.Settings.ShowBanner.Name", hint: "KRYNN.Settings.ShowBanner.Hint",
    scope: "client", config: true, type: Boolean, default: true,
    onChange: () => globalThis.krynn?.refresh?.(),
  });

  game.settings.registerMenu(MODULE_ID, "krynn", {
    name: "KRYNN.Settings.Menu.Name", label: "KRYNN.Settings.Menu.Label", hint: "KRYNN.Settings.Menu.Hint",
    icon: "fa-solid fa-moon", type: KrynnSettingsApp, restricted: true,
  });
}
