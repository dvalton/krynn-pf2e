// 0.5 content: the draconians and the other creatures of Krynn, as PF2e NPCs built to the Monster Core's tables.
// Written for this module (never copied from Dragonlance books). Texts are English and Brazilian Portuguese; on the
// actors they appear through @Localize[KRYNN.Bestiary...], so each reader sees their own language.
const p = (...lines) => lines.map((l) => `<p>${l}</p>`).join("");

// The building tables, by level (−1 to 24): [moderate, high].
const T = {
  ac: { "-1": [14, 15], 0: [15, 16], 1: [16, 17], 2: [18, 19], 3: [19, 20], 4: [21, 22], 5: [22, 23], 6: [24, 25], 7: [25, 26], 8: [27, 28], 9: [28, 29], 10: [30, 31], 11: [31, 32], 12: [33, 34], 13: [34, 35], 14: [36, 37], 15: [37, 38], 16: [39, 40], 17: [40, 41], 18: [42, 43], 19: [43, 44], 20: [45, 46], 21: [46, 47], 22: [48, 49], 23: [49, 50], 24: [51, 52] },
  save: { "-1": [5, 8], 0: [6, 9], 1: [7, 10], 2: [8, 11], 3: [9, 12], 4: [11, 14], 5: [12, 15], 6: [14, 17], 7: [15, 18], 8: [16, 19], 9: [18, 21], 10: [19, 22], 11: [20, 23], 12: [22, 24], 13: [23, 26], 14: [25, 27], 15: [26, 28], 16: [28, 30], 17: [29, 31], 18: [30, 32], 19: [32, 33], 20: [33, 35], 21: [35, 36], 22: [36, 38], 23: [37, 39], 24: [38, 40] },
  low: { "-1": 2, 0: 3, 1: 4, 2: 5, 3: 6, 4: 8, 5: 9, 6: 11, 7: 12, 8: 13, 9: 15, 10: 16, 11: 17, 12: 18, 13: 19, 14: 21, 15: 22, 16: 23, 17: 25, 18: 26, 19: 27, 20: 29, 21: 30, 22: 31, 23: 33, 24: 34 },
  hp: { "-1": 8, 0: 15, 1: 20, 2: 30, 3: 45, 4: 60, 5: 75, 6: 95, 7: 113, 8: 131, 9: 150, 10: 170, 11: 195, 12: 215, 13: 235, 14: 255, 15: 275, 16: 295, 17: 315, 18: 335, 19: 355, 20: 375, 21: 400, 22: 430, 23: 460, 24: 490 },
  atk: { "-1": [6, 8], 0: [6, 8], 1: [7, 9], 2: [9, 11], 3: [10, 12], 4: [12, 14], 5: [13, 15], 6: [15, 17], 7: [16, 18], 8: [18, 20], 9: [19, 21], 10: [21, 23], 11: [22, 24], 12: [24, 26], 13: [25, 27], 14: [27, 29], 15: [28, 30], 16: [30, 32], 17: [31, 33], 18: [33, 35], 19: [34, 36], 20: [36, 38], 21: [37, 39], 22: [39, 41], 23: [40, 42], 24: [42, 44] },
  dmg: { "-1": ["1d4", "1d4+1"], 0: ["1d4+2", "1d6+2"], 1: ["1d6+2", "1d6+3"], 2: ["1d8+4", "1d10+4"], 3: ["1d8+6", "1d10+6"], 4: ["2d6+5", "2d8+5"], 5: ["2d6+6", "2d8+7"],
    6: ["2d6+8", "2d8+9"], 7: ["2d8+8", "2d10+9"], 8: ["2d8+9", "2d10+11"], 9: ["2d8+11", "2d10+13"], 10: ["2d10+11", "2d12+13"], 11: ["2d10+12", "2d12+15"], 12: ["3d8+12", "3d10+14"], 13: ["3d8+14", "3d10+16"], 14: ["3d8+15", "3d10+18"], 15: ["3d10+14", "3d12+17"], 16: ["3d10+15", "3d12+18"], 17: ["3d10+16", "3d12+19"], 18: ["3d10+17", "3d12+20"], 19: ["4d8+17", "4d10+20"], 20: ["4d8+19", "4d10+22"], 21: ["4d8+20", "4d10+24"], 22: ["4d8+22", "4d10+26"], 23: ["4d10+20", "4d12+24"], 24: ["4d10+22", "4d12+26"] },
  skill: { "-1": [4, 5], 0: [5, 6], 1: [6, 7], 2: [7, 8], 3: [9, 10], 4: [10, 12], 5: [12, 13], 6: [13, 15], 7: [15, 17], 8: [16, 18], 9: [18, 20], 10: [19, 22], 11: [20, 23], 12: [22, 24], 13: [23, 25], 14: [25, 27], 15: [26, 28], 16: [28, 30], 17: [29, 32], 18: [30, 33], 19: [32, 35], 20: [33, 36], 21: [35, 38], 22: [36, 39], 23: [38, 40], 24: [39, 42] },
  dc: { "-1": [13, 16], 0: [13, 16], 1: [14, 17], 2: [15, 18], 3: [17, 20], 4: [18, 21], 5: [19, 22], 6: [21, 24], 7: [22, 25], 8: [23, 26], 9: [25, 28], 10: [26, 29], 11: [27, 30], 12: [28, 31], 13: [30, 32], 14: [31, 34], 15: [32, 35], 16: [34, 36], 17: [35, 38], 18: [36, 39], 19: [38, 40], 20: [39, 42], 21: [40, 43], 22: [42, 44], 23: [43, 46], 24: [44, 47] },
  // Area damage of an ability with limited uses.
  area: { "-1": "1d6", 0: "1d10", 1: "2d6", 2: "3d6", 3: "4d6", 4: "5d6", 5: "6d6", 6: "7d6", 7: "8d6", 8: "9d6", 9: "10d6", 10: "11d6", 11: "12d6", 12: "13d6", 13: "14d6", 14: "15d6", 15: "16d6", 16: "17d6", 17: "18d6", 18: "19d6", 19: "20d6", 20: "21d6", 21: "22d6", 22: "23d6", 23: "24d6", 24: "25d6" },
};
const tier = (t) => (t === "high" ? 1 : 0);
export const stat = {
  ac: (L, t) => T.ac[L][tier(t)],
  save: (L, t) => (t === "low" ? T.low[L] : T.save[L][tier(t)]),
  atk: (L, t) => T.atk[L][tier(t)],
  dmg: (L, t) => T.dmg[L][tier(t)],
  skill: (L, t) => T.skill[L][tier(t)],
  dc: (L, t) => T.dc[L][tier(t)],
  area: (L) => T.area[L],
  hp: (L, f = 1) => Math.round(T.hp[L] * f),
};

