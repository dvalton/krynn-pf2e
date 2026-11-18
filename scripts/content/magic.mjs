// The compendium content of 0.3, written for this module (never copied from Dragonlance books): the feats and effects
// of High Sorcery and of magic without the gods, and the guides. Each text has English and Brazilian Portuguese;
// the packs are built in English, and the Portuguese goes to the Babele translation files.
// tools/build-packs.mjs turns this into compendium packs.

const p = (...lines) => lines.map((l) => `<p>${l}</p>`).join("");

export const FEATS = [
  {
    slug: "mage-of-high-sorcery", category: "bonus", level: 1, traits: ["high-sorcery"], img: "modules/krynn-pf2e/icons/orders.svg",
    name: { en: "Mage of High Sorcery", pt: "Mago da Alta Feitiçaria" },
    description: {
      en: p("You belong to one of the three Orders of High Sorcery, and your magic is bound to its moon: Solinari for the White Robes, Lunitari for the Red, Nuitari for the Black.",
        "Choose your order. The moon of your order grows and wanes your power as it passes through its phases; the Krynn module applies its effect each day (Settings → Krynn → Moon magic).",
        "In the Orders' eyes you are an apprentice until you pass the Test of High Sorcery. A mage who casts arcane spells outside the Orders is a renegade."),
      pt: p("Você pertence a uma das três Ordens da Alta Feitiçaria, e sua magia está ligada à lua da ordem: Solinari para os Mantos Brancos, Lunitari para os Vermelhos, Nuitari para os Negros.",
        "Escolha sua ordem. A lua da sua ordem aumenta e diminui seu poder conforme passa pelas fases; o módulo Krynn aplica o efeito a cada dia (Configurações → Krynn → Magia lunar).",
        "Aos olhos das Ordens você é um aprendiz até passar no Teste da Alta Feitiçaria. Quem lança magias arcanas fora das Ordens é um renegado."),
    },
    rules: [
      { key: "ChoiceSet", flag: "order", prompt: "KRYNN.Feat.ChooseOrder", choices: [
        { value: "white", label: "KRYNN.Order.white" }, { value: "red", label: "KRYNN.Order.red" }, { value: "black", label: "KRYNN.Order.black" }] },
      { key: "RollOption", domain: "all", option: "krynn:high-sorcery" },
      { key: "RollOption", domain: "all", option: "krynn:order:{item|flags.system.rulesSelections.order}" },
    ],
  },
  {
    slug: "test-of-high-sorcery", category: "bonus", level: 1, traits: ["high-sorcery"], img: "modules/krynn-pf2e/icons/orders.svg",
    name: { en: "The Test of High Sorcery", pt: "O Teste da Alta Feitiçaria" },
    description: {
      en: p("You have passed the Test in one of the Towers of High Sorcery and come back changed. The GM grants this feat when the Test is done; it may leave a mark, a scar or a debt.",
        "You wear the robes of your order openly and are recognised by mages of all three Orders. You may take the Orders' feats that require the Test."),
      pt: p("Você passou no Teste numa das Torres da Alta Feitiçaria e voltou mudado. O mestre concede este talento quando o Teste termina; ele pode deixar uma marca, uma cicatriz ou uma dívida.",
        "Você veste abertamente os mantos da sua ordem e é reconhecido por magos das três Ordens. Você pode escolher os talentos das Ordens que exigem o Teste."),
    },
    prerequisites: { en: ["Mage of High Sorcery"], pt: ["Mago da Alta Feitiçaria"] },
    rules: [{ key: "RollOption", domain: "all", option: "krynn:test-passed" }],
  },
  {
    slug: "moonwise", category: "general", level: 1, traits: ["general", "high-sorcery"], img: "modules/krynn-pf2e/icons/solinari.svg",
    name: { en: "Moonwise", pt: "Sábio das Luas" },
    description: {
      en: p("You read the three moons as a sailor reads the sky. You always know the phase of each moon of magic you can see, and how many days remain until its High Sanction and until the next Night of the Eye.",
        "You gain a +2 circumstance bonus to checks to Recall Knowledge about the moons, the Orders of High Sorcery and their towers."),
      pt: p("Você lê as três luas como um marinheiro lê o céu. Você sempre sabe a fase de cada lua da magia que consegue ver, e quantos dias faltam para o Alto Santuário dela e para a próxima Noite do Olho.",
        "Você recebe +2 de bônus circunstancial em testes para Recordar Conhecimento sobre as luas, as Ordens da Alta Feitiçaria e suas torres."),
    },
    prerequisites: { en: ["Mage of High Sorcery"], pt: ["Mago da Alta Feitiçaria"] },
    // A toggle on the sheet: turn it on for a Recall Knowledge about the moons or the Orders.
    rules: [
      { key: "RollOption", domain: "skill-check", option: "krynn-moonwise", toggleable: true, label: "KRYNN.Feat.MoonwiseToggle" },
      { key: "FlatModifier", selector: "skill-check", type: "circumstance", value: 2, predicate: ["krynn-moonwise"], label: "KRYNN.Feat.Moonwise" },
    ],
  },
  {
    slug: "lunar-reservoir", category: "general", level: 2, traits: ["general", "high-sorcery"], img: "modules/krynn-pf2e/icons/lunitari.svg",
    frequency: { max: 1, per: "day" },
    name: { en: "Lunar Reservoir", pt: "Reservatório Lunar" },
    description: {
      en: p("<strong>Frequency</strong> once per day; <strong>Requirements</strong> the moon of your order is at High Sanction.",
        "You draw on the moon's fullness and regain one expended spell slot. Its rank can be no higher than half your level rounded down, minus 1 (minimum rank 1)."),
      pt: p("<strong>Frequência</strong> uma vez por dia; <strong>Requisitos</strong> a lua da sua ordem está no Alto Santuário.",
        "Você bebe da plenitude da lua e recupera um espaço de magia gasto. O círculo dele não pode ser maior que metade do seu nível arredondada para baixo, menos 1 (no mínimo 1º círculo)."),
    },
    prerequisites: { en: ["The Test of High Sorcery"], pt: ["O Teste da Alta Feitiçaria"] },
    actionType: "free", rules: [],
  },
  {
    slug: "mystic-of-the-heart", category: "bonus", level: 1, traits: ["mystic"], img: "modules/krynn-pf2e/icons/heart.svg",
    name: { en: "Mystic of the Heart", pt: "Místico do Coração" },
    description: {
      en: p("In the years when the gods are silent, you found divine power within yourself: the power of the heart, taught at the Citadel of Light.",
        "Your divine spells don't depend on a god. While the gods are absent from Krynn, they work for you as before."),
      pt: p("Nos anos em que os deuses se calam, você encontrou o poder divino dentro de si: o poder do coração, ensinado na Cidadela da Luz.",
        "Suas magias divinas não dependem de um deus. Enquanto os deuses estão ausentes de Krynn, elas funcionam para você como antes."),
    },
    rules: [{ key: "RollOption", domain: "all", option: "krynn:mystic" }],
  },
  {
    slug: "primal-sorcerer", category: "bonus", level: 1, traits: ["high-sorcery"], img: "modules/krynn-pf2e/icons/flame.svg",
    name: { en: "Primal Sorcerer", pt: "Feiticeiro Primordial" },
    description: {
      en: p("With the moons of magic gone, you learned to draw magic from the world itself, wild and raw, as the sorcerers of the Age of Mortals do.",
        "Your arcane spells don't need the moons. While the moons of magic are gone, they work for you as before; the moons' phases don't touch you."),
      pt: p("Com as luas da magia desaparecidas, você aprendeu a tirar magia do próprio mundo, selvagem e crua, como os feiticeiros da Era dos Mortais.",
        "Suas magias arcanas não precisam das luas. Enquanto as luas da magia estão ausentes, elas funcionam para você como antes; as fases das luas não o afetam."),
    },
    rules: [{ key: "RollOption", domain: "all", option: "krynn:primal-sorcery" }],
  },
];

