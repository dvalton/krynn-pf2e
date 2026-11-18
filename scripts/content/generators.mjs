// 0.7 content: the tables of the generators. Written for this module; English and Portuguese ([en, pt]).
// Names come from Lifewrought's stocks (data.json); everything else is here.

export const TRADES = [
  ["farmer", "fazendeiro(a)"], ["shepherd", "pastor(a)"], ["smith", "ferreiro(a)"], ["innkeeper", "estalajadeiro(a)"], ["brewer", "cervejeiro(a)"], ["weaver", "tecelão/tecelã"],
  ["fisher", "pescador(a)"], ["sailor", "marinheiro(a)"], ["merchant", "mercador(a)"], ["moneylender", "agiota"], ["scribe", "escriba"], ["healer", "curandeiro(a)"],
  ["hunter", "caçador(a)"], ["woodcutter", "lenhador(a)"], ["miner", "mineiro(a)"], ["mason", "pedreiro(a)"], ["carpenter", "carpinteiro(a)"], ["guard", "guarda"],
  ["soldier on leave", "soldado de licença"], ["mercenary", "mercenário(a)"], ["street performer", "artista de rua"], ["storyteller", "contador(a) de histórias"],
  ["priest of a false god", "sacerdote(isa) de um falso deus"], ["temple servant", "servidor(a) do templo"], ["cartographer", "cartógrafo(a)"], ["horse trader", "negociante de cavalos"],
  ["tanner", "curtidor(a)"], ["baker", "padeiro(a)"], ["ferryman", "balseiro(a)"], ["smuggler", "contrabandista"], ["thief", "ladrão/ladra"], ["beggar", "mendigo(a)"],
];
export const WANTS = [
  ["to pay off a debt before winter", "pagar uma dívida antes do inverno"], ["to find a missing brother", "achar um irmão desaparecido"], ["to leave town for good", "ir embora da cidade de vez"],
  ["to marry someone the family forbids", "casar com alguém que a família proíbe"], ["to be taken seriously by the council", "ser levado(a) a sério pelo conselho"], ["revenge for a burned farm", "vingança por uma fazenda queimada"],
  ["a cure for a sick child", "uma cura para um filho doente"], ["to see the sea once", "ver o mar uma vez"], ["to buy back the family's land", "comprar de volta as terras da família"],
  ["proof that the old gods are real", "provas de que os velhos deuses existem"], ["to be left alone", "ser deixado(a) em paz"], ["a better price for their goods", "um preço melhor pelos seus produtos"],
  ["to join the Knights, or anyone with a banner", "entrar para os Cavaleiros, ou para quem tiver uma bandeira"], ["to win back a lost love", "reconquistar um amor perdido"],
  ["a safe road for the caravan", "uma estrada segura para a caravana"], ["to learn to read", "aprender a ler"], ["to find who sold out the village", "descobrir quem traiu a vila"], ["one good harvest", "uma boa colheita"],
];
export const SECRETS = [
  ["informs for the dragonarmies", "é informante dos exércitos dracônicos"], ["is hiding a wanted mage", "esconde um mago procurado"], ["stole from the temple", "roubou do templo"],
  ["is not who they say they are", "não é quem diz ser"], ["deserted from an army", "desertou de um exército"], ["owes money to the thieves' guild", "deve dinheiro à guilda de ladrões"],
  ["prays in secret to a true god", "reza em segredo a um verdadeiro deus"], ["has a second family in the next town", "tem uma segunda família na cidade vizinha"], ["knows where something valuable is buried", "sabe onde algo valioso está enterrado"],
  ["poisoned someone, long ago", "envenenou alguém, há muito tempo"], ["is half-elven and hides it", "é meio-elfo(a) e esconde"], ["carries a letter they can't read", "carrega uma carta que não sabe ler"],
  ["saw a dragon and told no one", "viu um dragão e não contou a ninguém"], ["sold the town's grain to the enemy", "vendeu o grão da cidade ao inimigo"], ["is the last of a noble line", "é o(a) último(a) de uma linhagem nobre"],
  ["has a kender's stolen map, and no idea", "tem o mapa roubado de um kender, e não sabe"],
];
export const QUIRKS = [
  ["laughs too loud", "ri alto demais"], ["never meets your eyes", "nunca olha nos olhos"], ["quotes the Measure at everything", "cita a Medida para tudo"], ["hums old war songs", "cantarola velhas canções de guerra"],
  ["counts coins twice", "conta as moedas duas vezes"], ["is kind to animals, cold to people", "é gentil com bichos e frio(a) com gente"], ["talks with their hands", "fala com as mãos"], ["is always eating", "está sempre comendo"],
  ["distrusts magic loudly", "desconfia de magia em voz alta"], ["calls everyone 'friend'", "chama todo mundo de 'amigo'"], ["limps, and won't say why", "manca, e não diz por quê"], ["remembers every face", "lembra de todos os rostos"],
  ["speaks very quietly", "fala muito baixo"], ["wears a charm against dragons", "usa um amuleto contra dragões"], ["swears by gods no one has heard of", "jura por deuses que ninguém conhece"], ["answers questions with questions", "responde perguntas com perguntas"],
];
export const GENDERS = { woman: ["woman, she/her", "mulher, ela/dela"], man: ["man, he/him", "homem, ele/dele"], nonbinary: ["nonbinary, they/them", "não binário(a), elu/delu"] };
export const PEOPLES = {
  human: ["human", "humano(a)"], half_elf: ["half-elf", "meio-elfo(a)"], qualinesti_elf: ["Qualinesti elf", "elfo(a) Qualinesti"], silvanesti_elf: ["Silvanesti elf", "elfo(a) Silvanesti"],
  kagonesti_elf: ["Kagonesti elf", "elfo(a) Kagonesti"], hill_dwarf: ["hill dwarf", "anão/anã das colinas"], mountain_dwarf: ["mountain dwarf", "anão/anã da montanha"], gnome: ["gnome", "gnomo(a)"],
  goblin: ["goblin", "goblin"], hobgoblin: ["hobgoblin", "hobgoblin"], centaur: ["centaur", "centauro"], minotaur: ["minotaur", "minotauro"], kender: ["kender", "kender"],
};
export const FAMILY = { son: ["son of", "filho de"], daughter: ["daughter of", "filha de"], child: ["child of", "cria de"] };

