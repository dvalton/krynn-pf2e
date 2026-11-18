// The calendar of Krynn: months and weekdays by culture, holy days, seasons, and the Foundry CalendarConfig built from them.
// Pure logic, no Foundry. Month and weekday names are proper nouns in most cultures; the descriptive ones
// (Plainsmen, Elven, Kender, Goblin, Dwarven) also carry a Brazilian Portuguese rendering for the pt-BR interface.

export const CULTURES = ["ergothian", "solamnic", "plainsmen", "dwarven", "elven", "kender", "goblin", "gods"];

// [English, Portuguese]; when the Portuguese is the same word it is repeated.
export const MONTHS = {
  ergothian: ["Aelmont", "Rannmont", "Mishamont", "Chislmont", "Bran", "Corij", "Argon", "Sirrimont", "Reorxmont", "Hiddumont", "H'rarmont", "Phoenix"].map((n) => [n, n]),
  solamnic: ["Newkolt", "Deepkolt", "Brookgreen", "Yurthgreen", "Fleurgreen", "Holmswelt", "Fierswelt", "Paleswelt", "Reapember", "Gildember", "Darkember", "Frostkolt"].map((n) => [n, n]),
  plainsmen: [["Ice Glaze", "Gelo Vítreo"], ["Snow Deep", "Neve Funda"], ["Mountain Thaw", "Degelo da Montanha"], ["Earth Wakes", "Terra Desperta"], ["Flower Blooms", "Flor Desabrocha"], ["Home Hearth", "Lar e Lareira"],
    ["Raging Fire", "Fogo Furioso"], ["Dying Ember", "Brasa Morrendo"], ["Harvest Home", "Fim da Colheita"], ["Leaf Gild", "Folha Dourada"], ["Dark Cold", "Frio Escuro"], ["Frost Eve", "Véspera da Geada"]],
  dwarven: [["Dark-Crypt", "Cripta-Escura"], ["Dark-Deep", "Fundo-Escuro"], ["Damp-Mood", "Humor-Úmido"], ["Damp-Chisel", "Cinzel-Úmido"], ["Dry-Anvil", "Bigorna-Seca"], ["Dry-Axe", "Machado-Seco"],
    ["Dry-Heat", "Calor-Seco"], ["Dry-Forge", "Forja-Seca"], ["Cold-Hammer", "Martelo-Frio"], ["Cold-Steel", "Aço-Frio"], ["Cold-Rust", "Ferrugem-Fria"], ["Cold-Lode", "Veio-Frio"]],
  elven: [["Winter Night", "Noite de Inverno"], ["Winter Deep", "Fundo do Inverno"], ["Spring Dawning", "Alvorecer da Primavera"], ["Spring Rain", "Chuva de Primavera"], ["Spring Blossom", "Flor de Primavera"], ["Summer Home", "Lar de Verão"],
    ["Summer Run", "Corrida de Verão"], ["Summer End", "Fim do Verão"], ["Autumn Harvest", "Colheita de Outono"], ["Autumn Twilight", "Crepúsculo de Outono"], ["Autumn Dark", "Escuro de Outono"], ["Winter Come", "Chegada do Inverno"]],
  kender: [["Snowfun", "Folianeve"], ["Darktime", "Tempo Escuro"], ["Windsong", "Canção do Vento"], ["Raindrum", "Tambor de Chuva"], ["Flowerfield", "Campo de Flores"], ["Homefriends", "Amigos de Casa"],
    ["Wandertime", "Tempo de Andança"], ["Summerlaze", "Preguiça de Verão"], ["Harvestfete", "Festa da Colheita"], ["Leafplay", "Brincafolha"], ["Bleakcold", "Frio Triste"], ["Blessings", "Bênçãos"]],
  goblin: [["Famine", "Fome"], ["Madness", "Loucura"], ["Girding", "Armadura"], ["Scouting", "Batedura"], ["Campaign", "Campanha"], ["Siege", "Cerco"],
    ["Flame", "Chama"], ["Sack", "Saque"], ["Loot", "Pilhagem"], ["Betrayal", "Traição"], ["Pestilence", "Peste"], ["Reward", "Recompensa"]],
  gods: ["Chemosh", "Zeboim", "Mishakal", "Chislev", "Branchala", "Kiri-Jolith", "Sargonnas", "Sirrion", "Reorx", "Hiddukel", "Morgion", "Habbakuk"].map((n) => [n, n]),
};

