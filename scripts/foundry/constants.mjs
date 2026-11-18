export const MODULE_ID = "krynn-pf2e";
export const T = (key, data) => (data ? game.i18n.format(`KRYNN.${key}`, data) : game.i18n.localize(`KRYNN.${key}`));
export const has = (key) => game.i18n.has(`KRYNN.${key}`);
export const setting = (key) => game.settings.get(MODULE_ID, key);
export const template = (name) => `modules/${MODULE_ID}/templates/${name}.hbs`;
// The one GM client that posts world-level messages, so they are never posted twice.
export const isLeadGM = () => game.user.isGM && (game.users.activeGM ? game.users.activeGM.isSelf : true);