// Each ability: [slug, name {en, pt}, action ("passive", 1, 2, 3, "reaction", "free"), traits, text {en, pt}, rules?].
// Texts may use {dc} and {area} (the creature's moderate DC and limited area damage).
const throes = (kind) => [`death-throes-${kind}`, { en: "Death Throes", pt: "Estertores" }, "passive", [], { en: `@Localize[KRYNN.Bestiary.Throes.${kind}]`, pt: "" }];

export const CREATURES = [
  // ---- Draconians -------------------------------------------------------------------------------------------
  { slug: "baaz-draconian", level: 2, size: "med", traits: ["draconian", "humanoid"], draconian: "baaz", img: "modules/krynn-pf2e/icons/draconian.svg",
    name: { en: "Baaz Draconian", pt: "Draconiano Baaz" },
    abilities: { str: 4, dex: 2, con: 3, int: -1, wis: 1, cha: -1 }, ac: "mod", hp: 1, saves: { fortitude: "high", reflex: "mod", will: "low" }, perception: "mod",
    skills: { athletics: "high", intimidation: "mod" }, speed: 25, other: [], senses: ["darkvision"], languages: ["common", "draconic"],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p"]], ["Claw", "high", "1d6+4", "slashing", ["agile"]]],
    actions: [
      ["glide", { en: "Wing Glide", pt: "Planar com as Asas" }, "passive", [], { en: "The draconian's stubby wings can't lift it, but it takes no damage from a fall and can move 5 feet sideways for every 10 feet it falls.", pt: "As asas curtas do draconiano não o erguem, mas ele não sofre dano de queda e pode se mover 1,5 m para o lado a cada 3 m que cai." }],
      ["brute-rush", { en: "Brute Rush", pt: "Investida Bruta" }, 2, ["flourish"], { en: "The baaz Strides twice and makes a longsword Strike. If it hits, the target is pushed 5 feet.", pt: "O baaz Anda duas vezes e faz um Golpe de espada longa. Se acertar, o alvo é empurrado 1,5 m." }],
      throes("baaz"),
    ],
    notes: { en: "The most common of the draconians: soldiers bred for numbers, loud and quick to anger. Born from corrupted brass dragon eggs.", pt: "O mais comum dos draconianos: soldados feitos para ser muitos, barulhentos e de raiva fácil. Nascidos de ovos corrompidos de dragões de latão." } },

  { slug: "kapak-draconian", level: 3, size: "med", traits: ["draconian", "humanoid"], draconian: "kapak", img: "modules/krynn-pf2e/icons/draconian.svg",
    name: { en: "Kapak Draconian", pt: "Draconiano Kapak" },
    abilities: { str: 2, dex: 4, con: 2, int: 0, wis: 1, cha: -1 }, ac: "high", hp: 1, saves: { fortitude: "mod", reflex: "high", will: "mod" }, perception: "mod",
    skills: { stealth: "high", acrobatics: "mod", thievery: "mod" }, speed: 25, other: [], senses: ["darkvision"], languages: ["common", "draconic"],
    strikes: [["Short Sword", "high", "1d6+6", "piercing", ["agile", "finesse", "versatile-s"]], ["Claw", "high", "1d6+4", "slashing", ["agile", "finesse"]]],
    actions: [
      ["sneak-attack", { en: "Sneak Attack", pt: "Ataque Furtivo" }, "passive", [], { en: "The kapak deals 1d6 extra precision damage to off-guard creatures.", pt: "O kapak causa 1d6 de dano de precisão extra a criaturas desprevenidas." },
        [{ key: "DamageDice", selector: "strike-damage", diceNumber: 1, dieSize: "d6", category: "precision", predicate: ["target:condition:off-guard"] }]],
      ["toxic-saliva", { en: "Toxic Saliva", pt: "Saliva Tóxica" }, 1, ["manipulate"], { en: "The kapak licks its blade. Its next Strike that hits before the end of its turn exposes the target to kapak venom.<hr />@Localize[KRYNN.Bestiary.Venom.kapak]", pt: "O kapak lambe a lâmina. O próximo Golpe dele que acertar antes do fim do turno expõe o alvo ao veneno de kapak.<hr />@Localize[KRYNN.Bestiary.Venom.kapak]" }],
      throes("kapak"),
    ],
    notes: { en: "Scouts, assassins and saboteurs of the dragonarmies, with venom in their mouths. Born from copper dragon eggs.", pt: "Batedores, assassinos e sabotadores dos exércitos dracônicos, com veneno na boca. Nascidos de ovos de dragões de cobre." } },

  { slug: "bozak-draconian", level: 4, size: "med", traits: ["draconian", "humanoid"], draconian: "bozak", img: "modules/krynn-pf2e/icons/draconian.svg",
    name: { en: "Bozak Draconian", pt: "Draconiano Bozak" },
    abilities: { str: 3, dex: 2, con: 2, int: 2, wis: 2, cha: 4 }, ac: "mod", hp: 1, saves: { fortitude: "mod", reflex: "mod", will: "high" }, perception: "mod",
    skills: { arcana: "high", intimidation: "high", deception: "mod" }, speed: 25, other: [], senses: ["darkvision"], languages: ["common", "draconic"],
    strikes: [["Longsword", "mod", "dmg", "slashing", ["versatile-p"]], ["Claw", "mod", "2d4+4", "slashing", ["agile"]]],
    actions: [
      ["sorcerous-blast", { en: "Sorcerous Blast", pt: "Rajada Feiticeira" }, 2, ["arcane", "concentrate", "fire", "manipulate"], { en: "A 15-foot cone of red fire: @Damage[3d6[fire]] damage, @Check[reflex|dc:{dc}|basic].", pt: "Um cone de 4,5 m de fogo vermelho: @Damage[3d6[fire]] de dano, @Check[reflex|dc:{dc}|basic]." }],
      ["web-of-shadows", { en: "Web of Shadows", pt: "Teia de Sombras" }, 2, ["arcane", "concentrate", "manipulate"], { en: "<strong>Frequency</strong> once per hour<hr />Sticky threads fill a 10-foot burst within 60 feet. Each creature there must attempt @Check[reflex|dc:{dc}]. <strong>Failure</strong> immobilized for 1 round or until it Escapes. <strong>Critical Failure</strong> also restrained until it Escapes.", pt: "<strong>Frequência</strong> uma vez por hora<hr />Fios pegajosos enchem uma explosão de 3 m a até 18 m. Cada criatura ali faz @Check[reflex|dc:{dc}]. <strong>Falha</strong> imobilizada por 1 rodada ou até Escapar. <strong>Falha Crítica</strong> também contida até Escapar." }],
      ["commander", { en: "Bark Orders", pt: "Dar Ordens" }, 1, ["auditory", "linguistic"], { en: "One baaz or kapak within 30 feet that can hear the bozak gains a +1 status bonus to its next attack roll this round.", pt: "Um baaz ou kapak a até 9 m que ouça o bozak recebe +1 de bônus de status na próxima jogada de ataque nesta rodada." }],
      throes("bozak"),
    ],
    notes: { en: "Sorcerers and sergeants, the bozaks lead the lesser draconians with magic and fear. Born from bronze dragon eggs.", pt: "Feiticeiros e sargentos, os bozaks comandam os draconianos menores com magia e medo. Nascidos de ovos de dragões de bronze." } },

  { slug: "sivak-draconian", level: 6, size: "lg", traits: ["draconian", "humanoid"], draconian: "sivak", img: "modules/krynn-pf2e/icons/draconian.svg",
    name: { en: "Sivak Draconian", pt: "Draconiano Sivak" },
    abilities: { str: 5, dex: 2, con: 4, int: 1, wis: 2, cha: 1 }, ac: "mod", hp: 1.1, saves: { fortitude: "high", reflex: "mod", will: "mod" }, perception: "mod",
    skills: { athletics: "high", deception: "mod", stealth: "mod" }, speed: 30, other: [["fly", 40]], senses: ["darkvision"], languages: ["common", "draconic"],
    strikes: [["Greatsword", "high", "2d8+9", "slashing", ["versatile-p", "reach-10"]], ["Tail", "mod", "2d6+7", "bludgeoning", ["agile", "reach-10"]]],
    actions: [
      ["take-the-face", { en: "Take the Face", pt: "Tomar o Rosto" }, 1, ["concentrate", "polymorph"], { en: "<strong>Requirements</strong> The sivak killed a humanoid of size Small to Large within the last minute.<hr />It takes that creature's exact shape and voice, as the polymorph trait describes, until it chooses to end it. It gains a +4 circumstance bonus to Deception checks to pass as that creature.", pt: "<strong>Requisitos</strong> O sivak matou um humanoide de tamanho Pequeno a Grande no último minuto.<hr />Ele assume a forma e a voz exatas dessa criatura, como descreve o trait polimorfia, até decidir acabar. Recebe +4 de bônus circunstancial em testes de Enganação para se passar por ela." }],
      ["sky-strike", { en: "Sky Strike", pt: "Golpe do Céu" }, 2, [], { en: "The sivak Flies up to its fly Speed and makes a greatsword Strike at the end. On a hit, the target is knocked prone.", pt: "O sivak Voa até seu deslocamento de voo e faz um Golpe de montante no fim. Se acertar, o alvo cai." }],
      throes("sivak"),
    ],
    notes: { en: "Big, winged and cunning, the sivaks are the dragonarmies' hunters and infiltrators. Born from silver dragon eggs.", pt: "Grandes, alados e astutos, os sivaks são os caçadores e infiltradores dos exércitos dracônicos. Nascidos de ovos de dragões de prata." } },

  { slug: "aurak-draconian", level: 8, size: "med", traits: ["draconian", "humanoid"], draconian: "aurak", img: "modules/krynn-pf2e/icons/draconian.svg",
    name: { en: "Aurak Draconian", pt: "Draconiano Aurak" },
    abilities: { str: 2, dex: 3, con: 3, int: 5, wis: 3, cha: 5 }, ac: "mod", hp: 1, saves: { fortitude: "mod", reflex: "mod", will: "high" }, perception: "high",
    skills: { arcana: "high", deception: "high", diplomacy: "mod", occultism: "mod" }, speed: 25, other: [], senses: ["darkvision", "see-invisibility"], languages: ["common", "draconic", "elven", "solamnic"],
    strikes: [["Claw", "mod", "dmg", "slashing", ["agile"]]],
    actions: [
      ["lightning-rays", { en: "Lightning Rays", pt: "Raios Relâmpago" }, 2, ["arcane", "concentrate", "electricity", "manipulate"], { en: "Two rays at one or two targets within 60 feet; make a spell attack roll (+{attack}) for each. Each hit deals @Damage[3d8[electricity]] damage.", pt: "Dois raios contra um ou dois alvos a até 18 m; faça uma jogada de ataque de magia (+{attack}) para cada. Cada acerto causa @Damage[3d8[electricity]] de dano." }],
      ["golden-veil", { en: "Golden Veil", pt: "Véu Dourado" }, 2, ["arcane", "concentrate", "illusion"], { en: "<strong>Frequency</strong> once per hour<hr />The aurak becomes invisible for 1 minute, or until it uses a hostile action.", pt: "<strong>Frequência</strong> uma vez por hora<hr />O aurak fica invisível por 1 minuto, ou até usar uma ação hostil." }],
      ["dimension-step", { en: "Dimension Step", pt: "Passo Dimensional" }, 1, ["arcane", "concentrate", "teleportation"], { en: "<strong>Frequency</strong> once per 10 minutes<hr />The aurak teleports to a place it can see within 60 feet.", pt: "<strong>Frequência</strong> uma vez a cada 10 minutos<hr />O aurak se teleporta para um lugar que vê a até 18 m." }],
      ["borrowed-face", { en: "Borrowed Face", pt: "Rosto Emprestado" }, 1, ["arcane", "concentrate", "illusion"], { en: "The aurak looks like any humanoid of its size, an illusion that a creature who Seeks and succeeds at @Check[perception|dc:{dc}] sees through.", pt: "O aurak parece qualquer humanoide do seu tamanho, uma ilusão que uma criatura que Procure e passe em @Check[perception|dc:{dc}] percebe." }],
      throes("aurak"),
    ],
    notes: { en: "Wingless, golden and the most dangerous of the draconians: sorcerers who command the others. Born from gold dragon eggs.", pt: "Sem asas, dourados e os mais perigosos dos draconianos: feiticeiros que comandam os outros. Nascidos de ovos de dragões de ouro." } },

  // ---- Other creatures of Krynn -----------------------------------------------------------------------------
  { slug: "bakali-warrior", level: 1, size: "med", traits: ["bakali", "humanoid", "amphibious"], img: "modules/krynn-pf2e/icons/claw.svg",
    name: { en: "Bakali Warrior", pt: "Guerreiro Bakali" },
    abilities: { str: 4, dex: 1, con: 3, int: -1, wis: 1, cha: -1 }, ac: "mod", hp: 1.1, saves: { fortitude: "high", reflex: "mod", will: "low" }, perception: "mod",
    skills: { athletics: "high", survival: "mod" }, speed: 25, other: [["swim", 25]], senses: [], languages: ["draconic"],
    strikes: [["Spear", "high", "1d8+4", "piercing", []], ["Jaws", "high", "1d6+4", "piercing", []]],
    actions: [
      ["bellow", { en: "Swamp Bellow", pt: "Urro do Pântano" }, 1, ["auditory", "emotion", "fear", "mental"], { en: "<strong>Frequency</strong> once per minute<hr />Each enemy within 30 feet attempts @Check[will|dc:{dc}]; on a failure it is frightened 1.", pt: "<strong>Frequência</strong> uma vez por minuto<hr />Cada inimigo a até 9 m faz @Check[will|dc:{dc}]; se falhar, fica amedrontado 1." }],
    ],
    notes: { en: "The great lizard-folk of the old southern swamps, proud, territorial and slow to trust anyone warm-blooded.", pt: "O grande povo-lagarto dos velhos pântanos do sul, orgulhoso, territorial e lento para confiar em qualquer um de sangue quente." } },

  { slug: "thanoi-hunter", level: 2, size: "lg", traits: ["thanoi", "humanoid", "amphibious"], img: "modules/krynn-pf2e/icons/claw.svg",
    name: { en: "Thanoi Hunter", pt: "Caçador Thanoi" },
    abilities: { str: 4, dex: 1, con: 4, int: -1, wis: 2, cha: -1 }, ac: "mod", hp: 1.15, saves: { fortitude: "high", reflex: "low", will: "mod" }, perception: "mod",
    skills: { athletics: "high", survival: "high" }, speed: 20, other: [["swim", 30]], senses: ["low-light-vision"], languages: ["common"], resistances: [["cold", 5]],
    strikes: [["Tusks", "high", "dmg", "piercing", ["reach-10"]], ["Harpoon", "mod", "1d8+4", "piercing", ["thrown-20"]]],
    actions: [
      ["ice-adapted", { en: "Ice Adapted", pt: "Adaptado ao Gelo" }, "passive", [], { en: "The thanoi ignores difficult terrain from ice and snow and isn't harmed by severe cold.", pt: "O thanoi ignora terreno difícil de gelo e neve e não é prejudicado por frio severo." }],
      ["tusk-rake", { en: "Tusk Rake", pt: "Rasgo das Presas" }, 2, [], { en: "The thanoi makes a tusks Strike. On a hit, the target takes @Damage[1d6[bleed]] persistent bleed damage.", pt: "O thanoi faz um Golpe de presas. Se acertar, o alvo sofre @Damage[1d6[bleed]] de dano persistente de sangramento." }],
    ],
    notes: { en: "Walrus-folk of the frozen Icereach, who hunt on the ice floes and raid the ice folk's camps.", pt: "Povo-morsa da gelada Icereach, que caça nos blocos de gelo e ataca os acampamentos do povo do gelo." } },

  { slug: "aghar-scrounger", level: -1, size: "sm", traits: ["aghar", "dwarf", "humanoid"], img: "modules/krynn-pf2e/icons/claw.svg",
    name: { en: "Aghar Scrounger", pt: "Catador Aghar" },
    abilities: { str: 1, dex: 2, con: 3, int: -2, wis: 1, cha: 0 }, ac: "mod", hp: 1, saves: { fortitude: "high", reflex: "mod", will: "low" }, perception: "mod",
    skills: { stealth: "high", survival: "mod" }, speed: 20, other: [], senses: ["darkvision"], languages: ["dwarven"],
    strikes: [["Club", "mod", "1d6+1", "bludgeoning", []], ["Sling", "mod", "1d6", "bludgeoning", ["range-50"]]],
    actions: [
      ["survivor", { en: "Born Survivor", pt: "Sobrevivente Nato" }, "passive", [], { en: "The aghar gains a +2 circumstance bonus to saving throws against diseases and poisons from spoiled food and foul water.", pt: "O aghar recebe +2 de bônus circunstancial em testes de resistência contra doenças e venenos de comida estragada e água suja." }],
      ["duck-and-cover", { en: "Duck and Cover", pt: "Abaixar e Cobrir" }, "reaction", [], { en: "<strong>Trigger</strong> A creature targets the aghar with a Strike.<hr />The aghar drops prone, gaining a +2 circumstance bonus to AC against the triggering Strike.", pt: "<strong>Gatilho</strong> Uma criatura escolhe o aghar como alvo de um Golpe.<hr />O aghar se joga no chão, recebendo +2 de bônus circunstancial na CA contra o Golpe." }],
    ],
    notes: { en: "Gully dwarves: the outcast clan, who live on what others throw away and outlast everyone who looks down on them.", pt: "Anões dos esgotos: o clã rejeitado, que vive do que os outros jogam fora e sobrevive a todos que os desprezam." } },

  { slug: "kyrie-skywatcher", level: 3, size: "med", traits: ["humanoid"], img: "modules/krynn-pf2e/icons/claw.svg",
    name: { en: "Kyrie Skywatcher", pt: "Vigia do Céu Kyrie" },
    abilities: { str: 2, dex: 4, con: 1, int: 0, wis: 3, cha: 0 }, ac: "high", hp: 0.9, saves: { fortitude: "low", reflex: "high", will: "mod" }, perception: "high",
    skills: { acrobatics: "high", survival: "mod", nature: "mod" }, speed: 20, other: [["fly", 40]], senses: ["low-light-vision"], languages: ["common"],
    strikes: [["Talons", "high", "dmg", "slashing", ["agile", "finesse"]], ["Bow", "high", "1d8+3", "piercing", ["range-100"]]],
    actions: [
      ["dive", { en: "Stooping Dive", pt: "Mergulho" }, 2, [], { en: "The kyrie Flies at least 20 feet downward and makes a talons Strike; on a hit it deals 1d8 extra damage.", pt: "O kyrie Voa pelo menos 6 m para baixo e faz um Golpe de garras; se acertar, causa 1d8 de dano extra." }],
    ],
    notes: { en: "Bird-folk of the far southern isles, wary of outsiders and of the land-bound wars of Ansalon.", pt: "Povo-pássaro das ilhas do extremo sul, desconfiado de estrangeiros e das guerras terrestres de Ansalon." } },

  { slug: "spectral-minion", level: 4, size: "med", traits: ["undead", "incorporeal", "spirit", "unholy"], img: "modules/krynn-pf2e/icons/skull.svg",
    name: { en: "Spectral Minion", pt: "Servo Espectral" },
    abilities: { str: -5, dex: 3, con: 0, int: 0, wis: 2, cha: 3 }, ac: "mod", hp: 0.85, saves: { fortitude: "low", reflex: "mod", will: "high" }, perception: "mod",
    skills: { stealth: "high", intimidation: "mod" }, speed: 0, other: [["fly", 25]], senses: ["darkvision"], languages: ["common"],
    immunities: ["death-effects", "disease", "paralyzed", "poison", "precision", "unconscious"], resistances: [["all-damage", 5, ["force", "ghost-touch", "vitality"]]], weaknesses: [["vitality", 5]],
    strikes: [["Cold Touch", "high", "2d6+4", "void", ["finesse", "magical"]]],
    actions: [
      ["unfinished-oath", { en: "Unfinished Oath", pt: "Juramento Inacabado" }, "passive", [], { en: "The minion is bound to the task it failed in life. When the task is finished or released, it is laid to rest. Until then, if destroyed, it re-forms in 1d4 days near where it fell.", pt: "O servo está preso à tarefa em que falhou em vida. Quando a tarefa termina ou é liberada, ele descansa. Até lá, se destruído, volta a se formar em 1d4 dias perto de onde caiu." }],
    ],
    notes: { en: "Spirits held to a broken vow: soldiers still guarding a fallen gate, servants still waiting on a dead lord.", pt: "Espíritos presos a um voto quebrado: soldados ainda guardando um portão caído, servos ainda esperando por um senhor morto." } },

  { slug: "dreamwraith", level: 6, size: "med", traits: ["dream", "spirit"], img: "modules/krynn-pf2e/icons/skull.svg",
    name: { en: "Dreamwraith", pt: "Espectro Onírico" },
    abilities: { str: 2, dex: 4, con: 2, int: 1, wis: 2, cha: 4 }, ac: "mod", hp: 0.9, saves: { fortitude: "low", reflex: "high", will: "mod" }, perception: "mod",
    skills: { stealth: "high", deception: "high" }, speed: 30, other: [], senses: ["darkvision"], languages: [], immunities: ["mental"],
    strikes: [["Nightmare Claw", "high", "2d6+6", "mental", ["agile", "magical"]]],
    actions: [
      ["made-of-dreams", { en: "Made of Dreams", pt: "Feito de Sonho" }, "passive", [], { en: "A creature that spends an action to disbelieve the dreamwraith attempts @Check[will|dc:{dc}]. On a success, it takes half damage from the dreamwraith for the rest of the encounter.", pt: "Uma criatura que gaste uma ação para desacreditar o espectro faz @Check[will|dc:{dc}]. Se passar, sofre metade do dano do espectro pelo resto do encontro." }],
      ["dread-whisper", { en: "Dread Whisper", pt: "Sussurro de Pavor" }, 2, ["auditory", "emotion", "fear", "mental"], { en: "One creature within 30 feet attempts @Check[will|dc:{dc}]. <strong>Failure</strong> frightened 2. <strong>Critical Failure</strong> frightened 2 and fleeing for 1 round.", pt: "Uma criatura a até 9 m faz @Check[will|dc:{dc}]. <strong>Falha</strong> amedrontada 2. <strong>Falha Crítica</strong> amedrontada 2 e fugindo por 1 rodada." }],
    ],
    notes: { en: "Shapes from a nightmare made real: twisted soldiers, weeping trees and hungry beasts, real enough to kill.", pt: "Formas de um pesadelo tornado real: soldados retorcidos, árvores que choram e feras famintas, reais o bastante para matar." } },

  { slug: "fireshadow", level: 5, size: "med", traits: ["elemental", "fire"], img: "modules/krynn-pf2e/icons/flame.svg",
    name: { en: "Fireshadow", pt: "Sombra de Fogo" },
    abilities: { str: 0, dex: 5, con: 2, int: -1, wis: 2, cha: 1 }, ac: "high", hp: 0.85, saves: { fortitude: "mod", reflex: "high", will: "low" }, perception: "mod",
    skills: { stealth: "high", acrobatics: "mod" }, speed: 40, other: [], senses: ["darkvision"], languages: [], immunities: ["fire", "bleed", "paralyzed", "poison", "sleep"], weaknesses: [["cold", 5]],
    strikes: [["Burning Touch", "high", "2d6+5", "fire", ["agile", "finesse", "magical"]]],
    actions: [
      ["flicker", { en: "Flicker", pt: "Tremular" }, 1, ["fire", "teleportation"], { en: "The fireshadow vanishes into a flame or light source and steps out of another within 60 feet.", pt: "A sombra some numa chama ou fonte de luz e sai de outra a até 18 m." }],
      ["ember-burst", { en: "Ember Burst", pt: "Explosão de Brasas" }, 2, ["fire"], { en: "<strong>Frequency</strong> once per minute<hr />A 10-foot emanation of sparks: @Damage[{area}[fire]] damage, @Check[reflex|dc:{dc}|basic].", pt: "<strong>Frequência</strong> uma vez por minuto<hr />Uma emanação de 3 m de faíscas: @Damage[{area}[fire]] de dano, @Check[reflex|dc:{dc}|basic]." }],
    ],
    notes: { en: "A living shadow of flame that haunts burned places and the fires of sorcerers who called more than they could hold.", pt: "Uma sombra viva de chama que assombra lugares queimados e as fogueiras de feiticeiros que chamaram mais do que podiam segurar." } },

  { slug: "irda-wanderer", level: 5, size: "med", traits: ["irda", "humanoid"], img: "modules/krynn-pf2e/icons/claw.svg",
    name: { en: "Irda Wanderer", pt: "Andarilho Irda" },
    abilities: { str: 3, dex: 2, con: 2, int: 3, wis: 3, cha: 4 }, ac: "mod", hp: 1, saves: { fortitude: "mod", reflex: "mod", will: "high" }, perception: "high",
    skills: { arcana: "high", deception: "high", diplomacy: "mod", society: "mod" }, speed: 25, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "jotun"],
    strikes: [["Spear", "mod", "dmg", "piercing", []]],
    actions: [
      ["many-faces", { en: "Many Faces", pt: "Muitos Rostos" }, 1, ["concentrate", "polymorph", "primal"], { en: "The irda takes the shape of any Medium humanoid until it chooses to change back. Creatures who Seek with @Check[perception|dc:{dc}] notice something is off.", pt: "O irda assume a forma de qualquer humanoide Médio até decidir voltar. Criaturas que Procurem com @Check[perception|dc:{dc}] notam algo estranho." }],
      ["starlight-ward", { en: "Starlight Ward", pt: "Proteção Estelar" }, "reaction", ["primal"], { en: "<strong>Frequency</strong> once per hour; <strong>Trigger</strong> The irda would be hit by a Strike.<hr />The irda gains a +2 status bonus to AC against the triggering Strike.", pt: "<strong>Frequência</strong> uma vez por hora; <strong>Gatilho</strong> O irda seria atingido por um Golpe.<hr />O irda recebe +2 de bônus de status na CA contra o Golpe." }],
    ],
    notes: { en: "The high ogres, beautiful and secretive, who hid from the world and walk it now and then under borrowed faces.", pt: "Os altos ogros, belos e reservados, que se esconderam do mundo e de vez em quando andam por ele com rostos emprestados." } },

  // ---- 0.9 -------------------------------------------------------------------------------------------------
  { slug: "death-knight", level: 13, size: "med", traits: ["undead", "human", "humanoid", "unholy"], img: "modules/krynn-pf2e/icons/skull.svg",
    name: { en: "Death Knight", pt: "Cavaleiro da Morte" },
    abilities: { str: 7, dex: 2, con: 5, int: 2, wis: 3, cha: 5 }, ac: "high", hp: 1, saves: { fortitude: "high", reflex: "mod", will: "high" }, perception: "mod",
    skills: { athletics: "high", intimidation: "high", religion: "mod" }, speed: 25, other: [], senses: ["darkvision"], languages: ["common", "solamnic"],
    immunities: ["death-effects", "disease", "paralyzed", "poison", "unconscious"], weaknesses: [["vitality", 10]], resistances: [["fire", 10]],
    strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p", "magical", "unholy"]]],
    actions: [
      ["oath-broken", { en: "Oath Broken", pt: "Juramento Quebrado" }, "passive", ["aura", "emotion", "fear", "mental"], { en: "30 feet. Living creatures that enter attempt @Check[will|dc:{dc}]; on a failure they are frightened 1, on a critical failure frightened 2.", pt: "9 m. Criaturas vivas que entrem fazem @Check[will|dc:{dc}]; na falha ficam amedrontadas 1, na falha crítica amedrontadas 2." },
        [{ key: "Aura", radius: 30, slug: "death-knight-dread", traits: ["aura", "emotion", "fear", "mental"] }]],
      ["burning-word", { en: "Burning Word", pt: "Palavra Ardente" }, 2, ["fire", "occult"], { en: "<strong>Frequency</strong> once per hour<hr />A 20-foot burst within 100 feet: @Damage[{area}[fire]] damage, @Check[reflex|dc:{dc}|basic].", pt: "<strong>Frequência</strong> uma vez por hora<hr />Uma explosão de 6 m a até 30 m: @Damage[{area}[fire]] de dano, @Check[reflex|dc:{dc}|basic]." }],
      ["cursed-return", { en: "Cursed Return", pt: "Retorno Amaldiçoado" }, "passive", [], { en: "Destroyed, the death knight returns to its keep in 1d10 days, unless its curse is lifted or its crime is set right.", pt: "Destruído, o cavaleiro da morte volta à sua fortaleza em 1d10 dias, a menos que a maldição seja quebrada ou seu crime, reparado." }],
    ],
    notes: { en: "A Knight who broke the Measure in some terrible way and was cursed to go on, burning and unresting, in a body of the dead.", pt: "Um Cavaleiro que quebrou a Medida de algum modo terrível e foi amaldiçoado a continuar, ardendo e sem descanso, num corpo de morto." } },

  { slug: "fetch", level: 5, size: "med", traits: ["aberration", "shadow"], img: "modules/krynn-pf2e/icons/skull.svg",
    name: { en: "Fetch", pt: "Fetch" },
    abilities: { str: 2, dex: 4, con: 2, int: 1, wis: 2, cha: 4 }, ac: "mod", hp: 0.9, saves: { fortitude: "low", reflex: "high", will: "mod" }, perception: "mod",
    skills: { deception: "high", stealth: "high" }, speed: 30, other: [], senses: ["darkvision"], languages: ["common"],
    strikes: [["Shadow Claw", "high", "dmg", "slashing", ["agile", "finesse"]]],
    actions: [
      ["borrowed-likeness", { en: "Borrowed Likeness", pt: "Semelhança Emprestada" }, 1, ["concentrate", "illusion", "occult"], { en: "The fetch takes the look of someone dear to a creature it can see. That creature is off-guard to the fetch until it succeeds at @Check[will|dc:{dc}] (one attempt each round, as a free action).", pt: "O fetch assume a aparência de alguém querido de uma criatura que vê. Essa criatura fica desprevenida contra o fetch até passar em @Check[will|dc:{dc}] (uma tentativa por rodada, como ação livre)." }],
    ],
    notes: { en: "A thing from the edges of the Abyss that wears the faces of the people its victims love, and takes them away.", pt: "Uma coisa das bordas do Abismo que usa os rostos das pessoas que suas vítimas amam, e as leva embora." } },

  { slug: "huldre", level: 4, size: "med", traits: ["fey"], img: "modules/krynn-pf2e/icons/leaf.svg",
    name: { en: "Huldre", pt: "Huldre" },
    abilities: { str: 1, dex: 4, con: 1, int: 2, wis: 3, cha: 5 }, ac: "mod", hp: 0.85, saves: { fortitude: "low", reflex: "high", will: "high" }, perception: "high",
    skills: { deception: "high", nature: "mod", stealth: "high" }, speed: 30, other: [], senses: ["low-light-vision"], languages: ["common", "elven", "sylvan"], weaknesses: [["cold-iron", 5]],
    strikes: [["Thorn Dart", "high", "1d6+4", "piercing", ["agile", "range-30"]]],
    actions: [
      ["fey-glamour", { en: "Fey Glamour", pt: "Encanto Feérico" }, 2, ["emotion", "enchantment", "mental", "primal"], { en: "One creature within 30 feet attempts @Check[will|dc:{dc}]. <strong>Failure</strong> fascinated by the huldre for 1 minute. <strong>Critical Failure</strong> as failure, and it follows the huldre.", pt: "Uma criatura a até 9 m faz @Check[will|dc:{dc}]. <strong>Falha</strong> fascinada pelo huldre por 1 minuto. <strong>Falha Crítica</strong> como na falha, e ela segue o huldre." }],
      ["between-trees", { en: "Between the Trees", pt: "Entre as Árvores" }, 1, ["primal", "teleportation"], { en: "The huldre steps into one tree and out of another within 60 feet.", pt: "O huldre entra numa árvore e sai de outra a até 18 m." }],
    ],
    notes: { en: "Shy, ancient fey of the deep woods, who play long games with travellers and keep their bargains to the letter.", pt: "Fadas antigas e tímidas das matas fundas, que fazem jogos longos com viajantes e cumprem seus acordos ao pé da letra." } },

  { slug: "dargonesti-warrior", level: 3, size: "med", traits: ["elf", "humanoid", "aquatic"], img: "modules/krynn-pf2e/icons/leaf.svg",
    name: { en: "Dargonesti Warrior", pt: "Guerreiro Dargonesti" },
    abilities: { str: 3, dex: 3, con: 2, int: 1, wis: 2, cha: 1 }, ac: "mod", hp: 1, saves: { fortitude: "mod", reflex: "high", will: "mod" }, perception: "high",
    skills: { athletics: "high", nature: "mod", stealth: "mod" }, speed: 10, other: [["swim", 40]], senses: ["darkvision"], languages: ["elven", "common"],
    strikes: [["Trident", "high", "dmg", "piercing", []]],
    actions: [
      ["dolphin-form", { en: "Dolphin Shape", pt: "Forma de Golfinho" }, 1, ["concentrate", "polymorph", "primal"], { en: "The dargonesti becomes a dolphin (swim 60 feet, a jaws Strike like its trident's) until it changes back.", pt: "O dargonesti vira um golfinho (natação 18 m, um Golpe de mandíbula como o do tridente) até voltar." }],
    ],
    notes: { en: "The deep-sea elves, dark-skinned and proud, who keep cities on the ocean floor and rarely come up.", pt: "Os elfos do mar profundo, de pele escura e orgulhosos, que mantêm cidades no fundo do oceano e raramente sobem." } },

  { slug: "dimernesti-scout", level: 2, size: "med", traits: ["elf", "humanoid", "aquatic"], img: "modules/krynn-pf2e/icons/leaf.svg",
    name: { en: "Dimernesti Scout", pt: "Batedor Dimernesti" },
    abilities: { str: 1, dex: 4, con: 1, int: 1, wis: 3, cha: 1 }, ac: "high", hp: 0.9, saves: { fortitude: "low", reflex: "high", will: "mod" }, perception: "high",
    skills: { stealth: "high", survival: "mod", acrobatics: "mod" }, speed: 25, other: [["swim", 40]], senses: ["low-light-vision"], languages: ["elven", "common"],
    strikes: [["Spear", "high", "1d8+3", "piercing", ["thrown-20"]]],
    actions: [
      ["otter-form", { en: "Otter Shape", pt: "Forma de Lontra" }, 1, ["concentrate", "polymorph", "primal"], { en: "The dimernesti becomes a sea otter (Tiny, swim 40 feet, +2 status bonus to Stealth in water) until it changes back.", pt: "O dimernesti vira uma lontra-marinha (Minúsculo, natação 12 m, +2 de bônus de status em Furtividade na água) até voltar." }],
    ],
    notes: { en: "The shallow-sea elves, quick and curious, who trade with fishing villages and watch the coasts for their deep kin.", pt: "Os elfos do mar raso, rápidos e curiosos, que negociam com vilas de pescadores e vigiam as costas para seus parentes das profundezas." } },
];