// Seven days a week, from the first (Gilean's day) to the seventh (Zivilyn's).
export const WEEKDAYS = {
  ergothian: ["Gileadai", "Luindai", "Nuindai", "Soldai", "Manthus", "Shinarai", "Boreadai"].map((n) => [n, n]),
  solamnic: ["Linaras", "Palast", "Majetag", "Kirinor", "Misham", "Bakukal", "Bracha"].map((n) => [n, n]),
  plainsmen: [["Friend Day", "Dia do Amigo"], ["Hunt Day", "Dia da Caça"], ["Share Day", "Dia da Partilha"], ["Gather Day", "Dia da Coleta"], ["Barter Day", "Dia da Troca"], ["Worship Day", "Dia do Culto"], ["Council Day", "Dia do Conselho"]],
  dwarven: ["Brenzik", "Mithrik", "Adamachtis", "Aurachil", "Cuprig", "Ferramis", "Agorin"].map((n) => [n, n]),
  elven: [["Gateway", "Portal"], ["Bright Eye", "Olho Brilhante"], ["Night's Eye", "Olho da Noite"], ["Dead Eye", "Olho Morto"], ["Dream Dance", "Dança do Sonho"], ["Winged Trade", "Comércio Alado"], ["World Tree", "Árvore do Mundo"]],
  kender: [["Praise Day", "Dia do Louvor"], ["Light Day", "Dia da Luz"], ["Fire Day", "Dia do Fogo"], ["Winds Day", "Dia dos Ventos"], ["Waters Day", "Dia das Águas"], ["Ground Day", "Dia do Chão"], ["Shadow Day", "Dia da Sombra"]],
  goblin: [["Guard", "Guarda"], ["Pain", "Dor"], ["Fear", "Medo"], ["Rout", "Debandada"], ["Strife", "Contenda"], ["Feint", "Finta"], ["Flank", "Flanco"]],
  gods: ["Gilean", "Lunitari", "Nuitari", "Solinari", "Majere", "Shinare", "Zivilyn"].map((n) => [n, n]),
};

// Two ways to count a year. Classic: twelve months of thirty days (360 days, the older sources).
// Kalaman: twelve months of four seven-day weeks (336 days, the newer source).
export const STYLES = {
  classic: { monthDays: 30 },
  kalaman: { monthDays: 28 },
};

// Holy days and festivals: [month index, day of month (1-based), id]. Days past a short month fall on its last day.
export const HOLIDAYS = [
  [0, 1, "yearDay"], [0, 3, "darkDay"], [1, 9, "harnkeggerfest"], [2, 14, "kithKanandras"], [2, 15, "silvanosdras"], [2, 21, "springDawning"],
  [3, 4, "harrowing"], [5, 21, "midyearDay"], [6, 15, "festivalOfCandles"], [8, 22, "summersEnd"], [9, 12, "festivalOfKnights"],
  [10, 13, "genealogyDay"], [11, 6, "thanksALotDay"], [11, 22, "yule"],
];

export const SECONDS_PER_DAY = 86400;
// Year zero of the Foundry calendar, far enough back that every year of play has a positive world time.
export const YEAR_ZERO = -5000;

export function daysPerYear(style) { return 12 * STYLES[style].monthDays; }

// Day of the year (0-based) for a month index and a 1-based day of month.
export function dayOfYear(style, month, day) {
  const md = STYLES[style].monthDays;
  return month * md + Math.min(Math.max(day, 1), md) - 1;
}

// An absolute day count (days since the calendar's year zero) for a Krynn date.
export function absoluteDay(style, year, month, day) {
  return (year - YEAR_ZERO) * daysPerYear(style) + dayOfYear(style, month, day);
}

// The Krynn date for an absolute day.
export function dateOfDay(style, abs) {
  const dpy = daysPerYear(style), md = STYLES[style].monthDays;
  const y = Math.floor(abs / dpy), r = abs - y * dpy;
  return { year: y + YEAR_ZERO, month: Math.floor(r / md), day: (r % md) + 1, dayOfYear: r, weekday: ((abs % 7) + 7) % 7 };
}

