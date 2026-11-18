// 0.5 without Foundry: the creatures follow the building tables, the dragon and relic packs are whole, and the
// death throes and dragonfear logic.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildDocs, buildBabele, PACKS } from "../tools/build-packs.mjs";
import { CREATURES, stat, bestiaryStrings } from "../scripts/content/creatures.mjs";
import { OVERLORDS } from "../scripts/content/dragons.mjs";
import { throesPlan, draconianKind, inlineFor, parseDragon, dragonfearRadius, levelDC, overlordBase, withinFeet } from "../scripts/logic/dragons.mjs";

const docs = buildDocs(), bab = buildBabele();
const flat = (o, p = "", out = {}) => { for (const [k, v] of Object.entries(o)) { const key = p ? `${p}.${k}` : k; if (v && typeof v === "object") flat(v, key, out); else out[key] = v; } return out; };
const LANG = { en: flat(JSON.parse(fs.readFileSync(new URL("../lang/en.json", import.meta.url)))), pt: flat(JSON.parse(fs.readFileSync(new URL("../lang/pt-BR.json", import.meta.url)))) };

test("the creatures pack: 13 NPCs, five draconians, every number from the building tables", () => {
  assert.ok(PACKS.some((p) => p.name === "creatures" && p.type === "Actor"));
  assert.equal(docs.creatures.length, CREATURES.length);
  const kinds = docs.creatures.map((d) => d.flags["krynn-pf2e"].draconian).filter(Boolean);
  assert.deepEqual(kinds, ["baaz", "kapak", "bozak", "sivak", "aurak"]);
  for (const c of CREATURES) {
    const d = docs.creatures.find((x) => x.flags["krynn-pf2e"].slug === c.slug);
    assert.equal(d.type, "npc");
    assert.equal(d.system.details.level.value, c.level);
    assert.equal(d.system.attributes.ac.value, stat.ac(c.level, c.ac), `${c.slug} AC`);
    assert.ok(d.system.attributes.hp.max > 0);
    for (const s of ["fortitude", "reflex", "will"]) assert.equal(typeof d.system.saves[s].value, "number");
    const strikes = d.items.filter((i) => i.type === "melee");
    assert.ok(strikes.length >= 1, `${c.slug} has a Strike`);
    for (const st of strikes) assert.match(Object.values(st.system.damageRolls)[0].damage, /^\d+d\d+(\+\d+)?$/);
    for (const it of d.items) assert.ok(it._key.startsWith(`!actors.items!${d._id}.`), "embedded items carry their keys");
    for (const a of d.items.filter((i) => i.type === "action")) {
      const key = /@Localize\[([^\]]+)\]/.exec(a.system.description.value)?.[1];
      assert.ok(key && LANG.en[key] && LANG.pt[key], `${c.slug}/${a.name}: text in both languages (${key})`);
      assert.notEqual(LANG.en[key], LANG.pt[key]);
      assert.ok(!/\{dc\}|\{area\}|\{attack\}/.test(LANG.en[key] + LANG.pt[key]), "placeholders filled");
    }
    assert.ok(LANG.pt[`KRYNN.Bestiary.${c.slug}.Notes`], `${c.slug}: notes in Portuguese`);
    assert.ok(bab.creatures.entries[c.name.en].name, `${c.slug}: Portuguese name`);
  }
  const draconians = docs.creatures.filter((d) => d.flags["krynn-pf2e"].draconian);
  for (const d of draconians) assert.ok(d.items.some((i) => i.system.slug === `death-throes-${d.flags["krynn-pf2e"].draconian}`), `${d.name} has its death throes`);
  assert.ok(Object.keys(bestiaryStrings("en")).length > 40);
});

