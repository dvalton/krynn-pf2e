# Changelog

## 0.9.0

Completing the plan: what earlier versions left open.

- **The moons' spell slots** in the classic mode, as the plan has them:
  - High Sanction: one extra slot of the highest rank, from level 3.
  - Waxing: one extra slot of rank 1.
  - The Night of the Eye: two extra slots of the highest rank.
  The module adds them to the mage's arcane spellcasting and takes them back as the moon changes, touching only what is the moon's.
- **Human cultures and other peoples**: eleven new ancestry feats.
  - Human cultures: Solamnic Upbringing, Ergothian Seafarer, Plainsfolk Ways, Khurish Rider, Nerakan Hardiness, Saifhum Sailor and Ice Folk Endurance, each with an extra language.
  - Other peoples: Kagonesti Tattoos, Circus Champion, House Honour and Dragonarmy Auxiliary.
- **The Measure on the Krynn tab**: the GM records a breach (with what happened) and the penance done. The effect goes on and off, the knight's history keeps both, and the owner is told.
- **Standing history**: each change in a faction's standing is recorded with the date in Krynn and the reason. The factions window and the Krynn tab show it.
- **More creatures**: death knight, fetch, huldre, and the sea elves (Dargonesti and Dimernesti), also in the encounter generator.
- **Daylight on the active scene** (a setting, off by default): the darkness follows the sun, with sunrise and sunset moving with Krynn's seasons.
- **When the gods or the moons leave**, the age's card names the characters it touches and links Mystic of the Heart or Primal Sorcerer; when they return, it says so.
- **A lint of every pack** in the tests: each rule element uses a key PF2e has, each PF2e link is one PF2e has, and each link inside the module points to a built document.

## 0.8.0

Polish.

- **The Krynn tab** on PF2e's character sheet shows:
  - the order, the robe and what the moon gives tonight;
  - the god, and whether the gods answer in this age (or the power of the heart);
  - the knighthood, its order and any breach of the Measure;
  - the factions;
  - the life, with its Chronicle and its people;
  - the choices still to make.
  The **Krynn** button at the top of the sheet opens the same panel in a window, and keeps working if a PF2e update changes the sheet.
- **Cards**: Kender Pockets and Tinker's Contraption draw their table when used. Every Krynn card has its own parchment look, with a colour for each kind.
- **Steel as the coin of account** (a setting, off by default): PF2e's gold pieces read as steel pieces in sheets, prices and the compendium browser. Values don't change.
- **PF2e Workbench and PF2e Toolbelt**: detected, never required. With Toolbelt, the saves of death throes and dragonfear go to its target helper, with the creatures in reach as targets. The settings list what each module does and what Krynn leaves to it.
- **Portuguese review**: an automatic check of every Portuguese text (language files, compendium translations, generator tables) for English left behind and distances in feet. It runs with the tests. It found nothing to fix.

## 0.7.0

Generators.

