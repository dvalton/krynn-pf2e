// 0.5 content: the Krynn templates for the legacy bestiaries' dragons (dragonfear, the Overlords), dragon gear and
// dragonlances, the relics of the true gods, and the effects the death throes use. Written for this module;
// English and Portuguese. @UUID[SPELL:Name] links become PF2e spell UUIDs at build time.
const p = (...lines) => lines.map((l) => `<p>${l}</p>`).join("");

// Feats/actions and effects (Item pack "dragons").
export const DRAGON_ACTIONS = [
  { slug: "krynn-dragonfear", type: "action", img: "modules/krynn-pf2e/icons/dragon.svg", traits: ["aura", "emotion", "fear", "mental"],
    name: { en: "Dragonfear", pt: "Medo Dracônico" },
    rules: [{ key: "Aura", radius: 90, slug: "krynn-dragonfear", traits: ["aura", "emotion", "fear", "mental"] }],
    description: {
      en: p("90 feet (60 for a young dragon, 120 for an ancient one). @Check[will|dc:resolve(16 + @actor.level + floor(@actor.level / 3))|traits:emotion,fear,mental|options:area-effect,inflicts:frightened]",
        "A dragon of Krynn is a terror out of legend. A creature that enters the aura or starts its turn in it attempts a Will save, once per encounter. Creatures of higher level than the dragon are unaffected.",
        "<strong>Success</strong> The creature is unaffected and gets @UUID[EFFECT:krynn-faced-dragonfear]{Faced Dragonfear} for this dragon.",
        "<strong>Failure</strong> The creature is @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{Frightened 2}.",
        "<strong>Critical Failure</strong> As failure, and the creature is fleeing for 1 round.",
        "When an encounter begins, the Krynn module posts the save for every enemy in reach."),
      pt: p("27 m (18 para um dragão jovem, 36 para um ancião). @Check[will|dc:resolve(16 + @actor.level + floor(@actor.level / 3))|traits:emotion,fear,mental|options:area-effect,inflicts:frightened]",
        "Um dragão de Krynn é um terror saído das lendas. Uma criatura que entre na aura ou comece o turno nela faz um teste de Vontade, uma vez por encontro. Criaturas de nível maior que o dragão não são afetadas.",
        "<strong>Sucesso</strong> A criatura não é afetada e recebe @UUID[EFFECT:krynn-faced-dragonfear]{Encarou o Medo Dracônico} deste dragão.",
        "<strong>Falha</strong> A criatura fica @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{Amedrontada 2}.",
        "<strong>Falha Crítica</strong> Como na falha, e a criatura fica fugindo por 1 rodada.",
        "Quando um encontro começa, o módulo Krynn posta o teste para cada inimigo ao alcance."),
    } },
  { slug: "krynn-overlord", type: "action", img: "modules/krynn-pf2e/icons/dragon.svg", traits: [],
    name: { en: "Dragon Overlord", pt: "Senhor Supremo Dracônico" },
    rules: [
      { key: "Immunity", type: "frightened" },
      { key: "RollOption", domain: "all", option: "krynn-skull-totem", toggleable: true, label: "KRYNN.Dragons.NearTotem" },
      { key: "FlatModifier", selector: ["saving-throw", "ac", "spell-dc", "class"], type: "status", value: 1, predicate: ["krynn-skull-totem"], label: "KRYNN.Dragons.NearTotem" },
    ],
    description: {
      en: p("This dragon is one of the Overlords of the Age of Mortals: vast, ancient, and grown fat on the dragons of Ansalon. It is elite (the module applies the adjustment), immune to fear, and can't be surprised in its realm.",
        "While it is in its realm within a mile of its @UUID[ITEM:krynn-skull-totem]{skull totem}, turn on the toggle: it gains a +1 status bonus to AC, saving throws and DCs. Its realm reshapes the land around it (see The Dragon Overlords in the GM Guides)."),
      pt: p("Este dragão é um dos Senhores Supremos da Era dos Mortais: enorme, antigo, e engordado com os dragões de Ansalon. É elite (o módulo aplica o ajuste), imune ao medo, e não pode ser surpreendido em seu domínio.",
        "Enquanto estiver no seu domínio a até 1,5 km do seu @UUID[ITEM:krynn-skull-totem]{totem de crânios}, ligue a opção: recebe +1 de bônus de status na CA, testes de resistência e CDs. Seu domínio transforma a terra ao redor (veja Os Senhores Supremos Dracônicos nos Guias do Mestre)."),
    } },
];