test("dragons and relics: Dragonfear, the Overlord, the dragonlances and the gods' relics", () => {
  const byName = (pack, n) => docs[pack].find((d) => d.name === n);
  const fear = byName("dragons", "Dragonfear");
  assert.equal(fear.system.rules[0].key, "Aura");
  assert.match(fear.system.description.value, /@Check\[will\|dc:resolve\(/);
  assert.match(fear.system.description.value, /Compendium\.krynn-pf2e\.dragons\.Item\.[A-Za-z0-9]{16}\]\{Faced Dragonfear\}/, "links to the effect");
  const lance = byName("dragons", "Footman's Dragonlance");
  assert.equal(lance.type, "weapon");
  assert.equal(lance.system.runes.potency, 2);
  assert.ok(lance.system.rules.some((r) => r.key === "DamageDice" && r.predicate.includes("target:trait:dragon")));
  assert.equal(byName("dragons", "Mounted Dragonlance").system.runes.striking, 2);
  assert.equal(byName("dragons", "Dragon Barding").system.category, "heavy-barding");
  const disks = byName("relics", "Disks of Mishakal");
  assert.equal(disks.system.traits.rarity, "unique");
  assert.match(disks.system.description.value, /@UUID\[Compendium\.pf2e\.spells-srd\.Item\.[A-Za-z0-9]{16}\]\{heal\}/, "the real Heal spell");
  assert.equal(byName("relics", "Blue Crystal Staff").system.baseItem, "staff");
  for (const pack of ["dragons", "relics"]) for (const d of docs[pack]) {
    const pt = bab[pack].entries[d.name];
    assert.ok(pt?.name && pt.description && pt.description !== d.system.description.value, `${d.name} in Portuguese`);
    assert.ok(!/@UUID\[(EFFECT|ITEM|SPELL):/.test(d.system.description.value + pt.description), `${d.name}: links resolved`);
  }
  const ov = docs["gm-guides"].find((j) => j.name === "The Dragon Overlords");
  assert.equal(ov.pages.length, 1 + OVERLORDS.length);
  assert.ok(docs.guides.find((j) => j.name === "The Dragons of Krynn").pages.some((p) => p.name === "Draconians"));
});

test("death throes: what each draconian does, from its level and its killer", () => {
  assert.equal(draconianKind({ flag: "kapak" }), "kapak");
  assert.equal(draconianKind({ slugs: ["claw", "death-throes-bozak"] }), "bozak");
  assert.equal(draconianKind({ name: "Sivak Draconian Captain" }), "sivak");
  assert.equal(draconianKind({ name: "Goblin" }), null);
  const baaz = throesPlan("baaz", 2, { name: "Sturm", melee: true, weapon: "Longsword", humanoid: true });
  assert.equal(baaz.dc, stat.dc(2, "mod"));
  assert.equal(baaz.save.who, "Sturm");
  assert.equal(baaz.weapon, "Longsword");
  assert.equal(throesPlan("baaz", 2, { name: "Archer", melee: false }).save, null, "a bow isn't caught in the stone");
  const kapak = throesPlan("kapak", 3);
  assert.deepEqual([kapak.area.radius, kapak.area.rounds], [5, 3]);
  assert.match(inlineFor(kapak), /^@Damage\[2d6\[acid\]\] @Check\[reflex\|dc:17\|basic\]$/);
  assert.equal(throesPlan("bozak", 4).damage, "5d6[piercing]");
  assert.equal(throesPlan("sivak", 6, { name: "Tanis", humanoid: true }).shape, "Tanis");
  assert.equal(throesPlan("sivak", 6, { name: "A bear", humanoid: false }).damage, "7d6[fire]");
  const aurak = throesPlan("aurak", 8);
  assert.equal(aurak.frenzy.rounds, 2);
  assert.ok(aurak.keepAlive);
  assert.equal(throesPlan("goblin", 1), null);
});

test("dragonfear reach and DC, and the legacy dragons by name", () => {
  assert.deepEqual([0, 3, 6, 10, 19].map(levelDC), [14, 18, 22, 27, 39]);
  assert.equal(dragonfearRadius("Young Red Dragon"), 60);
  assert.equal(dragonfearRadius("Adult Blue Dragon"), 90);
  assert.equal(dragonfearRadius("Ancient Gold Dragon"), 120);
  assert.deepEqual(parseDragon("Ancient Gold Dragon (Spellcaster)"), { age: "ancient", color: "gold", spellcaster: true, chromatic: false });
  assert.equal(parseDragon("Adult Red Dragon").chromatic, true);
  assert.equal(parseDragon("Red Dragon Wyrmling"), null);
  assert.equal(parseDragon("Dragonfly"), null);
  assert.equal(overlordBase("white"), "Ancient White Dragon");
  const near = withinFeet({ id: "a", x: 0, y: 0, size: 1 }, [{ id: "b", x: 200, y: 0, size: 1 }, { id: "c", x: 400, y: 0, size: 1 }], 10);
  assert.deepEqual(near.map((t) => t.id), ["b"]);
});
