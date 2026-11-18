// "Live a life on Krynn": the Lifewrought page in a Foundry window. The page and this window talk by postMessage
// (same origin only): the window sends the GM's campaign and the saved life, and keeps every save in the user's flags.
import { MODULE_ID, T } from "../constants.mjs";
import { lwPath, campaign } from "./engine.mjs";
import { requestCharacter } from "./socket.mjs";
import { embedHTML } from "../../logic/embed.mjs";

const fa = foundry.applications;

export class LifeApp extends fa.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    classes: ["krynn", "krynn-life"],
    window: { title: "KRYNN.Life.Title", icon: "fa-solid fa-book-open", resizable: true },
    position: { width: 1280, height: 860 },
  };

  constructor({ userId = game.user.id, readonly = false } = {}) {
    super({ id: `krynn-life-${userId}${readonly ? "-watch" : ""}` });
    this.userId = userId;
    this.readonly = readonly;
    this.frame = null;
    this.listener = (e) => this.#onMessage(e);
    this.saveLater = foundry.utils.debounce((record) => this.user.setFlag(MODULE_ID, "life", record), 800);
  }

  get user() { return game.users.get(this.userId); }
  get title() { return this.readonly ? T("Life.WatchTitle", { name: this.user?.name ?? "" }) : T("Life.Title"); }

  async _renderHTML() {
    if (this.frame) return this.frame;
    const f = document.createElement("iframe");
    f.className = "krynn-life-frame";
    f.title = T("Life.Title");
    // Foundry serves module HTML as text, so the page is written into the frame (see logic/embed.mjs).
    const base = new URL(lwPath(""), window.location.href).href;
    const r = await fetch(lwPath("index.html"));
    f.srcdoc = embedHTML(await r.text(), base);
    this.frame = f;
    return f;
  }

  _replaceHTML(result, content) { if (!content.contains(result)) content.replaceChildren(result); }

  _onFirstRender(context, options) { window.addEventListener("message", this.listener); return super._onFirstRender?.(context, options); }
  _onClose(options) { window.removeEventListener("message", this.listener); this.frame = null; return super._onClose?.(options); }

  #send(type, data = {}) { this.frame?.contentWindow?.postMessage({ source: "krynn", type, ...data }, window.location.origin); }

  async state() {
    const u = this.user, saved = u.getFlag(MODULE_ID, "life") ?? null, created = u.getFlag(MODULE_ID, "created");
    return { cfg: await campaign(), saved, recent: u.getFlag(MODULE_ID, "recent") ?? [], readonly: this.readonly, created: saved?.done && created ? created.name : null };
  }

  async #onMessage(e) {
    if (!this.frame || e.source !== this.frame.contentWindow || e.origin !== window.location.origin) return;
    const d = e.data;
    if (!d || d.source !== "lifewrought") return;
    if (d.type === "ready") return this.#send("init", { state: await this.state() });
    if (this.readonly) return;
    if (d.type === "save") return this.saveLater(d.record);
    if (d.type === "recent") return this.user.setFlag(MODULE_ID, "recent", d.recent);
    if (d.type === "clear") { await this.user.unsetFlag(MODULE_ID, "life"); return this.user.unsetFlag(MODULE_ID, "created"); }
    if (d.type === "finish") return this.#finish(d.record);
  }

  async #finish(record) {
    await this.user.setFlag(MODULE_ID, "life", record);
    let r;
    try { r = await requestCharacter(record); } catch (e) { r = { action: "failed", error: e.message }; }
    if (r.action === "created") {
      this.#send("created", { name: r.result.name });
      ui.notifications.info(T("Life.Created", { name: r.result.name }));
      game.actors.get(r.result.actorId)?.sheet.render(true);
    } else if (r.action === "queued") {
      this.#send("failed", { error: T("Life.Queued") });
    } else {
      this.#send("failed", { error: r.error });
      ui.notifications.error(T("Life.Failed", { error: r.error }));
    }
  }
}

export function openLife(options = {}) {
  const id = `krynn-life-${options.userId ?? game.user.id}${options.readonly ? "-watch" : ""}`;
  const app = foundry.applications.instances.get(id) ?? new LifeApp(options);
  app.render({ force: true });
  return app;
}