export const DRAGON_EFFECTS = [
  { slug: "krynn-faced-dragonfear", img: "modules/krynn-pf2e/icons/dragon.svg", duration: { value: 1, unit: "days" },
    name: { en: "Faced Dragonfear", pt: "Encarou o Medo Dracônico" },
    description: { en: p("This creature has faced this dragon's dragonfear and is immune to it for 1 day."), pt: p("Esta criatura encarou o medo dracônico deste dragão e está imune a ele por 1 dia.") },
    rules: [{ key: "RollOption", domain: "all", option: "krynn:faced-dragonfear" }] },
  { slug: "krynn-weapon-in-stone", img: "modules/krynn-pf2e/icons/draconian.svg", duration: { value: 1, unit: "rounds" },
    name: { en: "Weapon Caught in Stone", pt: "Arma Presa na Pedra" },
    description: { en: p("A baaz turned to stone around this creature's weapon. The weapon can't be used until the statue crumbles at the start of the baaz's next turn, or the wielder succeeds at an Athletics check to Force Open it."),
      pt: p("Um baaz virou pedra em volta da arma desta criatura. A arma não pode ser usada até a estátua desmoronar no início do próximo turno do baaz, ou até o portador passar num teste de Atletismo para Forçar Abertura.") },
    rules: [] },
  { slug: "krynn-aurak-frenzy", img: "modules/krynn-pf2e/icons/draconian.svg", duration: { value: 2, unit: "rounds" },
    name: { en: "Aurak's Final Frenzy", pt: "Frenesi Final do Aurak" },
    description: { en: p("Wrapped in green fire, the aurak fights on at 0 Hit Points: it can't be reduced further and acts only to attack. When this effect ends, it explodes (see its Death Throes)."),
      pt: p("Envolto em fogo verde, o aurak continua lutando com 0 Pontos de Vida: não pode ser reduzido mais e só age para atacar. Quando este efeito acaba, ele explode (veja seus Estertores).") },
    rules: [{ key: "FlatModifier", selector: "attack", type: "status", value: 2, label: "KRYNN.Dragons.Frenzy" }] },
];