- **Generators of Krynn** (GM, Actors sidebar): choose a region, a place, a year and the party (read from PF2e's Party). Each result is a chat card whispered to you; **Show to players** reposts it without its secrets.
  - **People**: a name from the place's own culture (Lifewrought's name lists, with patronyms and family names), a people from the place's mix, gender and pronouns, a trade, a want, a secret and a manner. **Make the NPC** builds a PF2e NPC from a role (commoner, guard, merchant, priest, mage, knight, thug, scout, veteran, captain) at the level you choose.
  - **Encounters**: who can be met in the region's terrains in that year (draconians only in their years, the nightmare of Silvanesti in its own), found in your compendiums (the module's creatures, the Monster Core, the legacy bestiaries), within PF2e's XP budget for your party and difficulty. **Place on the scene** brings them in and puts their tokens down.
  - **Rumours and news**: the region's news for the year, what the region talks about, and the talk of the age.
  - **Treasure**: steel pieces, gems and art objects from PF2e's treasure by level, and sometimes an item of Krynn.
  - **Travel and weather**: the weather for the region's climate and the calendar's season, with its effect in play, and something on the road.
  - **Inns** (name, innkeeper, the house's dish, a rumour), **ship names**, **gnome inventions**, and **kender pockets** (drawn from the table).
- The NPC builder is shared by the compendiums and the generators.
- Self-test: the creatures the encounter generator can find.

## 0.6.0

The world.

- **Krynn: Atlas of Ansalon**: a journal for each of Lifewrought's 17 ready regions, and old Istar. Each has these pages:
  - Land and People;
  - Through the Ages;
  - Places: Lifewrought's towns and villages with the peoples who live there;
  - its main cities: Palanthas, Solace, Tarsis, Kalaman, Sanction, Neraka, Qualinost, Silvanost, Thorbardin, Mount Nevermind, Kendermore, Flotsam and Nethosak;
  - Hooks.
- **A live line in the Atlas**: "Now, 351 AC: invaded by the Blue Dragonarmy". It follows the world's date, so change the year and the region changes with it (`@KrynnNow[region]` in any journal).
- **The Timeline of Krynn**, from the Age of Starbirth to the War of Souls, with what each event changes in play. A GM's click on a year brings the world to it; a player's shows the age (`@KrynnYear[351]` in any journal).
- **The Powers of Krynn**: the Knights, the dragonarmies, the Orders, the Knights of Takhisis, the Dragonlances, the Dragon Orbs, the Staff of Magius, the Hammer of Kharas and the Tower of Palanthas.
- **Krynn: Iconic People**, 25 NPCs at the level they hold in their age:
  - the eleven Heroes of the Lance in autumn 351;
  - Laurana the Golden General, Raistlin Master of Past and Present, Caramon in 358, and Goldmoon of the Citadel;
  - Kitiara, Lord Soth, Verminaard, Ariakas, Toede, Fistandantilus, Dalamar and the Avatar of Takhisis;
  - Mina and Palin.
  Their abilities are in English or Portuguese, and their portraits are left for the GM.
- Self-test: the new compendiums and the journal enrichers.

## 0.5.0

Dragons and draconians.

- **Krynn: Draconians and Creatures**: the baaz, kapak, bozak, sivak and aurak, and eight more creatures of Krynn (bakali, thanoi, aghar, kyrie, spectral minion, dreamwraith, fireshadow, irda), built to the Monster Core's tables. Their abilities read in English or Portuguese, as each player's Foundry is set.
- **Death throes, automated**: when a draconian drops to 0 Hit Points, a chat card rolls what happens, with PF2e's damage and save buttons. In automatic mode the token changes too:
  - the baaz turns to stone, and the sword that killed it may be caught;
  - the kapak melts into an acid pool on the map, which dries up after three rounds;
  - the bozak's bones burst at everyone within 10 feet;
  - the sivak takes the face of the humanoid who killed it, or bursts into flame;
  - the aurak fights on for two rounds of Final Frenzy, then explodes.
  The module remembers who struck the last blow from PF2e's own roll messages. A setting chooses automatic, card only, or off.
- **Dragons of Krynn** (GM button in the Actors sidebar): finds the chromatic and metallic dragons of your legacy bestiaries and brings them in with **Dragonfear**, a stronger frightful presence whose reach depends on the dragon's age. When an encounter begins, the Will save is posted for every enemy in reach.
- **The Dragon Overlords**: Malystryx, Khellendros, Beryllinthranox, Onysablet and Gellidus, built from the legacy ancient dragons: elite, Gargantuan, immune to fear, with the Skull Totem. Their realms are described as hazards in the GM Guides.
- **Krynn: Dragons**: the footman's and mounted dragonlances (bane of dragons), the dragon saddle and dragon barding, and the effects the throes and dragonfear use.
- **Krynn: Relics**: the Disks of Mishakal and the Blue Crystal Staff.
- **Guides**: The Dragons of Krynn (dragonfear, dragonlances and riding, the good dragons' oath, draconians); GM Guides: The Dragon Overlords.
- Self-test: the new compendiums and the legacy dragons found.

## 0.4.0

Peoples and orders, and fixes for Lifewrought characters.

Fixes
- **The Lifewrought tables didn't load** (engine.js and data.json gave 404). Foundry drops the trailing slash of a route, so the page in the window looked for its files one folder too high. The window now takes the folder from the page's own address, and the self-test checks that the page finds its files.
- **PF2e errors on Lifewrought characters** ("rulesSelections.assurance" and similar). Choices a background or feat makes for you, like Assurance in Athletics, now come with the character, and so do the simple ones (a skill, a fixed list, a champion's sanctification, a cleric's divine font, from the god of the life). A choice among compendium items, like Versatile Human's feat, is shown on the sheet with a **Finish choices** button: the item is taken again on the owner's computer, and PF2e asks.
- A Lifewrought character's god is now the one in the Krynn: Gods compendium, with the god's real spells.

Peoples and orders
- **Krynn: Peoples**: heritages for the Qualinesti, Silvanesti and Kagonesti elves, the Neidar and the five clans of Thorbardin, tinker gnomes, kender and afflicted kender. Ancestry feats: Kender Taunt, Kender Pockets, Tinker's Contraption, Life Quest, Clan Loyalty, House Etiquette.
- **Krynn: Backgrounds**: ten Krynn backgrounds, from Squire of the Knights to Dragonarmy Deserter, each with a PF2e skill feat.
- **Krynn: Knightly Orders**: the Knight of Solamnia Dedication (Crown, Sword or Rose) and its three order feats, and the Breach of the Measure effect. The Knight of Takhisis Dedication (Lily, Skull or Thorn) and Lily's Menace.
- **Krynn: Tables**: Kender Pockets (d20) and Gnomish Contraption (d12), linked from their feats.
- **Factions**: each character has a standing with the factions of Krynn, in PF2e's attitudes from hostile to helpful. It starts from the organizations of their Lifewrought life. The GM changes it from the Factions button on the sheet or in Lives; the player sees it.
- **Krynn heritages for Lifewrought characters** (a setting, on by default): kender, elves, dwarves and gnomes get their Krynn heritage instead of a PF2e one.
- Everything is in English and in Portuguese (through Babele).

## 0.3.0

Magic, and two fixes.

Fixes
- **Live a life showed the page's source code.** Foundry serves a module's HTML files as plain text, so the window now writes the Lifewrought page into its frame itself. Tested in a browser against a server that serves files the way Foundry does.
- **The Krynn settings window couldn't scroll.** It now fits the screen, can be resized, scrolls, and keeps the Save button in view. The sky and Lives windows scroll too.

Magic
- **Compendiums**: Krynn: Magic (feats and effects), Krynn: Gods (the 21 gods of Krynn as PF2e deities), Krynn: Guides (The Magic of Krynn, for everyone) and Krynn: GM Guides (The Test of High Sorcery). In Portuguese through Babele when it is active.
- **Mage of High Sorcery**: choose your order (White, Red or Black Robes). The Test of High Sorcery, Moonwise, Lunar Reservoir; the Renegade effect.
- **Moon magic on the sheet**: each mage of the Orders carries a "Moons of Magic" effect, rewritten as their moon changes: classic (High Sanction +1, Low Sanction −1, +1 for an alignment, the Night of the Eye +2, to spell attack rolls and spell DCs), light, narrative or off. A setting chooses from which level the moons matter.
- **The gods' absence**: before 351 AC and from 384 to 420 AC, the divine spells of a caster with a god fail (nothing is spent), work with a note to the GM, or are left alone, as the GM chooses. Mystics of the Heart are not affected.
- **The moons' absence**: from 384 to 420 AC, the arcane spells of mages of High Sorcery fail, warn or are left alone. Primal Sorcerers are not affected.
- The sky window tells a mage what their moon gives them tonight.
- Lifewrought characters who cast arcane spells get a note to choose their order.
- Self-test: the compendiums, the gate at casting, tonight's moon magic.

## 0.2.0

Lifewrought inside Foundry.
- **Live a life on Krynn**: a button in the Actors sidebar opens Lifewrought in a Foundry window. The life leads to the campaign the GM set in Settings → Krynn (the world's year or a fixed one, the region, the starting town, the canon); players can't change it.
- **Saved as you go** in the player's Foundry account: close the window, come back on any computer, and carry on.
- **The character is created directly**: the life is replayed from its saved dice and answers and built from this world's own PF2e compendiums (ancestry, heritage, background, class and its choices, feats, spells, gear, the Krynn god), owned by the player, and set as their character.
- **The Chronicle**: a journal with the backstory, every year lived, the people met, the notes for the campaign, and a page only the GM sees with the threads to pull.
- **The people of the life as NPCs** (optional setting), in a folder of their own, linked to the character.
- **Players and the GM**: players' characters are built by a GM's client; with no GM online, the life waits and is built when one connects.
- **Lives** (GM): who is living a life and how far they are, watch any life read-only, build a finished one, open the characters and their Chronicles.
- The calendar now shows a Lifewrought character's own people's month names by default.
- The self-test also checks that the Lifewrought engine and tables load and that a random life builds from this world's compendiums.
- Lifewrought itself is still in English; the module around it is in English and Portuguese.

## 0.1.0

The foundations.
- The age and date of the campaign, and what each year means: the age and period, the gods present or silent, the moons of magic shining or gone.
- The Calendar of Krynn as Foundry's world calendar, in two styles (12×30 days, or 12×28), with holy days and seasons, and month and day names for eight cultures; each player chooses theirs.
- Solinari, Lunitari and Nuitari with their four phases, alignments and the Night of the Eye; Nuitari visible only to the GM and the Black Robes (configurable).
- The sky banner and the sky window, with time controls for the GM.
- Chat cards for High Sanctions, the Night of the Eye, holy days and changes of age.
- Krynn's languages, creature traits and feat traits registered in PF2e.
- Settings → Krynn, with the moon magic and gods options kept ready for 0.3.
- English and Brazilian Portuguese.
- Self-test for the GM.
