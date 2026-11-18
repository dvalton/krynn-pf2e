// A small stand-in for Foundry VTT 14 and the PF2e system, enough to load the module in Node and run it:
// settings, localization, world time with the configured calendar, hooks, chat messages, users and the DOM.
// It is not Foundry: it checks that the module's own code runs and does what it says, not Foundry's behaviour.
import fs from "node:fs";
import { JSDOM } from "jsdom";
import Handlebars from "handlebars";

const ROOT = new URL("../../", import.meta.url);
const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };

export function installFoundry({ lang = "en", isGM = true, worldTime = 0, robe = null } = {}) {
  const dom = new JSDOM(`<!doctype html><body><div id="interface"><div id="ui-middle"><div id="ui-top"></div></div></div></body>`);
  globalThis.window = dom.window; globalThis.document = dom.window.document;

  const strings = flat(JSON.parse(fs.readFileSync(new URL(`lang/${lang}.json`, ROOT))));
  const i18n = {
    lang,
    has: (k) => k in strings,
    localize: (k) => strings[k] ?? k,
    format: (k, data) => (strings[k] ?? k).replace(/\{(\w+)\}/g, (_, n) => (n in data ? data[n] : `{${n}}`)),
  };

  // Calendar: what Foundry's CalendarData does with a CalendarConfig with no leap years.
  class CalendarData {
    constructor(cfg) { Object.assign(this, structuredClone(cfg)); }
    timeToComponents(t = 0) {
      const spd = 86400, dpy = this.days.daysPerYear, totalDays = Math.floor(t / spd);
      const year = Math.floor(totalDays / dpy), day = totalDays - year * dpy;
      let month = 0, left = day;
      while (month < this.months.values.length - 1 && left >= this.months.values[month].days) { left -= this.months.values[month].days; month++; }
      const secs = t - totalDays * spd;
      return { year, day, month, dayOfMonth: left, hour: Math.floor(secs / 3600), minute: Math.floor((secs % 3600) / 60), second: secs % 60, dayOfWeek: totalDays % 7, leapYear: false };
    }
  }

  const settings = new Map(), registered = new Map(), menus = new Map();
  const hooks = { on: {}, once: {} };
  const Hooks = {
    on: (n, f) => (hooks.on[n] ??= []).push(f),
    once: (n, f) => (hooks.once[n] ??= []).push(f),
    async callAll(n, ...args) {
      for (const f of hooks.once[n] ?? []) await f(...args);
      hooks.once[n] = [];
      for (const f of hooks.on[n] ?? []) await f(...args);
    },
  };
  globalThis.Hooks = Hooks;

  const chat = [];
  globalThis.ChatMessage = { create: async (data) => { chat.push(data); return data; } };

  const gmUser = { id: "gm1", name: "GM", isGM: true, active: true, isSelf: isGM, character: null };
  const playerUser = { id: "pl1", name: "Player", isGM: false, active: true, isSelf: !isGM,
    character: { getFlag: (scope, key) => (scope === "krynn-pf2e" && key === "robe" ? robe : undefined) } };
  const users = [gmUser, playerUser];
  users.activeGM = gmUser;

  const time = {
    worldTime,
    calendar: null,
    async set(t) { const delta = t - this.worldTime; this.worldTime = t; await Hooks.callAll("updateWorldTime", t, delta, {}, "gm1"); return t; },
    async advance(d) { return this.set(this.worldTime + d); },
  };

  const module = { id: "krynn-pf2e", version: "0.1.0-test", active: true, flags: JSON.parse(fs.readFileSync(new URL("module.json", ROOT))).flags };

  globalThis.game = {
    i18n, time, users, user: isGM ? gmUser : playerUser,
    release: { version: "14.370" }, system: { id: "pf2e", version: "8.7.1" },
    modules: new Map([["krynn-pf2e", module]]),
    settings: {
      register(ns, key, cfg) { registered.set(`${ns}.${key}`, cfg); if (!settings.has(`${ns}.${key}`)) settings.set(`${ns}.${key}`, structuredClone(cfg.default)); },
      get(ns, key) { if (!registered.has(`${ns}.${key}`)) throw new Error(`setting ${ns}.${key} not registered`); return structuredClone(settings.get(`${ns}.${key}`)); },
      async set(ns, key, v) { if (!registered.has(`${ns}.${key}`)) throw new Error(`setting ${ns}.${key} not registered`); settings.set(`${ns}.${key}`, structuredClone(v)); registered.get(`${ns}.${key}`).onChange?.(v); return v; },
      registerMenu(ns, key, cfg) { menus.set(`${ns}.${key}`, cfg); },
      menus,
    },
  };

  // PF2e reads module.json's pf2e-homebrew flags into CONFIG.PF2E at setup.
  const hb = module.flags["krynn-pf2e"]["pf2e-homebrew"];
  globalThis.CONFIG = {
    time: { worldCalendarConfig: null, worldCalendarClass: CalendarData, formatters: {} },
    PF2E: {
      languages: { common: "Common", draconic: "Draconic", ...Object.fromEntries(Object.entries(hb.languages).map(([k, v]) => [k, v])) },
      creatureTraits: Object.fromEntries(Object.entries(hb.creatureTraits).map(([k, v]) => [k, v.label])),
    },
  };

  // Applications: render Handlebars templates from the module folder with the app's context.
  const hbs = Handlebars.create();
  hbs.registerHelper("localize", (key, options) => (options?.hash && Object.keys(options.hash).length ? i18n.format(key, options.hash) : i18n.localize(key)));
  class ApplicationV2 {
    static DEFAULT_OPTIONS = {};
    constructor() { this.rendered = false; this.element = null; }
    async render() {
      const ctx = await this._prepareContext({});
      const html = Object.values(this.constructor.PARTS).map((p) => {
        const file = p.template.replace(/^modules\/krynn-pf2e\//, "");
        if (!file.startsWith("templates/") || file.startsWith("templates/generic")) return "";
        return hbs.compile(fs.readFileSync(new URL(file, ROOT), "utf8"))(ctx);
      }).join("");
      this.element = document.createElement(this.constructor.DEFAULT_OPTIONS.tag || "div");
      this.element.innerHTML = html;
      this.rendered = true; this.lastContext = ctx; this.lastHTML = html;
      return this;
    }
  }
  const HandlebarsApplicationMixin = (Base) => class extends Base {};
  globalThis.foundry = {
    applications: { api: { ApplicationV2, HandlebarsApplicationMixin } },
    utils: {
      escapeHTML: (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
      expandObject: (o) => { const out = {}; for (const [k, v] of Object.entries(o)) { const parts = k.split("."); let n = out; parts.slice(0, -1).forEach((p) => { n = n[p] ??= {}; }); n[parts.at(-1)] = v; } return out; },
      isNewerVersion: (a, b) => { const pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number); for (let i = 0; i < Math.max(pa.length, pb.length); i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); } return false; },
      debouncedReload: () => { globalThis.__reloaded = true; },
    },
  };

  return {
    chat, settings, menus, hooks: Hooks,
    // Foundry builds game.time.calendar from CONFIG.time after init.
    async start() {
      await Hooks.callAll("init");
      game.time.calendar = new CONFIG.time.worldCalendarClass(CONFIG.time.worldCalendarConfig);
      await Hooks.callAll("ready");
    },
  };
}