// Weapons, armour and gear.
export const GEAR = [
  { slug: "footmans-dragonlance", type: "weapon", level: 10, price: 1000, rarity: "rare", img: "modules/krynn-pf2e/icons/lance.svg",
    name: { en: "Footman's Dragonlance", pt: "Lança do Dragão de Infantaria" },
    system: { baseItem: null, category: "martial", group: "polearm", damage: { dice: 1, die: "d10", damageType: "piercing" }, usage: { value: "held-in-two-hands" }, bulk: { value: 2 },
      runes: { potency: 2, striking: 1, property: [] }, traits: ["magical", "reach", "deadly-d8"] },
    rules: [
      { key: "DamageDice", selector: "{item|_id}-damage", diceNumber: 2, dieSize: "d8", damageType: "spirit", predicate: ["target:trait:dragon"], label: "KRYNN.Dragons.Dragonbane" },
      { key: "FlatModifier", selector: "{item|_id}-attack", type: "status", value: 1, predicate: ["target:trait:dragon"], label: "KRYNN.Dragons.Dragonbane" },
      { key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 2, predicate: ["item:trait:dragon"], label: "KRYNN.Dragons.Dragonmetal" },
    ],
    description: { en: p("A long lance of silvery dragonmetal, forged with the help of a god for the war against the Dark Queen's dragons. This is a <em>+2 striking</em> weapon.",
      "Against a dragon, Strikes with it gain a +1 status bonus to the attack roll and deal 2d8 extra spirit damage. While you hold it, you gain a +2 circumstance bonus to saving throws against effects of creatures with the dragon trait (a dragon's breath)."),
      pt: p("Uma longa lança de metal dracônico prateado, forjada com a ajuda de um deus para a guerra contra os dragões da Rainha das Trevas. É uma arma <em>+2 poderosa</em>.",
        "Contra um dragão, Golpes com ela recebem +1 de bônus de status na jogada de ataque e causam 2d8 de dano espiritual extra. Enquanto a empunha, você recebe +2 de bônus circunstancial em testes de resistência contra efeitos de criaturas com o trait dragão (o sopro de um dragão).") } },
  { slug: "mounted-dragonlance", type: "weapon", level: 12, price: 2000, rarity: "rare", img: "modules/krynn-pf2e/icons/lance.svg",
    name: { en: "Mounted Dragonlance", pt: "Lança do Dragão de Montaria" },
    system: { baseItem: null, category: "martial", group: "spear", damage: { dice: 1, die: "d12", damageType: "piercing" }, usage: { value: "held-in-two-hands" }, bulk: { value: 3 },
      runes: { potency: 2, striking: 2, property: [] }, traits: ["magical", "reach", "jousting-d6"] },
    rules: [
      { key: "DamageDice", selector: "{item|_id}-damage", diceNumber: 3, dieSize: "d8", damageType: "spirit", predicate: ["target:trait:dragon"], label: "KRYNN.Dragons.Dragonbane" },
      { key: "FlatModifier", selector: "{item|_id}-attack", type: "status", value: 1, predicate: ["target:trait:dragon"], label: "KRYNN.Dragons.Dragonbane" },
      { key: "FlatModifier", selector: "saving-throw", type: "circumstance", value: 2, predicate: ["item:trait:dragon"], label: "KRYNN.Dragons.Dragonmetal" },
    ],
    description: { en: p("The great dragonlance, too heavy to wield on foot, made to be braced on a dragon saddle and carried by a good dragon into the sky. This is a <em>+2 greater striking</em> weapon.",
      "Braced on a @UUID[ITEM:dragon-saddle]{dragon saddle}, it is wielded in one hand. Against a dragon, Strikes with it gain a +1 status bonus to the attack roll and deal 3d8 extra spirit damage; you gain a +2 circumstance bonus to saves against dragons' effects while holding it."),
      pt: p("A grande lança do dragão, pesada demais para usar a pé, feita para ser apoiada numa sela de dragão e levada aos céus por um dragão bondoso. É uma arma <em>+2 poderosa maior</em>.",
        "Apoiada numa @UUID[ITEM:dragon-saddle]{sela de dragão}, é empunhada com uma mão. Contra um dragão, Golpes com ela recebem +1 de bônus de status na jogada de ataque e causam 3d8 de dano espiritual extra; você recebe +2 de bônus circunstancial em testes contra efeitos de dragões enquanto a empunha.") } },
  { slug: "dragon-saddle", type: "equipment", level: 4, price: 80, rarity: "uncommon", img: "modules/krynn-pf2e/icons/lance.svg",
    name: { en: "Dragon Saddle", pt: "Sela de Dragão" },
    system: { bulk: { value: 4 }, usage: { value: "worn" }, traits: [] },
    rules: [{ key: "FlatModifier", selector: ["reflex-dc", "fortitude-dc"], predicate: [{ or: ["action:shove", "action:trip", "action:reposition"] }], type: "circumstance", value: 2, label: "KRYNN.Dragons.Saddle" }],
    description: { en: p("A high-backed saddle with straps for the legs and a socket for a mounted dragonlance, made for riding a dragon in the air. While riding in it, you gain a +2 circumstance bonus to your Fortitude and Reflex DCs against being Shoved, Tripped or Repositioned off your mount, and you can't fall from it unless you choose to or are unconscious."),
      pt: p("Uma sela de encosto alto com tiras para as pernas e um encaixe para a lança do dragão de montaria, feita para montar um dragão no ar. Enquanto a monta, você recebe +2 de bônus circunstancial nas CDs de Fortitude e Reflexos contra ser Empurrado, Derrubado ou Reposicionado da montaria, e não cai dela a menos que queira ou esteja inconsciente.") } },
  { slug: "dragon-barding", type: "armor", level: 6, price: 250, rarity: "uncommon", img: "modules/krynn-pf2e/icons/dragon.svg",
    name: { en: "Dragon Barding", pt: "Armadura de Dragão" },
    system: { category: "heavy-barding", acBonus: 3, dexCap: 1, checkPenalty: -3, speedPenalty: -5, strength: 5, bulk: { value: 8 }, traits: ["companion"] },
    rules: [],
    description: { en: p("Plates of steel shaped for a dragon's chest and neck, worn by good dragons who fight beside the Whitestone armies."),
      pt: p("Placas de aço moldadas para o peito e o pescoço de um dragão, usadas pelos dragões bondosos que lutam ao lado dos exércitos da Pedra Branca.") } },
];

