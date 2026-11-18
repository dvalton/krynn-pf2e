// Standing with the factions of Krynn: one list per character (actor flag "factions"), PF2e's attitudes from hostile
// to helpful. The GM edits; the owner sees it. Started from the organizations of a Lifewrought life.
import { MODULE_ID, T, template } from "../constants.mjs";
import { FACTIONS } from "../../content/orders.mjs";
import { factionRows, STANDINGS, slugify } from "../../logic/peoples.mjs";

const fa = foundry.applications;
const lang = () => (game.i18n.lang?.startsWith("pt") ? "pt" : "en");

export class FactionsApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ["krynn", "krynn-factions"],
    window: { title: "KRYNN.Factions.Title", icon: "fa-solid fa-flag", resizable: true },
    position: { width: 560 },
    actions: {
      add: FactionsApp.#onAdd,
      remove: FactionsApp.#onRemove,
      step: FactionsApp.#onStep,
    },
  };
  static PARTS = { factions: { template: template("factions") } };

  constructor({ actor } = {}) { super({ id: `krynn-factions-${actor.id}` }); this.actor = actor; }
  get title() { return T("Factions.TitleOf", { name: this.actor.name }); }
  get stored() { return this.actor.getFlag(MODULE_ID, "factions") ?? {}; }

  async _prepareContext() {
    const rows = factionRows(this.stored, FACTIONS, lang()).map((r) => ({ ...r, label: T(`Factions.Standing.${r.key}`), up: r.standing < 2, down: r.standing > -2 }));
    const presets = FACTIONS.filter((f) => !(f.id in this.stored)).map((f) => ({ id: f.id, name: f.name[lang()] }));
    return { rows, presets, gm: game.user.isGM, empty: !rows.length, scale: STANDINGS.map((k, i) => ({ n: i - 2, label: T(`Factions.Standing.${k}`) })) };
  }

  async #set(id, data) {
    if (!game.user.isGM) return;
    if (data === null) await this.actor.update({ [`flags.${MODULE_ID}.factions.-=${id}`]: null });
    else await this.actor.setFlag(MODULE_ID, "factions", { ...this.stored, [id]: { ...(this.stored[id] || {}), ...data } });
    this.render();
  }

  static async #onAdd(e, t) {
    const root = this.element;
    const preset = root.querySelector("[name=preset]")?.value, custom = root.querySelector("[name=custom]")?.value?.trim();
    if (custom) return this.#set(slugify(custom) || foundry.utils.randomID(), { name: custom, standing: 0, note: "" });
    if (preset) return this.#set(preset, { name: null, standing: 0, note: "" });
  }
  static async #onRemove(e, t) { return this.#set(t.dataset.id, null); }
  static async #onStep(e, t) {
    const f = this.stored[t.dataset.id];
    if (!f) return;
    return this.#set(t.dataset.id, { standing: Math.max(-2, Math.min(2, (f.standing ?? 0) + Number(t.dataset.by))) });
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    if (!game.user.isGM) return;
    for (const input of this.element.querySelectorAll("input[name=note]")) input.addEventListener("change", (ev) => this.#set(ev.target.dataset.id, { note: ev.target.value }));
  }
}

export function openFactions(actor) {
  if (!actor) return ui.notifications.warn(T("Factions.NoActor"));
  (foundry.applications.instances.get(`krynn-factions-${actor.id}`) ?? new FactionsApp({ actor })).render({ force: true });
}
