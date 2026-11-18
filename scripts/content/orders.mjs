// 0.4 content: the knightly orders, as PF2e archetypes. Written for this module; English and Portuguese.
const p = (...lines) => lines.map((l) => `<p>${l}</p>`).join("");
const train = (skill) => ({ key: "ActiveEffectLike", mode: "upgrade", path: `system.skills.${skill}.rank`, value: 1 });

export const ORDER_FEATS = [
  { slug: "knight-of-solamnia-dedication", level: 2, traits: ["archetype", "dedication", "solamnic-knight"], img: "modules/krynn-pf2e/icons/kingfisher.svg",
    name: { en: "Knight of Solamnia Dedication", pt: "Dedicação de Cavaleiro de Solamnia" },
    description: {
      en: p("You have sworn the Oath, <em>my honour is my life</em>, and live by the Measure, the long code of the Knights of Solamnia. Choose your order: the Crown (loyalty and obedience), the Sword (courage) or the Rose (wisdom and justice). Most knights begin in the Crown; rising to the Sword or the Rose is the GM's to grant.",
        "You become trained in Diplomacy and in Knighthood Lore (tell your GM if you already are). Breaking the Measure has consequences: the GM may give you the Breach of the Measure effect until you do penance."),
      pt: p("Você fez o Juramento, <em>minha honra é minha vida</em>, e vive pela Medida, o longo código dos Cavaleiros de Solamnia. Escolha sua ordem: a Coroa (lealdade e obediência), a Espada (coragem) ou a Rosa (sabedoria e justiça). A maioria dos cavaleiros começa na Coroa; subir para a Espada ou a Rosa é o mestre quem concede.",
        "Você fica treinado em Diplomacia e em Conhecimento de Cavalaria (avise o mestre se já for). Quebrar a Medida tem consequências: o mestre pode dar o efeito Quebra da Medida até você cumprir a penitência."),
    },
    prerequisites: { en: ["trained in Athletics or Religion"], pt: ["treinado em Atletismo ou Religião"] },
    rules: [
      { key: "ChoiceSet", flag: "knightOrder", prompt: "KRYNN.Knight.ChooseOrder", choices: [
        { value: "crown", label: "KRYNN.Knight.crown" }, { value: "sword", label: "KRYNN.Knight.sword" }, { value: "rose", label: "KRYNN.Knight.rose" }] },
      { key: "RollOption", domain: "all", option: "krynn:knight" },
      { key: "RollOption", domain: "all", option: "krynn:knight:{item|flags.system.rulesSelections.knightOrder}" },
      train("diplomacy"),
    ] },
  { slug: "crowns-vigilance", level: 4, traits: ["archetype", "solamnic-knight"], img: "modules/krynn-pf2e/icons/kingfisher.svg",
    name: { en: "Crown's Vigilance", pt: "Vigilância da Coroa" },
    description: { en: p("You are loyal first. While you are protecting someone in your charge (turn on the toggle), you gain a +2 circumstance bonus to Perception checks for initiative."),
      pt: p("Você é leal antes de tudo. Enquanto protege alguém sob sua guarda (ligue a opção), recebe +2 de bônus circunstancial em testes de Percepção para iniciativa.") },
    prerequisites: { en: ["Knight of Solamnia Dedication (Crown)"], pt: ["Dedicação de Cavaleiro de Solamnia (Coroa)"] },
    rules: [
      { key: "RollOption", domain: "all", option: "krynn-guarding", toggleable: true, label: "KRYNN.Knight.Guarding" },
      { key: "FlatModifier", selector: "initiative", type: "circumstance", value: 2, predicate: ["krynn-guarding"], label: "KRYNN.Knight.CrownsVigilance" },
    ] },
  { slug: "swords-courage", level: 4, traits: ["archetype", "solamnic-knight"], img: "modules/krynn-pf2e/icons/kingfisher.svg",
    name: { en: "Sword's Courage", pt: "Coragem da Espada" },
    description: { en: p("Fear finds little purchase in you. You gain a +1 status bonus to saving throws against fear effects, and when you would become frightened, reduce the value by 1 (the GM applies it)."),
      pt: p("O medo encontra pouco espaço em você. Você recebe +1 de bônus de status em testes de resistência contra efeitos de medo, e quando ficaria amedrontado, reduz o valor em 1 (o mestre aplica).") },
    prerequisites: { en: ["Knight of Solamnia Dedication (Sword)"], pt: ["Dedicação de Cavaleiro de Solamnia (Espada)"] },
    rules: [{ key: "FlatModifier", selector: "saving-throw", type: "status", value: 1, predicate: ["item:trait:fear"], label: "KRYNN.Knight.SwordsCourage" }] },
  { slug: "roses-judgement", level: 4, traits: ["archetype", "solamnic-knight"], img: "modules/krynn-pf2e/icons/kingfisher.svg",
    name: { en: "Rose's Judgement", pt: "Juízo da Rosa" },
    description: { en: p("You weigh what is just before what is lawful. You gain a +1 circumstance bonus to Perception checks to Sense Motive."),
      pt: p("Você pesa o que é justo antes do que é lícito. Você recebe +1 de bônus circunstancial em testes de Percepção para Sentir Motivação.") },
    prerequisites: { en: ["Knight of Solamnia Dedication (Rose)"], pt: ["Dedicação de Cavaleiro de Solamnia (Rosa)"] },
    rules: [{ key: "FlatModifier", selector: "perception", type: "circumstance", value: 1, predicate: ["action:sense-motive"], label: "KRYNN.Knight.RosesJudgement" }] },
  { slug: "knight-of-takhisis-dedication", level: 2, traits: ["archetype", "dedication", "dark-knight"], img: "modules/krynn-pf2e/icons/lily.svg",
    name: { en: "Knight of Takhisis Dedication", pt: "Dedicação de Cavaleiro de Takhisis" },
    description: {
      en: p("You serve the Vision of the Dark Queen (after her departure, the knights are the Knights of Neraka). Choose your order: the Lily (warriors), the Skull (priests and inquisitors) or the Thorn (the grey-robed sorcerers).",
        "You become trained in Intimidation. Your order expects obedience; the GM may call on it."),
      pt: p("Você serve à Visão da Rainha das Trevas (depois que ela parte, os cavaleiros são os Cavaleiros de Neraka). Escolha sua ordem: o Lírio (guerreiros), a Caveira (sacerdotes e inquisidores) ou o Espinho (os feiticeiros de manto cinza).",
        "Você fica treinado em Intimidação. Sua ordem espera obediência; o mestre pode cobrá-la."),
    },
    prerequisites: { en: ["trained in Athletics, Religion or Arcana"], pt: ["treinado em Atletismo, Religião ou Arcanismo"] },
    rules: [
      { key: "ChoiceSet", flag: "darkOrder", prompt: "KRYNN.Knight.ChooseOrder", choices: [
        { value: "lily", label: "KRYNN.Knight.lily" }, { value: "skull", label: "KRYNN.Knight.skull" }, { value: "thorn", label: "KRYNN.Knight.thorn" }] },
      { key: "RollOption", domain: "all", option: "krynn:dark-knight" },
      { key: "RollOption", domain: "all", option: "krynn:dark-knight:{item|flags.system.rulesSelections.darkOrder}" },
      train("intimidation"),
    ] },
  { slug: "lilys-menace", level: 4, traits: ["archetype", "dark-knight"], img: "modules/krynn-pf2e/icons/lily.svg",
    name: { en: "Lily's Menace", pt: "Ameaça do Lírio" },
    description: { en: p("Your presence on the field is a threat in itself. You gain a +1 circumstance bonus to Intimidation checks to Demoralize."),
      pt: p("Sua presença no campo já é uma ameaça. Você recebe +1 de bônus circunstancial em testes de Intimidação para Desmoralizar.") },
    prerequisites: { en: ["Knight of Takhisis Dedication (Lily)"], pt: ["Dedicação de Cavaleiro de Takhisis (Lírio)"] },
    rules: [{ key: "FlatModifier", selector: "intimidation", type: "circumstance", value: 1, predicate: ["action:demoralize"], label: "KRYNN.Knight.LilysMenace" }] },
];

