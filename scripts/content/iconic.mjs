// 0.6 content: the iconic people of Krynn as PF2e NPCs, at the level they hold in an age (a variant per age where
// it matters). Built to the same Monster Core tables as the creatures; short descriptions written for this module.
// Portraits are left for the GM. English and Portuguese.
const era = (en, pt) => ({ en, pt });
const E351 = era("Autumn 351 AC, the Inn of the Last Home", "Outono de 351 DC, a Pousada do Último Lar");
const human = ["human", "humanoid"], elf = ["elf", "humanoid"];
const img = "modules/krynn-pf2e/icons/hero.svg", villain = "modules/krynn-pf2e/icons/villain.svg";
const A = (str, dex, con, int, wis, cha) => ({ str, dex, con, int, wis, cha });
const S = (fortitude, reflex, will) => ({ fortitude, reflex, will });

export const ICONIC = [
  // ---- The Heroes of the Lance, 351 AC ---------------------------------------------------------------------
  { slug: "tanis-351", level: 5, year: 351, size: "med", traits: ["elf", "human", "humanoid"], img, rarity: "unique", era: E351,
    name: { en: "Tanis Half-Elven (351)", pt: "Tanis Meio-Elfo (351)" },
    abilities: A(4, 3, 2, 1, 3, 3), ac: "mod", hp: 1, saves: S("mod", "high", "mod"), perception: "high", skills: { diplomacy: "high", survival: "mod", nature: "mod", athletics: "mod" },
    speed: 30, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "qualinesti", "abanasinian"],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p"]], ["Longbow", "high", "1d8+3", "piercing", ["deadly-d10", "range-100"]]],
    actions: [["rally", { en: "Rally the Companions", pt: "Reunir os Companheiros" }, 1, ["auditory", "linguistic"], { en: "<strong>Frequency</strong> once per round<hr />One ally within 30 feet gains a +1 circumstance bonus to its next attack roll or saving throw before the end of its next turn.", pt: "<strong>Frequência</strong> uma vez por rodada<hr />Um aliado a até 9 m recebe +1 de bônus circunstancial na próxima jogada de ataque ou teste de resistência antes do fim do próximo turno dele." }]],
    notes: { en: "A reluctant leader, at home neither with elves nor humans, who holds the companions together because no one else will.", pt: "Um líder relutante, que não se sente em casa nem entre elfos nem entre humanos, e que mantém os companheiros juntos porque ninguém mais o faria." } },

  { slug: "raistlin-351", level: 4, year: 351, size: "med", traits: human, img, rarity: "unique", era: E351,
    name: { en: "Raistlin Majere (351)", pt: "Raistlin Majere (351)" },
    abilities: A(-1, 2, -1, 5, 3, 2), ac: "low", hp: 0.75, saves: S("low", "mod", "high"), perception: "high", skills: { arcana: "high", occultism: "mod", deception: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "draconic", "elven", "solamnic"],
    strikes: [["Staff of Magius", "mod", "1d6+2", "bludgeoning", ["two-hand-d8", "magical"]]],
    actions: [
      ["force-bolts", { en: "Force Bolts", pt: "Projéteis de Força" }, 2, ["arcane", "concentrate", "force", "manipulate"], { en: "Two darts of force strike creatures he can see within 120 feet; each deals @Damage[1d4+1[force]] damage, no roll needed.", pt: "Dois dardos de força atingem criaturas que ele vê a até 36 m; cada um causa @Damage[1d4+1[force]] de dano, sem jogada." }],
      ["sleep-mist", { en: "Sleeping Mist", pt: "Névoa do Sono" }, 2, ["arcane", "incapacitation", "mental", "sleep"], { en: "<strong>Frequency</strong> once per hour<hr />A 5-foot burst within 30 feet. Each creature attempts @Check[will|dc:{dc}]; on a failure it falls unconscious for 1 minute or until hurt or shaken awake.", pt: "<strong>Frequência</strong> uma vez por hora<hr />Uma explosão de 1,5 m a até 9 m. Cada criatura faz @Check[will|dc:{dc}]; se falhar, cai inconsciente por 1 minuto ou até ser ferida ou sacudida." }],
      ["frail", { en: "Frail Body", pt: "Corpo Frágil" }, "passive", [], { en: "After his Test, Raistlin's body is weak and his eyes see everything wither. On a critical failure on a Fortitude save, he also falls into a coughing fit: stunned 1.", pt: "Depois do Teste, o corpo de Raistlin é fraco e seus olhos veem tudo murchar. Numa falha crítica de Fortitude, ele também tem um acesso de tosse: atordoado 1." }],
    ],
    notes: { en: "A young Red Robe of brilliant, bitter power, who passed the Test at a price no one else knows in full. His brother is never far.", pt: "Um jovem Manto Vermelho de poder brilhante e amargo, que passou no Teste a um preço que ninguém mais conhece por inteiro. O irmão nunca está longe." } },

  { slug: "caramon-351", level: 5, year: 351, size: "med", traits: human, img, rarity: "unique", era: E351,
    name: { en: "Caramon Majere (351)", pt: "Caramon Majere (351)" },
    abilities: A(5, 1, 4, 0, 1, 2), ac: "mod", hp: 1.2, saves: S("high", "mod", "low"), perception: "mod", skills: { athletics: "high", intimidation: "mod", diplomacy: "mod" },
    speed: 25, other: [], senses: [], languages: ["common"],
    strikes: [["Longsword", "high", "2d8+7", "slashing", ["versatile-p"]], ["Fist", "high", "1d6+7", "bludgeoning", ["agile", "nonlethal"]]],
    actions: [["brothers-shield", { en: "My Brother's Shield", pt: "O Escudo do Meu Irmão" }, "reaction", [], { en: "<strong>Trigger</strong> An enemy adjacent to Caramon attacks Raistlin.<hr />Caramon makes a Strike against it before the attack is rolled.", pt: "<strong>Gatilho</strong> Um inimigo adjacente a Caramon ataca Raistlin.<hr />Caramon faz um Golpe contra ele antes do ataque ser rolado." }]],
    notes: { en: "Big, warm-hearted and stronger than anyone in the room, he has lived for his twin since they were children.", pt: "Grande, de bom coração e mais forte que todos na sala, vive para o irmão gêmeo desde que eram crianças." } },

  { slug: "sturm-351", level: 5, year: 351, size: "med", traits: human, img, rarity: "unique", era: E351,
    name: { en: "Sturm Brightblade (351)", pt: "Sturm Brightblade (351)" },
    abilities: A(4, 1, 3, 1, 2, 2), ac: "high", hp: 1, saves: S("high", "low", "high"), perception: "mod", skills: { athletics: "high", diplomacy: "mod", religion: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "solamnic"],
    strikes: [["Two-Handed Sword", "high", "dmg", "slashing", ["versatile-p"]]],
    actions: [["oath-and-measure", { en: "Oath and Measure", pt: "Juramento e Medida" }, "passive", [], { en: "Sturm gains a +2 status bonus to saving throws against fear, and never retreats while an ally is in danger.", pt: "Sturm recebe +2 de bônus de status em testes de resistência contra medo, e nunca recua enquanto um aliado está em perigo." },
      [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 2, predicate: ["item:trait:fear"] }]]],
    notes: { en: "A Knight without a knighthood, keeping the Measure in a land that spits on it, with his father's sword and armour.", pt: "Um Cavaleiro sem cavalaria, mantendo a Medida numa terra que cospe nela, com a espada e a armadura do pai." } },

  { slug: "tasslehoff-351", level: 3, year: 351, size: "sm", traits: ["halfling", "kender", "humanoid"], img, rarity: "unique", era: E351,
    name: { en: "Tasslehoff Burrfoot (351)", pt: "Tasslehoff Burrfoot (351)" },
    abilities: A(0, 4, 1, 1, 0, 3), ac: "high", hp: 0.9, saves: S("low", "high", "high"), perception: "mod", skills: { thievery: "high", deception: "high", acrobatics: "mod" },
    speed: 25, other: [], senses: ["low-light-vision"], languages: ["common", "kenderspeak"],
    strikes: [["Hoopak", "high", "1d6+3", "bludgeoning", ["finesse", "trip"]], ["Hoopak Sling", "high", "1d6+2", "bludgeoning", ["range-50"]]],
    actions: [
      ["kender-taunt", { en: "Taunt", pt: "Provocar" }, 1, ["auditory", "emotion", "linguistic", "mental"], { en: "One creature within 30 feet attempts @Check[will|dc:{dc}]; on a failure it is off-guard against Tas's allies until the end of its next turn.", pt: "Uma criatura a até 9 m faz @Check[will|dc:{dc}]; se falhar, fica desprevenida contra os aliados de Tas até o fim do próximo turno dela." }],
      ["fearless", { en: "Fearless", pt: "Destemido" }, "passive", [], { en: "Tas is immune to fear.", pt: "Tas é imune a medo." }, [{ key: "Immunity", type: "frightened" }]],
    ],
    notes: { en: "Endlessly curious, endlessly cheerful, and owner of an enormous collection of things that other people have dropped.", pt: "Curioso sem fim, alegre sem fim, e dono de uma coleção enorme de coisas que os outros deixaram cair." } },

  { slug: "flint-351", level: 4, year: 351, size: "med", traits: ["dwarf", "humanoid"], img, rarity: "unique", era: E351,
    name: { en: "Flint Fireforge (351)", pt: "Flint Fireforge (351)" },
    abilities: A(4, 0, 4, 1, 2, 0), ac: "high", hp: 1.1, saves: S("high", "low", "mod"), perception: "mod", skills: { crafting: "high", athletics: "mod", intimidation: "mod" },
    speed: 20, other: [], senses: ["darkvision"], languages: ["common", "dwarven"],
    strikes: [["Battle Axe", "high", "dmg", "slashing", ["sweep"]]],
    actions: [["grumble", { en: "Old Dwarf's Grit", pt: "Garra de Anão Velho" }, "passive", [], { en: "Flint gains a +1 circumstance bonus to saving throws against poison and against being knocked prone.", pt: "Flint recebe +1 de bônus circunstancial em testes de resistência contra veneno e contra ser derrubado." }]],
    notes: { en: "A hill dwarf smith who grumbles about everything and would die for any of them. He hates boats, and horses, and elves' cooking.", pt: "Um ferreiro anão das colinas que reclama de tudo e morreria por qualquer um deles. Odeia barcos, cavalos e a comida dos elfos." } },

  { slug: "goldmoon-351", level: 4, year: 351, size: "med", traits: human, img, rarity: "unique", era: E351,
    name: { en: "Goldmoon (351)", pt: "Goldmoon (351)" },
    abilities: A(0, 2, 1, 1, 4, 4), ac: "mod", hp: 0.9, saves: S("mod", "mod", "high"), perception: "high", skills: { religion: "high", diplomacy: "high", medicine: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "que-shu"],
    strikes: [["Blue Crystal Staff", "mod", "1d6+2", "bludgeoning", ["two-hand-d8", "magical"]]],
    actions: [
      ["mishakals-touch", { en: "Mishakal's Touch", pt: "Toque de Mishakal" }, 2, ["divine", "healing", "vitality"], { en: "<strong>Frequency</strong> three times per day<hr />A creature she touches regains @Damage[3d8+8[healing]] Hit Points.", pt: "<strong>Frequência</strong> três vezes por dia<hr />Uma criatura que ela toca recupera @Damage[3d8+8[healing]] Pontos de Vida." }],
      ["staff-refuses", { en: "The Staff Refuses", pt: "O Cajado Recusa" }, "reaction", ["divine"], { en: "<strong>Trigger</strong> An unholy creature touches or strikes with the Blue Crystal Staff.<hr />It takes @Damage[4d6[spirit]] damage and lets go.", pt: "<strong>Gatilho</strong> Uma criatura profana toca ou ataca com o Cajado de Cristal Azul.<hr />Ela sofre @Damage[4d6[spirit]] de dano e o solta." }],
    ],
    notes: { en: "Chieftain's daughter of the Que-Shu, bearer of the Blue Crystal Staff, and the first true cleric of the gods in three hundred years.", pt: "Filha do chefe dos Que-Shu, portadora do Cajado de Cristal Azul, e a primeira verdadeira clériga dos deuses em trezentos anos." } },

  { slug: "riverwind-351", level: 4, year: 351, size: "med", traits: human, img, rarity: "unique", era: E351,
    name: { en: "Riverwind (351)", pt: "Riverwind (351)" },
    abilities: A(4, 3, 2, 0, 2, 0), ac: "mod", hp: 1, saves: S("high", "high", "low"), perception: "high", skills: { survival: "high", nature: "mod", athletics: "mod", stealth: "mod" },
    speed: 30, other: [], senses: [], languages: ["common", "que-shu"],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p"]], ["Longbow", "high", "1d8+3", "piercing", ["deadly-d10", "range-100"]]],
    actions: [["hunters-mark", { en: "Plainsman's Mark", pt: "Marca do Homem das Planícies" }, 1, ["concentrate"], { en: "Riverwind marks one creature he can see. His Strikes against it deal 1d8 extra damage until he marks another.", pt: "Riverwind marca uma criatura que vê. Seus Golpes contra ela causam 1d8 de dano extra até ele marcar outra." }]],
    notes: { en: "A Que-Shu hunter of a low-born family, who went on an impossible quest to marry the chieftain's daughter and came back with a staff.", pt: "Um caçador Que-Shu de família humilde, que partiu numa busca impossível para casar com a filha do chefe e voltou com um cajado." } },

  { slug: "tika-351", level: 2, year: 351, size: "med", traits: human, img, rarity: "unique", era: E351,
    name: { en: "Tika Waylan (351)", pt: "Tika Waylan (351)" },
    abilities: A(3, 3, 2, 0, 1, 3), ac: "mod", hp: 1, saves: S("mod", "high", "low"), perception: "mod", skills: { athletics: "mod", acrobatics: "mod", diplomacy: "high" },
    speed: 25, other: [], senses: [], languages: ["common"],
    strikes: [["Frying Pan", "high", "1d6+4", "bludgeoning", ["agile", "shove"]], ["Short Sword", "mod", "1d6+3", "piercing", ["agile", "finesse"]]],
    actions: [["barroom-brawler", { en: "Barroom Brawler", pt: "Briga de Taverna" }, 1, [], { en: "Tika Shoves or Trips an adjacent creature, and gains a +2 circumstance bonus to the check if it is taller than she is.", pt: "Tika Empurra ou Derruba uma criatura adjacente, com +2 de bônus circunstancial no teste se ela for mais alta que Tika." }]],
    notes: { en: "The barmaid of the Inn of the Last Home, brave, red-haired and still learning which end of a sword to hold.", pt: "A garçonete da Pousada do Último Lar, corajosa, ruiva e ainda aprendendo por que lado se segura uma espada." } },

  { slug: "laurana-351", level: 3, year: 351, size: "med", traits: elf, img, rarity: "unique", era: E351,
    name: { en: "Laurana (351)", pt: "Laurana (351)" },
    abilities: A(1, 4, 1, 2, 2, 4), ac: "mod", hp: 0.9, saves: S("low", "high", "mod"), perception: "mod", skills: { diplomacy: "high", society: "mod", acrobatics: "mod" },
    speed: 30, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "qualinesti"],
    strikes: [["Longbow", "high", "1d8+3", "piercing", ["deadly-d10", "range-100"]], ["Rapier", "mod", "1d6+3", "piercing", ["deadly-d8", "finesse"]]],
    actions: [["princess", { en: "Daughter of the Speaker", pt: "Filha do Orador" }, "passive", [], { en: "Laurana gains a +2 circumstance bonus to Diplomacy with elves of Qualinesti.", pt: "Laurana recebe +2 de bônus circunstancial em Diplomacia com elfos de Qualinesti." }]],
    notes: { en: "The Speaker's daughter, who has loved Tanis since they were young and has just decided to stop waiting for him at home.", pt: "A filha do Orador, que ama Tanis desde jovem e acabou de decidir que não vai mais esperá-lo em casa." } },

  { slug: "gilthanas-351", level: 4, year: 351, size: "med", traits: elf, img, rarity: "unique", era: E351,
    name: { en: "Gilthanas (351)", pt: "Gilthanas (351)" },
    abilities: A(1, 3, 1, 3, 2, 2), ac: "mod", hp: 0.85, saves: S("mod", "high", "mod"), perception: "mod", skills: { arcana: "high", diplomacy: "mod", stealth: "mod" },
    speed: 30, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "qualinesti"],
    strikes: [["Longsword", "mod", "dmg", "slashing", ["versatile-p"]], ["Longbow", "high", "1d8+3", "piercing", ["deadly-d10", "range-100"]]],
    actions: [["elven-spell", { en: "Elven Spellcraft", pt: "Feitiçaria Élfica" }, 2, ["arcane", "concentrate", "fire", "manipulate"], { en: "A ray of fire at one target within 60 feet: spell attack +{attack}, @Damage[2d6+4[fire]] damage.", pt: "Um raio de fogo contra um alvo a até 18 m: ataque de magia +{attack}, @Damage[2d6+4[fire]] de dano." }]],
    notes: { en: "Laurana's brother, a prince of Qualinesti, a mage and a warrior, and suspicious of the half-elf his sister loves.", pt: "O irmão de Laurana, príncipe de Qualinesti, mago e guerreiro, e desconfiado do meio-elfo que a irmã ama." } },

  // ---- Later ages of the heroes ------------------------------------------------------------------------------
  { slug: "laurana-golden-general", level: 10, year: 352, size: "med", traits: elf, img, rarity: "unique", era: era("352 AC, the Whitestone armies", "352 DC, os exércitos da Pedra Branca"),
    name: { en: "Laurana, the Golden General", pt: "Laurana, a General Dourada" },
    abilities: A(2, 5, 2, 3, 3, 5), ac: "high", hp: 1, saves: S("mod", "high", "high"), perception: "high", skills: { diplomacy: "high", society: "high", acrobatics: "mod" },
    speed: 30, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "qualinesti", "solamnic"],
    strikes: [["Dragonlance", "high", "dmg", "piercing", ["reach-10", "magical"]], ["Longbow", "high", "2d8+6", "piercing", ["deadly-d10", "range-100"]]],
    actions: [
      ["golden-general", { en: "Golden General", pt: "General Dourada" }, 1, ["auditory", "emotion", "mental"], { en: "<strong>Frequency</strong> once per round<hr />Allies within 60 feet who can see her gain a +1 status bonus to attack rolls and to saves against fear until the start of her next turn.", pt: "<strong>Frequência</strong> uma vez por rodada<hr />Aliados a até 18 m que a vejam recebem +1 de bônus de status em jogadas de ataque e em testes contra medo até o início do próximo turno dela." }],
      ["dragonrider", { en: "Dragonrider", pt: "Cavaleira de Dragão" }, "passive", [], { en: "Mounted on a dragon, Laurana's dragonlance deals 3d8 extra spirit damage to dragons.", pt: "Montada num dragão, a lança do dragão de Laurana causa 3d8 de dano espiritual extra a dragões." }],
    ],
    notes: { en: "She took command when the Knights had none, and the armies follow her hair, gold under the sun, into every battle.", pt: "Ela assumiu o comando quando os Cavaleiros não tinham nenhum, e os exércitos seguem seu cabelo, dourado ao sol, em cada batalha." } },

  { slug: "raistlin-358", level: 18, year: 358, size: "med", traits: human, img: villain, rarity: "unique", era: era("358 AC, Master of Past and Present", "358 DC, Mestre do Passado e do Presente"),
    name: { en: "Raistlin, Master of Past and Present", pt: "Raistlin, Mestre do Passado e do Presente" },
    abilities: A(0, 4, 0, 8, 5, 5), ac: "mod", hp: 0.7, saves: S("low", "mod", "high"), perception: "high", skills: { arcana: "high", occultism: "high", deception: "high", religion: "mod" },
    speed: 25, other: [], senses: ["darkvision"], languages: ["common", "draconic", "elven", "solamnic", "istarian"],
    strikes: [["Staff of Magius", "mod", "3d6+6", "bludgeoning", ["two-hand-d8", "magical"]]],
    actions: [
      ["meteor-fall", { en: "Falling Stars", pt: "Estrelas Cadentes" }, 2, ["arcane", "concentrate", "fire", "manipulate"], { en: "<strong>Frequency</strong> once per hour<hr />Four 20-foot bursts within 500 feet: @Damage[{area}[fire]] damage, @Check[reflex|dc:{dc}|basic].", pt: "<strong>Frequência</strong> uma vez por hora<hr />Quatro explosões de 6 m a até 150 m: @Damage[{area}[fire]] de dano, @Check[reflex|dc:{dc}|basic]." }],
      ["black-bolt", { en: "Black Bolt", pt: "Raio Negro" }, 2, ["arcane", "concentrate", "manipulate", "void"], { en: "One creature within 120 feet: spell attack +{attack}, @Damage[8d10[void]] damage.", pt: "Uma criatura a até 36 m: ataque de magia +{attack}, @Damage[8d10[void]] de dano." }],
      ["time-walker", { en: "Time Walker", pt: "Andarilho do Tempo" }, "reaction", ["arcane", "teleportation"], { en: "<strong>Frequency</strong> once per hour; <strong>Trigger</strong> Raistlin would be hit by an attack.<hr />He steps a moment out of time: the attack misses, and he teleports up to 30 feet.", pt: "<strong>Frequência</strong> uma vez por hora; <strong>Gatilho</strong> Raistlin seria atingido por um ataque.<hr />Ele sai do tempo por um instante: o ataque erra, e ele se teleporta até 9 m." }],
    ],
    notes: { en: "Now in black robes, master of the Tower of Palanthas, and set on a goal no mage has dared: the Dark Queen's own throne.", pt: "Agora de manto negro, mestre da Torre de Palanthas, e decidido a algo que nenhum mago ousou: o próprio trono da Rainha das Trevas." } },

  { slug: "caramon-358", level: 10, year: 358, size: "med", traits: human, img, rarity: "unique", era: era("358 AC, after Istar", "358 DC, depois de Istar"),
    name: { en: "Caramon Majere (358)", pt: "Caramon Majere (358)" },
    abilities: A(6, 2, 5, 1, 2, 2), ac: "high", hp: 1.15, saves: S("high", "mod", "mod"), perception: "mod", skills: { athletics: "high", intimidation: "mod", diplomacy: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "istarian"],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p"]]],
    actions: [["gladiator", { en: "Gladiator's Fury", pt: "Fúria de Gladiador" }, 2, ["flourish"], { en: "Caramon makes two Strikes against the same target; both count as one for his multiple attack penalty.", pt: "Caramon faz dois Golpes contra o mesmo alvo; os dois contam como um para a penalidade de ataques múltiplos." }]],
    notes: { en: "He followed his brother into the past and came back knowing he must let him go.", pt: "Ele seguiu o irmão até o passado e voltou sabendo que precisa deixá-lo ir." } },

  { slug: "goldmoon-citadel", level: 14, year: 390, size: "med", traits: human, img, rarity: "unique", era: era("Age of Mortals, the Citadel of Light", "Era dos Mortais, a Cidadela da Luz"),
    name: { en: "Goldmoon, First Master of the Citadel", pt: "Goldmoon, Primeira Mestra da Cidadela" },
    abilities: A(0, 2, 2, 3, 6, 6), ac: "mod", hp: 0.9, saves: S("mod", "mod", "high"), perception: "high", skills: { religion: "high", medicine: "high", diplomacy: "high" },
    speed: 25, other: [], senses: [], languages: ["common", "que-shu", "elven"],
    strikes: [["Staff", "mod", "2d6+6", "bludgeoning", []]],
    actions: [["power-of-the-heart", { en: "Power of the Heart", pt: "Poder do Coração" }, 2, ["healing", "mental", "vitality"], { en: "<strong>Frequency</strong> three times per day<hr />Mysticism, not a god's gift: up to three creatures within 30 feet each regain @Damage[6d8+20[healing]] Hit Points.", pt: "<strong>Frequência</strong> três vezes por dia<hr />Misticismo, não um dom de um deus: até três criaturas a até 9 m recuperam @Damage[6d8+20[healing]] Pontos de Vida cada." }]],
    notes: { en: "With the gods gone, she found the power in the heart, and founded the Citadel of Light to teach it to anyone.", pt: "Com os deuses partidos, ela achou o poder no coração, e fundou a Cidadela da Luz para ensiná-lo a qualquer um." } },

  // ---- Villains and powers -----------------------------------------------------------------------------------
  { slug: "kitiara-352", level: 11, year: 352, size: "med", traits: human, img: villain, rarity: "unique", era: era("352 AC, Highlord of the Blue Dragonarmy", "352 DC, Senhora do Exército Dracônico Azul"),
    name: { en: "Kitiara uth Matar", pt: "Kitiara uth Matar" },
    abilities: A(5, 4, 3, 2, 2, 4), ac: "high", hp: 1, saves: S("high", "high", "mod"), perception: "mod", skills: { athletics: "high", deception: "high", intimidation: "high" },
    speed: 25, other: [], senses: [], languages: ["common", "draconic", "solamnic"],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p", "magical"]]],
    actions: [
      ["dragon-highlord", { en: "Dragon Highlord", pt: "Senhora Dracônica" }, 1, ["auditory", "linguistic"], { en: "One ally within 60 feet can immediately Step or make a Strike as a reaction.", pt: "Um aliado a até 18 m pode imediatamente dar um Passo ou fazer um Golpe como reação." }],
      ["riposte", { en: "Riposte", pt: "Riposte" }, "reaction", [], { en: "<strong>Trigger</strong> A creature critically fails a Strike against Kitiara.<hr />She makes a Strike against it.", pt: "<strong>Gatilho</strong> Uma criatura falha criticamente num Golpe contra Kitiara.<hr />Ela faz um Golpe contra ela." }],
    ],
    notes: { en: "The twins' half-sister, a sword for hire turned Highlord, who rides the blue dragon Skie and wants everything.", pt: "A meia-irmã dos gêmeos, mercenária que virou Senhora Dracônica, que monta o dragão azul Skie e quer tudo." } },

  { slug: "lord-soth", level: 19, year: 352, size: "med", traits: ["undead", "human", "humanoid", "unholy"], img: villain, rarity: "unique", era: era("The Knight of the Black Rose", "O Cavaleiro da Rosa Negra"),
    name: { en: "Lord Soth", pt: "Lord Soth" },
    abilities: A(7, 2, 5, 3, 4, 6), ac: "high", hp: 1, saves: S("high", "mod", "high"), perception: "high", skills: { athletics: "high", intimidation: "high", religion: "mod" },
    speed: 25, other: [], senses: ["darkvision"], languages: ["common", "solamnic"],
    immunities: ["death-effects", "disease", "paralyzed", "poison", "unconscious", "fear-effects"], weaknesses: [["vitality", 15]], resistances: [["fire", 15]],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p", "magical", "unholy"]]],
    actions: [
      ["death-word", { en: "Word of Death", pt: "Palavra de Morte" }, 2, ["death", "incapacitation", "occult"], { en: "<strong>Frequency</strong> once per day<hr />One living creature within 30 feet of 15th level or lower attempts @Check[fortitude|dc:{dc}]. <strong>Failure</strong> It dies. <strong>Success</strong> @Damage[10d10[void]] damage.", pt: "<strong>Frequência</strong> uma vez por dia<hr />Uma criatura viva a até 9 m de nível 15 ou menor faz @Check[fortitude|dc:{dc}]. <strong>Falha</strong> Ela morre. <strong>Sucesso</strong> @Damage[10d10[void]] de dano." }],
      ["dread-presence", { en: "Dread Presence", pt: "Presença Terrível" }, "passive", ["aura", "emotion", "fear", "mental"], { en: "60 feet. A creature that enters attempts @Check[will|dc:{dc}]; on a failure it is frightened 2, on a critical failure also fleeing for 1 round.", pt: "18 m. Uma criatura que entre faz @Check[will|dc:{dc}]; na falha fica amedrontada 2, na falha crítica também fugindo por 1 rodada." },
        [{ key: "Aura", radius: 60, slug: "soth-dread", traits: ["aura", "emotion", "fear", "mental"] }]],
      ["hellfire", { en: "Hellfire Burst", pt: "Explosão de Fogo Infernal" }, 2, ["fire", "occult"], { en: "<strong>Frequency</strong> once per hour<hr />A 20-foot burst within 120 feet: @Damage[{area}[fire]] damage, @Check[reflex|dc:{dc}|basic].", pt: "<strong>Frequência</strong> uma vez por hora<hr />Uma explosão de 6 m a até 36 m: @Damage[{area}[fire]] de dano, @Check[reflex|dc:{dc}|basic]." }],
    ],
    notes: { en: "A Knight of Solamnia who failed at the moment that mattered, cursed to an undying life in Dargaard Keep with the warriors who died with him.", pt: "Um Cavaleiro de Solamnia que falhou no momento que importava, amaldiçoado a uma vida sem morte no Forte Dargaard com os guerreiros que morreram com ele." } },

  { slug: "verminaard", level: 8, year: 351, size: "med", traits: human, img: villain, rarity: "unique", era: era("351 AC, Highlord of the Red Dragonarmy", "351 DC, Senhor do Exército Dracônico Vermelho"),
    name: { en: "Verminaard", pt: "Verminaard" },
    abilities: A(5, 0, 4, 2, 4, 3), ac: "high", hp: 1, saves: S("high", "low", "high"), perception: "mod", skills: { religion: "high", intimidation: "high", athletics: "mod" },
    speed: 20, other: [], senses: [], languages: ["common", "draconic"],
    strikes: [["Nightbringer", "high", "dmg", "bludgeoning", ["magical", "shove"]]],
    actions: [
      ["nightbringer", { en: "Nightbringer's Dark", pt: "Escuridão de Nightbringer" }, 1, ["darkness", "divine"], { en: "<strong>Frequency</strong> once per round<hr />After a hit with his mace, the target attempts @Check[fortitude|dc:{dc}]; on a failure it is blinded for 1 round.", pt: "<strong>Frequência</strong> uma vez por rodada<hr />Depois de acertar com a maça, o alvo faz @Check[fortitude|dc:{dc}]; se falhar, fica cego por 1 rodada." }],
      ["takhisis-favour", { en: "The Queen's Favour", pt: "O Favor da Rainha" }, 2, ["divine", "healing", "void"], { en: "<strong>Frequency</strong> twice per day<hr />He regains @Damage[4d8+16[healing]] Hit Points.", pt: "<strong>Frequência</strong> duas vezes por dia<hr />Ele recupera @Damage[4d8+16[healing]] Pontos de Vida." }],
    ],
    notes: { en: "A cleric of the Dark Queen in a horned helmet, who rules Abanasinia from Pax Tharkas on the red dragon Ember.", pt: "Um clérigo da Rainha das Trevas de elmo com chifres, que governa Abanasinia de Pax Tharkas montado no dragão vermelho Ember." } },

  { slug: "ariakas", level: 16, year: 352, size: "med", traits: human, img: villain, rarity: "unique", era: era("352 AC, Emperor of the Dragon Empire", "352 DC, Imperador do Império Dracônico"),
    name: { en: "Ariakas", pt: "Ariakas" },
    abilities: A(6, 2, 5, 3, 4, 5), ac: "high", hp: 1, saves: S("high", "mod", "high"), perception: "high", skills: { intimidation: "high", religion: "mod", deception: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "draconic", "nerakan"],
    strikes: [["Spear", "high", "dmg", "piercing", ["magical"]]],
    actions: [
      ["crown-of-power", { en: "Crown of Power", pt: "Coroa do Poder" }, "passive", [], { en: "While he wears the Crown, Ariakas gains a +2 status bonus to saving throws, and whoever holds the Crown commands the dragonarmies.", pt: "Enquanto usa a Coroa, Ariakas recebe +2 de bônus de status em testes de resistência, e quem segura a Coroa comanda os exércitos dracônicos." },
        [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 2 }]],
      ["dark-pulse", { en: "Dark Pulse", pt: "Pulso Sombrio" }, 2, ["divine", "void"], { en: "A 30-foot emanation: @Damage[{area}[void]] damage, @Check[fortitude|dc:{dc}|basic].", pt: "Uma emanação de 9 m: @Damage[{area}[void]] de dano, @Check[fortitude|dc:{dc}|basic]." }],
    ],
    notes: { en: "The Dark Queen's general and emperor, as strong as he is cruel, ruling the Highlords by fear.", pt: "O general e imperador da Rainha das Trevas, tão forte quanto cruel, que governa os Senhores Dracônicos pelo medo." } },

  { slug: "toede", level: 3, year: 351, size: "sm", traits: ["goblin", "hobgoblin", "humanoid"], img: villain, rarity: "unique", era: era("351 AC, Fewmaster of Solace", "351 DC, Fewmaster de Solace"),
    name: { en: "Fewmaster Toede", pt: "Fewmaster Toede" },
    abilities: A(2, 1, 2, 0, 0, 3), ac: "mod", hp: 1, saves: S("mod", "mod", "low"), perception: "mod", skills: { intimidation: "high", deception: "mod" },
    speed: 25, other: [], senses: ["darkvision"], languages: ["common", "goblin"],
    strikes: [["Longsword", "mod", "dmg", "slashing", []]],
    actions: [["cowards-command", { en: "Coward's Command", pt: "Ordem do Covarde" }, "reaction", ["auditory"], { en: "<strong>Trigger</strong> An enemy moves adjacent to Toede.<hr />An ally within 30 feet Strides toward the enemy, and Toede Steps away.", pt: "<strong>Gatilho</strong> Um inimigo se move para perto de Toede.<hr />Um aliado a até 9 m Anda na direção do inimigo, e Toede dá um Passo para longe." }]],
    notes: { en: "A hobgoblin officer of the dragonarmies, vain, greedy and very good at surviving.", pt: "Um oficial hobgoblin dos exércitos dracônicos, vaidoso, ganancioso e muito bom em sobreviver." } },

  { slug: "fistandantilus", level: 20, year: -1, size: "med", traits: human, img: villain, rarity: "unique", era: era("Before the Cataclysm", "Antes do Cataclismo"),
    name: { en: "Fistandantilus", pt: "Fistandantilus" },
    abilities: A(0, 3, 2, 8, 5, 5), ac: "mod", hp: 0.8, saves: S("mod", "mod", "high"), perception: "high", skills: { arcana: "high", occultism: "high", deception: "high" },
    speed: 25, other: [], senses: ["darkvision"], languages: ["common", "draconic", "elven", "istarian"],
    strikes: [["Staff", "mod", "4d6+8", "bludgeoning", ["magical"]]],
    actions: [
      ["life-drain", { en: "Drain Life", pt: "Drenar Vida" }, 2, ["arcane", "death", "void"], { en: "One creature within 30 feet attempts @Check[fortitude|dc:{dc}]: @Damage[12d8[void]] damage (basic), and Fistandantilus regains half as Hit Points.", pt: "Uma criatura a até 9 m faz @Check[fortitude|dc:{dc}]: @Damage[12d8[void]] de dano (básico), e Fistandantilus recupera metade em Pontos de Vida." }],
      ["archmage-storm", { en: "Archmage's Storm", pt: "Tempestade do Arquimago" }, 2, ["arcane", "electricity"], { en: "<strong>Frequency</strong> once per hour<hr />A 30-foot burst within 500 feet: @Damage[{area}[electricity]] damage, @Check[reflex|dc:{dc}|basic].", pt: "<strong>Frequência</strong> uma vez por hora<hr />Uma explosão de 9 m a até 150 m: @Damage[{area}[electricity]] de dano, @Check[reflex|dc:{dc}|basic]." }],
    ],
    notes: { en: "The greatest of the Black Robes, who lengthens his life by taking the lives of his apprentices.", pt: "O maior dos Mantos Negros, que prolonga a vida tomando a vida dos seus aprendizes." } },

  { slug: "dalamar-358", level: 9, year: 358, size: "med", traits: elf, img: villain, rarity: "unique", era: era("358 AC, apprentice of the Tower", "358 DC, aprendiz da Torre"),
    name: { en: "Dalamar the Dark", pt: "Dalamar, o Sombrio" },
    abilities: A(0, 4, 1, 5, 3, 3), ac: "mod", hp: 0.85, saves: S("low", "high", "high"), perception: "high", skills: { arcana: "high", deception: "high", stealth: "mod" },
    speed: 30, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "silvanesti", "draconic"],
    strikes: [["Dagger", "mod", "1d4+4", "piercing", ["agile", "finesse"]]],
    actions: [
      ["black-lightning", { en: "Black Lightning", pt: "Relâmpago Negro" }, 2, ["arcane", "electricity"], { en: "A 60-foot line: @Damage[{area}[electricity]] damage, @Check[reflex|dc:{dc}|basic].", pt: "Uma linha de 18 m: @Damage[{area}[electricity]] de dano, @Check[reflex|dc:{dc}|basic]." }],
      ["dark-elf", { en: "Dark Elf", pt: "Elfo Sombrio" }, "passive", [], { en: "Cast out by the Silvanesti for practising black magic, he serves Raistlin and spies on him for the Conclave.", pt: "Expulso pelos Silvanesti por praticar magia negra, ele serve a Raistlin e o espiona para o Conclave." }],
    ],
    notes: { en: "A Silvanesti cast out for wearing the black robes, apprentice in the Tower of Palanthas, playing a careful double game.", pt: "Um Silvanesti expulso por usar o manto negro, aprendiz na Torre de Palanthas, num jogo duplo cuidadoso." } },

  { slug: "takhisis-avatar", level: 24, year: 352, size: "grg", traits: ["dragon", "unholy"], img: villain, rarity: "unique", era: era("The Queen of Darkness, at the gate of the Abyss", "A Rainha das Trevas, no portão do Abismo"),
    name: { en: "Avatar of Takhisis", pt: "Avatar de Takhisis" },
    abilities: A(9, 4, 8, 6, 7, 9), ac: "high", hp: 1.2, saves: S("high", "mod", "high"), perception: "high", skills: { arcana: "high", deception: "high", intimidation: "high", religion: "high" },
    speed: 50, other: [["fly", 200]], senses: ["darkvision", "see-invisibility"], languages: ["common", "draconic"],
    immunities: ["paralyzed", "sleep", "fear-effects"], resistances: [["all-damage", 15, ["spirit"]]],
    strikes: [["Five Jaws", "high", "dmg", "piercing", ["reach-30", "magical", "unholy"]], ["Claw", "high", "4d10+20", "slashing", ["agile", "reach-20"]]],
    actions: [
      ["five-breaths", { en: "Five Breaths", pt: "Cinco Sopros" }, 2, ["arcane"], { en: "<strong>Frequency</strong> once per 1d4 rounds<hr />One of her five heads breathes, a 60-foot cone or a 120-foot line: @Damage[{area}[fire]] (red), electricity (blue), poison (green), acid (black) or cold (white), @Check[reflex|dc:{dc}|basic].", pt: "<strong>Frequência</strong> uma vez a cada 1d4 rodadas<hr />Uma das cinco cabeças sopra, um cone de 18 m ou uma linha de 36 m: @Damage[{area}[fire]] (vermelha), elétrico (azul), veneno (verde), ácido (negra) ou frio (branca), @Check[reflex|dc:{dc}|basic]." }],
      ["dark-majesty", { en: "Dark Majesty", pt: "Majestade Sombria" }, "passive", ["aura", "emotion", "fear", "mental"], { en: "120 feet. Creatures that enter attempt @Check[will|dc:{dc}]; on a failure, frightened 3.", pt: "36 m. Criaturas que entrem fazem @Check[will|dc:{dc}]; na falha, amedrontadas 3." },
        [{ key: "Aura", radius: 120, slug: "takhisis-majesty", traits: ["aura", "emotion", "fear", "mental"] }]],
    ],
    notes: { en: "The Queen of Darkness in the shape of a five-headed dragon. She can't be killed, only driven back.", pt: "A Rainha das Trevas na forma de um dragão de cinco cabeças. Não pode ser morta, só repelida." } },

  // ---- The Age of Mortals ------------------------------------------------------------------------------------
  { slug: "mina", level: 14, year: 421, size: "med", traits: human, img: villain, rarity: "unique", era: era("421 AC, the War of Souls", "421 DC, a Guerra das Almas"),
    name: { en: "Mina", pt: "Mina" },
    abilities: A(4, 3, 3, 2, 5, 6), ac: "high", hp: 1, saves: S("mod", "mod", "high"), perception: "high", skills: { diplomacy: "high", religion: "high", athletics: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "solamnic"],
    strikes: [["Morningstar", "high", "dmg", "piercing", ["versatile-b", "magical"]]],
    actions: [
      ["one-god", { en: "Gift of the One God", pt: "Dom do Deus Único" }, 2, ["divine", "healing", "vitality"], { en: "<strong>Frequency</strong> three times per day<hr />A creature she touches regains @Damage[6d8+24[healing]] Hit Points, and is freed of one condition.", pt: "<strong>Frequência</strong> três vezes por dia<hr />Uma criatura que ela toca recupera @Damage[6d8+24[healing]] Pontos de Vida, e fica livre de uma condição." }],
      ["devotion", { en: "Unshakable Devotion", pt: "Devoção Inabalável" }, "passive", [], { en: "Mina is immune to fear, and soldiers who follow her gain a +1 status bonus to Will saves.", pt: "Mina é imune a medo, e soldados que a seguem recebem +1 de bônus de status em testes de Vontade." }, [{ key: "Immunity", type: "frightened" }]],
    ],
    notes: { en: "A girl with amber eyes who walked out of a storm preaching the One God, and led the Knights of Neraka to victory after victory.", pt: "Uma moça de olhos cor de âmbar que saiu de uma tempestade pregando o Deus Único, e levou os Cavaleiros de Neraka de vitória em vitória." } },

  { slug: "palin-majere", level: 9, year: 395, size: "med", traits: human, img, rarity: "unique", era: era("Age of Mortals", "Era dos Mortais"),
    name: { en: "Palin Majere", pt: "Palin Majere" },
    abilities: A(1, 3, 2, 5, 3, 3), ac: "mod", hp: 0.85, saves: S("mod", "mod", "high"), perception: "mod", skills: { arcana: "high", nature: "mod", diplomacy: "mod" },
    speed: 25, other: [], senses: [], languages: ["common", "elven", "solamnic"],
    strikes: [["Staff", "mod", "2d4+4", "bludgeoning", ["two-hand-d8"]]],
    actions: [["wild-sorcery", { en: "Wild Sorcery", pt: "Feitiçaria Selvagem" }, 2, ["primal", "concentrate", "manipulate"], { en: "Magic of the world, without the moons: a 20-foot burst within 120 feet, @Damage[{area}[fire]] damage, @Check[reflex|dc:{dc}|basic].", pt: "Magia do mundo, sem as luas: uma explosão de 6 m a até 36 m, @Damage[{area}[fire]] de dano, @Check[reflex|dc:{dc}|basic]." }]],
    notes: { en: "Caramon's son, a mage who lost the moons with everyone else and learned the wild magic of the world to keep going.", pt: "O filho de Caramon, um mago que perdeu as luas com todo mundo e aprendeu a magia selvagem do mundo para seguir em frente." } },
];

// Heroes stand with the party; villains against it.
for (const c of ICONIC) c.disposition = c.img === villain ? -1 : 1;
