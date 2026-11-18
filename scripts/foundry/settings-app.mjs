// The "Krynn" settings window: the age and date, the calendar, the moons and the gods, and the self-test.
import { MODULE_ID, T, setting, template } from "./constants.mjs";
import { PERIODS, PERIOD_DEFAULT_YEAR, periodOf } from "../logic/ages.mjs";
import { CULTURES, STYLES } from "../logic/calendar.mjs";
import { now, setDate, monthName, yearLabel } from "./time.mjs";
import { MOON_MAGIC, GODS_MODE, NUITARI_SEEN } from "./settings.mjs";
import { lwData, campaign } from "./lifewrought/engine.mjs";

const fa = foundry.applications;

export class KrynnSettingsApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "krynn-settings",
    tag: "form",
    classes: ["krynn"],
    window: { title: "KRYNN.Settings.Menu.Name", icon: "fa-solid fa-moon", contentClasses: ["standard-form"] },
    position: { width: 560 },
    form: { handler: KrynnSettingsApp.#onSubmit, closeOnSubmit: true },
    actions: {
      jumpToPeriod: KrynnSettingsApp.#onJumpToPeriod,
      selfTest: () => globalThis.krynn.selfTest(),
    },
  };

  static PARTS = { form: { template: template("settings") }, footer: { template: "templates/generic/form-footer.hbs" } };

  async _prepareContext() {
    const d = now(), eye = setting("eyeDate"), culture = setting("worldCulture");
    let life = null;
    try {
      const D = await lwData(), c = await campaign();
      life = {
        regions: D.regions.filter((r) => c.year >= r.years[0] && c.year <= r.years[1]).map((r) => ({ value: r.id, label: r.name + (r.content === "ready" ? "" : ` (${T("Settings.Life.ToCome")})`), selected: r.id === setting("lwRegion") })),
        scopes: Object.entries(D.scope.scopes).map(([id, x]) => ({ value: id, label: x.text, selected: id === setting("lwScope") })),
        yearWorld: setting("lwYearMode") === "world", year: setting("lwYear"), start: setting("lwStart"),
        npcActors: setting("lwNpcActors"), whoEveryone: setting("lwWho") === "everyone",
        summary: T("Settings.Life.Summary", { year: c.year, region: (D.regions.find((r) => r.id === c.region) || {}).name || c.region }), clamped: c.clamped,
      };
    } catch (e) { life = { error: e.message }; }
    const opts = (ids, prefix, sel) => ids.map((id) => ({ value: id, label: T(`${prefix}.${id}`), selected: id === sel }));
    const months = (sel) => Array.from({ length: 12 }, (_, i) => ({ value: i, label: monthName(i, culture), selected: i === sel }));
    return {
      date: d, yearLabel: yearLabel(d.year),
      period: periodOf(d.year),
      periods: PERIODS.map((p) => ({ value: p.id, label: T(`Period.${p.id}.Name`), hint: T(`Period.${p.id}.Years`), selected: p.id === periodOf(d.year) })),
      months: months(d.month), monthDays: STYLES[setting("calendarStyle")].monthDays,
      eye, eyeMonths: months(eye.month),
      styles: opts(Object.keys(STYLES), "Calendar.Style", setting("calendarStyle")),
      cultures: opts(CULTURES, "Calendar.Culture", culture),
      moonMagic: opts(MOON_MAGIC, "Settings.MoonMagic", setting("moonMagic")),
      gods: opts(GODS_MODE, "Settings.Gods", setting("godsMode")),
      nuitari: opts(NUITARI_SEEN, "Settings.Nuitari", setting("nuitariSeen")),
      announce: setting("announce"), life,
      buttons: [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "KRYNN.Settings.Save" }],
    };
  }

  static async #onJumpToPeriod(event, target) {
    const p = this.element.querySelector("[name=period]").value;
    this.element.querySelector("[name=year]").value = PERIOD_DEFAULT_YEAR[p];
  }

  static async #onSubmit(event, form, formData) {
    const f = foundry.utils.expandObject(formData.object);
    const n = (x, def) => (Number.isFinite(Number(x)) ? Number(x) : def);
    await game.settings.set(MODULE_ID, "eyeDate", { year: n(f.eye?.year, 351), month: n(f.eye?.month, 0), day: n(f.eye?.day, 1) });
    for (const k of ["moonMagic", "godsMode", "nuitariSeen"]) if (f[k]) await game.settings.set(MODULE_ID, k, f[k]);
    await game.settings.set(MODULE_ID, "announce", !!f.announce);
    if (f.lw) {
      await game.settings.set(MODULE_ID, "lwYearMode", f.lw.yearMode === "fixed" ? "fixed" : "world");
      await game.settings.set(MODULE_ID, "lwYear", n(f.lw.year, 351));
      if (f.lw.region) await game.settings.set(MODULE_ID, "lwRegion", f.lw.region);
      if (f.lw.scope) await game.settings.set(MODULE_ID, "lwScope", f.lw.scope);
      await game.settings.set(MODULE_ID, "lwStart", String(f.lw.start ?? "").trim());
      await game.settings.set(MODULE_ID, "lwNpcActors", !!f.lw.npcActors);
      await game.settings.set(MODULE_ID, "lwWho", f.lw.who === "gm" ? "gm" : "everyone");
    }
    const d = now();
    const year = n(f.year, d.year), month = n(f.month, d.month), day = n(f.day, d.day);
    // Calendar style and the world's culture change the Foundry calendar itself: these need a reload.
    // A new style keeps the date: the same day, month and year are set again in the new count of days.
    const styleChanged = f.calendarStyle && f.calendarStyle !== setting("calendarStyle");
    const reload = styleChanged || (f.worldCulture && f.worldCulture !== setting("worldCulture"));
    if (styleChanged) await game.settings.set(MODULE_ID, "calendarStyle", f.calendarStyle);
    if (f.worldCulture) await game.settings.set(MODULE_ID, "worldCulture", f.worldCulture);
    if (styleChanged || year !== d.year || month !== d.month || day !== d.day) await setDate({ year, month, day, hour: d.hour, minute: d.minute });
    globalThis.krynn.refresh();
    if (reload) foundry.utils.debouncedReload();
  }
}
