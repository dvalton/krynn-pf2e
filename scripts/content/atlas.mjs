// 0.6 content: the Atlas of Ansalon. Written for this module from Lifewrought's region notes, rewritten for play
// (never copied from Dragonlance books). English and Brazilian Portuguese.
// Each region: land and people, through the ages, hooks, and its main cities. The places page and the live
// "now" line come from Lifewrought's data (see logic/atlas.mjs).

export const REGIONS = [
  { id: "abanasinia", name: { en: "Abanasinia", pt: "Abanasinia" },
    land: { en: "Rolling plains, the vallenwood forests around Crystalmir Lake and the hills that climb towards the elves of Qualinesti. Humans of the towns live beside the Plainsmen tribes, the Que-Shu, Que-Kiri and Que-Teh, who keep their ancestors' ways. Solace, built up in the vallenwood trees, sits on the road between everywhere.",
      pt: "Planícies onduladas, as florestas de vallenwood em volta do Lago Crystalmir e as colinas que sobem até os elfos de Qualinesti. Os humanos das cidades vivem ao lado das tribos das Planícies, os Que-Shu, Que-Kiri e Que-Teh, que guardam os costumes dos antepassados. Solace, construída no alto das árvores, fica na estrada entre todos os lugares." },
    ages: { en: "For three centuries after the Cataclysm, the land waited for gods who didn't answer, and the Seekers of Haven filled the silence with new ones. In 351 the Red Dragonarmy came: Que-Shu burned, Solace was taken, and the Highlord Verminaard ruled from Pax Tharkas until the slaves rose. After the war the gods' temples returned. In the Age of Mortals the green overlord Beryl took the forest and the plains below it.",
      pt: "Por três séculos depois do Cataclismo, a terra esperou por deuses que não respondiam, e os Buscadores de Haven encheram o silêncio com outros. Em 351 veio o Exército Dracônico Vermelho: Que-Shu queimou, Solace foi tomada, e o Senhor Dracônico Verminaard governou de Pax Tharkas até os escravos se levantarem. Depois da guerra, os templos dos deuses voltaram. Na Era dos Mortais, a senhora suprema verde Beryl tomou a floresta e as planícies abaixo dela." },
    hooks: [
      { en: "A Plainsman healer asks the heroes to carry a blue crystal shard to a council of chieftains who don't trust each other.", pt: "Uma curandeira das Planícies pede aos heróis que levem um fragmento de cristal azul a um conselho de chefes que não confiam uns nos outros." },
      { en: "A Seeker priest in Haven pays well to find whoever is spreading talk of the old gods.", pt: "Um sacerdote Buscador em Haven paga bem para achar quem anda espalhando conversa sobre os velhos deuses." },
      { en: "Darken Wood's spirits stop a caravan, and won't let it pass until someone answers for an old promise.", pt: "Os espíritos de Darken Wood param uma caravana, e não a deixam passar até alguém responder por uma promessa antiga." },
    ],
    cities: [{ id: "solace", name: "Solace", text: { en: "A town of houses and bridges built up in the vallenwood trees, with the Inn of the Last Home at its heart: a place where travellers from everywhere tell what they've seen, and where stories start.", pt: "Uma cidade de casas e pontes construídas no alto das árvores de vallenwood, com a Pousada do Último Lar no centro: um lugar onde viajantes de toda parte contam o que viram, e onde as histórias começam." } }] },

  { id: "qualinesti", name: { en: "Qualinesti", pt: "Qualinesti" },
    land: { en: "The forest kingdom of the western elves, their capital Qualinost of quartz towers joined by bridges of metal. The Qualinesti trade with humans more than their eastern kin, and argue about it more. Their Speaker of the Sun rules with the Thalas-Enthia, the senate of the great families.",
      pt: "O reino florestal dos elfos do oeste, com a capital Qualinost de torres de quartzo unidas por pontes de metal. Os Qualinesti fazem comércio com humanos mais que os parentes do leste, e discutem mais sobre isso. O Orador do Sol governa com o Thalas-Enthia, o senado das grandes famílias." },
    ages: { en: "Closed to outsiders for most of the years after the Cataclysm, Qualinesti was abandoned in 351 as the dragonarmies came: its people fled across the sea to Southern Ergoth and returned after the war. The Knights of Takhisis occupied it after the Chaos War, and the green overlord Beryl ruled it through them. In 421 Qualinost was drowned, taking the dragon with it, and the Qualinesti went into exile again.",
      pt: "Fechada a estrangeiros na maior parte dos anos depois do Cataclismo, Qualinesti foi abandonada em 351 com a chegada dos exércitos dracônicos: seu povo fugiu pelo mar para Ergoth do Sul e voltou depois da guerra. Os Cavaleiros de Takhisis a ocuparam depois da Guerra do Caos, e a senhora suprema verde Beryl a governou por meio deles. Em 421 Qualinost foi afogada, levando o dragão junto, e os Qualinesti partiram de novo para o exílio." },
    hooks: [
      { en: "A human merchant was promised safe passage to Qualinost by a prince; the senate never heard of the promise.", pt: "Um mercador humano recebeu de um príncipe a promessa de passagem segura até Qualinost; o senado nunca ouviu falar dela." },
      { en: "Under the occupation, a resistance cell needs messages carried past the Dark Knights' patrols.", pt: "Sob a ocupação, uma célula da resistência precisa levar mensagens além das patrulhas dos Cavaleiros Sombrios." },
      { en: "An exile's family heirloom was left behind in a house now held by an enemy.", pt: "A herança de família de um exilado ficou numa casa agora ocupada por um inimigo." },
    ],
    cities: [{ id: "qualinost", name: "Qualinost", text: { en: "The capital of the western elves: four slender towers at the corners, bridges of silvery metal between them, and the Tower of the Sun at the centre, where the Speaker sits.", pt: "A capital dos elfos do oeste: quatro torres esguias nos cantos, pontes de metal prateado entre elas, e a Torre do Sol no centro, onde fica o Orador." } }] },

  { id: "silvanesti", name: { en: "Silvanesti", pt: "Silvanesti" },
    land: { en: "The oldest elven nation, in the eastern forests along the Thon-Thalas river. The Silvanesti keep the Houses, castes of craft and duty, and believe their ways are the right ones. Their rangers, the kirath, guard the borders where the rest of the elves won't go.",
      pt: "A nação élfica mais antiga, nas florestas do leste ao longo do rio Thon-Thalas. Os Silvanesti mantêm as Casas, castas de ofício e dever, e acreditam que seus costumes são os certos. Seus batedores, os kirath, guardam as fronteiras por onde os outros elfos não vão." },
    ages: { en: "When the dragonarmies came, King Lorac used a dragon orb to save his land, and it held him in a nightmare that twisted the whole forest. The Silvanesti fled; after the war they came back to reclaim it. Later a magical shield sealed the kingdom from the world, until it fell in the War of Souls and the minotaurs took the land.",
      pt: "Quando os exércitos dracônicos chegaram, o rei Lorac usou um orbe do dragão para salvar sua terra, e ele o prendeu num pesadelo que retorceu a floresta inteira. Os Silvanesti fugiram; depois da guerra voltaram para retomá-la. Mais tarde um escudo mágico selou o reino do mundo, até cair na Guerra das Almas e os minotauros tomarem a terra." },
    hooks: [
      { en: "The kirath need someone who isn't Silvanesti to walk a stretch of the nightmare forest and report what still moves there.", pt: "Os kirath precisam de alguém que não seja Silvanesti para andar por um trecho da floresta do pesadelo e contar o que ainda se mexe lá." },
      { en: "A House's young heir wants to marry outside her caste, and both families want the heroes to stop it.", pt: "A jovem herdeira de uma Casa quer se casar fora da sua casta, e as duas famílias querem que os heróis impeçam." },
      { en: "Something beneath the shield is making the trees sicken.", pt: "Algo sob o escudo está fazendo as árvores adoecerem." },
    ],
    cities: [{ id: "silvanost", name: "Silvanost", text: { en: "The white city of the Silvanesti, its gardens and towers shaped by magic, and the Tower of the Stars where the elven kings are crowned.", pt: "A cidade branca dos Silvanesti, com jardins e torres moldados por magia, e a Torre das Estrelas onde os reis élficos são coroados." } }] },

  { id: "thorbardin", name: { en: "Thorbardin and the Kharolis Mountains", pt: "Thorbardin e as Montanhas Kharolis" },
    land: { en: "The great dwarven kingdom under the mountains: a lake inside the rock, cities on its shores, and the clans, Hylar, Daewar, Theiwar, Daergar and Klar, each in its own city. The Neidar, the hill dwarves, live outside, in villages like Hillhome, and remember being shut out.",
      pt: "O grande reino anão sob as montanhas: um lago dentro da rocha, cidades nas margens, e os clãs, Hylar, Daewar, Theiwar, Daergar e Klar, cada um na sua cidade. Os Neidar, os anões das colinas, vivem do lado de fora, em vilas como Hillhome, e lembram de terem sido deixados para fora." },
    ages: { en: "Thorbardin closed its gates during the Dwarfgate War, after the Cataclysm, and stayed sealed for three centuries. In 351 it opened them to let in the refugees of Pax Tharkas, and the Red Dragonarmy besieged Northgate. The Hammer of Kharas was found again. In the Chaos War the kingdom was ravaged from within, and in the Age of Mortals it sealed itself again against the dragons.",
      pt: "Thorbardin fechou os portões na Guerra do Portão Anão, depois do Cataclismo, e ficou selada por três séculos. Em 351 os abriu para os refugiados de Pax Tharkas, e o Exército Dracônico Vermelho sitiou o Portão Norte. O Martelo de Kharas foi encontrado de novo. Na Guerra do Caos o reino foi devastado por dentro, e na Era dos Mortais se selou de novo contra os dragões." },
    hooks: [
      { en: "A Theiwar thane offers to open a side gate for the heroes, for a favour he won't name yet.", pt: "Um thane Theiwar se oferece para abrir um portão lateral para os heróis, por um favor que ainda não diz qual é." },
      { en: "A Neidar elder wants an old debt from the mountain dwarves repaid before he dies.", pt: "Um ancião Neidar quer que uma dívida antiga dos anões da montanha seja paga antes de morrer." },
      { en: "The Northgate watch heard digging on the other side of a wall that should be solid rock.", pt: "A guarda do Portão Norte ouviu escavação do outro lado de uma parede que deveria ser rocha sólida." },
    ],
    cities: [{ id: "thorbardin", name: "Thorbardin", text: { en: "The Life-Tree of the Hylar, a city carved downward in a great stalactite over the Urkhan Sea, with the other clan cities around the lake and the Valley of the Thanes where the kings lie.", pt: "A Árvore da Vida dos Hylar, uma cidade esculpida para baixo numa grande estalactite sobre o Mar Urkhan, com as outras cidades dos clãs em volta do lago e o Vale dos Thanes onde os reis descansam." } }] },

  { id: "solamnia", name: { en: "Solamnia", pt: "Solamnia" },
    land: { en: "The human heartland of the north-west: plains of grain and cattle along the Vingaard river, the mountains of Vingaard, Dargaard and Garnet, and the provinces that broke apart after the Cataclysm. It is the home of the Knights of Solamnia, of Palanthas the Beautiful, and of hill dwarves in Garnet who trade with Kayolin.",
      pt: "O coração humano do noroeste: planícies de grãos e gado ao longo do rio Vingaard, as montanhas de Vingaard, Dargaard e Garnet, e as províncias que se separaram depois do Cataclismo. É a terra dos Cavaleiros de Solamnia, de Palanthas, a Bela, e de anões das colinas em Garnet que negociam com Kayolin." },
    ages: { en: "Blamed for the Cataclysm, the Knights were despised for three centuries; Solanthus expelled them in 300 AC. In 351 the Blue and Red Dragonarmies overran the plains, and the Knights held the High Clerist's Tower through the winter. Laurana, the Golden General, freed Solamnia in 352. In 383 the Knights of Takhisis invaded; in the Age of Mortals the north fell under the blue overlord.",
      pt: "Culpados pelo Cataclismo, os Cavaleiros foram desprezados por três séculos; Solanthus os expulsou em 300 DC. Em 351 os Exércitos Dracônicos Azul e Vermelho tomaram as planícies, e os Cavaleiros seguraram a Torre do Alto Clérigo durante o inverno. Laurana, a General Dourada, libertou Solamnia em 352. Em 383 os Cavaleiros de Takhisis invadiram; na Era dos Mortais o norte caiu sob o senhor supremo azul." },
    hooks: [
      { en: "A village in Hinterlund hides an old Knight who refuses to admit what he is.", pt: "Uma vila de Hinterlund esconde um velho Cavaleiro que se recusa a admitir o que é." },
      { en: "Grain carts to Palanthas are disappearing on the road, and the guild blames the Knights.", pt: "Carroças de grãos para Palanthas estão sumindo na estrada, e a guilda culpa os Cavaleiros." },
      { en: "In Nightlund, a family asks the heroes to bring back a son who went towards Dargaard Keep.", pt: "Em Nightlund, uma família pede aos heróis que tragam de volta um filho que foi para o lado do Forte Dargaard." },
    ],
    cities: [{ id: "palanthas", name: "Palanthas", text: { en: "Palanthas the Beautiful: an Old City laid out like a wheel around the Lord's palace, the New City outside its walls, the Great Library of Astinus, and the Tower of High Sorcery that no one goes near.", pt: "Palanthas, a Bela: uma Cidade Velha desenhada como uma roda em volta do palácio do Senhor, a Cidade Nova fora das muralhas, a Grande Biblioteca de Astinus, e a Torre da Alta Feitiçaria de que ninguém se aproxima." } }] },

  { id: "kalaman", name: { en: "Kalaman", pt: "Kalaman" },
    land: { en: "A free merchant city at the mouth of the Vingaard, with the farms of its plain and the hamlets under the Dargaard Mountains. Kalaman counts in four-week months and trusts coin more than kings.",
      pt: "Uma cidade mercante livre na foz do Vingaard, com as fazendas da sua planície e os povoados sob as Montanhas Dargaard. Kalaman conta em meses de quatro semanas e confia mais em moedas do que em reis." },
    ages: { en: "The dragonarmies took the city in 351 and held it until 352, when the Whitestone armies freed it. Kalaman rebuilt quickly and grew rich; much later it asked to join the new Empire of Solamnia.",
      pt: "Os exércitos dracônicos tomaram a cidade em 351 e a seguraram até 352, quando os exércitos da Pedra Branca a libertaram. Kalaman se reconstruiu rápido e enriqueceu; muito depois pediu para entrar no novo Império de Solamnia." },
    hooks: [
      { en: "A ship's captain needs a crew for a run past the dragonarmy patrols on the estuary.", pt: "Um capitão precisa de tripulação para passar pelas patrulhas do exército dracônico no estuário." },
      { en: "A merchant house is paying ransom to someone who claims to hold its heir in Dargaard's shadow.", pt: "Uma casa mercante está pagando resgate a alguém que diz manter seu herdeiro à sombra de Dargaard." },
      { en: "The city celebrates its liberation every year; this year someone means to ruin the parade.", pt: "A cidade comemora sua libertação todo ano; este ano alguém pretende estragar o desfile." },
    ],
    cities: [{ id: "kalaman", name: "Kalaman", text: { en: "Walled, busy and proud, Kalaman's harbour fills with ships from every coast, and its council of merchants argues about everything except money.", pt: "Murada, movimentada e orgulhosa, o porto de Kalaman se enche de navios de todas as costas, e seu conselho de mercadores discute tudo, menos dinheiro." } }] },

  { id: "sancrist", name: { en: "Sancrist", pt: "Sancrist" },
    land: { en: "An island west of Solamnia: the Knights' last refuge in the bad years, the lands of Castle Uth Wistan, and Mount Nevermind, where the tinker gnomes build what nobody asked for.",
      pt: "Uma ilha a oeste de Solamnia: o último refúgio dos Cavaleiros nos anos ruins, as terras do Castelo Uth Wistan, e Mount Nevermind, onde os gnomos funileiros constroem o que ninguém pediu." },
    ages: { en: "While the Knights were despised on the mainland, Sancrist kept them. In 352 the Whitestone Council met here, elves, dwarves, gnomes and Knights, and agreed to fight the dragonarmies together. The gnomes never stopped building.",
      pt: "Enquanto os Cavaleiros eram desprezados no continente, Sancrist os acolheu. Em 352 o Conselho da Pedra Branca se reuniu aqui, elfos, anões, gnomos e Cavaleiros, e concordou em lutar junto contra os exércitos dracônicos. Os gnomos nunca pararam de construir." },
    hooks: [
      { en: "A gnome Guild wants witnesses for the trial of a device; the last witnesses are still in the infirmary.", pt: "Uma Guilda gnômica quer testemunhas para o teste de um aparelho; as últimas testemunhas ainda estão na enfermaria." },
      { en: "A delegate to the Whitestone Council needs protection from someone at the council itself.", pt: "Um delegado do Conselho da Pedra Branca precisa de proteção contra alguém do próprio conselho." },
      { en: "An old Knight's estate is claimed by two cousins, and the Measure says both are right.", pt: "As terras de um velho Cavaleiro são reivindicadas por dois primos, e a Medida diz que os dois têm razão." },
    ],
    cities: [{ id: "mount-nevermind", name: "Mount Nevermind", text: { en: "A hollow volcano full of gnomes, Guilds and noise. Lifts go up and down on steam, and sometimes come back.", pt: "Um vulcão oco cheio de gnomos, Guildas e barulho. Elevadores sobem e descem a vapor, e às vezes voltam." } }] },

  { id: "northern_ergoth", name: { en: "Northern Ergoth", pt: "Ergoth do Norte" },
    land: { en: "What is left of the old Empire of Ergoth, torn in two by the Cataclysm: an emperor and a senate in Gwynned, the kender nation of Hylo in the north, and Sikk'et Hul, a goblin province granted for service long ago. The capital of old, Daltigoth, lies across the water in ogre hands.",
      pt: "O que resta do velho Império de Ergoth, partido em dois pelo Cataclismo: um imperador e um senado em Gwynned, a nação kender de Hylo no norte, e Sikk'et Hul, uma província goblin concedida por serviços há muito tempo. A capital antiga, Daltigoth, fica do outro lado da água, nas mãos dos ogros." },
    ages: { en: "The empire missed the War of the Lance and argued about it for years. In 383 the irda's island nearby was destroyed and Chaos was released. In the Age of Mortals, refugees came from the frozen south, and a kender called Belladonna claimed Hylo.",
      pt: "O império ficou de fora da Guerra da Lança e discutiu isso por anos. Em 383 a ilha dos irda ali perto foi destruída e o Caos foi libertado. Na Era dos Mortais vieram refugiados do sul congelado, e uma kender chamada Belladonna reivindicou Hylo." },
    hooks: [
      { en: "A senator wants proof that Daltigoth can be retaken, and is willing to pay for a look.", pt: "Um senador quer provas de que Daltigoth pode ser retomada, e paga por uma olhada." },
      { en: "Goblins of Sikk'et Hul carry an imperial charter, and a lord who wants their land says it's forged.", pt: "Os goblins de Sikk'et Hul têm uma carta imperial, e um senhor que quer as terras deles diz que é falsa." },
      { en: "A kender in Hylo has found a map of the irda's island, and is happy to show everyone.", pt: "Um kender em Hylo achou um mapa da ilha dos irda, e está feliz de mostrar para todo mundo." },
    ], cities: [] },

  { id: "southern_ergoth", name: { en: "Southern Ergoth", pt: "Ergoth do Sul" },
    land: { en: "An island of forests and cold plains: the Kagonesti in the woods, Ergothian villages in the north, goblin tribes on the plain, and ogres in the ruins of Daltigoth.",
      pt: "Uma ilha de florestas e planícies frias: os Kagonesti nos bosques, vilas ergothianas no norte, tribos goblins na planície, e ogros nas ruínas de Daltigoth." },
    ages: { en: "During the War of the Lance the elven nations lived here in exile, Qualimori and Silvamori, and treated the Kagonesti as servants. In the Age of Mortals the white overlord Gellidus buried the island under ice.",
      pt: "Durante a Guerra da Lança as nações élficas viveram aqui no exílio, Qualimori e Silvamori, e trataram os Kagonesti como servos. Na Era dos Mortais o senhor supremo branco Gellidus enterrou a ilha sob o gelo." },
    hooks: [
      { en: "A Kagonesti hunter was taken by exile elves for 'trespassing' in her own forest.", pt: "Uma caçadora Kagonesti foi presa por elfos exilados por 'invadir' a própria floresta." },
      { en: "A dragon orb is rumoured to lie in a frozen ruin to the south.", pt: "Dizem que um orbe do dragão está numa ruína congelada ao sul." },
      { en: "Under the ice, a whole village still lives in tunnels, and needs a way out.", pt: "Sob o gelo, uma vila inteira ainda vive em túneis, e precisa de uma saída." },
    ], cities: [] },

  { id: "khur", name: { en: "Khur", pt: "Khur" },
    land: { en: "A harsh, rocky land of nomad tribes and the city of Khuri-Khan, its markets full of what crosses the desert. Seven tribes, once united by a single khan, feud over wells.",
      pt: "Uma terra dura e pedregosa de tribos nômades e da cidade de Khuri-Khan, com mercados cheios do que atravessa o deserto. Sete tribos, um dia unidas por um só khan, brigam por poços." },
    ages: { en: "Salah of the Khur tribe crushed the tribes who resisted the dragonarmies, became Highlord of the Green Dragonarmy and khan of all, until 356; Matarc followed him. After 421, the Qualinesti in exile found shelter in the desert.",
      pt: "Salah, da tribo Khur, esmagou as tribos que resistiram aos exércitos dracônicos, tornou-se Senhor do Exército Dracônico Verde e khan de todos, até 356; Matarc o sucedeu. Depois de 421, os Qualinesti exilados acharam abrigo no deserto." },
    hooks: [
      { en: "Two tribes claim the same well; whoever the heroes side with, the other remembers.", pt: "Duas tribos reivindicam o mesmo poço; seja qual for o lado dos heróis, o outro lembra." },
      { en: "A caravan master hires guards for the salt road and doesn't say what's in the sealed wagon.", pt: "Um mestre de caravana contrata guardas para a estrada do sal e não diz o que tem na carroça lacrada." },
      { en: "Elven exiles need a guide who knows which khans can be trusted.", pt: "Elfos exilados precisam de um guia que saiba em quais khans se pode confiar." },
    ], cities: [] },

  { id: "neraka", name: { en: "Neraka and Taman Busuk", pt: "Neraka e Taman Busuk" },
    land: { en: "A hard, mountain-ringed land of herders and fortresses. Neraka, built around the Dark Queen's temple, was the dragonarmies' capital; Jelek and the hill villages supplied it.",
      pt: "Uma terra dura cercada de montanhas, de pastores e fortalezas. Neraka, construída em volta do templo da Rainha das Trevas, foi a capital dos exércitos dracônicos; Jelek e as vilas das colinas a abasteciam." },
    ages: { en: "From the 340s the Queen's armies gathered here; Neraka was the capital of the Dragon Empire until the temple fell in 352. It lay in ruins for thirty years, then became the seat of the Knights of Takhisis, later of Neraka.",
      pt: "A partir dos anos 340 os exércitos da Rainha se reuniram aqui; Neraka foi a capital do Império Dracônico até o templo cair em 352. Ficou em ruínas por trinta anos, e depois virou a sede dos Cavaleiros de Takhisis, mais tarde de Neraka." },
    hooks: [
      { en: "A deserter offers a map of the temple tunnels, if the heroes get her family out of Jelek first.", pt: "Uma desertora oferece um mapa dos túneis do templo, se os heróis tirarem primeiro a família dela de Jelek." },
      { en: "In the ruins, looters dig for the Highlords' treasure, and something digs back.", pt: "Nas ruínas, saqueadores cavam atrás do tesouro dos Senhores Dracônicos, e algo cava de volta." },
      { en: "A Dark Knight officer wants to defect, and wants the heroes to vouch for him.", pt: "Um oficial dos Cavaleiros Sombrios quer desertar, e quer que os heróis respondam por ele." },
    ],
    cities: [{ id: "neraka", name: "Neraka", text: { en: "A city of armies around the Temple of the Dark Queen: camps for each dragonarmy, markets of slaves and steel, and fear in every street.", pt: "Uma cidade de exércitos em volta do Templo da Rainha das Trevas: acampamentos de cada exército dracônico, mercados de escravos e aço, e medo em cada rua." } }] },

  { id: "sanction", name: { en: "Sanction", pt: "Sanction" },
    land: { en: "A harbour city in a valley of volcanoes, the Lords of Doom, where lava runs in channels the lava-wrights keep open. Hot, crowded and dangerous, it has always belonged to whoever is strongest.",
      pt: "Uma cidade portuária num vale de vulcões, os Senhores da Perdição, onde a lava corre em canais que os mestres da lava mantêm abertos. Quente, cheia e perigosa, sempre pertenceu a quem é mais forte." },
    ages: { en: "From the 330s to 352 Sanction was the dragonarmies' stronghold. In the Age of Mortals it was a free city under siege by the Dark Knights, until Mina's army took it in 421.",
      pt: "Dos anos 330 até 352 Sanction foi a fortaleza dos exércitos dracônicos. Na Era dos Mortais foi uma cidade livre sitiada pelos Cavaleiros Sombrios, até o exército de Mina tomá-la em 421." },
    hooks: [
      { en: "A lava channel is clogging, and the lava-wrights say it's sabotage.", pt: "Um canal de lava está entupindo, e os mestres da lava dizem que é sabotagem." },
      { en: "A shipment of steel leaves the harbour every new moon; nobody knows who pays for it.", pt: "Uma carga de aço deixa o porto a cada lua nova; ninguém sabe quem paga por ela." },
      { en: "The besieged city needs someone to carry a message through the enemy lines.", pt: "A cidade sitiada precisa de alguém para levar uma mensagem através das linhas inimigas." },
    ],
    cities: [{ id: "sanction", name: "Sanction", text: { en: "Smoke, lava light and the smell of sulphur over a harbour of every flag. Temples of every god stand here, and none of them is quiet.", pt: "Fumaça, a luz da lava e o cheiro de enxofre sobre um porto de todas as bandeiras. Templos de todos os deuses ficam aqui, e nenhum deles é silencioso." } }] },

  { id: "balifor", name: { en: "Balifor", pt: "Balifor" },
    land: { en: "The savannah and the bay of the east: tribes of the grasslands, fishing villages, Port Balifor, and Flotsam, where pirates, deserters and sailors drink side by side.",
      pt: "A savana e a baía do leste: tribos das pastagens, vilas de pescadores, Porto Balifor, e Flotsam, onde piratas, desertores e marinheiros bebem lado a lado." },
    ages: { en: "The dragonarmies conquered Balifor from 348 to 352 and used Flotsam as a port. In the Age of Mortals the red overlord's Desolation spread over it, and its bay was poisoned.",
      pt: "Os exércitos dracônicos conquistaram Balifor de 348 a 352 e usaram Flotsam como porto. Na Era dos Mortais a Desolação da senhora suprema vermelha se espalhou sobre ele, e a baía foi envenenada." },
    hooks: [
      { en: "In Flotsam, a captain sells passage to anywhere, and the last passengers never arrived.", pt: "Em Flotsam, um capitão vende passagem para qualquer lugar, e os últimos passageiros nunca chegaram." },
      { en: "A tribe of the savannah asks the heroes to find the cause of the dying grass.", pt: "Uma tribo da savana pede aos heróis que descubram por que o capim está morrendo." },
      { en: "A dragonarmy paymaster deserted with the chest, and three groups are looking for him.", pt: "Um pagador do exército dracônico desertou com o baú, e três grupos estão atrás dele." },
    ],
    cities: [{ id: "flotsam", name: "Flotsam", text: { en: "A port of rotting docks and sudden fortunes. Anything can be bought in Flotsam, including silence.", pt: "Um porto de docas apodrecidas e fortunas repentinas. Tudo pode ser comprado em Flotsam, inclusive silêncio." } }] },

  { id: "goodlund", name: { en: "Goodlund", pt: "Goodlund" },
    land: { en: "The kender lands: woods, villages and the city of Kendermore, ruled by a mayor who mostly agrees with everyone. Travellers lose things here and find others.",
      pt: "As terras kender: bosques, vilas e a cidade de Kendermore, governada por um prefeito que concorda com quase todo mundo. Viajantes perdem coisas aqui e acham outras." },
    ages: { en: "The dragonarmies occupied Goodlund from 349 to 352, and found kender hard to rule. In the Age of Mortals the red overlord Malystryx turned it into the Desolation; Kendermore fell, and the kender who survived were changed by fear.",
      pt: "Os exércitos dracônicos ocuparam Goodlund de 349 a 352, e descobriram que kender são difíceis de governar. Na Era dos Mortais a senhora suprema vermelha Malystryx a transformou na Desolação; Kendermore caiu, e os kender que sobreviveram foram mudados pelo medo." },
    hooks: [
      { en: "The mayor of Kendermore needs a 'small errand' run; the list of errands is three pages long.", pt: "O prefeito de Kendermore precisa de um 'pequeno favor'; a lista de favores tem três páginas." },
      { en: "A kender camp at the edge of the Desolation has a child who saw where the dragon sleeps.", pt: "Um acampamento kender na beira da Desolação tem uma criança que viu onde o dragão dorme." },
      { en: "Someone's very important item turned up in a kender's pouch, and now the kender is missing.", pt: "O item muito importante de alguém apareceu na bolsa de um kender, e agora o kender sumiu." },
    ],
    cities: [{ id: "kendermore", name: "Kendermore", text: { en: "A city with no straight streets and no locked doors, where every house has a story and most of them are true.", pt: "Uma cidade sem ruas retas e sem portas trancadas, onde cada casa tem uma história e a maioria é verdade." } }] },

  { id: "icereach", name: { en: "Icereach", pt: "Icereach" },
    land: { en: "The glaciers of the far south, home of the Ice Folk, human hunters who sail the ice on runner-boats and carry axes of a special ice. Thanoi, the walrus-folk, raid them from the coast.",
      pt: "As geleiras do extremo sul, terra do Povo do Gelo, caçadores humanos que velejam no gelo em barcos com patins e carregam machados de um gelo especial. Os thanoi, o povo-morsa, os atacam vindos da costa." },
    ages: { en: "In 350–351 the White Dragonarmy held Icewall Castle under Feal-Thas, and the thanoi served it. In the winter of 351 heroes and Ice Folk took the castle and a dragon orb with it. Later, two white dragons held Icewall.",
      pt: "Em 350–351 o Exército Dracônico Branco segurou o Castelo Muralha de Gelo sob Feal-Thas, e os thanoi o serviam. No inverno de 351 heróis e o Povo do Gelo tomaram o castelo, e um orbe do dragão junto. Depois, dois dragões brancos seguraram a Muralha de Gelo." },
    hooks: [
      { en: "A chieftain's daughter wants to go to Icewall to prove herself; her father wants her back alive.", pt: "A filha de um chefe quer ir à Muralha de Gelo para se provar; o pai a quer de volta viva." },
      { en: "A frostreaver was stolen, and the tracks lead to a thanoi camp.", pt: "Um frostreaver foi roubado, e as pegadas levam a um acampamento thanoi." },
      { en: "Something is calling the thanoi together, more than ever before.", pt: "Algo está reunindo os thanoi, mais do que nunca." },
    ], cities: [] },

  { id: "tarsis_plains", name: { en: "Tarsis and the Plains of Dust", pt: "Tarsis e as Planícies de Poeira" },
    land: { en: "Tarsis, the old harbour city left inland when the Cataclysm drained its sea, and the wide Plains of Dust with their nomads and centaur tribes.",
      pt: "Tarsis, a velha cidade portuária que ficou no interior quando o Cataclismo secou seu mar, e as largas Planícies de Poeira com seus nômades e tribos de centauros." },
    ages: { en: "The dragonarmies attacked Tarsis in 351 and occupied it until 352. In the Age of Mortals, dragons carved realms in the eastern plains.",
      pt: "Os exércitos dracônicos atacaram Tarsis em 351 e a ocuparam até 352. Na Era dos Mortais, dragões abriram domínios nas planícies do leste." },
    hooks: [
      { en: "In Tarsis's old library, a record of the drowned harbour lists a ship's cargo no one has found.", pt: "Na velha biblioteca de Tarsis, um registro do porto afundado lista a carga de um navio que ninguém achou." },
      { en: "A centaur tribe will trade horses only to those who race them.", pt: "Uma tribo de centauros só troca cavalos com quem aposta corrida com eles." },
      { en: "A dust storm uncovers the masts of a ship in the middle of the plain.", pt: "Uma tempestade de poeira descobre os mastros de um navio no meio da planície." },
    ],
    cities: [{ id: "tarsis", name: "Tarsis", text: { en: "A city of walls and empty docks, still proud of the sea it lost. Its lords rule a land that is now all road and dust.", pt: "Uma cidade de muralhas e docas vazias, ainda orgulhosa do mar que perdeu. Seus senhores governam uma terra que hoje é toda estrada e poeira." } }] },

  { id: "blood_sea_isles", name: { en: "The Blood Sea Isles", pt: "As Ilhas do Mar de Sangue" },
    land: { en: "Mithas and Kothas, the minotaur islands, and their capital Nethosak, where the Great Circus decides honour, office and the emperor's throne by combat. Saifhum, an island of human sailors, rivals them at sea. Over drowned Istar the Maelstrom turns, and the sea is red near it.",
      pt: "Mithas e Kothas, as ilhas dos minotauros, e a capital Nethosak, onde o Grande Circo decide honra, cargos e o trono do imperador em combate. Saifhum, uma ilha de marinheiros humanos, rivaliza com eles no mar. Sobre a Istar afundada gira o Redemoinho, e o mar fica vermelho perto dele." },
    ages: { en: "In the War of the Lance the minotaurs sailed for the dragonarmies. Emperor Chot ruled for decades after; in 421, during the War of Souls, Hotak seized the throne in a night of blood and built a new empire.",
      pt: "Na Guerra da Lança os minotauros navegaram pelos exércitos dracônicos. O imperador Chot governou por décadas depois; em 421, na Guerra das Almas, Hotak tomou o trono numa noite de sangue e construiu um novo império." },
    hooks: [
      { en: "A minotaur house challenges a hero to the Circus, for an insult nobody remembers making.", pt: "Uma casa minotauro desafia um herói no Circo, por um insulto que ninguém lembra de ter feito." },
      { en: "Saifhumi sailors want an escort past the Maelstrom, where their last ship disappeared.", pt: "Marinheiros de Saifhum querem escolta para passar pelo Redemoinho, onde seu último navio sumiu." },
      { en: "A human born in servitude in Nethosak wants to buy freedom for her whole family.", pt: "Uma humana nascida em servidão em Nethosak quer comprar a liberdade da família inteira." },
    ],
    cities: [{ id: "nethosak", name: "Nethosak", text: { en: "The minotaur capital: stone halls, the roar of the Great Circus, and houses that keep count of every debt of honour.", pt: "A capital dos minotauros: salões de pedra, o rugido do Grande Circo, e casas que contam cada dívida de honra." } }] },

  { id: "istar", name: { en: "Istar (before the Cataclysm)", pt: "Istar (antes do Cataclismo)" }, old: true,
    land: { en: "The greatest empire of Krynn before the Cataclysm, ruled by the Kingpriest from a city of white temples. It grew rich and certain of its own goodness, and turned on wizards, on the races it called evil, and at last on the gods' own balance.",
      pt: "O maior império de Krynn antes do Cataclismo, governado pelo Rei-Sacerdote a partir de uma cidade de templos brancos. Enriqueceu e ficou certo da própria bondade, e se voltou contra os magos, contra as raças que chamava de malignas, e por fim contra o próprio equilíbrio dos deuses." },
    ages: { en: "The Kingpriest demanded the powers of the gods. The gods sent warnings, then withdrew their true clerics, and on the first day of the year a fiery mountain fell on Istar. The city sank, the sea rushed in, and the world was broken: that is the Cataclysm, year 1 of the count after it.",
      pt: "O Rei-Sacerdote exigiu os poderes dos deuses. Os deuses mandaram avisos, depois retiraram seus verdadeiros clérigos, e no primeiro dia do ano uma montanha de fogo caiu sobre Istar. A cidade afundou, o mar entrou, e o mundo se partiu: é o Cataclismo, o ano 1 da contagem depois dele." },
    hooks: [
      { en: "A scroll from Istar's archives is for sale in Palanthas; three churches want it destroyed.", pt: "Um pergaminho dos arquivos de Istar está à venda em Palanthas; três igrejas o querem destruído." },
      { en: "A diver swears he saw lights in the drowned temples under the Blood Sea.", pt: "Um mergulhador jura que viu luzes nos templos afundados sob o Mar de Sangue." },
      { en: "For a campaign before the Cataclysm: the Kingpriest's inquisitors are looking for a mage the heroes are hiding.", pt: "Para uma campanha antes do Cataclismo: os inquisidores do Rei-Sacerdote procuram um mago que os heróis estão escondendo." },
    ], cities: [] },
];