export const RELICS = [
  { slug: "disks-of-mishakal", type: "equipment", level: 20, price: 0, rarity: "unique", img: "modules/krynn-pf2e/icons/disk.svg", traits: ["artifact", "divine"],
    name: { en: "Disks of Mishakal", pt: "Discos de Mishakal" },
    system: { bulk: { value: 1 }, usage: { value: "held-in-two-hands" } },
    rules: [{ key: "FlatModifier", selector: "religion", type: "item", value: 3, label: "KRYNN.Dragons.Disks" }],
    description: { en: p("A stack of thin platinum disks, bound together, written with the teachings of the true gods. They can't be damaged by anything short of a god.",
      "While holding them you gain a +3 item bonus to Religion checks. A creature who reads them for a day learns that the true gods exist and how to pray to them; in the years the gods are silent, a reader may become a cleric of the gods of good (the GM decides).",
      "<strong>Activate—Mishakal's Mercy</strong> (concentrate, healing) 2 actions; <strong>Frequency</strong> once per day; <strong>Effect</strong> The Disks cast @UUID[SPELL:Heal]{heal} at rank 5 (the 30-foot area version), even in the years the gods are silent."),
      pt: p("Uma pilha de discos finos de platina, unidos, escritos com os ensinamentos dos verdadeiros deuses. Nada menos que um deus pode danificá-los.",
        "Enquanto os segura, você recebe +3 de bônus de item em testes de Religião. Uma criatura que os leia por um dia descobre que os verdadeiros deuses existem e como rezar a eles; nos anos em que os deuses se calam, quem os lê pode se tornar clérigo dos deuses do bem (o mestre decide).",
        "<strong>Ativar—Misericórdia de Mishakal</strong> (concentração, cura) 2 ações; <strong>Frequência</strong> uma vez por dia; <strong>Efeito</strong> Os Discos lançam @UUID[SPELL:Heal]{cura} no grau 5 (a versão em área de 9 m), mesmo nos anos em que os deuses se calam.") } },
  { slug: "blue-crystal-staff", type: "weapon", level: 8, price: 0, rarity: "unique", img: "modules/krynn-pf2e/icons/staff.svg", traits: ["artifact", "divine", "magical", "staff", "two-hand-d8"],
    name: { en: "Blue Crystal Staff", pt: "Cajado de Cristal Azul" },
    system: { baseItem: "staff", category: "simple", group: "club", damage: { dice: 1, die: "d4", damageType: "bludgeoning" }, usage: { value: "held-in-one-hand" }, bulk: { value: 1 },
      runes: { potency: 1, striking: 1, property: [] } },
    rules: [
      { key: "FlatModifier", selector: "healing", type: "item", value: 2, predicate: ["item:type:spell", "item:slug:heal"], label: "KRYNN.Dragons.Staff" },
      { key: "DamageDice", selector: "{item|_id}-damage", diceNumber: 1, dieSize: "d6", damageType: "spirit", predicate: ["target:trait:unholy"], label: "KRYNN.Dragons.Staff" },
    ],
    description: { en: p("A staff of blue crystal that glows with Mishakal's light, the first sign in three hundred years that the true gods had not gone. It is a <em>+1 striking</em> staff.",
      "It adds a +2 item bonus to the Hit Points you restore with @UUID[SPELL:Heal]{heal}, and its Strikes deal 1d6 extra spirit damage to unholy creatures.",
      "<strong>Activate—Healing Light</strong> (manipulate) 2 actions; <strong>Frequency</strong> three times per day; <strong>Effect</strong> The staff casts heal at rank 3.",
      "<strong>Refusal</strong> An unholy creature that touches the staff takes @Damage[4d6[spirit]] damage and lets go."),
      pt: p("Um cajado de cristal azul que brilha com a luz de Mishakal, o primeiro sinal em trezentos anos de que os verdadeiros deuses não tinham partido. É um cajado <em>+1 poderoso</em>.",
        "Ele soma +2 de bônus de item aos Pontos de Vida que você restaura com @UUID[SPELL:Heal]{cura}, e seus Golpes causam 1d6 de dano espiritual extra a criaturas profanas.",
        "<strong>Ativar—Luz Curativa</strong> (manipulação) 2 ações; <strong>Frequência</strong> três vezes por dia; <strong>Efeito</strong> O cajado lança cura no grau 3.",
        "<strong>Recusa</strong> Uma criatura profana que toque o cajado sofre @Damage[4d6[spirit]] de dano e o solta.") } },
  { slug: "krynn-skull-totem", type: "equipment", level: 20, price: 0, rarity: "unique", img: "modules/krynn-pf2e/icons/skull.svg", traits: ["artifact"],
    name: { en: "Skull Totem", pt: "Totem de Crânios" },
    system: { bulk: { value: 100 }, usage: { value: "other" } },
    rules: [],
    description: { en: p("A mound of dragon skulls, the heads of the dragons an Overlord killed, raised at the heart of its realm. The Overlord's power is anchored to it: within a mile, the Overlord is stronger (see Dragon Overlord). Destroying the totem (each skull has Hardness 15 and 60 HP) weakens the Overlord's hold on its realm for a year and a day."),
      pt: p("Um monte de crânios de dragão, as cabeças dos dragões que um Senhor Supremo matou, erguido no coração do seu domínio. O poder do Senhor Supremo está ancorado nele: a até 1,5 km, ele fica mais forte (veja Senhor Supremo Dracônico). Destruir o totem (cada crânio tem Dureza 15 e 60 PV) enfraquece o domínio do Senhor Supremo por um ano e um dia.") } },
];

