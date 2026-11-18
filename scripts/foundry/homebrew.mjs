// What the module registers in the PF2e system through module.json (flags.krynn-pf2e.pf2e-homebrew).
// This file is the source: `npm run build` writes it into module.json, and the self-test checks it took.
// Languages PF2e already has (Common, Draconic, Dwarven, Elven, Gnomish, Goblin) are used as they are.
export const KRYNN_LANGUAGES = {
  solamnic: "KRYNN.Language.solamnic",
  ergot: "KRYNN.Language.ergot",
  abanasinian: "KRYNN.Language.abanasinian",
  "que-shu": "KRYNN.Language.queShu",
  khurish: "KRYNN.Language.khurish",
  nerakan: "KRYNN.Language.nerakan",
  kenderspeak: "KRYNN.Language.kenderspeak",
  qualinesti: "KRYNN.Language.qualinesti",
  silvanesti: "KRYNN.Language.silvanesti",
  kagonesti: "KRYNN.Language.kagonesti",
  kothian: "KRYNN.Language.kothian",
  ogre: "KRYNN.Language.ogre",
  istarian: "KRYNN.Language.istarian",
  "ice-folk": "KRYNN.Language.iceFolk",
  saifhum: "KRYNN.Language.saifhum",
};

export const KRYNN_CREATURE_TRAITS = {
  kender: { label: "KRYNN.Trait.kender", description: "KRYNN.TraitText.kender" },
  draconian: { label: "KRYNN.Trait.draconian", description: "KRYNN.TraitText.draconian" },
  aghar: { label: "KRYNN.Trait.aghar", description: "KRYNN.TraitText.aghar" },
  irda: { label: "KRYNN.Trait.irda", description: "KRYNN.TraitText.irda" },
  thanoi: { label: "KRYNN.Trait.thanoi", description: "KRYNN.TraitText.thanoi" },
  bakali: { label: "KRYNN.Trait.bakali", description: "KRYNN.TraitText.bakali" },
};

export const KRYNN_FEAT_TRAITS = {
  "high-sorcery": { label: "KRYNN.Trait.highSorcery", description: "KRYNN.TraitText.highSorcery" },
  "solamnic-knight": { label: "KRYNN.Trait.solamnicKnight", description: "KRYNN.TraitText.solamnicKnight" },
  mystic: { label: "KRYNN.Trait.mystic", description: "KRYNN.TraitText.mystic" },
  "dark-knight": { label: "KRYNN.Trait.darkKnight", description: "KRYNN.TraitText.darkKnight" },
};

export const HOMEBREW = { languages: KRYNN_LANGUAGES, creatureTraits: KRYNN_CREATURE_TRAITS, featTraits: KRYNN_FEAT_TRAITS };
