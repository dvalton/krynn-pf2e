// A small stand-in for Foundry VTT 14 and the PF2e system, enough to load the module in Node and run it:
// settings, localization, world time with the configured calendar, hooks, chat messages, users and the DOM.
// It is not Foundry: it checks that the module's own code runs and does what it says, not Foundry's behaviour.
import fs from "node:fs";
import { PACKS } from "../../tools/build-packs.mjs";
import { JSDOM } from "jsdom";
import Handlebars from "handlebars";
import { createRequire } from "node:module";

const ROOT = new URL("../../", import.meta.url);
const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };

export function installFoundry({ lang = "en", isGM = true, worldTime = 0, robe = null } = {}) {
  const dom = new JSDOM(`<!doctype html><body><div id="interface"><div id="ui-middle"><div id="ui-top"></div></div></div></body>`, { url: "http://localhost:30000/game" });
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.HTMLElement = dom.window.HTMLElement;

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
  globalThis.ChatMessage = { create: async (data) => { chat.push(data); return data; }, getSpeaker: ({ actor }) => ({ alias: actor?.name }) };

  // Documents with flags, enough for actors, journals, folders and users.
  const ids = { n: 0 };
  const newId = () => `id${String(++ids.n).padStart(14, "0")}`;
  const setPath = (o, k, v) => { const parts = k.split("."); let n = o; parts.slice(0, -1).forEach((p) => { n = n[p] ??= {}; }); const last = parts.at(-1); if (last.startsWith("-=")) delete n[last.slice(2)]; else n[last] = v; };
  class Doc {
    constructor(data) { Object.assign(this, structuredClone(data)); this.id ??= this._id ?? newId(); this._id = this.id; this.flags ??= {}; this.uuid = `${this.constructor.name}.${this.id}`; }
    getFlag(scope, key) { return this.flags?.[scope]?.[key]; }
    get isOwner() { return game.user.isGM || this.ownership?.[game.user.id] === 3; }
    async setFlag(scope, key, value) { (this.flags[scope] ??= {})[key] = structuredClone(value); return this; }
    async unsetFlag(scope, key) { if (this.flags[scope]) delete this.flags[scope][key]; return this; }
    async update(changes) { for (const [k, v] of Object.entries(changes)) { if (k.includes(".")) setPath(this, k, structuredClone(v)); else this[k] = structuredClone(v); } return this; }
    toObject() { return structuredClone({ ...this, uuid: undefined }); }
  }
  const collection = (name) => { const c = new Map(); c[Symbol.iterator] = function () { return this.values(); }; Object.defineProperty(c, "contents", { get() { return [...c.values()]; } }); c.find = (fn) => [...c.values()].find(fn); c.filter = (fn) => [...c.values()].filter(fn); c.name = name; return c; };
  const actors = collection("actors"), journal = collection("journal"), folders = collection("folders");
  // Embedded items, with the hooks Foundry fires when they change.
  class Items extends Map {
    [Symbol.iterator]() { return this.values(); } // a Foundry Collection iterates its documents
    find(fn) { return [...this.values()].find(fn); }
    filter(fn) { return [...this.values()].filter(fn); }
    some(fn) { return [...this.values()].some(fn); }
    map(fn) { return [...this.values()].map(fn); }
    get length() { return this.size; }
  }
  class Item extends Doc {
    constructor(data, parent) { super(data); this.parent = parent; this.flags ??= {}; this.system ??= {}; }
    async delete() { return this.parent.deleteEmbeddedDocuments("Item", [this.id]); }
    toObject() { const { parent, uuid, ...rest } = this; return structuredClone(rest); }
  }
  class Actor extends Doc {
    async update(changes) { await super.update(changes); await Hooks.callAll("updateActor", this, foundry.utils.expandObject(changes), {}, "gm1"); return this; }
    constructor(data) { super({ ...data, items: undefined }); this.items = new Items(); for (const i of data.items || []) { const it = new Item(i, this); this.items.set(it.id, it); } this.system ??= {}; }
    get level() { return this.system?.details?.level?.value ?? 1; }
    get deity() { return this.items.find((i) => i.type === "deity") ?? null; }
    getRollOptions() { return this.items.filter((i) => i.system?.rules).flatMap((i) => i.system.rules.filter((r) => r.key === "RollOption" && !r.toggleable).map((r) => r.option.replace("{item|flags.system.rulesSelections.order}", i.flags?.pf2e?.rulesSelections?.order ?? ""))); }
    static async create(data) { const a = new Actor(data); a.sheet = { render: () => { a.sheet.rendered = true; } }; actors.set(a.id, a); return a; }
    static async createDocuments(list) { return Promise.all(list.map((d) => Actor.create(d))); }
    async importFromJSON(json) { const d = JSON.parse(json); const keep = { id: this.id, folder: this.folder }; Object.assign(this, { ...d, items: undefined }, keep); this.ownership = undefined; this.items = new Items(); for (const i of d.items || []) { const it = new Item(i, this); this.items.set(it.id, it); } return this; }
    async createEmbeddedDocuments(type, list) { const made = list.map((d) => new Item(d, this)); for (const it of made) { this.items.set(it.id, it); await Hooks.callAll("createItem", it, {}, "gm1"); } return made; }
    async updateEmbeddedDocuments(type, list) { for (const ch of list) { const it = this.items.get(ch._id); const { _id, ...rest } = ch; await it.update(rest); await Hooks.callAll("updateItem", it, rest, {}, "gm1"); } }
    async deleteEmbeddedDocuments(type, ids) { for (const i of ids) { const it = this.items.get(i); this.items.delete(i); if (it) await Hooks.callAll("deleteItem", it, {}, "gm1"); } }
  }
  class JournalEntry extends Doc { static async create(data) { const j = new JournalEntry(data); j.sheet = { render: () => {} }; journal.set(j.id, j); return j; } }
  class Folder extends Doc { static async create(data) { const f = new Folder(data); f.folder = data.folder ? folders.get(data.folder) : null; folders.set(f.id, f); return f; } }
  globalThis.Actor = Actor; globalThis.JournalEntry = JournalEntry; globalThis.Folder = Folder;
  const casts = [];
  class SpellcastingEntry { constructor(actor, tradition) { this.actor = actor; this.tradition = tradition; } async cast(spell, options) { casts.push({ actor: this.actor.name, spell: spell.name, tradition: this.tradition }); } }
  // The module's packs, read from packs-src (npm run check builds it first), with an index and their documents.
  const packs = collection("packs"), packDocs = {};
  for (const { name, type } of PACKS) {
    let docs = [];
    try { docs = fs.readdirSync(new URL(`packs-src/${name}/`, ROOT)).map((f) => JSON.parse(fs.readFileSync(new URL(`packs-src/${name}/${f}`, ROOT), "utf8"))); } catch (e) { /* not built */ }
    const uuid = (d) => `Compendium.krynn-pf2e.${name}.${type}.${d._id}`;
    const index = collection(`index-${name}`);
    for (const d of docs) { index.set(d._id, { _id: d._id, name: d.name, type: d.type, uuid: uuid(d), ...(d.system ? { system: { details: { level: d.system.details?.level }, level: d.system.level, traits: d.system.traits } } : {}) }); packDocs[uuid(d)] = d; }
    packs.set(`krynn-pf2e.${name}`, { collection: `krynn-pf2e.${name}`, documentName: type, metadata: { label: name }, index,
      getDocument: async (id) => { const d = docs.find((x) => x._id === id); return d ? { ...structuredClone(d), uuid: uuid(d), toObject: () => structuredClone(d) } : null; } });
  }
  globalThis.CONST = { DOCUMENT_OWNERSHIP_LEVELS: { INHERIT: -1, NONE: 0, LIMITED: 1, OBSERVER: 2, OWNER: 3 } };
  // A legacy bestiary with a few of its dragons (just enough of each NPC to bring it in).
  {
    const legacy = collection("index-legacy"), docs = {};
    const dragon = (name, level) => ({ _id: newId(), name, type: "npc", img: "systems/pf2e/icons/default-icons/npc.svg", items: [{ _id: newId(), name: "Jaws", type: "melee", system: { bonus: { value: level + 10 } } }],
      system: { details: { level: { value: level } }, traits: { size: { value: "huge" }, value: ["dragon", "fire"] }, attributes: { hp: { value: 100, max: 100 } } }, prototypeToken: { name, width: 3, height: 3 } });
    for (const [n, l] of [["Young Red Dragon", 10], ["Adult Red Dragon", 14], ["Ancient Red Dragon", 19], ["Adult Bronze Dragon", 11], ["Ancient Blue Dragon", 18], ["Red Dragon Wyrmling", 4]]) {
      const d = dragon(n, l); docs[d._id] = d; const uuid = `Compendium.pf2e.pathfinder-bestiary.Actor.${d._id}`; legacy.set(d._id, { _id: d._id, name: n, type: "npc", uuid, system: { details: { level: { value: l } } } }); packDocs[uuid] = d;
    }
    // And a few of the Monster Core's creatures, for the encounter generator.
    const core = collection("index-core"), coreDocs = {};
    for (const [n, l] of [["Goblin Warrior", -1], ["Wolf", 1], ["Hobgoblin Soldier", 1], ["Hobgoblin Archer", 1], ["Ogre Warrior", 3], ["Grizzly Bear", 3], ["Warg", 2]]) {
      const d = dragon(n, l); d.system.traits.value = ["animal"]; coreDocs[d._id] = d; const uuid = `Compendium.pf2e.pathfinder-monster-core.Actor.${d._id}`;
      core.set(d._id, { _id: d._id, name: n, type: "npc", uuid, system: { details: { level: { value: l } } } }); packDocs[uuid] = d;
    }
    packs.set("pf2e.pathfinder-monster-core", { collection: "pf2e.pathfinder-monster-core", documentName: "Actor", metadata: { label: "Monster Core" }, index: core, getDocument: async (id) => (coreDocs[id] ? { ...structuredClone(coreDocs[id]), toObject: () => structuredClone(coreDocs[id]) } : null) });
    packs.set("pf2e.pathfinder-bestiary", { collection: "pf2e.pathfinder-bestiary", documentName: "Actor", metadata: { label: "Pathfinder Bestiary" }, index: legacy, getDocument: async (id) => (docs[id] ? { ...structuredClone(docs[id]), toObject: () => structuredClone(docs[id]) } : null) });
  }
  const items = JSON.parse(fs.readFileSync(new URL("tests/fixtures/pf2e-items.json", ROOT)));
  globalThis.fromUuid = async (uuid) => { const d = items[uuid] ?? packDocs[uuid]; return d ? { uuid, toObject: () => structuredClone(d) } : null; };
  globalThis.fetch = async (url) => {
    const path = new URL(String(url), "http://localhost:30000/game").pathname;
    if (!path.startsWith("/modules/krynn-pf2e/")) return { ok: false, status: 404 };
    const file = path.slice("/modules/krynn-pf2e/".length);
    try { const text = fs.readFileSync(new URL(file, ROOT), "utf8"); return { ok: true, status: 200, json: async () => JSON.parse(text), text: async () => text }; } catch (e) { return { ok: false, status: 404 }; }
  };
  // Lifewrought's engine, as module.json's "scripts" would load it.
  globalThis.LW = createRequire(import.meta.url)(new URL("lifewrought/engine.js", ROOT).pathname);
  globalThis.ui = { notifications: { info: (m) => notes.push(["info", m]), error: (m) => notes.push(["error", m]), warn: (m) => notes.push(["warn", m]) } };
  const notes = [];

  const gmUser = new Doc({ id: "gm1", name: "GM", isGM: true, active: true, isSelf: isGM, character: null });
  const playerUser = new Doc({ id: "pl1", name: "Player", isGM: false, active: true, isSelf: !isGM, character: null });
  playerUser.character = robe ? { getFlag: (scope, key) => (scope === "krynn-pf2e" && key === "robe" ? robe : undefined) } : null;
  // A user's character is a document in Foundry; setting it by id finds the actor.
  for (const u of [gmUser, playerUser]) { const up = u.update.bind(u); u.update = async (ch) => { if ("character" in ch) { u.character = actors.get(ch.character) ?? null; const { character, ...rest } = ch; return up(rest); } return up(ch); }; }
  const users = [gmUser, playerUser];
  users.activeGM = gmUser;
  users.get = (id) => users.find((u) => u.id === id);
  const sent = [];

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
    actors, journal, folders, packs,
    socket: { handlers: [], on(ch, fn) { this.handlers.push([ch, fn]); }, emit(ch, msg) { sent.push([ch, msg]); } },
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
    TextEditor: { enrichers: [] },
    PF2E: {
      languages: { common: "Common", draconic: "Draconic", ...Object.fromEntries(Object.entries(hb.languages).map(([k, v]) => [k, v])) },
      creatureTraits: Object.fromEntries(Object.entries(hb.creatureTraits).map(([k, v]) => [k, v.label])),
      Item: { documentClasses: { spellcastingEntry: SpellcastingEntry } },
    },
  };

  // Applications: render Handlebars templates from the module folder with the app's context.
  const hbs = Handlebars.create();
  hbs.registerHelper("localize", (key, options) => (options?.hash && Object.keys(options.hash).length ? i18n.format(key, options.hash) : i18n.localize(key)));
  const instances = new Map();
  class ApplicationV2 {
    static DEFAULT_OPTIONS = {};
    constructor(options = {}) { this.rendered = false; this.element = null; this.options = { ...this.constructor.DEFAULT_OPTIONS, ...options }; this.id = this.options.id; if (this.id) instances.set(this.id, this); }
    async render() {
      if (!this.constructor.PARTS) {
        // A window that draws its own content (the Lifewrought frame).
        if (!this.element) { this.element = document.createElement("div"); this.content = document.createElement("div"); this.element.append(this.content); document.body.append(this.element); }
        const result = await this._renderHTML({}, {});
        this._replaceHTML(result, this.content, {});
        if (!this.rendered) await this._onFirstRender?.({}, {});
        this.rendered = true;
        return this;
      }
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
    applications: { api: { ApplicationV2, HandlebarsApplicationMixin }, instances },
    utils: {
      escapeHTML: (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
      expandObject: (o) => { const out = {}; for (const [k, v] of Object.entries(o)) { const parts = k.split("."); let n = out; parts.slice(0, -1).forEach((p) => { n = n[p] ??= {}; }); n[parts.at(-1)] = v; } return out; },
      isNewerVersion: (a, b) => { const pa = String(a).split(".").map(Number), pb = String(b).split(".").map(Number); for (let i = 0; i < Math.max(pa.length, pb.length); i++) { if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0); } return false; },
      debouncedReload: () => { globalThis.__reloaded = true; },
      getProperty: (o, k) => k.split(".").reduce((n, p) => (n == null ? undefined : n[p]), o),
      getRoute: (p) => `/${p}`.replace(/\/+$/, ""), // like Foundry: no trailing slash
      mergeObject: (a, b) => { const out = structuredClone(a); const m = (x, y) => { for (const [k, v] of Object.entries(y || {})) { if (v && typeof v === "object" && !Array.isArray(v) && x[k] && typeof x[k] === "object") m(x[k], v); else x[k] = v; } }; m(out, b); return out; },
      randomID: () => newId(),
      debounce: (fn) => fn,
    },
  };

  return {
    chat, settings, menus, hooks: Hooks, notes, sent, gmUser, playerUser, casts, SpellcastingEntry, Actor, packs, packDocs, collection,
    // Foundry builds game.time.calendar from CONFIG.time after init.
    async start() {
      await Hooks.callAll("init");
      await Hooks.callAll("setup");
      game.time.calendar = new CONFIG.time.worldCalendarClass(CONFIG.time.worldCalendarConfig);
      await Hooks.callAll("ready");
    },
  };
}
