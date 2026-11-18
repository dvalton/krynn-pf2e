// PF2e Workbench and PF2e Toolbelt: detected at startup, never required. The module hands Toolbelt the targets of
// its save prompts (death throes, dragonfear) so Toolbelt's target helper can roll and apply them; it leaves to
// Workbench what Workbench already automates, and does nothing twice.
import { MODULE_ID } from "./constants.mjs";

export const WORKBENCH = "xdy-pf2e-workbench", TOOLBELT = "pf2e-toolbelt";
export const active = (id) => !!game.modules?.get(id)?.active;

export function companions() {
  return [
    { id: WORKBENCH, title: "PF2e Workbench", active: active(WORKBENCH), key: "Workbench" },
    { id: TOOLBELT, title: "PF2e Toolbelt", active: active(TOOLBELT), key: "Toolbelt" },
  ];
}

// A save prompt for Toolbelt's target helper: a message that is only the check, flagged with its targets.
// Without Toolbelt, nothing is posted (the module's own card already carries the check).
export async function toolbeltSave({ statistic, dc, basic = false, targets = [], traits = [], options = [], speaker = null, author = null }) {
  if (!active(TOOLBELT) || !targets.length) return null;
  const check = `@Check[${statistic}|dc:${dc}${basic ? "|basic" : ""}${traits.length ? `|traits:${traits.join(",")}` : ""}${options.length ? `|options:${options.join(",")}` : ""}]`;
  return ChatMessage.create({
    speaker: speaker ?? { alias: "Krynn" }, content: `<p>${check}</p>`,
    flags: { [TOOLBELT]: { targetHelper: { type: "check", targets, author, saveVariants: { null: { dc, basic, statistic } }, options: [...(basic ? ["damaging-effect"] : []), ...options].sort(), traits } }, [MODULE_ID]: { toolbelt: true } },
  });
}