export const EFFECTS = [
  {
    slug: "krynn-renegade", img: "modules/krynn-pf2e/icons/renegade.svg",
    name: { en: "Renegade", pt: "Renegado" },
    description: {
      en: p("This mage practises outside the Orders of High Sorcery, or has broken their laws. The Orders hunt renegades; the moons give them nothing (no effect of moon magic applies).",
        "Remove this effect when the mage is accepted by an order."),
      pt: p("Este mago pratica fora das Ordens da Alta Feitiçaria, ou quebrou suas leis. As Ordens caçam os renegados; as luas não lhes dão nada (nenhum efeito da magia lunar se aplica).",
        "Remova este efeito quando o mago for aceito por uma ordem."),
    },
    rules: [{ key: "RollOption", domain: "all", option: "krynn:renegade" }],
  },
];

// The guides: what the players and the GM need to know, in a few pages each.
export const JOURNALS = [
  {
    slug: "magic-of-krynn", name: { en: "The Magic of Krynn", pt: "A Magia de Krynn" },
    pages: [
      { slug: "moons", name: { en: "The three moons", pt: "As três luas" }, text: {
        en: p("Three moons cross the sky of Krynn. Solinari, the white, turns in 36 days; Lunitari, the red, in 28; Nuitari, the black, in 8. Most people know only two: Nuitari is seen by the Black Robes alone, and by everyone on the Night of the Eye.",
          "Each moon passes through four phases of a quarter of its turn each: <strong>High Sanction</strong> (full), <strong>Waning</strong>, <strong>Low Sanction</strong> (new) and <strong>Waxing</strong>. When two moons stand close together they are in alignment. Once every 504 days all three are full together: the <strong>Night of the Eye</strong>.",
          "Click the banner at the top of the screen to see tonight's sky."),
        pt: p("Três luas cruzam o céu de Krynn. Solinari, a branca, dá a volta em 36 dias; Lunitari, a vermelha, em 28; Nuitari, a negra, em 8. A maioria das pessoas conhece só duas: Nuitari só é vista pelos Mantos Negros, e por todos na Noite do Olho.",
          "Cada lua passa por quatro fases, cada uma de um quarto da volta: <strong>Alto Santuário</strong> (cheia), <strong>Minguante</strong>, <strong>Baixo Santuário</strong> (nova) e <strong>Crescente</strong>. Quando duas luas ficam próximas, estão em alinhamento. Uma vez a cada 504 dias as três ficam cheias juntas: a <strong>Noite do Olho</strong>.",
          "Clique na faixa no alto da tela para ver o céu desta noite.") } },
      { slug: "orders", name: { en: "The Orders of High Sorcery", pt: "As Ordens da Alta Feitiçaria" }, text: {
        en: p("Arcane magic on Krynn belongs to the three Orders. A mage takes the feat <strong>Mage of High Sorcery</strong> (in the compendium Krynn: Magic) and chooses an order: the White Robes of Solinari, the Red Robes of Lunitari or the Black Robes of Nuitari.",
          "With <strong>classic</strong> moon magic, the mage's own moon gives each day: High Sanction, +1 status bonus to spell attack rolls and spell DCs; Waxing and Waning, nothing; Low Sanction, a −1 status penalty. An alignment with another moon adds 1 (at most +2). The Night of the Eye gives +2 to every mage of the Orders.",
          "With <strong>light</strong> moon magic only High Sanction (+1) and the Eye (+2) count. With <strong>narrative</strong> moon magic the effect only describes the night. The GM chooses in Settings → Krynn, and from which level the moons start to matter.",
          "Apprentices take <strong>The Test of High Sorcery</strong> when the GM says they are ready. A mage outside the Orders is a <strong>Renegade</strong> (an effect in the compendium): the moons do nothing for them, and the Orders hunt them."),
        pt: p("A magia arcana em Krynn pertence às três Ordens. O mago escolhe o talento <strong>Mago da Alta Feitiçaria</strong> (no compêndio Krynn: Magia) e uma ordem: os Mantos Brancos de Solinari, os Mantos Vermelhos de Lunitari ou os Mantos Negros de Nuitari.",
          "Com a magia lunar <strong>clássica</strong>, a lua do próprio mago dá a cada dia: Alto Santuário, +1 de bônus de status nas jogadas de ataque e CDs de magia; Crescente e Minguante, nada; Baixo Santuário, −1 de penalidade de status. Um alinhamento com outra lua soma 1 (no máximo +2). A Noite do Olho dá +2 a todo mago das Ordens.",
          "Com a magia lunar <strong>leve</strong> só contam o Alto Santuário (+1) e o Olho (+2). Com a magia lunar <strong>narrativa</strong> o efeito só descreve a noite. O mestre escolhe em Configurações → Krynn, e a partir de qual nível as luas passam a contar.",
          "Os aprendizes fazem <strong>O Teste da Alta Feitiçaria</strong> quando o mestre diz que estão prontos. Um mago fora das Ordens é um <strong>Renegado</strong> (um efeito no compêndio): as luas não fazem nada por ele, e as Ordens o caçam.") } },
      { slug: "gods", name: { en: "The gods, age by age", pt: "Os deuses, era a era" }, text: {
        en: p("The true gods do not always answer. After the Cataclysm they are silent until 351 AC, when the Disks of Mishakal are found; they leave again after the Chaos War (383 AC) and return with the War of Souls (421 AC).",
          "While they are absent, a caster whose divine spells come from a god finds them silent. The GM chooses what that means in Settings → Krynn: <strong>strict</strong> (the spell fails and nothing is spent), <strong>warn</strong> (it works, and the GM is told) or <strong>off</strong>.",
          "The gods of Krynn are in the compendium Krynn: Gods, with their domains, fonts, sanctification and favoured weapons."),
        pt: p("Os verdadeiros deuses nem sempre respondem. Depois do Cataclismo eles se calam até 351 DC, quando os Discos de Mishakal são encontrados; partem de novo depois da Guerra do Caos (383 DC) e voltam com a Guerra das Almas (421 DC).",
          "Enquanto estão ausentes, um conjurador cujas magias divinas vêm de um deus encontra silêncio. O mestre escolhe o que isso significa em Configurações → Krynn: <strong>estrita</strong> (a magia falha e nada é gasto), <strong>aviso</strong> (ela funciona, e o mestre é avisado) ou <strong>desligada</strong>.",
          "Os deuses de Krynn estão no compêndio Krynn: Deuses, com seus domínios, fontes, santificação e armas favoritas.") } },
      { slug: "mortals", name: { en: "Magic in the Age of Mortals", pt: "A magia na Era dos Mortais" }, text: {
        en: p("From 384 to 420 AC the gods and the moons of magic are gone. Two new magics fill the silence:",
          "<strong>Mysticism</strong>, the power of the heart taught at the Citadel of Light: a divine caster with the feat <strong>Mystic of the Heart</strong> keeps their spells without a god.",
          "<strong>Primal sorcery</strong>, the wild magic of the world: an arcane caster with the feat <strong>Primal Sorcerer</strong> keeps their spells without the moons.",
          "Mages of the Orders without primal sorcery find High Sorcery failing (strict) or uncertain (warn), as the GM chose."),
        pt: p("De 384 a 420 DC os deuses e as luas da magia se foram. Duas magias novas preenchem o silêncio:",
          "O <strong>misticismo</strong>, o poder do coração ensinado na Cidadela da Luz: um conjurador divino com o talento <strong>Místico do Coração</strong> mantém suas magias sem um deus.",
          "A <strong>feitiçaria primordial</strong>, a magia selvagem do mundo: um conjurador arcano com o talento <strong>Feiticeiro Primordial</strong> mantém suas magias sem as luas.",
          "Magos das Ordens sem a feitiçaria primordial veem a Alta Feitiçaria falhar (estrita) ou vacilar (aviso), conforme o mestre escolheu.") } },
    ],
  },
  {
    slug: "test-of-high-sorcery", name: { en: "The Test of High Sorcery (GM)", pt: "O Teste da Alta Feitiçaria (mestre)" }, gmOnly: true,
    pages: [
      { slug: "before", name: { en: "Before the Test", pt: "Antes do Teste" }, text: {
        en: p("The Test is not an exam. It is a crossing a mage makes once, in a Tower of High Sorcery, before the conclave of the three Orders, and it is built for that one mage: their fears, their loves, the thing they would sell their soul for.",
          "Call it when an apprentice has shown real power, usually around level 3 to 5, or when the story needs them to choose. Tell the player only that the Tower is waiting, and that some do not come back."),
        pt: p("O Teste não é uma prova. É uma travessia que o mago faz uma única vez, numa Torre da Alta Feitiçaria, diante do conclave das três Ordens, e ela é feita para aquele mago: seus medos, seus amores, aquilo por que venderia a alma.",
          "Chame-o quando um aprendiz mostrar poder de verdade, em geral por volta do nível 3 a 5, ou quando a história precisar que ele escolha. Diga ao jogador apenas que a Torre está esperando, e que alguns não voltam.") } },
      { slug: "trials", name: { en: "Building the trials", pt: "Montando as provas" }, text: {
        en: p("Build three trials from the character's own life (their Chronicle's threads are a good place to start):",
          "<strong>A trial of power</strong>: a spell they must cast at the edge of what they can, against a real cost. Use a hard check against their class DC, or a spell they have not yet mastered.",
          "<strong>A trial of the heart</strong>: someone they love, or the memory of them, asks for something the Orders forbid. There is no right answer, only the one they give.",
          "<strong>A trial of the self</strong>: they meet what they could become. A White Robe meets their cruelty, a Black Robe their mercy, a Red Robe the side they refuse to take.",
          "The robes are not chosen before the Test; the Test shows which ones fit. The mage may leave in a colour they did not expect."),
        pt: p("Monte três provas a partir da vida do próprio personagem (os ganchos da Crônica dele são um bom começo):",
          "<strong>Uma prova de poder</strong>: uma magia que ele precisa lançar no limite do que consegue, com um custo real. Use um teste difícil contra a CD de classe dele, ou uma magia que ele ainda não domina.",
          "<strong>Uma prova do coração</strong>: alguém que ele ama, ou a lembrança dessa pessoa, pede algo que as Ordens proíbem. Não há resposta certa, só a que ele der.",
          "<strong>Uma prova de si</strong>: ele encontra aquilo em que poderia se tornar. Um Manto Branco encontra sua crueldade, um Manto Negro sua misericórdia, um Manto Vermelho o lado que se recusa a tomar.",
          "Os mantos não são escolhidos antes do Teste; o Teste mostra quais servem. O mago pode sair com uma cor que não esperava.") } },
      { slug: "price", name: { en: "The price, and after", pt: "O preço, e depois" }, text: {
        en: p("Everyone pays something. Choose one, from what happened in the trials: a lasting mark (eyes, skin, voice), a weakened body (a −1 to Fortitude saves until they earn it back), a debt to someone in the Tower, or a memory lost.",
          "Those who fail and survive may not try again for a long time; those who refuse the Test and keep casting become renegades.",
          "When it is done, give the character the feat <strong>The Test of High Sorcery</strong>, and set their order on <strong>Mage of High Sorcery</strong> if the Test changed it. Their robes are now worn openly."),
        pt: p("Todo mundo paga alguma coisa. Escolha um, a partir do que aconteceu nas provas: uma marca duradoura (olhos, pele, voz), um corpo enfraquecido (−1 nos testes de Fortitude até ele recuperar), uma dívida com alguém da Torre, ou uma lembrança perdida.",
          "Quem falha e sobrevive não pode tentar de novo por muito tempo; quem recusa o Teste e continua conjurando se torna renegado.",
          "Quando terminar, dê ao personagem o talento <strong>O Teste da Alta Feitiçaria</strong>, e ajuste a ordem em <strong>Mago da Alta Feitiçaria</strong> se o Teste a mudou. Agora seus mantos são usados abertamente.") } },
    ],
  },
];