// Roles for an NPC's stat block: the creature builder's fields, by role. Levels are the role's usual one.
export const ROLES = {
  commoner: { level: -1, name: ["Commoner", "Plebeu"], abilities: [1, 1, 1, 0, 1, 0], ac: "mod", saves: ["mod", "mod", "low"], perception: "mod", skills: { athletics: "mod", society: "mod" }, strikes: [["Club", "mod", "1d6+1", "bludgeoning", []]] },
  guard: { level: 1, name: ["Guard", "Guarda"], abilities: [3, 2, 2, 0, 1, 0], ac: "high", saves: ["high", "mod", "low"], perception: "high", skills: { athletics: "mod", intimidation: "mod" }, strikes: [["Spear", "high", "dmg", "piercing", []], ["Crossbow", "mod", "1d8", "piercing", ["range-120"]]] },
  merchant: { level: 0, name: ["Merchant", "Mercador"], abilities: [0, 1, 1, 2, 2, 3], ac: "mod", saves: ["low", "mod", "high"], perception: "high", skills: { diplomacy: "high", society: "mod", deception: "mod" }, strikes: [["Dagger", "mod", "1d4+1", "piercing", ["agile", "finesse"]]] },
  priest: { level: 2, name: ["Priest", "Sacerdote"], abilities: [1, 0, 1, 1, 4, 2], ac: "mod", saves: ["mod", "low", "high"], perception: "high", skills: { religion: "high", medicine: "mod", diplomacy: "mod" }, strikes: [["Mace", "mod", "dmg", "bludgeoning", ["shove"]]] },
  mage: { level: 3, name: ["Mage", "Mago"], abilities: [-1, 2, 1, 4, 2, 1], ac: "mod", saves: ["low", "mod", "high"], perception: "mod", skills: { arcana: "high", occultism: "mod" }, strikes: [["Staff", "mod", "1d6+1", "bludgeoning", ["two-hand-d8"]]] },
  knight: { level: 4, name: ["Knight", "Cavaleiro"], abilities: [4, 1, 3, 1, 2, 2], ac: "high", saves: ["high", "low", "high"], perception: "mod", skills: { athletics: "high", diplomacy: "mod" }, strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p"]]] },
  thug: { level: 1, name: ["Thug", "Bandido"], abilities: [3, 2, 2, -1, 0, 1], ac: "mod", saves: ["high", "mod", "low"], perception: "mod", skills: { intimidation: "high", athletics: "mod" }, strikes: [["Club", "high", "dmg", "bludgeoning", []]] },
  scout: { level: 1, name: ["Scout", "Batedor"], abilities: [1, 4, 1, 0, 2, 0], ac: "high", saves: ["mod", "high", "low"], perception: "high", skills: { stealth: "high", survival: "high" }, strikes: [["Shortbow", "high", "1d6+2", "piercing", ["deadly-d10", "range-60"]], ["Shortsword", "mod", "1d6+2", "piercing", ["agile", "finesse"]]] },
  veteran: { level: 5, name: ["Veteran", "Veterano"], abilities: [4, 2, 3, 0, 2, 1], ac: "high", saves: ["high", "mod", "mod"], perception: "mod", skills: { athletics: "high", intimidation: "mod" }, strikes: [["Bastard Sword", "high", "dmg", "slashing", ["two-hand-d12"]]] },
  captain: { level: 7, name: ["Captain", "Capitão"], abilities: [4, 2, 3, 1, 2, 4], ac: "high", saves: ["high", "mod", "high"], perception: "high", skills: { intimidation: "high", diplomacy: "mod", athletics: "mod" }, strikes: [["Longsword", "high", "dmg", "slashing", ["versatile-p"]]] },
};
// Which role fits a trade best (the GM can pick another).
export const TRADE_ROLE = { guard: "guard", "soldier on leave": "veteran", mercenary: "veteran", merchant: "merchant", moneylender: "merchant", innkeeper: "merchant", "horse trader": "merchant",
  "priest of a false god": "priest", "temple servant": "priest", healer: "priest", hunter: "scout", smuggler: "scout", thief: "thug", cartographer: "scout" };

// Encounters. Terrain of each region; pools of creatures by terrain: [name, weight, from, to] (years, optional).
export const REGION_TERRAIN = {
  abanasinia: ["plains", "forest", "hills"], qualinesti: ["forest"], silvanesti: ["forest"], thorbardin: ["mountains", "underground"], solamnia: ["plains", "hills", "mountains"],
  kalaman: ["plains", "coast"], sancrist: ["coast", "mountains"], northern_ergoth: ["plains", "coast", "forest"], southern_ergoth: ["forest", "arctic"], khur: ["desert", "hills"],
  neraka: ["mountains", "hills"], sanction: ["volcanic", "coast"], balifor: ["plains", "coast", "swamp"], goodlund: ["forest", "plains"], icereach: ["arctic"], tarsis_plains: ["plains", "desert"],
  blood_sea_isles: ["coast"], istar: ["coast"],
};
const WAR = [348, 383], AFTER = [348, 430];
export const POOLS = {
  any: [["Baaz Draconian", 6, ...WAR], ["Kapak Draconian", 4, ...WAR], ["Bozak Draconian", 2, ...WAR], ["Sivak Draconian", 1, ...WAR], ["Aurak Draconian", 1, ...WAR],
    ["Baaz Draconian", 2, 384, 430], ["Hobgoblin Soldier", 4, ...AFTER], ["Hobgoblin Archer", 3, ...AFTER], ["Goblin Warrior", 4], ["Ogre Warrior", 2], ["Wolf", 3], ["Spectral Minion", 1]],
  plains: [["Wolf", 4], ["Warg", 2], ["Boar", 3], ["Centaur Herbalist", 1], ["Griffon", 1], ["Hyena", 2], ["Ogre Warrior", 2]],
  forest: [["Huldre", 1], ["Wolf", 4], ["Grizzly Bear", 2], ["Hunting Spider", 3], ["Forest Troll", 1], ["Dryad", 1], ["Leaf Leshy", 1], ["Dreamwraith", 4, 349, 352], ["Boar", 2]],
  hills: [["Ogre Warrior", 3], ["Ogre Boss", 1], ["Goblin Warrior", 3], ["Wyvern", 1], ["Griffon", 1], ["Hyena", 2]],
  mountains: [["Cave Bear", 2], ["Ogre Warrior", 3], ["Stone Giant", 1], ["Wyvern", 2], ["Griffon", 2], ["Aghar Scrounger", 2]],
  underground: [["Fetch", 1], ["Death Knight", 1, 1, 430], ["Aghar Scrounger", 4], ["Giant Rat", 3], ["Cave Worm", 1], ["Skeleton Guard", 2], ["Zombie Shambler", 2], ["Ghoul Stalker", 1]],
  coast: [["Dargonesti Warrior", 1], ["Dimernesti Scout", 2], ["Kyrie Skywatcher", 2], ["Merfolk Warrior", 1], ["Giant Octopus", 1], ["Harpy", 2], ["Sea Hag", 1], ["Minotaur Hunter", 2]],
  swamp: [["Bakali Warrior", 4], ["Crocodile", 3], ["Boggard Warrior", 2], ["Giant Anaconda", 1], ["Will-o'-Wisp", 1]],
  desert: [["Giant Scorpion", 3], ["Hyena", 3], ["Desert Drake", 1], ["Lamia", 1], ["Mummy Guardian", 1]],
  arctic: [["Thanoi Hunter", 5], ["Yeti", 2], ["Frost Giant", 1], ["Frost Drake", 1], ["Wolf", 2]],
  volcanic: [["Fireshadow", 4], ["Flame Drake", 1], ["Hell Hound", 2], ["Cinder Rat", 3], ["Living Wildfire", 1]],
};

// Treasure: PF2e's party treasure by level (gp, four characters), expressed in steel pieces on Krynn.
export const PARTY_TREASURE = { 1: 175, 2: 300, 3: 500, 4: 850, 5: 1350, 6: 2000, 7: 2900, 8: 4000, 9: 5700, 10: 8000, 11: 11500, 12: 16500, 13: 25000, 14: 36500, 15: 54500, 16: 82500, 17: 128000, 18: 208000, 19: 355000, 20: 490000 };
export const GEMS = [
  [10, "a chip of bloodstone", "uma lasca de heliotrópio"], [10, "a smooth piece of jade", "um pedaço liso de jade"], [25, "a deep red garnet", "uma granada vermelho-escura"], [25, "a moonstone the colour of Solinari", "uma pedra-da-lua da cor de Solinari"],
  [50, "a cut amethyst", "uma ametista lapidada"], [50, "a string of river pearls", "um fio de pérolas de rio"], [100, "a blue topaz", "um topázio azul"], [100, "a fire opal from Sanction", "uma opala de fogo de Sanction"],
  [250, "a flawless emerald", "uma esmeralda sem defeito"], [500, "a star sapphire", "uma safira-estrela"], [1000, "a ruby the size of a thumb", "um rubi do tamanho de um polegar"], [2500, "a black pearl from the Blood Sea", "uma pérola negra do Mar de Sangue"],
];
export const ART = [
  [15, "a carved wooden kingfisher", "um martim-pescador de madeira entalhada"], [25, "a silver cloak pin", "um broche de capa de prata"], [50, "an Istarian coin, a collector's piece", "uma moeda de Istar, peça de colecionador"],
  [75, "a dwarven drinking horn banded in brass", "um chifre de beber anão com aros de latão"], [100, "a Silvanesti tapestry", "uma tapeçaria Silvanesti"], [150, "a gold torc of the Plainsmen", "um torque de ouro do povo das Planícies"],
  [250, "a jewelled dragonarmy officer's medal", "uma medalha de oficial do exército dracônico com joias"], [400, "a steel-and-gold Solamnic helm", "um elmo solâmnico de aço e ouro"],
  [750, "a crystal figurine of a silver dragon", "uma estatueta de cristal de um dragão de prata"], [1500, "the crown of a forgotten thane", "a coroa de um thane esquecido"],
];

// Weather by climate and season (the calendar's season ids); each [en, pt, effect en, effect pt].
export const REGION_CLIMATE = {
  abanasinia: "temperate", qualinesti: "temperate", silvanesti: "warm", thorbardin: "mountain", solamnia: "temperate", kalaman: "temperate", sancrist: "temperate", northern_ergoth: "temperate",
  southern_ergoth: "cold", khur: "dry", neraka: "mountain", sanction: "volcanic", balifor: "warm", goodlund: "warm", icereach: "arctic", tarsis_plains: "dry", blood_sea_isles: "warm", istar: "warm",
};
const W = (en, pt, fen = "", fpt = "") => [en, pt, fen, fpt];
const RAIN = W("Steady rain", "Chuva contínua", "−1 to Perception to see or hear at a distance; fires are hard to light.", "−1 em Percepção para ver ou ouvir à distância; fogueiras são difíceis de acender.");
const STORM = W("A storm with wind and lightning", "Tempestade com vento e raios", "Ranged attacks −2; flying is a DC 20 Acrobatics check each round.", "Ataques à distância −2; voar exige Acrobacia CD 20 a cada rodada.");
const FOG = W("Thick fog", "Neblina espessa", "Everything beyond 30 feet is concealed.", "Tudo além de 9 m fica oculto.");
const CLEAR = W("Clear and mild", "Céu limpo e ameno");
const HOT = W("Hot and still", "Calor parado", "Severe heat if over 110°F: Fortitude save each hour of travel or fatigued.", "Calor severo acima de 43 °C: Fortitude a cada hora de viagem ou fatigado.");
const SNOW = W("Snowfall", "Neve caindo", "Difficult terrain on the road; tracks are easy to follow.", "Terreno difícil na estrada; rastros são fáceis de seguir.");
const BLIZZ = W("A blizzard", "Nevasca", "Severe cold: 2d6 cold damage per hour without shelter (Fortitude basic, DC 20); visibility 30 feet.", "Frio severo: 2d6 de dano de frio por hora sem abrigo (Fortitude básico, CD 20); visibilidade de 9 m.");
const WIND = W("Strong wind", "Vento forte", "Ranged attacks −1; small boats can't put out.", "Ataques à distância −1; barcos pequenos não saem.");
const DUST = W("A dust storm", "Tempestade de poeira", "Creatures in the open are concealed; travel is halved.", "Criaturas a céu aberto ficam ocultas; a viagem cai pela metade.");
const ASH = W("Ash falls from the Lords of Doom", "Cinzas caem dos Senhores da Perdição", "Breathing is hard: Fortitude DC 18 each hour of exertion or sickened 1.", "Respirar é difícil: Fortitude CD 18 a cada hora de esforço ou enjoado 1.");
export const WEATHER = {
  temperate: { spring: [CLEAR, RAIN, RAIN, FOG, STORM], summer: [CLEAR, CLEAR, HOT, STORM], autumn: [CLEAR, RAIN, FOG, WIND], winter: [SNOW, CLEAR, FOG, BLIZZ] },
  warm: { spring: [CLEAR, RAIN, STORM], summer: [HOT, HOT, STORM, CLEAR], autumn: [CLEAR, RAIN, WIND], winter: [CLEAR, RAIN, FOG] },
  cold: { spring: [FOG, RAIN, SNOW], summer: [CLEAR, RAIN, FOG], autumn: [WIND, SNOW, FOG], winter: [BLIZZ, SNOW, SNOW] },
  arctic: { spring: [SNOW, WIND, BLIZZ], summer: [CLEAR, WIND, FOG], autumn: [SNOW, BLIZZ, WIND], winter: [BLIZZ, BLIZZ, SNOW] },
  mountain: { spring: [RAIN, FOG, SNOW, CLEAR], summer: [CLEAR, STORM, WIND], autumn: [WIND, FOG, SNOW], winter: [SNOW, BLIZZ, WIND] },
  dry: { spring: [CLEAR, WIND, DUST], summer: [HOT, HOT, DUST], autumn: [CLEAR, WIND, DUST], winter: [CLEAR, WIND] },
  volcanic: { spring: [ASH, CLEAR, HOT], summer: [HOT, ASH, STORM], autumn: [ASH, WIND, CLEAR], winter: [ASH, RAIN, FOG] },
};

export const ROAD = [
  ["A broken cart blocks the road; its owner swears the wheel was cut.", "Uma carroça quebrada bloqueia a estrada; o dono jura que a roda foi cortada."],
  ["A kender joins the party for a mile, and leaves with something.", "Um kender acompanha o grupo por uma milha, e vai embora com alguma coisa."],
  ["Refugees going the other way warn of soldiers ahead.", "Refugiados indo no sentido contrário avisam de soldados à frente."],
  ["A toll bridge, and a new toll nobody has heard of.", "Uma ponte com pedágio, e um pedágio novo que ninguém conhecia."],
  ["Fresh tracks of something large, crossing the road twice.", "Pegadas frescas de algo grande, cruzando a estrada duas vezes."],
  ["A wayside shrine to a god no one prays to anymore.", "Um santuário de beira de estrada a um deus a quem ninguém mais reza."],
  ["A merchant offers a ride, and a price to keep quiet about the cargo.", "Um mercador oferece carona, e um preço para ficarem quietos sobre a carga."],
  ["The ford is flooded; the way around adds a day.", "O vau está cheio; o caminho em volta acrescenta um dia."],
  ["A burned farm, still smoking.", "Uma fazenda queimada, ainda fumegando."],
  ["A lone knight asks for help with a vow he can't keep alone.", "Um cavaleiro sozinho pede ajuda com um voto que não consegue cumprir sozinho."],
  ["A gnome's machine has broken down in the middle of the road.", "A máquina de um gnomo quebrou no meio da estrada."],
  ["A recruiter for the dragonarmies pays in steel, cash in hand.", "Um recrutador dos exércitos dracônicos paga em aço, dinheiro na mão."],
  ["An old woman sells charms against dragons; one of them works.", "Uma velha vende amuletos contra dragões; um deles funciona."],
  ["A herd of wild horses, and someone trying to catch them.", "Uma manada de cavalos selvagens, e alguém tentando pegá-los."],
  ["Bandits at the narrows, too hungry to be careful.", "Bandidos no estreito, famintos demais para serem cuidadosos."],
  ["The inn ahead is full; the stable isn't.", "A estalagem à frente está lotada; o estábulo não."],
  ["A shadow passes over the road. Everyone stops talking.", "Uma sombra passa sobre a estrada. Todo mundo para de falar."],
  ["A messenger collapses at the party's feet with a sealed letter.", "Um mensageiro desmaia aos pés do grupo com uma carta lacrada."],
  ["Pilgrims singing; one of them is not a pilgrim.", "Peregrinos cantando; um deles não é peregrino."],
  ["A milestone with a message scratched on it, meant for one of the party.", "Um marco de pedra com uma mensagem riscada, para alguém do grupo."],
];

// Rumours: of each period (logic/ages.mjs period ids), and of each region [from, to, en, pt].
export const PERIOD_RUMOURS = {
  despair: [["The Seekers say a new god heals the faithful in Haven.", "Os Buscadores dizem que um novo deus cura os fiéis em Haven."], ["Armies are gathering in the east; nobody says whose.", "Exércitos se reúnem no leste; ninguém diz de quem."], ["Strange creatures, like men with scales, were seen in the hills.", "Criaturas estranhas, como homens com escamas, foram vistas nas colinas."]],
  war: [["Dragons have come back. Not in stories: over Que-Shu.", "Os dragões voltaram. Não nas histórias: sobre Que-Shu."], ["A woman of the Plains heals with a blue staff.", "Uma mulher das Planícies cura com um cajado azul."], ["The Highlords pay in steel for anyone who can fight.", "Os Senhores Dracônicos pagam em aço quem souber lutar."]],
  after: [["The gods' temples are open again, and people actually go.", "Os templos dos deuses estão abertos de novo, e o povo vai mesmo."], ["Draconians who didn't die in the war have turned bandit.", "Draconianos que não morreram na guerra viraram bandidos."], ["The Knights are taking squires again.", "Os Cavaleiros estão aceitando escudeiros de novo."]],
  chaos: [["Dark knights in black armour came from the sea.", "Cavaleiros sombrios de armadura negra vieram do mar."], ["The priests can't feel their gods. The mages can't find the moons.", "Os sacerdotes não sentem seus deuses. Os magos não acham as luas."]],
  mortals: [["A great dragon from beyond the sea has eaten three of our own.", "Um grande dragão de além-mar comeu três dos nossos."], ["At the Citadel of Light they teach a power in the heart.", "Na Cidadela da Luz ensinam um poder do coração."], ["The dark knights collect tribute from anyone near the roads.", "Os cavaleiros sombrios cobram tributo de quem mora perto das estradas."]],
  souls: [["A girl with amber eyes leads the dark knights, and they win.", "Uma moça de olhos cor de âmbar lidera os cavaleiros sombrios, e eles vencem."], ["The dead are seen walking towards the east.", "Os mortos são vistos andando para o leste."]],
};
export const REGION_RUMOURS = {
  abanasinia: [[300, 350, "Old Plainsmen say a shepherd's son went looking for proof of the old gods.", "Velhos das Planícies dizem que o filho de um pastor saiu atrás de provas dos velhos deuses."], [351, 352, "The slaves in Pax Tharkas are planning something.", "Os escravos de Pax Tharkas estão planejando alguma coisa."]],
  qualinesti: [[300, 350, "The Speaker is said to want his daughter wed to a Silvanesti prince.", "Dizem que o Orador quer casar a filha com um príncipe Silvanesti."], [383, 420, "There are still elves in the woods who don't bow to the dark knights.", "Ainda há elfos na mata que não se curvam aos cavaleiros sombrios."]],
  silvanesti: [[353, 382, "Those who walked the nightmare forest still dream it.", "Quem andou pela floresta do pesadelo ainda sonha com ela."], [394, 420, "Nothing comes out of the shield. Something is going in.", "Nada sai do escudo. Algo está entrando."]],
  thorbardin: [[300, 350, "A Neidar swears he knows where the Hammer of Kharas lies.", "Um Neidar jura saber onde está o Martelo de Kharas."], [351, 352, "The gates are opening for the refugees, and not all the thanes agree.", "Os portões estão se abrindo para os refugiados, e nem todos os thanes concordam."]],
  solamnia: [[300, 350, "In Solanthus they spit at anyone in a Knight's colours.", "Em Solanthus cospem em quem usar as cores de Cavaleiro."], [351, 352, "The High Clerist's Tower will hold. Or it won't, and nothing will.", "A Torre do Alto Clérigo vai resistir. Ou não, e nada mais vai."]],
  kalaman: [[351, 352, "The Golden General is coming to free the city.", "A General Dourada está vindo libertar a cidade."], [353, 400, "Kalaman's merchants are richer every year since the war.", "Os mercadores de Kalaman estão mais ricos a cada ano desde a guerra."]],
  sancrist: [[300, 400, "The gnomes have built a flying machine. It flew. Briefly.", "Os gnomos construíram uma máquina voadora. Ela voou. Por pouco tempo."], [352, 352, "Elves, dwarves and Knights will meet at Whitestone. Swords may be drawn.", "Elfos, anões e Cavaleiros vão se reunir na Pedra Branca. Espadas podem sair."]],
  northern_ergoth: [[300, 382, "The senate voted, again, to retake Daltigoth someday.", "O senado votou, de novo, retomar Daltigoth algum dia."], [383, 430, "Something terrible happened on the irda's island.", "Algo terrível aconteceu na ilha dos irda."]],
  southern_ergoth: [[351, 365, "The exiled elves treat the Kagonesti like servants.", "Os elfos exilados tratam os Kagonesti como servos."], [395, 430, "Under the ice there are still villages, and they're still alive.", "Sob o gelo ainda há vilas, e ainda estão vivas."]],
  khur: [[348, 356, "Salah-Khan's riders wear green, and they kill anyone who won't.", "Os cavaleiros de Salah-Khan vestem verde, e matam quem não vestir."], [421, 430, "The elves in the desert have a prince who won't stop fighting.", "Os elfos no deserto têm um príncipe que não para de lutar."]],
  neraka: [[337, 352, "The temple at Neraka grows every night, and no one builds it.", "O templo de Neraka cresce toda noite, e ninguém o constrói."], [353, 382, "In the ruins, the Highlords' treasure is still down there.", "Nas ruínas, o tesouro dos Senhores Dracônicos ainda está lá embaixo."]],
  sanction: [[337, 352, "The lava-wrights work for whoever pays, and the Highlords pay.", "Os mestres da lava trabalham para quem paga, e os Senhores Dracônicos pagam."], [400, 420, "Hogan Bight still holds the city. For now.", "Hogan Bight ainda segura a cidade. Por enquanto."]],
  balifor: [[348, 352, "In Flotsam a Highlord's ship is looking for a crew, no questions.", "Em Flotsam o navio de um Senhor Dracônico procura tripulação, sem perguntas."], [386, 430, "The bay's water burns the skin now.", "A água da baía agora queima a pele."]],
  goodlund: [[349, 352, "The kender drove off a whole patrol with insults alone.", "Os kender expulsaram uma patrulha inteira só com insultos."], [386, 420, "Kendermore is gone. Some kender are afraid now.", "Kendermore se foi. Alguns kender agora têm medo."]],
  icereach: [[350, 351, "The thanoi serve a wizard in a castle of ice.", "Os thanoi servem um mago num castelo de gelo."], [352, 380, "The Ice Folk sing of strangers who took Icewall.", "O Povo do Gelo canta sobre estranhos que tomaram a Muralha de Gelo."]],
  tarsis_plains: [[351, 352, "Dragons over Tarsis: the library burned.", "Dragões sobre Tarsis: a biblioteca queimou."], [300, 350, "The old harbour's stones still smell of the sea.", "As pedras do velho porto ainda cheiram a mar."]],
  blood_sea_isles: [[349, 352, "Minotaur ships are sailing for the dragonarmies.", "Navios minotauros estão navegando pelos exércitos dracônicos."], [355, 420, "The emperor hasn't lost a fight in the Circus, because no one is allowed to win.", "O imperador não perdeu uma luta no Circo, porque ninguém tem permissão de ganhar."]],
};

// Inns, ships, gnome inventions: parts in each language (not translations of each other).
export const INN = {
  en: { adj: ["Last", "Golden", "Drowned", "Sleeping", "Red", "Crooked", "Silver", "Laughing", "Three-Legged", "Wandering", "Lucky", "Weary"],
    noun: ["Home", "Dragon", "Kingfisher", "Moon", "Anvil", "Lantern", "Goat", "Shield", "Kender", "Rose", "Hearth", "Wagon"], pattern: (a, n) => `The ${a} ${n}` },
  pt: { noun: [["Lar", "m"], ["Dragão", "m"], ["Martim-Pescador", "m"], ["Lua", "f"], ["Bigorna", "f"], ["Lanterna", "f"], ["Bode", "m"], ["Escudo", "m"], ["Kender", "m"], ["Rosa", "f"], ["Lareira", "f"], ["Carroça", "f"]],
    adj: [["Último", "Última"], ["Dourado", "Dourada"], ["Afogado", "Afogada"], ["Adormecido", "Adormecida"], ["Vermelho", "Vermelha"], ["Torto", "Torta"], ["Prateado", "Prateada"], ["Risonho", "Risonha"], ["Errante", "Errante"], ["Sortudo", "Sortuda"], ["Cansado", "Cansada"], ["de Três Pernas", "de Três Pernas"]] },
};
export const DISHES = [["spiced potatoes, the house's pride", "batatas temperadas, o orgulho da casa"], ["mutton stew that's been on the fire since morning", "ensopado de carneiro no fogo desde manhã"], ["river trout with herbs", "truta de rio com ervas"],
  ["black bread and strong cheese", "pão preto e queijo forte"], ["dwarf spirits that clear the head, or remove it", "aguardente anã que limpa a cabeça, ou a tira"], ["honey cakes", "bolos de mel"], ["roast fowl and cider", "ave assada e sidra"],
  ["Plainsmen flatbread with spiced meat", "pão achatado das Planícies com carne temperada"], ["fish soup that smells better than it looks", "sopa de peixe que cheira melhor do que parece"], ["elven wine, watered and overpriced", "vinho élfico, aguado e caro demais"]];
export const SHIP = {
  en: { a: ["Perechon", "Kingfisher", "Silver", "Storm", "Red", "Lucky", "Grey", "Dawn", "Sea", "Black"], b: ["Wake", "Queen", "Rose", "Runner", "Gull", "Wind", "Lance", "Maiden", "Moon", "Serpent"], pattern: (a, b) => `${a} ${b}` },
  pt: { a: ["Rainha", "Rosa", "Corredora", "Gaivota", "Lança", "Donzela", "Lua", "Serpente", "Estrela", "Sereia"], b: ["do Mar", "de Prata", "da Tempestade", "Vermelha", "da Sorte", "Cinzenta", "da Aurora", "Negra", "do Norte", "de Istar"], pattern: (a, b) => `${a} ${b}` },
};
export const INVENTION = {
  en: { power: ["Steam-Powered", "Self-Winding", "Clockwork", "Water-Driven", "Spring-Loaded", "Kender-Proof"], thing: ["Apple-Peeler", "Door-Opener", "Dragon-Detector", "Boot-Polisher", "Beard-Trimmer", "Map-Folder", "Letter-Carrier", "Ladder"],
    use: ["to save a whole minute every morning", "to find dragons before they find you", "to make tea at the top of a mountain", "to open any lock (in theory)", "to fold maps back the right way"],
    flaw: ["it explodes if it gets bored", "it needs three gnomes to start", "it only works upside down", "it whistles loudly the whole time", "it has never been tested, but the calculations are excellent"] },
  pt: { thing: ["Descascador de Maçãs", "Abridor de Portas", "Detector de Dragões", "Engraxate de Botas", "Aparador de Barbas", "Dobrador de Mapas", "Carteiro", "Escada"], power: ["a Vapor", "de Corda Automática", "de Relojoaria", "Movido a Água", "de Mola", "à Prova de Kender"],
    use: ["para economizar um minuto inteiro toda manhã", "para achar dragões antes que eles achem você", "para fazer chá no alto de uma montanha", "para abrir qualquer fechadura (em teoria)", "para dobrar mapas do jeito certo"],
    flaw: ["explode se ficar entediado", "precisa de três gnomos para ligar", "só funciona de cabeça para baixo", "assobia alto o tempo todo", "nunca foi testado, mas os cálculos são excelentes"] },
};