// Lifewrought's region status lines (the "now" of each region), in Portuguese.
export const STATUS_PT = {
  "under the Seekers of Haven": "sob os Buscadores de Haven", "occupied by the Red Dragonarmy": "ocupada pelo Exército Dracônico Vermelho", "the Summer of Chaos": "o Verão do Caos",
  "under the green overlord Beryl": "sob a senhora suprema verde Beryl", "closed to outsiders": "fechada a estrangeiros", "abandoned; its people in exile": "abandonada; seu povo no exílio",
  "occupied by the Knights of Takhisis": "ocupada pelos Cavaleiros de Takhisis", "ruled by the green overlord Beryl": "governada pela senhora suprema verde Beryl", "Qualinost drowned; its people in exile": "Qualinost afogada; seu povo no exílio",
  "abandoned to Lorac's nightmare": "abandonada ao pesadelo de Lorac", "being reclaimed from the nightmare": "sendo retomada do pesadelo", "sealed under the magical shield": "selada sob o escudo mágico", "taken by the minotaurs": "tomada pelos minotauros",
  "gates sealed since the Dwarfgate War": "portões selados desde a Guerra do Portão Anão", "besieged at Northgate by the Red Dragonarmy": "sitiada no Portão Norte pelo Exército Dracônico Vermelho", "devastated from within by Chaos": "devastada por dentro pelo Caos",
  "sealed again against the dragons": "selada de novo contra os dragões", "its Knights despised": "seus Cavaleiros desprezados", "invaded by the Blue Dragonarmy": "invadida pelo Exército Dracônico Azul", "invaded by the Knights of Takhisis": "invadida pelos Cavaleiros de Takhisis",
  "the north under the blue overlord": "o norte sob o senhor supremo azul", "at war with Ankhar": "em guerra com Ankhar", "an empire under Jaymes Markham": "um império sob Jaymes Markham",
  "raided by the Red Dragonarmy and taken by the dragonarmies until 352": "atacada pelo Exército Dracônico Vermelho e tomada pelos exércitos dracônicos até 352", "asking to join the Empire of Solamnia": "pedindo para entrar no Império de Solamnia",
  "the Knights' last refuge": "o último refúgio dos Cavaleiros", "host of the Whitestone Council": "sede do Conselho da Pedra Branca", "the irda's isle destroyed nearby": "a ilha dos irda destruída ali perto", "Hylo under Belladonna": "Hylo sob Belladonna",
  "refuge of the elven nations in exile": "refúgio das nações élficas no exílio", "frozen under the white overlord Gellidus": "congelada sob o senhor supremo branco Gellidus", "under Salah-Khan and the Green Dragonarmy": "sob Salah-Khan e o Exército Dracônico Verde",
  "sheltering the elven exiles": "abrigando os elfos exilados", "the Dark Queen's armies gathering": "os exércitos da Rainha das Trevas se reunindo", "capital of the Dragon Empire": "capital do Império Dracônico", "in ruins": "em ruínas",
  "seat of the Dark Knights": "sede dos Cavaleiros Sombrios", "the dragonarmies' stronghold": "a fortaleza dos exércitos dracônicos", "a free city under siege": "uma cidade livre sitiada", "taken by Mina's army": "tomada pelo exército de Mina",
  "conquered by the dragonarmies": "conquistada pelos exércitos dracônicos", "the Desolation, its bay poisoned": "a Desolação, com a baía envenenada", "occupied by the Dragonarmies": "ocupada pelos Exércitos Dracônicos",
  "the Desolation, under the red overlord Malystryx": "a Desolação, sob a senhora suprema vermelha Malystryx", "under the White Dragonarmy at Icewall": "sob o Exército Dracônico Branco na Muralha de Gelo", "Icewall held by two white dragons": "a Muralha de Gelo nas mãos de dois dragões brancos",
  "attacked and occupied by the Dragonarmies": "atacada e ocupada pelos Exércitos Dracônicos", "dragon realms in the eastern plains": "domínios de dragões nas planícies do leste", "minotaurs sailing for the dragonarmies": "minotauros navegando pelos exércitos dracônicos",
  "the empire of Hotak": "o império de Hotak", "overrun by the Dragonarmies": "tomada pelos Exércitos Dracônicos",
};