export const ORDER_EFFECTS = [
  { slug: "krynn-breach-of-the-measure", img: "modules/krynn-pf2e/icons/kingfisher.svg",
    name: { en: "Breach of the Measure", pt: "Quebra da Medida" },
    description: { en: p("This knight has broken the Measure and not yet done penance. They take a −1 status penalty to Diplomacy checks with Knights of Solamnia, and the order may refuse them aid. Remove the effect when the penance is done."),
      pt: p("Este cavaleiro quebrou a Medida e ainda não cumpriu a penitência. Ele sofre −1 de penalidade de status em testes de Diplomacia com Cavaleiros de Solamnia, e a ordem pode lhe negar ajuda. Remova o efeito quando a penitência for cumprida.") },
    rules: [{ key: "RollOption", domain: "all", option: "krynn:breach" }] },
];

// Factions for the standing tracker: ids, names, and whether they exist in a year.
export const FACTIONS = [
  ["knights-of-solamnia", "Knights of Solamnia", "Cavaleiros de Solamnia"],
  ["knights-of-takhisis", "Knights of Takhisis (of Neraka)", "Cavaleiros de Takhisis (de Neraka)"],
  ["orders-of-high-sorcery", "Orders of High Sorcery", "Ordens da Alta Feitiçaria"],
  ["legion-of-steel", "Legion of Steel", "Legião do Aço"],
  ["citadel-of-light", "Citadel of Light", "Cidadela da Luz"],
  ["dragonarmies", "The Dragonarmies", "Os Exércitos Dracônicos"],
  ["qualinesti", "The Qualinesti", "Os Qualinesti"],
  ["silvanesti", "The Silvanesti", "Os Silvanesti"],
  ["thorbardin", "The Kingdom of Thorbardin", "O Reino de Thorbardin"],
  ["mount-nevermind", "The Guilds of Mount Nevermind", "As Guildas de Mount Nevermind"],
  ["thieves-guild", "A thieves' guild", "Uma guilda de ladrões"],
  ["seekers", "The Seekers", "Os Buscadores"],
].map(([id, en, pt]) => ({ id, name: { en, pt } }));
