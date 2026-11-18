# Krynn for PF2e — a Foundry module plan

A module that turns a Foundry VTT world running the Pathfinder Second Edition system into Krynn: its ages, gods, moons, peoples, orders, dragons and draconians, and the life of every hero in it, made with Lifewrought, inside Foundry.

Target: Foundry VTT 14 (build 370) and PF2e 8.7.x, the versions this group uses. It is for private use by one group, so it may carry setting names freely. The legacy bestiaries the group already owns provide the chromatic and metallic dragons.

## Decisions taken with the GM (18 Nov 2026)
| Question | Decision |
|---|---|
| Ages | All of them, with an age selector: the world knows the year, and gods, magic, moons and factions follow it |
| Language | English and Brazilian Portuguese |
| Lifewrought | Runs inside Foundry: the life is lived there, and the actor, its journal and its people are created directly |
| Moon magic | Configurable: classic, light, narrative or off |
| Extra playable peoples | None beyond Lifewrought's thirteen (draconians, gully dwarves, ogres and irda stay NPCs) |
| Calendar | The module's own, on Foundry 14's native calendar, with no dependency |
| Companion modules | PF2e Workbench and PF2e Toolbelt are used: integrate where they help, never require them |
| Campaign content | Generators by region and age, Atlas of Ansalon (journals, no map), iconic NPCs and creatures |
| Installation | Public repository of its own, installed and updated through a manifest URL |

## Principles
1. **The year rules.** One world setting, the current date in Krynn, drives everything: which gods answer, whether the moons exist, which orders stand, which dragons rule, what a generator can roll.
2. **Automate what the rules say; surface what the story says.** Numbers go through PF2e rule elements, so the system's own sheets, rolls and chat cards show them. Story effects (an omen, a god's silence) appear as chat cards and sheet notes, and never block play.
3. **Configurable, never forced.** Every Krynn rule has a setting: classic, light, narrative or off.
4. **Native first.** Items, effects, journals and roll tables are ordinary Foundry and PF2e documents, so a GM can edit them by hand. Scripts only do what rule elements can't (time, the sky, death throes, Lifewrought).
5. **Two languages from the first line.** Every string goes through `lang/en.json` and `lang/pt-BR.json`; compendium content has both through the system's translation mechanism (Babele-style mapping files shipped in the module).
6. **Original words.** Descriptions are written fresh, in our own words: no text copied from books or novels.

## 1. Foundation
- **Package**: `krynn-pf2e`, a module requiring the `pf2e` system (minimum 8.7.0, verified 8.7.1) and Foundry 14.370.
- **Source layout**: YAML and JSON sources in the repository (`src/packs/<pack>/*.yaml`), built into LevelDB compendium packs with the official Foundry CLI; code in plain ES modules (`scripts/`), styles in `styles/`, translations in `lang/`.
- **Registration** in `module.json` (`flags.krynn-pf2e.pf2e-homebrew`): Krynn languages, creature traits, feat traits and damage types, so ancestries grant languages and items show proper trait tooltips.
- **Settings menu "Krynn"** (ApplicationV2): age and year, calendar style, moon magic mode, the gods' presence, currency, generators, Lifewrought defaults. One place for the GM.
- **Compatibility layer** (`scripts/compat/`): every touch of PF2e internals or sheet HTML lives here, so a system update breaks one file, not the module.
- **Quality**:
  - Node unit tests for everything that is pure logic: calendar arithmetic, moon phases and alignments, age rules, generators, the Lifewrought-to-actor mapping.
  - A **self-test inside Foundry**: a GM macro, "Krynn: check this world". It creates throwaway actors, applies each moon phase, era and order, and checks the resulting modifiers, slots and warnings. Then it reports and deletes them.
  - CI on GitHub runs the build, the unit tests and a pack lint (every UUID resolves, every rule element has a known key, every string is translated).
- **Release**: GitHub releases with `module.json` and `module.zip`; the manifest URL updates the module from Foundry's setup screen.

## 2. Time: ages, calendar and the sky
### The age selector
- The world stores a Krynn date. The **age** follows from the year, using Lifewrought's eras:
  - Age of Despair, up to 347 AC;
  - the War of the Lance, 348–352;
  - the years after, 353–382;
  - the Chaos War, 383;
  - the Age of Mortals, 384–420;
  - the War of Souls and after, 421 on.
