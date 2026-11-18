// The GM's view of the lives at the table: who is living one, how far they are, and the characters already made.
import { MODULE_ID, T, template } from "../constants.mjs";
import { openLife, LifeApp } from "./app.mjs";
import { canLive } from "./engine.mjs";
import { createCharacter } from "./create.mjs";

const fa = foundry.applications;

export class LivesApp extends fa.api.HandlebarsApplicationMixin(fa.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "krynn-lives",
    classes: ["krynn"],
    window: { title: "KRYNN.Lives.Title", icon: "fa-solid fa-users" },
    position: { width: 640 },
    actions: {
      watch: (e, t) => openLife({ userId: t.dataset.user, readonly: true }),
      live: () => openLife(),
      build: LivesApp.#onBuild,
      actor: (e, t) => game.actors.get(t.dataset.id)?.sheet.render(true),
      journal: (e, t) => game.journal.get(t.dataset.id)?.sheet.render(true),
    },
  };
  static PARTS = { lives: { template: template("lives") } };

  async _prepareContext() {
    const rows = game.users.filter((u) => u.isGM || u.active || u.getFlag(MODULE_ID, "life") || u.getFlag(MODULE_ID, "created")).map((u) => {
      const life = u.getFlag(MODULE_ID, "life"), created = u.getFlag(MODULE_ID, "created"), pending = u.getFlag(MODULE_ID, "pending");
      return {
        id: u.id, user: u.name, active: u.active,
        living: !!life && !life.done, finished: !!life?.done, pending: !!pending,
        name: life?.name || T("Lives.Unnamed"), stage: life?.stage || "", choices: life?.answers?.length ?? 0,
        year: life?.cfg?.year, created: created && game.actors.get(created.actorId) ? created : null,
        canBuild: !!life?.done && !(created && game.actors.get(created.actorId)),
      };
    });
    const made = game.actors.filter((a) => a.getFlag(MODULE_ID, "lifewrought")).map((a) => ({ id: a.id, name: a.name, journal: a.getFlag(MODULE_ID, "lifewrought").journal, owner: game.users.get(a.getFlag(MODULE_ID, "lifewrought").user)?.name ?? "" }));
    return { rows, made, canLive: canLive() };
  }

  static async #onBuild(e, t) {
    const user = game.users.get(t.dataset.user);
    const record = user?.getFlag(MODULE_ID, "life");
    try {
      const r = await createCharacter(record, user.id);
      await user.setFlag(MODULE_ID, "created", { actorId: r.actorId, journalId: r.journalId, name: r.name });
      await user.unsetFlag(MODULE_ID, "pending");
      ui.notifications.info(T("Life.Created", { name: r.name }));
    } catch (err) { ui.notifications.error(T("Life.Failed", { error: err.message })); }
    this.render();
  }
}

export function openLives() { (foundry.applications.instances.get("krynn-lives") ?? new LivesApp()).render({ force: true }); }

// Buttons in the Actors sidebar: "Live a life on Krynn" for anyone allowed, and "Lives" for the GM.
export function addDirectoryButtons(app, html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector(".krynn-life-buttons")) return;
  const box = document.createElement("div");
  box.className = "krynn-life-buttons";
  const button = (icon, label, fn) => { const b = document.createElement("button"); b.type = "button"; b.innerHTML = `<i class="fa-solid ${icon}"></i> ${foundry.utils.escapeHTML(label)}`; b.addEventListener("click", fn); return b; };
  if (canLive()) box.append(button("fa-book-open", T("Life.Open"), () => openLife()));
  if (game.user.isGM) box.append(button("fa-users", T("Lives.Open"), () => openLives()));
  if (!box.children.length) return;
  const header = root.querySelector(".directory-header") || root.querySelector("header") || root;
  header.append(box);
}

export { LifeApp };
