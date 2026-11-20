# Krynn for PF2e

The world of Dragonlance for the **Pathfinder Second Edition** system on **Foundry VTT 14**. You get:
- Krynn's ages, calendar and three moons of magic;
- its gods and their silences;
- its peoples, knights, dragons and draconians;
- an atlas that knows what year it is;
- generators for the table;
- the lives of your heroes, made with [Lifewrought](https://github.com/dvalton/lifewrought) and built straight into Foundry.

Everything is in English and Brazilian Portuguese.

Unofficial fan content for private play. Not approved or endorsed by Wizards of the Coast or Paizo. Dragonlance and its names are property of Wizards of the Coast; Pathfinder is a trademark of Paizo Inc.

## Install

In Foundry's setup screen: **Add-on Modules → Install Module**, and paste this manifest URL:

```
https://github.com/dvalton/krynn-pf2e/releases/latest/download/module.json
```

Requires Foundry VTT 14 (verified on 14.370) and Pathfinder Second Edition 8.7 or newer (verified on 8.7.1). Babele is optional, for the compendiums in Portuguese. PF2e Workbench and PF2e Toolbelt are optional; Krynn works with them and without them.

## Quick start

1. Enable the module, then open **Settings → Krynn**.
2. Set the year (it decides the age, the gods and the moons), the calendar and how strong moon magic is.
3. Set the Lifewrought campaign (year, region, starting town).
4. Press **Run the check**, then **Run the campaign check**. Both post a card to you.
5. Open the **GM's Guide** in the compendium *Krynn: GM Guides*. Share the **Player's Guide** (*Krynn: Guides*) with your table.
6. Tell your players about **Live a life**, in the Actors sidebar.

## What's in it

**Time and the sky**
- A Krynn date.
- Ages from before the Cataclysm to the War of Souls.
- The Calendar of Krynn, with month names for each people.
- The three moons, their alignments and the Night of the Eye.
- A sky banner, and cards when something in the heavens matters.
- Optional daylight that follows the seasons.

**Magic**
- The Orders of High Sorcery. Each mage's moon changes their spells every day: bonuses, penalties and extra spell slots.
- The Test, renegades, and the Night of the Eye.
- The years the gods are silent and the years the moons are gone, as strict, warn or off.
- Mysticism and primal sorcery for the Age of Mortals.

**Lifewrought**
- Players live their characters' lives inside Foundry.
- Each player chooses how much the dice decide (pure fate, three fate points, free rerolls, choosing among the life's offers, or a concept) and a full or quick life. Every hero ends with a faith.
- The character is built from your own compendiums, with its Chronicle journal and the people of the life.
- A GM view of every life at the table.

**Peoples and orders**
- Heritages: the elven nations, the clans of Thorbardin, tinker gnomes, kender.
- Culture feats, Krynn backgrounds, and the Knights of Solamnia and of Takhisis, with the Measure.
- Standing with the factions of Krynn, with its history.

**Dragons and draconians**
- Draconians whose death throes happen on their own: stone, acid, bone, a stolen face, a final frenzy.
- Your legacy bestiaries' dragons brought in with Dragonfear.
- The five Overlords, the dragonlances, and the relics of the gods.
- More creatures of Krynn.

**The world**
- The Atlas of Ansalon, a journal per region with a line that shows what is happening there in the world's year.
- The Timeline of Krynn: click a year to go there.
- The Powers of Krynn.
- Twenty-five iconic people, by age.

**At the table**
- The Generators: people, encounters, rumours, treasure, weather and the road, inns, ships, gnome inventions, kender pockets.
- The Krynn tab on every character sheet.
- Steel as the coin of account (optional).

## Em português

Dragonlance para o Pathfinder 2e no Foundry 14: as eras e o calendário de Krynn, as três luas da magia, os deuses e seus silêncios, os povos e as ordens, dragões e draconianos, um atlas que sabe em que ano está, geradores para a mesa e as vidas dos heróis feitas no Lifewrought e criadas direto no Foundry. Tudo em português e inglês.

Instale pelo link de manifest acima e abra **Configurações → Krynn**. Comece pelo **Guia do Mestre** (compêndio *Krynn: Guias do Mestre*) e compartilhe o **Guia do Jogador** (*Krynn: Guias*) com a mesa.

## Development

```
npm ci
npm run check   # strings in both languages, the Portuguese review, unit tests, the module in a mock Foundry
                # (with a campaign rehearsal through six ages), module.json
```

`lang/en.json` and `lang/pt-BR.json` are built from `lang/strings/*`, the calendar names and the bestiary texts (`npm run lang`). `module.json` is built by `tools/build.mjs`; the compendium packs by `tools/build-packs.mjs`. A new version in `package.json` pushed to main publishes a release. The plan is in [docs/plan.md](docs/plan.md); the history in [CHANGELOG.md](CHANGELOG.md).