// The powers of Krynn: factions and artefacts (one journal, a page each).
export const POWERS = [
  { slug: "knights-of-solamnia", name: { en: "The Knights of Solamnia", pt: "Os Cavaleiros de Solamnia" }, text: { en: "Three orders, Crown, Sword and Rose, bound by the Oath and the Measure. Despised for three hundred years, reborn in the War of the Lance, battered in the Chaos War. Their strength is that they keep their word; their weakness is that they keep it even when it is wrong.", pt: "Três ordens, Coroa, Espada e Rosa, ligadas pelo Juramento e pela Medida. Desprezados por trezentos anos, renascidos na Guerra da Lança, castigados na Guerra do Caos. Sua força é cumprir a palavra; sua fraqueza é cumpri-la mesmo quando está errada." } },
  { slug: "dragonarmies", name: { en: "The Dragonarmies", pt: "Os Exércitos Dracônicos" }, text: { en: "The Dark Queen's armies, five of them by the colour of their dragons, each under a Highlord, and the Emperor Ariakas over all. Draconians, humans, goblins, ogres and mercenaries; the Highlords plot against each other as much as against their enemies.", pt: "Os exércitos da Rainha das Trevas, cinco, pela cor dos seus dragões, cada um sob um Senhor Dracônico, e o Imperador Ariakas acima de todos. Draconianos, humanos, goblins, ogros e mercenários; os Senhores tramam uns contra os outros tanto quanto contra os inimigos." } },
  { slug: "orders-of-high-sorcery", name: { en: "The Orders of High Sorcery", pt: "As Ordens da Alta Feitiçaria" }, text: { en: "White, Red and Black Robes, three orders under the three moons, bound by one law: magic belongs to the Orders. Every mage passes the Test or dies, and those who refuse are renegades. See the Magic guide.", pt: "Mantos Brancos, Vermelhos e Negros, três ordens sob as três luas, ligadas por uma lei: a magia pertence às Ordens. Todo mago passa no Teste ou morre, e quem recusa é renegado. Veja o guia de Magia." } },
  { slug: "knights-of-takhisis", name: { en: "The Knights of Takhisis", pt: "Os Cavaleiros de Takhisis" }, text: { en: "Founded by Ariakan in 370, the dark knights of the Vision: Lily, Skull and Thorn. Disciplined and sure of their destiny, they conquered much of Ansalon in 383. After the gods left, they became the Knights of Neraka.", pt: "Fundados por Ariakan em 370, os cavaleiros sombrios da Visão: Lírio, Caveira e Espinho. Disciplinados e certos do seu destino, conquistaram boa parte de Ansalon em 383. Depois que os deuses partiram, viraram os Cavaleiros de Neraka." } },
  { slug: "dragonlances", name: { en: "The Dragonlances", pt: "As Lanças do Dragão" }, text: { en: "Lances of dragonmetal, forged with the Hammer of Kharas and the silver arm of Ergoth, that turned the war against the dragons. See Krynn: Dragons for their rules.", pt: "Lanças de metal dracônico, forjadas com o Martelo de Kharas e o braço de prata de Ergoth, que viraram a guerra contra os dragões. Veja Krynn: Dragões para as regras." } },
  { slug: "dragon-orbs", name: { en: "The Dragon Orbs", pt: "Os Orbes do Dragão" }, text: { en: "Crystal globes made by the Orders long ago, able to call dragons and to hold the mind of whoever uses them. Few survived the Cataclysm; each that was found in the War of the Lance changed a battle, and the mind of the one who looked into it.", pt: "Globos de cristal feitos pelas Ordens há muito tempo, capazes de chamar dragões e de prender a mente de quem os usa. Poucos sobreviveram ao Cataclismo; cada um encontrado na Guerra da Lança mudou uma batalha, e a mente de quem olhou dentro dele." } },
  { slug: "staff-of-magius", name: { en: "The Staff of Magius", pt: "O Cajado de Magius" }, text: { en: "The staff of a great war-mage of old, given by an old mage to a young one. It lights the dark, strikes hard and carries more secrets than its bearer knows.", pt: "O cajado de um grande mago de guerra de outrora, dado por um mago velho a um jovem. Ilumina o escuro, bate forte e guarda mais segredos do que seu portador sabe." } },
  { slug: "hammer-of-kharas", name: { en: "The Hammer of Kharas", pt: "O Martelo de Kharas" }, text: { en: "The hammer of the dwarven hero Kharas, lost after the Dwarfgate War. Whoever finds it can claim the throne of Thorbardin, and with it the dragonlances can be forged.", pt: "O martelo do herói anão Kharas, perdido depois da Guerra do Portão Anão. Quem o encontrar pode reivindicar o trono de Thorbardin, e com ele as lanças do dragão podem ser forjadas." } },
  { slug: "tower-of-palanthas", name: { en: "The Tower of High Sorcery of Palanthas", pt: "A Torre da Alta Feitiçaria de Palanthas" }, text: { en: "A black tower in the heart of Palanthas, cursed when the Kingpriest's men came for it, guarded by the Shoikan Grove that no living thing walks through unafraid. Its master will come from the past.", pt: "Uma torre negra no coração de Palanthas, amaldiçoada quando os homens do Rei-Sacerdote vieram por ela, guardada pelo Bosque Shoikan que nenhum ser vivo atravessa sem medo. Seu mestre virá do passado." } },
];