// The five Overlords: their base dragon in the legacy bestiaries, and their realm.
export const OVERLORDS = [
  { slug: "malystryx", name: "Malystryx", color: "red", realm: { en: "the Goodlund peninsula, around her peak", pt: "a península de Goodlund, em volta do seu pico" },
    hazard: { en: "The land is a volcanic waste. Each hour of travel in the heat: @Check[fortitude|dc:30] or take @Damage[2d6[fire]] and become fatigued.", pt: "A terra é um deserto vulcânico. Cada hora de viagem no calor: @Check[fortitude|dc:30] ou sofre @Damage[2d6[fire]] e fica fatigado." } },
  { slug: "khellendros", name: "Khellendros", color: "blue", realm: { en: "the Desolation, the desert he made of northern Abanasinia", pt: "a Desolação, o deserto que ele fez do norte de Abanasinia" },
    hazard: { en: "Sandstorms and dry lightning. Each day: @Check[survival|dc:30] to find water, or take @Damage[1d6[untyped]] and become fatigued; lightning strikes the tallest creature in the open: @Damage[4d12[electricity]] (@Check[reflex|dc:30|basic]).", pt: "Tempestades de areia e raios secos. Cada dia: @Check[survival|dc:30] para achar água, ou sofre @Damage[1d6[untyped]] e fica fatigado; raios atingem a criatura mais alta a céu aberto: @Damage[4d12[electricity]] (@Check[reflex|dc:30|basic])." } },
  { slug: "beryllinthranox", name: "Beryllinthranox", color: "green", realm: { en: "the forest of Qualinesti, grown wild and choking", pt: "a floresta de Qualinesti, crescida selvagem e sufocante" },
    hazard: { en: "The forest itself watches for her. Each hour of travel: @Check[stealth|dc:30] or her spies report you; the undergrowth is greater difficult terrain off the old roads.", pt: "A própria floresta vigia por ela. Cada hora de viagem: @Check[stealth|dc:30] ou os espiões dela contam onde você está; fora das velhas estradas, o mato é terreno difícil maior." } },
  { slug: "onysablet", name: "Onysablet", color: "black", realm: { en: "the great swamp she grew over the land of the New Coast", pt: "o grande pântano que ela fez crescer sobre a Nova Costa" },
    hazard: { en: "Rotting water and biting swarms. Each day: @Check[fortitude|dc:30] against swamp fever (the GM's choice of disease); the water is acidic near her lair: @Damage[2d6[acid]] per round of wading.", pt: "Água podre e enxames que picam. Cada dia: @Check[fortitude|dc:30] contra febre do pântano (a doença à escolha do mestre); perto do covil a água é ácida: @Damage[2d6[acid]] por rodada andando nela." } },
  { slug: "gellidus", name: "Gellidus", color: "white", realm: { en: "Southern Ergoth, buried under his glacier", pt: "o sul de Ergoth, enterrado sob a sua geleira" },
    hazard: { en: "Severe cold and whiteouts. Each hour outdoors without cold-weather gear: @Damage[2d6[cold]] (@Check[fortitude|dc:30|basic]); visibility drops to 30 feet in storms.", pt: "Frio severo e nevascas cegantes. Cada hora ao ar livre sem roupa de frio: @Damage[2d6[cold]] (@Check[fortitude|dc:30|basic]); a visibilidade cai para 9 m nas tempestades." } },
];