- A banner in the sidebar shows the age, date and moons. Changing the year (or letting time pass across a boundary) posts a GM chat card listing what changed: "The gods have left Krynn. Divine spells now…".
- Pre-war years before 1 AC (Istar, the Cataclysm) are allowed as "AC/PC" dates, with the gods present and the Kingpriest's Istar in the Atlas.

### The calendar
- A `CalendarData` subclass registered as the world calendar.
- **Two styles**, as a setting:
  - **classic**: twelve months of Earth-like lengths, as in the older sources;
  - **12×28**: twelve months of four seven-day weeks, a 336-day year.
- **Month and weekday names by culture**: Solamnic, Ergothian, Elven, Dwarven, Kender, Plainsmen and Goblin. Each player sees the names of their character's culture (taken from Lifewrought's culture facts); the GM picks a default.
- **Holy days and festivals** of the gods and peoples, as calendar notes, with optional chat reminders.
- **Seasons** with sunrise and sunset for scene lighting (Foundry's darkness level, if the GM enables it).

### The three moons
- Solinari (white) turns in 36 days, Lunitari (red) in 28, Nuitari (black) in 8. Each passes through **High Sanction, Waning, Low Sanction, Waxing** (a quarter each).
- **Alignments and the Night of the Eye**: the module computes conjunctions; all three meet at High Sanction every 504 days. The GM sets the reference date of one Night of the Eye, and every phase follows from it.
- **Who sees what**: Nuitari is drawn only for users whose character belongs to the Black Robes (or for the GM). Everyone else sees two moons and, on the Night of the Eye, the black pupil of the Eye.
- **The ages change the sky**:
  - From the Chaos War to the War of Souls, the three moons are gone and a single pale moon rises.
  - In 421 the moons of magic return.
  - The widget shows this, and moon magic switches off and on with it.
- **Widget**: a small sky panel (ApplicationV2) with the moons' phases, the next High Sanction of each, and a countdown to the Night of the Eye. GM buttons advance time by an hour, a rest, a day or a week.

## 3. Magic of Krynn
### High Sorcery and the moons
- **The Orders** (White, Red, Black) as a free archetype feat at level 1, "Mage of High Sorcery", for arcane casters. It records the order, the robes and the moon, and sets the roll options `krynn:order:white`, `krynn:order:red` and `krynn:order:black`.
- Feats along the way:
  - **The Test of High Sorcery**: a milestone feat around level 3. It is granted by a GM-run Test, with a journal toolkit of scenes, trials and the price paid.
  - Order feats: lunar focus, the robes' protections, the towers' libraries.
  - **Renegade**: a status the GM can apply, with consequences. Renegades are hunted and take no moon bonuses.
- **Moon magic, applied automatically when time changes**. Each mode is an effect set:

| Mode | Phase of your order's moon | Alignments and the Eye |
|---|---|---|
| **Classic** | High Sanction: +1 status bonus to spell attacks and spell DCs, and one extra spell slot of your highest rank (from level 3). Waxing: one extra slot of rank 1. Waning: nothing. Low Sanction: −1 status penalty to spell attacks and DCs. | Two moons aligned: +1 to the moons' wizards' spell DCs. Night of the Eye: +2 to spell attacks and DCs, two extra slots, and rituals of the Orders allowed |
| **Light** | High Sanction: +1 status bonus to spell attacks and DCs; nothing else | Night of the Eye: +1 more |
| **Narrative** | No numbers: chat cards and sheet notes describe what the mage feels | The Eye as a story event |
| **Off** | Calendar only | — |

- These are status effects with rule elements (`FlatModifier`, `ActiveEffectLike` on the spellcasting entry's slots) and the roll-option predicate, so they show on the sheet and in every roll breakdown. They are refreshed on the world-time hook and on login.
- Thresholds (from which level the moons matter, the size of each bonus) are settings.

### The gods and their absence
- **The pantheon**: twenty-one gods as PF2e deity items. The seven of good, of balance and of evil, the three moon-gods among them, and the High God and Chaos as journal entries.
  - Each has domains, an alternate domain, favoured weapon, divine font, sanctification, divine skill, edicts and anathema.
  - Lifewrought's `krynn-deities.yaml` is the source, so the app and the module agree.
- **Their presence follows the age**:
  - Before 351 AC there are no true clerics, only the Seekers' false priests; the gods return through Goldmoon's disks in 351.
  - From 383 to 421 the gods are gone.
- **Setting: strict, warn or off**:
  - **Strict**: divine spells and divine font of a god who is absent fail with a chat card.
  - **Warn**: they work, and the GM is told.
  - **Off**: nothing changes.
- **The Age of Mortals' magic**:
  - **Mysticism**: power of the heart, the Citadel of Light. It is a "Mystic" doctrine and archetype for divine casters without a god.
  - **Primal sorcery**: the wild magic of the land. It covers arcane casters without the Orders, and sorcerers.
  - Both are packaged so a character can switch when the age changes.
- **Clerical relics**: the Disks of Mishakal and the Blue Crystal Staff, each with its own rules.

## 4. Peoples and cultures
The thirteen peoples Lifewrought plays, on PF2e ancestries, with Krynn heritages and feats:

| People | PF2e base | Heritages and feats |
|---|---|---|
| Humans | Human | Solamnic, Ergothian, Plainsfolk (Que-Shu, Que-Kiri…), Khurish, Nerakan, Saifhum/Blood Sea, Ice Folk, Kharolian… as cultural heritage options and background boons |
| Half-elves | Human (Aiuvarin) | Between two peoples |
| Qualinesti, Silvanesti, Kagonesti elves | Elf | Heritage per nation; feats: Houses of Silvanesti, Qualinesti woodcraft, Kagonesti tattoos and wilder ways |
| Hill and mountain dwarves | Dwarf | Neidar; Hylar, Daewar, Theiwar, Daergar, Klar (Thorbardin clans) |
| Gnomes | Gnome | Tinker gnomes: life quests, the Guilds, gnomeflingers, and a "Gnomish Contraption" table for inventions that work, mostly |
| Kender | Halfling | Fearless; Taunt; Handling (a "kender pockets" roll table that puts a found trinket in the inventory); hoopak proficiency; afflicted kender after the Chaos War |
| Minotaurs | Minotaur | The Circus of Nethosak, the House system, honour |
| Centaurs | Centaur | Abanasinian centaurs |
| Goblins, hobgoblins | Goblin, Hobgoblin | Dragonarmy auxiliaries, Throtyl |

- **Languages** registered in the system: Common, Solamnic, Ergot, Abanasinian, Que-Shu, Khurish, Nerakan, Kenderspeak, Qualinesti, Silvanesti, Kagonesti, Dwarven (with clan dialects as lore), Gnomish, Kothian (minotaur), Goblin, Ogre, Draconic and Istarian (a dead language).
- **Krynn backgrounds**: Lifewrought's 54 PF2e backgrounds work as they are. Added to them: squire of the Knights, kirath ranger, Ergothian sailor, Que-Shu shepherd, Tinker guild apprentice, Legion of Steel cell member, Citadel of Light novice, Seeker priest, Dragonarmy deserter, Mount Nevermind refugee and others.

## 5. Orders and factions
- **Knights of Solamnia**:
  - Three orders (Crown, Sword, Rose) as archetypes, with the Oath, the Measure and the knightly ranks.
  - **The Measure** is edicts and anathema the GM can check. A "Measure" button on the sheet records a breach and its penance.
  - Knightly powers come at the higher orders.
- **Knights of Takhisis** (later of Neraka): Lily, Skull and Thorn, with the Vision, after 353.
- **Legion of Steel**; **Dragonarmies** (the five flights, Highlords, the ranks); **Citadel of Light**; **the Orders of High Sorcery** (section 3); **the kirath and the Silvanesti House Protector**; **the Qualinesti resistance**; **the Thieves' Guild of Palanthas**; and others from Lifewrought's 26 organizations.
- **Standing tracker**: each character's rank and reputation with each faction, on the sheet's Krynn tab, with a history of why it changed. It uses Toolbelt's or Workbench's reputation tools if they are active, our own otherwise.

## 6. Dragons, draconians and the creatures of Krynn
### Dragons
- The chromatic and metallic dragons come from the group's legacy bestiaries. The module finds them by name, in whichever compendium holds them (a setting lists which).
- It adds **Krynn templates**:
  - **Dragonfear**: an aura with the frightened condition, a Will save, and immunity for those who have faced it.
  - Dragon **riders and saddles**; **dragon armour**; and **the good dragons' oath** (journal and story).
- **The Dragon Overlords** of the Age of Mortals: Malystryx, Khellendros, Beryllinthranox, Onysablet and Gellidus. They are elite and mythic templates on the legacy dragons, with their realms' effects as regional hazards and the skull totems as artefacts.

### Draconians, fully automated
- Baaz, kapak, bozak, sivak and aurak as NPCs.
- **Death throes** run when a draconian drops to 0 HP:
  - **Baaz** turns to stone and can trap the weapon that killed it (Reflex save).
  - **Kapak** dissolves into an acid pool, a hazard area.
  - **Bozak** explodes in a burst of bone; damage is rolled and applied with a save prompt to those in reach.
  - **Sivak** takes the shape of its killer, or bursts into flame when killed by a non-human.
  - **Aurak** goes into its final frenzy, then bursts into spheres of lightning.
- They use Foundry's hooks with templates and the system's damage rolls. Toolbelt's target helper is used when present.
- Noble draconians (from good dragons' eggs) come after 383 AC.

### Other creatures
Thanoi (walrus-folk), bakali, death knights (Lord Soth's kind), spectral minions, fetches, dreamwraiths, kyrie, slig, the shadow-people, Istar's leftovers, fireshadows, the Dargonesti and Dimernesti sea elves, Huldre, gully dwarves (Aghar) and ogres and irda as NPCs. Each is a PF2e creature with rule elements, written to the Monster Core's building rules.

## 7. Iconic people
- **The Heroes of the Lance** at the levels they hold in each age, from the Inn of the Last Home (351) to their later lives: Tanis, Raistlin, Caramon, Sturm, Tasslehoff, Flint, Goldmoon, Riverwind, Tika, Laurana, Gilthanas.
- **The villains and powers**: Kitiara, Lord Soth, Verminaard, Ariakas, Fewmaster Toede, Fistandantilus, Dalamar, and the avatar of Takhisis.
- **The Age of Mortals**: Mina, Palin Majere, Goldmoon in her last years.
- Each comes as a PF2e NPC (a variant per age where it matters) with original short descriptions, portraits left for the GM to add, and a link to the Atlas.

## 8. Atlas of Ansalon (journals)
- **Regions**: Lifewrought's seventeen ready regions (and the six still to come, as they are written), plus old Istar, as journals. Each has its geography, peoples, powers by age, places, rumours and hooks; the source is Lifewrought's region notes, rewritten for play.
- **Cities**: Palanthas, Solace, Tarsis, Kalaman, Sanction, Neraka, Qualinost, Silvanost, Thorbardin, Mount Nevermind, Kendermore, Flotsam, Nethosak and others.
- **Timeline of Krynn**, from the Age of Starbirth to the War of Souls. Each entry is marked with what it changes in play, and links to the age selector.
- **Factions, gods, artefacts** (the Dragonlances, the Dragon Orbs, the Staff of Magius, the Hammer of Kharas, the Tower of High Sorcery of Palanthas).
- No map scene; the journals link to each other by region, city and road.

## 9. Generators, by region and age
They use Lifewrought's tables (837 events, region origins, NPC names by culture, people and gender), so the world is consistent with the app:
- **Encounters**: region, terrain and age in, a PF2e encounter out. The XP budget is sized to the party; creatures come from the module, the legacy bestiaries and the system's compendia. One click puts the actors on the scene.
- **Rumours and news**: what people are talking about in a given place and year, from Lifewrought's history events (the dragonarmies march, the Highlords meet, the Blue Lady is seen).
- **People**: an NPC with name, culture, gender and pronouns, trade, a want and a secret. It uses Lifewrought's NPC generator, with an optional PF2e stat block from the GM's level.
- **Treasure**: steel, gems and Krynn items, by level and region.
- **Travel and weather**: by region and season, with the road's events.
- **Inns and taverns**, **ship names**, **kender pockets**, **gnome inventions**.

## 10. Lifewrought inside Foundry
- **"Live a life on Krynn"** opens from the actor directory or a character sheet: the same chronicle, rolls and choices, as a Foundry window.
- The GM sets the campaign start (age, year, region, starting town) once, in the Krynn settings; players can't change it.
- **Saved as you go**, in the user's flags. A player can stop and resume, and the GM can watch a life in progress (read-only).
- **At the end the module creates the character directly**:
  - **The PF2e actor**: ancestry, heritage, background, class and class choices, feats, spells and gear, from the system's compendia and the module's.
  - **Biography fields**, the deity, Krynn languages and the faction standing, all set on the actor.
  - **A journal, "The Chronicle of …"**:
    - a page of the backstory;
    - a page of every year lived;
    - a page of the people met.
    - A **GM-only page** with the secrets and threads to pull.
  - **The people of the life** (family, mentors, rivals, loves) as journal entries, and optionally as simple NPC actors, linked to each other.
- **The party's web**: the GM sees every character's ties in one view, and can link two lives (two characters who met, or are kin) and ask Lifewrought to reconcile them.
- Lifewrought's engine is shared as-is (`engine.js` + `data.json`), so the web app and the module never drift apart.

## 11. On the character sheet
- A **Krynn tab** on the PF2e character sheet:
  - order and moon (with tonight's phase);
  - god and whether they answer in this age;
  - the Measure (for knights);
  - faction standing;
  - the people of the life;
  - a link to the Chronicle.
- **Chat cards** for Krynn events: a moon at High Sanction, the Night of the Eye, the gods' silence, a draconian's death throes, a kender's taunt and pockets.

## 12. Currency: steel
- A setting turns **steel** into the coin of account: "gp" reads "stl" in sheets, prices and the compendium browser. Gold, silver and copper keep their value as trade goods (the Age of Despair's standard).
- Off by default. Prices are unchanged; only the labels and the treasure generator change.

## 13. Workbench and Toolbelt
- **Detected at startup, never required.**
- When present: Toolbelt's targeting helpers apply the death-throes damage; Workbench's automations are left alone where they already cover a rule (no double effects).
- A compatibility note in the settings lists what the module leaves to each.

## Roadmap
Each step is a usable release, tested in the group's world.

| Version | What it brings |
|---|---|
| **0.1 Foundations** ✅ | Module skeleton, settings menu, languages and traits, age selector, calendar with cultural names, the three moons and their widget, CI and self-test |
| **0.2 Lifewrought in Foundry** ✅ | The app as a Foundry window, the actor created directly, the Chronicle journal, the people of the life |
| **0.3 Magic** ✅ | Orders of High Sorcery, moon magic in all four modes, the Test and renegades, the pantheon as deities, the gods' presence by age, mysticism and primal sorcery |
| **0.4 Peoples and orders** ✅ | Krynn heritages and ancestry feats, kender and gnome tables, Krynn backgrounds, the Knights' three orders and the Measure, factions and standing |
| **0.5 Dragons and draconians** ✅ | Draconians with death throes, Krynn dragon templates and the Overlords, dragonlances and dragon gear, the other creatures of Krynn |
| **0.6 The world** ✅ | Atlas of Ansalon, timeline, iconic NPCs by age |
| **0.7 Generators** ✅ | Encounters, rumours, people, treasure, travel and weather, inns and the small tables |
| **0.8 Polish** ✅ | Krynn tab, chat cards, steel, Workbench and Toolbelt integration, full Portuguese translation review |
| **0.9 Completing the plan** ✅ | The moons' spell slots, human culture feats, the Measure and standing history, more creatures, daylight, the age's affected characters, a pack lint |
| **1.0** | A full campaign test: one session per age, every self-test green |

## Risks and how we handle them
- **PF2e updates** (8.x moves fast): everything touching system internals sits in the compatibility layer; the self-test runs after every system update; each release states the versions it was verified on.
- **Sheet injection** (the Krynn tab) is the most fragile part: it degrades to a button that opens a Krynn window if the sheet changes.
- **Balance of moon magic**: the classic mode adds real power to wizards; the bonuses are settings, and the self-test shows the numbers so the GM can tune them.
- **Size**: this is a large module. The roadmap keeps each version playable, so the group uses it from 0.1.
