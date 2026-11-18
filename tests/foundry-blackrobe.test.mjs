// A Black Robe player sees Nuitari.
import { test } from "node:test";
import assert from "node:assert/strict";
import { installFoundry } from "./harness/foundry-mock.mjs";
import { absoluteDay } from "../scripts/logic/calendar.mjs";

const F = installFoundry({ lang: "en", isGM: false, robe: "black", worldTime: absoluteDay("classic", 357, 2, 3) * 86400 });
await import("../scripts/krynn.mjs");
await F.start();

test("a Black Robe sees the black moon", () => {
  assert.equal(document.querySelectorAll("#krynn-banner svg.krynn-moon").length, 3);
  assert.ok(document.querySelector("#krynn-banner svg.nuitari"));
});