export function absoluteDayOfTime(worldTime) { return Math.floor(worldTime / SECONDS_PER_DAY); }

// Holidays falling on a date.
export function holidaysOn(style, month, day) {
  const md = STYLES[style].monthDays;
  return HOLIDAYS.filter(([m, d]) => m === month && Math.min(d, md) === day).map(([, , id]) => id);
}

// Seasons start on the equinoxes and solstices (Spring Dawning, Midyear Day, Summer's End, Yule).
export function seasonsFor(style) {
  const s = (m, d) => dayOfYear(style, m, d);
  return [
    { id: "spring", dayStart: s(2, 21), dayEnd: s(5, 20) },
    { id: "summer", dayStart: s(5, 21), dayEnd: s(8, 21) },
    { id: "autumn", dayStart: s(8, 22), dayEnd: s(11, 21) },
    { id: "winter", dayStart: s(11, 22), dayEnd: s(2, 20) },
  ];
}

// The CalendarConfig Foundry 14 reads (CONFIG.time.worldCalendarConfig). Names are localization keys.
export function calendarConfig(style, culture = "ergothian") {
  const md = STYLES[style].monthDays;
  return {
    name: "KRYNN.Calendar.Name",
    description: `KRYNN.Calendar.Style.${style}`,
    years: { yearZero: YEAR_ZERO, firstWeekday: 0 }, // no leap years on Krynn
    months: { values: MONTHS[culture].map((_, i) => ({ name: `KRYNN.Calendar.Month.${culture}.${i}`, abbreviation: `KRYNN.Calendar.MonthShort.${culture}.${i}`, ordinal: i + 1, days: md, leapDays: md })) },
    days: {
      values: WEEKDAYS[culture].map((_, i) => ({ name: `KRYNN.Calendar.Weekday.${culture}.${i}`, abbreviation: `KRYNN.Calendar.WeekdayShort.${culture}.${i}`, ordinal: i + 1 })),
      daysPerYear: 12 * md, hoursPerDay: 24, minutesPerHour: 60, secondsPerMinute: 60,
    },
    seasons: { values: seasonsFor(style).map((x) => ({ name: `KRYNN.Calendar.Season.${x.id}`, dayStart: x.dayStart, dayEnd: x.dayEnd })) },
  };
}

// The localization entries for the calendar names: a tool writes these into lang/en.json and lang/pt-BR.json.
export function calendarStrings(lang) {
  const k = lang === "pt-BR" ? 1 : 0, out = {};
  for (const c of CULTURES) {
    MONTHS[c].forEach((n, i) => { out[`KRYNN.Calendar.Month.${c}.${i}`] = n[k]; out[`KRYNN.Calendar.MonthShort.${c}.${i}`] = n[k].replace(/[^A-Za-zÀ-ÿ']/g, "").slice(0, 3); });
    WEEKDAYS[c].forEach((n, i) => { out[`KRYNN.Calendar.Weekday.${c}.${i}`] = n[k]; out[`KRYNN.Calendar.WeekdayShort.${c}.${i}`] = n[k].replace(/[^A-Za-zÀ-ÿ']/g, "").slice(0, 3); });
  }
  return out;
}

// Daylight: sunrise and sunset by the day of the year (the longest day at the start of summer), and the scene's
// darkness for an hour of the day, with an hour of twilight at each end.
export function sunTimes(dayOfYear, daysInYear = 360, solstice = 170) {
  const k = Math.cos((2 * Math.PI * (dayOfYear - solstice)) / daysInYear);
  return { sunrise: 6 - 1.5 * k, sunset: 18 + 1.5 * k };
}
export function darknessAt(dayOfYear, hour, daysInYear = 360, night = 1) {
  const { sunrise, sunset } = sunTimes(dayOfYear, daysInYear);
  const ramp = (x) => Math.max(0, Math.min(1, x));
  if (hour < sunrise - 0.5) return night;
  if (hour < sunrise + 0.5) return night * (1 - ramp(hour - (sunrise - 0.5)));
  if (hour < sunset - 0.5) return 0;
  if (hour < sunset + 0.5) return night * ramp(hour - (sunset - 0.5));
  return night;
}