// The death throes, by draconian. Shown on the action and in the chat card; the module runs them (logic/dragons.mjs).
export const THROES_TEXT = {
  baaz: { en: "When the baaz dies, it turns to stone. The creature that struck the killing blow with a melee weapon attempts a Reflex save against the baaz's DC; on a failure, the weapon is stuck in the stone until the statue crumbles to dust at the start of the baaz's next turn (or the wielder succeeds at an Athletics check to Force Open against the same DC).",
    pt: "Quando o baaz morre, vira pedra. A criatura que deu o golpe fatal com uma arma corpo a corpo faz um teste de Reflexos contra a CD do baaz; se falhar, a arma fica presa na pedra até a estátua virar pó no início do próximo turno do baaz (ou até o portador passar num teste de Atletismo para Forçar Abertura contra a mesma CD)." },
  kapak: { en: "When the kapak dies, its body melts into a pool of acid 10 feet across. A creature in the pool when it forms, or that ends its turn in it, takes acid damage (basic Reflex save against the kapak's DC). The pool dries up after 3 rounds.",
    pt: "Quando o kapak morre, o corpo derrete numa poça de ácido de 3 m de diâmetro. Uma criatura na poça quando ela se forma, ou que termine o turno nela, sofre dano de ácido (Reflexos básico contra a CD do kapak). A poça seca depois de 3 rodadas." },
  bozak: { en: "When the bozak dies, its flesh shrivels away and its bones burst outward. Each creature within 10 feet takes piercing damage (basic Reflex save against the bozak's DC).",
    pt: "Quando o bozak morre, a carne murcha e os ossos explodem para fora. Cada criatura a até 3 m sofre dano perfurante (Reflexos básico contra a CD do bozak)." },
  sivak: { en: "When a humanoid kills the sivak, the body takes the killer's shape for three days, a body that looks like the killer's own. If anything else kills it, the sivak bursts into flame: each creature adjacent takes fire damage (basic Reflex save against the sivak's DC).",
    pt: "Quando um humanoide mata o sivak, o corpo assume a forma do assassino por três dias: um cadáver igual a quem o matou. Se outra coisa o matar, o sivak explode em chamas: cada criatura adjacente sofre dano de fogo (Reflexos básico contra a CD do sivak)." },
  aurak: { en: "When the aurak drops to 0 Hit Points, it doesn't die yet. Wrapped in green fire, it goes into a frenzy for 2 rounds: it can't be reduced further, gains a +2 status bonus to attack rolls and acts only to attack. Then it explodes: each creature within 10 feet takes electricity damage (basic Reflex save against the aurak's DC).",
    pt: "Quando o aurak chega a 0 Pontos de Vida, ainda não morre. Envolto em fogo verde, entra em frenesi por 2 rodadas: não pode ser reduzido mais, recebe +2 de bônus de status em jogadas de ataque e só age para atacar. Então explode: cada criatura a até 3 m sofre dano elétrico (Reflexos básico contra a CD do aurak)." },
};