const ov = (o, L) => p(`<strong>${o.name}</strong> (${L === "pt" ? { red: "vermelho", blue: "azul", green: "verde", black: "negro", white: "branco" }[o.color] : o.color}) — ${o.realm[L]}.`,
  L === "pt" ? `Para jogar: importe o <em>Ancient ${o.color[0].toUpperCase() + o.color.slice(1)} Dragon</em> do bestiário legacy pela janela Dragões de Krynn, como Senhor Supremo. Ele fica elite, Imenso, imune ao medo, com o Medo Dracônico e o Totem de Crânios.`
    : `To play: import the <em>Ancient ${o.color[0].toUpperCase() + o.color.slice(1)} Dragon</em> from the legacy bestiary through the Dragons of Krynn window, as an Overlord. It becomes elite and Gargantuan, immune to fear, with Dragonfear and the Skull Totem.`,
  `<strong>${L === "pt" ? "O domínio" : "The realm"}</strong> ${o.hazard[L]}`);

export const DRAGON_JOURNALS = [
  { slug: "dragons-of-krynn", name: { en: "The Dragons of Krynn", pt: "Os Dragões de Krynn" }, pages: [
    { slug: "dragonfear", name: { en: "Dragonfear", pt: "Medo Dracônico" }, text: {
      en: p("The dragons of Krynn are not beasts: they are powers of the world, and the gods' own servants. When one shows itself, armies break. In play, every dragon brought into the world through the module has <strong>Dragonfear</strong>, stronger than frightful presence: frightened 2 on a failure, fleeing as well on a critical failure.",
        "The module posts the Will save for every enemy in reach when an encounter begins. Those who succeed are immune to that dragon for a day."),
      pt: p("Os dragões de Krynn não são feras: são poderes do mundo, e servos dos próprios deuses. Quando um se mostra, exércitos se desfazem. No jogo, todo dragão trazido pelo módulo tem <strong>Medo Dracônico</strong>, mais forte que a presença aterradora: amedrontado 2 na falha, e também fugindo na falha crítica.",
        "O módulo posta o teste de Vontade para cada inimigo ao alcance quando um encontro começa. Quem passa fica imune àquele dragão por um dia.") } },
    { slug: "dragonlances", name: { en: "Dragonlances and Riding", pt: "Lanças do Dragão e Montaria" }, text: {
      en: p("The dragonlances were forged of dragonmetal with a god's help, and given to the knights who would ride the good dragons against the Dark Queen's flights. The <em>footman's dragonlance</em> is wielded on foot; the <em>mounted dragonlance</em> is braced on a <em>dragon saddle</em>.",
        "A good dragon who lets a mortal ride it is choosing that rider; it is never a mount like a horse. Ask the dragon, not the rider, when it comes to where they fly."),
      pt: p("As lanças do dragão foram forjadas de metal dracônico com a ajuda de um deus, e dadas aos cavaleiros que montariam os dragões bondosos contra as revoadas da Rainha das Trevas. A <em>lança do dragão de infantaria</em> se usa a pé; a <em>de montaria</em> se apoia numa <em>sela de dragão</em>.",
        "Um dragão bondoso que deixa um mortal montá-lo está escolhendo esse cavaleiro; nunca é uma montaria como um cavalo. Pergunte ao dragão, não ao cavaleiro, para onde eles voam.") } },
    { slug: "good-dragons-oath", name: { en: "The Good Dragons' Oath", pt: "O Juramento dos Dragões Bondosos" }, text: {
      en: p("After the last great war against the Dark Queen, the metallic dragons swore to stay out of mortal wars. While the oath holds, they don't fight, even when the chromatic dragons return. The oath breaks when the good dragons learn what was done to their eggs, and they come back to the war.",
        "In play: before that, a metallic dragon met in the world is a hermit, a riddle or a disguise, not an ally in battle."),
      pt: p("Depois da última grande guerra contra a Rainha das Trevas, os dragões metálicos juraram ficar fora das guerras dos mortais. Enquanto o juramento vale, eles não lutam, nem quando os dragões cromáticos voltam. O juramento se rompe quando os dragões bondosos descobrem o que foi feito com seus ovos, e eles voltam à guerra.",
        "No jogo: antes disso, um dragão metálico encontrado no mundo é um eremita, um enigma ou um disfarce, não um aliado de batalha.") } },
    { slug: "draconians", name: { en: "Draconians", pt: "Draconianos" }, text: {
      en: p("The draconians were made from the stolen eggs of good dragons, corrupted by dark priests and mages. Each kind dies in its own way, and those deaths are dangerous: the baaz turns to stone around the blade that killed it, the kapak melts into acid, the bozak's bones burst, the sivak takes its killer's face, the aurak fights on in green fire and explodes.",
        "The module runs these death throes when a draconian drops to 0 Hit Points: the chat card rolls the damage and the saves, the token changes, and the acid pool appears on the map and dries up after three rounds."),
      pt: p("Os draconianos foram feitos dos ovos roubados dos dragões bondosos, corrompidos por sacerdotes e magos das trevas. Cada tipo morre do seu jeito, e essas mortes são perigosas: o baaz vira pedra em volta da lâmina que o matou, o kapak derrete em ácido, os ossos do bozak explodem, o sivak toma o rosto de quem o matou, o aurak continua lutando em fogo verde e explode.",
        "O módulo executa esses estertores quando um draconiano chega a 0 Pontos de Vida: o card do chat rola o dano e os testes, o token muda, e a poça de ácido aparece no mapa e seca depois de três rodadas.") } },
  ] },
  { slug: "dragon-overlords", gmOnly: true, name: { en: "The Dragon Overlords", pt: "Os Senhores Supremos Dracônicos" }, pages: [
    { slug: "overlords", name: { en: "The Overlords", pt: "Os Senhores Supremos" }, text: {
      en: p("After the Chaos War, with the gods gone, great dragons came to Ansalon and divided it. They killed many of Krynn's own dragons and raised totems of their skulls. Five ruled most of the continent through the Age of Mortals, until the War of Souls.",
        "Each is an ancient dragon of the legacy bestiaries made into an Overlord: elite, Gargantuan, immune to fear, with Dragonfear and the Skull Totem. Their realms are hazards for anyone who travels there."),
      pt: p("Depois da Guerra do Caos, sem os deuses, grandes dragões chegaram a Ansalon e o dividiram. Mataram muitos dos dragões de Krynn e ergueram totens com seus crânios. Cinco governaram a maior parte do continente durante a Era dos Mortais, até a Guerra das Almas.",
        "Cada um é um dragão ancião dos bestiários legacy transformado em Senhor Supremo: elite, Imenso, imune ao medo, com o Medo Dracônico e o Totem de Crânios. Seus domínios são perigos para quem viaja por eles.") } },
    ...OVERLORDS.map((o) => ({ slug: o.slug, name: { en: o.name, pt: o.name }, text: { en: ov(o, "en"), pt: ov(o, "pt") } })),
  ] },
];

// The legacy bestiaries' chromatic and metallic dragons, by name.
export const DRAGON_COLORS = ["black", "blue", "green", "red", "white", "brass", "bronze", "copper", "gold", "silver"];
export const DRAGON_AGES = ["young", "adult", "ancient"];
