// The sky of Krynn: a small banner at the top of the screen (date, age and the moons), and a window with the full sky.
import { MODULE_ID, T, setting, template } from "./constants.mjs";
import { now, skyNow, stateNow, formatDate, formatDateTime, yearLabel } from "./time.mjs";
import { holidaysOn, seasonsFor, dateOfDay } from "../logic/calendar.mjs";
import { litPath, illumination } from "../logic/moon-svg.mjs";
import { magicFor, effectData } from "./magic/moons.mjs";

const fa = foundry.applications;

// Who sees the black moon: by default only the GM and players whose character wears the black robes.
export function canSeeNuitari(user = game.user) {
  const mode = setting("nuitariSeen");
  if (user.isGM || mode === "everyone") return true;
  if (mode === "gm") return false;
  return user.character?.getFlag(MODULE_ID, "robe") === "black";
}

const MOON_STYLE = {
  solinari: { lit: "#f4f4fa", dark: "#3a3d4a", ring: "#c9cbe0" },
  lunitari: { lit: "#d23a2e", dark: "#3b1a18", ring: "#8f2a22" },
  nuitari: { lit: "#4b3b6b", dark: "#0c0a12", ring: "#5d4a86" },
};

export function moonSvg(moon, size) {
  const r = size / 2 - 1.5, s = MOON_STYLE[moon.id];
  const pct = Math.round(illumination(moon.position) * 100);
  const label = T("Sky.MoonAria", { moon: T(`Moon.${moon.id}`), phase: T(`Phase.${moon.phase}`), pct });
  return `<svg class="krynn-moon ${moon.id}" width="${size}" height="${size}" viewBox="${-size / 2} ${-size / 2} ${size} ${size}" role="img" aria-label="${label}">`
    + `<title>${label}</title><circle r="${r}" fill="${s.dark}" stroke="${s.ring}" stroke-width="1"/>`
    + `<path d="${litPath(r, moon.position)}" fill="${s.lit}"/></svg>`;
}

// What the window and the banner show, computed once.
export function skyContext() {
  const d = now(), sky = skyNow(), state = stateNow(), style = setting("calendarStyle");
  const seeN = canSeeNuitari();
  const moons = state.moons ? sky.moons.filter((m) => m.id !== "nuitari" || seeN || sky.eye) : [];
  const season = seasonsFor(style).find((x) => (x.dayStart <= x.dayEnd ? d.dayOfYear >= x.dayStart && d.dayOfYear <= x.dayEnd : d.dayOfYear >= x.dayStart || d.dayOfYear <= x.dayEnd));
  const eyeDate = dateOfDay(style, d.abs + sky.toEye);
  return {
    date: formatDate(d), dateTime: formatDateTime(d), year: yearLabel(d.year),
    season: season ? T(`Calendar.Season.${season.id}`) : "",
    holidays: holidaysOn(style, d.month, d.day).map((h) => ({ name: T(`Holiday.${h}.Name`), text: T(`Holiday.${h}.Text`) })),
    age: T(`Age.${state.age}.Name`), period: T(`Period.${state.period}.Name`), periodText: T(`Period.${state.period}.Text`),
    gods: state.gods, moonsPresent: state.moons,
    moons: moons.map((m) => ({ id: m.id, name: T(`Moon.${m.id}`), robe: T(`Robe.${m.robe}`), phase: T(`Phase.${m.phase}`), phaseId: m.phase,
      svg: moonSvg(m, 72), small: moonSvg(m, 18), toHigh: m.toHigh, high: m.phase === "high" })),
    alignments: state.moons ? sky.alignments.filter((pair) => seeN || !pair.includes("nuitari")).map((pair) => pair.map((id) => T(`Moon.${id}`)).join(" · ")) : [],
    eye: state.moons && sky.eye, toEye: sky.toEye, eyeDate: formatDate(eyeDate), seeNuitari: seeN,
    myMagic: myMagic(),
    isGM: game.user.isGM,
  };
}

// For a player whose character is a mage of High Sorcery: what their moon gives them tonight.
function myMagic() {
  const actor = game.user.character;
  if (!actor?.items) return null;
  try {
    const m = magicFor(actor);
    if (!m) return null;
    const e = effectData(m);
    return { name: e.name, text: e.system.description.value };
  } catch (err) { return null; }
}

export class SkyApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "krynn-sky",
    classes: ["krynn"],
    window: { title: "KRYNN.Sky.Title", icon: "fa-solid fa-moon", resizable: false },
    position: { width: 460 },
    actions: {
      advance: SkyApp.#onAdvance,
      openSettings: () => new (game.settings.menus.get(`${MODULE_ID}.krynn`).type)().render(true),
    },
  };
  static PARTS = { sky: { template: template("sky") } };

  async _prepareContext() { return skyContext(); }

  static async #onAdvance(event, target) {
    if (!game.user.isGM) return;
    await game.time.advance(Number(target.dataset.seconds));
  }
}

let skyApp = null;
export function openSky() { skyApp ??= new SkyApp(); skyApp.render({ force: true }); }

// The banner: a strip at the top centre of the screen.
export function renderBanner() {
  document.getElementById("krynn-banner")?.remove();
  if (!game.settings.get(MODULE_ID, "showBanner")) return;
  const c = skyContext();
  const el = document.createElement("button");
  el.id = "krynn-banner"; el.type = "button";
  el.className = "krynn-banner" + (c.eye ? " eye" : "");
  el.setAttribute("aria-label", T("Sky.Open"));
  el.dataset.tooltip = T("Sky.Open");
  el.innerHTML = `<span class="moons">${c.moonsPresent ? c.moons.map((m) => m.small).join("") : `<span class="pale" aria-hidden="true"></span>`}</span>`
    + `<span class="date">${foundry.utils.escapeHTML(c.date)}</span><span class="age">${foundry.utils.escapeHTML(c.period)}</span>`;
  el.addEventListener("click", openSky);
  const host = document.querySelector("#ui-middle #ui-top") || document.querySelector("#ui-top") || document.body;
  host.append(el);
}

export function refreshSky() {
  renderBanner();
  if (skyApp?.rendered) skyApp.render();
}
