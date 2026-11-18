# Krynn for PF2e

The world of Dragonlance for the **Pathfinder Second Edition** system on **Foundry VTT 14**: the ages of Krynn, its calendar and the three moons of magic, and, in the versions to come, its gods, peoples, orders, dragons and draconians, and the lives of its heroes made with [Lifewrought](https://github.com/dvalton/lifewrought).

Unofficial fan content for private play. Not approved or endorsed by Wizards of the Coast or Paizo. Dragonlance and its names are property of Wizards of the Coast; Pathfinder is a trademark of Paizo Inc.

## Install

In Foundry's setup screen: **Add-on Modules → Install Module**, and paste this manifest URL:

```
https://github.com/dvalton/krynn-pf2e/releases/latest/download/module.json
```

Requires Foundry VTT 14 (verified on 14.370) and Pathfinder Second Edition 8.7 or newer (verified on 8.7.1). Enable it in your world, then open **Settings → Krynn**.

## Dragons and draconians (0.5)

- Compendiums **Krynn: Draconians and Creatures**, **Krynn: Dragons** and **Krynn: Relics**.
- Drop a draconian on the map: when it falls, its **death throes** happen on their own (stone, acid, bone, a stolen face, a final frenzy).
- **Dragons** (Actors sidebar, GM) brings your legacy bestiaries' dragons into Krynn with **Dragonfear**, and builds the five **Dragon Overlords**.
- The dragonlances, the dragon saddle, the Disks of Mishakal and the Blue Crystal Staff.

## Peoples and orders (0.4)

- Compendiums **Krynn: Peoples** (heritages and ancestry feats), **Krynn: Backgrounds**, **Krynn: Knightly Orders** and **Krynn: Tables**.
- The Knights of Solamnia and of Takhisis as archetypes, each with a choice of order; the Breach of the Measure effect for the GM.
- **Factions**: a button on the character sheet shows the character's standing with the factions of Krynn. The GM keeps it up to date.
- Lifewrought characters get their Krynn heritage, their god from Krynn: Gods, and a **Finish choices** button for the few choices PF2e has to ask.

## Magic (0.3)

- Compendiums **Krynn: Magic**, **Krynn: Gods**, **Krynn: Guides** and **Krynn: GM Guides** (in Portuguese with Babele).
- Give an arcane caster **Mage of High Sorcery** and choose the robes: the moon of their order changes their spells each day, as an effect on the sheet.
- The years the gods are silent, and the years the moons are gone, change what divine and arcane spells do. Settings → Krynn chooses how strict.
- Read **The Magic of Krynn** in the Guides compendium.

## Lifewrought in Foundry (0.2)

- In the **Actors** sidebar, **Live a life** opens [Lifewrought](https://github.com/dvalton/lifewrought) in a window. Each player lives their character's life from birth to the first day of adventure, towards the campaign the GM set in **Settings → Krynn → Lifewrought**.
- The life is saved in the player's Foundry account as it goes.
- At the end, **Create the character in Foundry** builds the PF2e character from your world's compendiums, gives it to the player, and writes **The Chronicle of …** in the Journal (with a page only the GM sees). Optionally, everyone they met becomes an NPC.
- The GM's **Lives** button shows every life at the table; any of them can be watched read-only.

## What 0.1 does

- **The age and the date.** The world keeps a Krynn date. The year decides the age and the period (the War of the Lance, the Age of Mortals...), whether the gods answer, and whether the moons of magic shine. The first time the module runs, the clock is set to 351 AC.
- **The Calendar of Krynn**, as Foundry's world calendar: twelve months of thirty days (or the newer 4-week months), holy days and seasons. Month and day names by people: Ergothian, Solamnic, Plainsmen, Dwarven, Elven, Kender, Goblin and the gods' days. Each player picks their own.
- **The three moons**: Solinari (36 days), Lunitari (28) and Nuitari (8), through High Sanction, Waning, Low Sanction and Waxing, their alignments, and the Night of the Eye every 504 days. Nuitari is seen only by the GM and the Black Robes. After the Chaos War a single pale moon rises, until 421 AC.
- **The sky banner** at the top of the screen and the **sky window** (click the banner), with GM buttons to pass time.
- **Chat cards** when a moon reaches High Sanction, on the Night of the Eye, on holy days, and when the age changes (the gods leaving or returning).
- **The languages and creature traits of Krynn** registered in PF2e (Solamnic, Ergot, Kenderspeak, Qualinesti, Kothian...; kender, draconian, aghar, irda, thanoi, bakali).
- **English and Brazilian Portuguese.**
- **A self-test**: Settings → Krynn → *Run the check* posts a report to the GM.

The plan for the whole module is in [docs/plan.md](docs/plan.md).

## Em português

Módulo de Dragonlance para o Pathfinder 2e no Foundry 14. Instale pelo link de manifest acima e abra **Configurações → Krynn**. A 0.5 traz os dragões e draconianos: os estertores automáticos dos draconianos, os dragões dos bestiários legacy com o Medo Dracônico, os Senhores Supremos, as lanças do dragão e as relíquias. A 0.4 traz os povos e as ordens: heranças de Krynn (kender, elfos, anões dos clãs, gnomos funileiros), antecedentes, os Cavaleiros de Solamnia e de Takhisis, as tabelas de bolsos de kender e engenhocas, e a reputação com as facções. A 0.3 traz a magia das luas e os deuses. A 0.2 traz o Lifewrought para dentro do Foundry: cada jogador vive a vida do personagem numa janela, e no fim o personagem é criado direto, com a Crônica no Diário. A versão 0.1 traz a era e a data da campanha, o Calendário de Krynn com os nomes de cada povo, as três luas com a Noite do Olho, a faixa do céu, os avisos no chat, os idiomas e traits de Krynn e a verificação do mundo. Tudo em inglês e português.

## Development

```
npm ci
npm run check   # strings in both languages, unit tests, the module in a mock Foundry, module.json
```

`lang/en.json` and `lang/pt-BR.json` are built from `lang/strings/*` and the calendar names (`npm run lang`); `module.json` is built by `tools/build.mjs`. A new version in `package.json` pushed to main publishes a release.
