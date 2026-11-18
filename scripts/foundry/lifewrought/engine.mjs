// Lifewrought's engine and data inside Foundry. The engine is loaded by module.json as a plain script (window.LW);
// the data is fetched once from the module's folder.
import { MODULE_ID, T, setting } from "../constants.mjs";
import { now } from "../time.mjs";
import { campaignCfg } from "../../logic/lifewrought.mjs";

let D = null;
export const lwPath = (file) => foundry.utils.getRoute(`modules/${MODULE_ID}/lifewrought/${file}`);

export function LW() {
  if (!globalThis.LW) throw new Error(T("Life.NoEngine"));
  return globalThis.LW;
}

export async function lwData() {
  if (!D) {
    const r = await fetch(lwPath("data.json"));
    if (!r.ok) throw new Error(T("Life.NoData", { status: r.status }));
    D = await r.json();
  }
  return D;
}

export async function campaign() {
  return campaignCfg({ yearMode: setting("lwYearMode"), fixedYear: setting("lwYear"), region: setting("lwRegion"), start: setting("lwStart"), scope: setting("lwScope") }, now().year, await lwData());
}

export const canLive = (user = game.user) => user.isGM || setting("lwWho") === "everyone";