// Lifewrought's peoples and place sizes, for the Places pages.
export const PEOPLE_NAMES = {
  human: { en: "humans", pt: "humanos" }, half_elf: { en: "half-elves", pt: "meio-elfos" }, qualinesti_elf: { en: "Qualinesti elves", pt: "elfos Qualinesti" },
  silvanesti_elf: { en: "Silvanesti elves", pt: "elfos Silvanesti" }, kagonesti_elf: { en: "Kagonesti elves", pt: "elfos Kagonesti" }, hill_dwarf: { en: "hill dwarves", pt: "anões das colinas" },
  mountain_dwarf: { en: "mountain dwarves", pt: "anões da montanha" }, gnome: { en: "gnomes", pt: "gnomos" }, goblin: { en: "goblins", pt: "goblins" }, hobgoblin: { en: "hobgoblins", pt: "hobgoblins" },
  centaur: { en: "centaurs", pt: "centauros" }, minotaur: { en: "minotaurs", pt: "minotauros" }, kender: { en: "kender", pt: "kender" },
};
export const SIZE_NAMES = { city: { en: "city", pt: "cidade" }, town: { en: "town", pt: "vila grande" }, village: { en: "village", pt: "vila" }, hamlet: { en: "hamlet", pt: "povoado" } };
export const PAGE_NAMES = { land: { en: "Land and People", pt: "Terra e Povos" }, ages: { en: "Through the Ages", pt: "Através das Eras" }, places: { en: "Places", pt: "Lugares" }, hooks: { en: "Hooks", pt: "Ganchos" } };
