# Changelog

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