export const VENOM_TEXT = {
  kapak: { en: "<strong>Kapak Venom</strong> (poison) <strong>Saving Throw</strong> DC 17 Fortitude; <strong>Maximum Duration</strong> 4 rounds; <strong>Stage 1</strong> @Damage[1d6[poison]] and clumsy 1 (1 round); <strong>Stage 2</strong> @Damage[1d6[poison]] and slowed 1 (1 round); <strong>Stage 3</strong> paralyzed (1 round).",
    pt: "<strong>Veneno de Kapak</strong> (veneno) <strong>Teste de Resistência</strong> Fortitude CD 17; <strong>Duração Máxima</strong> 4 rodadas; <strong>Estágio 1</strong> @Damage[1d6[poison]] e desajeitado 1 (1 rodada); <strong>Estágio 2</strong> @Damage[1d6[poison]] e lento 1 (1 rodada); <strong>Estágio 3</strong> paralisado (1 rodada)." },
};

// The strings these texts become: KRYNN.Bestiary.<creature>.<ability> (and .Notes), Throes.<kind>, Venom.<kind>.
export function bestiaryStrings(lang, list = CREATURES) {
  const L = lang.startsWith("pt") ? "pt" : "en", out = {};
  for (const c of list) {
    const sub = (s) => fill(s, c);
    out[`KRYNN.Bestiary.${c.slug}.Notes`] = `${c.era ? `<p><em>${c.era[L]}</em></p>` : ""}<p>${c.notes[L]}</p>`;
    for (const [slug, , , , text] of c.actions) if (!text.en.startsWith("@Localize")) out[`KRYNN.Bestiary.${c.slug}.${slug}`] = sub(text[L]);
  }
  if (list !== CREATURES) return out;
  for (const [k, t] of Object.entries(THROES_TEXT)) out[`KRYNN.Bestiary.Throes.${k}`] = `<p>${t[L]}</p>`;
  for (const [k, t] of Object.entries(VENOM_TEXT)) out[`KRYNN.Bestiary.Venom.${k}`] = t[L];
  return out;
}

// {dc}, {area} and {attack} in a creature's texts: its moderate DC, limited area damage, and high attack.
export function fill(s, c) {
  return s.replace(/\{dc\}/g, String(stat.dc(c.level, "mod"))).replace(/\{area\}/g, stat.area(c.level)).replace(/\{attack\}/g, String(stat.atk(c.level, "high") + 2));
}
export const _p = p;
