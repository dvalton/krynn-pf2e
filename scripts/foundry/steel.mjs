// Steel as the coin of account (a setting, off by default): PF2e's "gp" reads "stl" and "Gold" reads "Steel" in
// sheets, prices and the compendium browser. Values don't change: one steel piece is worth one gold piece.
import { MODULE_ID, T, setting } from "./constants.mjs";

export function applySteel() {
  if (!setting("steelCurrency")) return false;
  const tr = game.i18n?.translations;
  if (!tr) return false;
  foundry.utils.setProperty(tr, "PF2E.CurrencyAbbreviations.gp", T("Steel.Abbr"));
  foundry.utils.setProperty(tr, "PF2E.Currency.gp", T("Steel.Name"));
  if (game.i18n._fallback) {
    foundry.utils.setProperty(game.i18n._fallback, "PF2E.CurrencyAbbreviations.gp", T("Steel.Abbr"));
    foundry.utils.setProperty(game.i18n._fallback, "PF2E.Currency.gp", T("Steel.Name"));
  }
  return true;
}
export { MODULE_ID };
