import type {
  CompendiumEntry,
  Spell,
  SpellLevel,
  SpellSchool,
  SpellComponents,
  Weapon,
  WeaponCategory,
  WeaponProperty,
  DamageType,
  DieType,
  Armor,
  ArmorCategory,
  EquipmentItem,
  ItemRarity,
  ItemTier,
  Feature,
  FeatureChoice,
  FeatureSourceType,
  CompendiumContentType,
  AbilityScore,
  InventoryWeapon,
  InventoryArmor,
  InventoryEquipment,
  CharacterBackground,
  BackgroundEquipmentItem,
} from '@aplus-compendium/types';

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function normalizeRarity(raw: unknown): ItemRarity | undefined {
  if (typeof raw !== 'string') return undefined;
  const s = raw.toLowerCase().replace(' ', '-');
  const valid: ItemRarity[] = ['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact'];
  return valid.includes(s as ItemRarity) ? (s as ItemRarity) : undefined;
}

export function normalizeTier(raw: unknown): ItemTier | undefined {
  if (typeof raw !== 'string') return undefined;
  const s = raw.toLowerCase();
  if (s === 'minor') return 'minor';
  if (s === 'major') return 'major';
  return undefined;
}

const ITEM_TYPE_LABEL: Record<string, string> = {
  A: 'Ammunition', AF: 'Ammunition (futuristic)', AT: "Artisan's Tools",
  EXP: 'Explosive', G: 'Adventuring Gear', GS: 'Gaming Set',
  GV: 'Generic Variant', HA: 'Heavy Armor', INS: 'Instrument',
  LA: 'Light Armor', M: 'Melee Weapon', MA: 'Medium Armor',
  MNT: 'Mount', OTH: 'Other', P: 'Potion', R: 'Ranged Weapon',
  RD: 'Rod', RG: 'Ring', S: 'Shield', SC: 'Scroll', SCF: 'Spellcasting Focus',
  SHP: 'Vehicle (water)', ST: 'Staff', T: 'Tool', TAH: 'Tack and Harness',
  TG: 'Trade Good', VEH: 'Vehicle (land)', W: 'Weapon', WD: 'Wand',
};

export function normalizeItemType(raw: Record<string, unknown>): string | undefined {
  if (raw['wondrous']) return 'Wondrous Item';
  const code = raw['type'] as string | undefined;
  if (!code) return undefined;
  return ITEM_TYPE_LABEL[code] ?? undefined;
}

// ---------------------------------------------------------------------------
// Spell
// ---------------------------------------------------------------------------

const SCHOOL_MAP: Record<string, SpellSchool> = {
  A: 'abjuration', C: 'conjuration', D: 'divination', E: 'enchantment',
  V: 'evocation',  I: 'illusion',    N: 'necromancy',  T: 'transmutation',
};

export function entryToSpell(entry: CompendiumEntry): Spell {
  const raw = entry.raw;

  // Components
  const m = (raw['components'] as Record<string, unknown> | undefined)?.['m'];
  const components: SpellComponents = {
    verbal:              !!((raw['components'] as Record<string, unknown> | undefined)?.['v']),
    somatic:             !!((raw['components'] as Record<string, unknown> | undefined)?.['s']),
    material:            !!m,
    materialDescription: typeof m === 'string' ? m : ((m as Record<string, unknown> | undefined)?.['text'] as string | undefined),
  };

  // Range
  const rng = raw['range'] as Record<string, unknown> | undefined;
  let range = '';
  if (rng) {
    if (rng['type'] === 'touch') range = 'Touch';
    else if (rng['type'] === 'self') range = 'Self';
    else if (rng['type'] === 'special') range = 'Special';
    else {
      const dist = rng['distance'] as Record<string, unknown> | undefined;
      if (dist) range = `${dist['amount'] ?? ''} ${dist['type'] ?? ''}`.trim();
    }
  }

  // Casting time
  const times = raw['time'] as Array<Record<string, unknown>> | undefined;
  const t0 = times?.[0];
  const castingTime = t0 ? `${t0['number']} ${t0['unit']}` : '1 action';

  // Duration
  const durs = raw['duration'] as Array<Record<string, unknown>> | undefined;
  const d0 = durs?.[0];
  let duration = 'Instantaneous';
  if (d0) {
    if (d0['type'] === 'instant') duration = 'Instantaneous';
    else if (d0['type'] === 'permanent') duration = 'Until dispelled';
    else if (d0['concentration']) {
      const dl = d0['duration'] as Record<string, unknown> | undefined;
      duration = dl ? `Concentration, up to ${dl['amount']} ${dl['type']}` : 'Concentration';
    } else {
      const dl = d0['duration'] as Record<string, unknown> | undefined;
      if (dl) duration = `${dl['amount']} ${dl['type']}`;
    }
  }

  return {
    id: entry.id,
    name: entry.name,
    level: ((raw['level'] as number | undefined) ?? 0) as SpellLevel,
    school: SCHOOL_MAP[raw['school'] as string] ?? 'evocation',
    castingTime,
    range,
    components,
    duration,
    concentration: durs?.some(d => d['concentration']) ?? false,
    ritual: (raw['meta'] as Record<string, unknown> | undefined)?.['ritual'] === true,
    description: '',
    rawEntries: Array.isArray(raw['entries']) ? (raw['entries'] as unknown[]) : undefined,
    prepared: false,
  };
}

// ---------------------------------------------------------------------------
// Weapon
// ---------------------------------------------------------------------------

const DMG_TYPE_MAP: Record<string, DamageType> = {
  A: 'acid', B: 'bludgeoning', C: 'cold', F: 'fire', O: 'force',
  L: 'lightning', N: 'necrotic', P: 'piercing', I: 'poison',
  Y: 'psychic', R: 'radiant', S: 'slashing', T: 'thunder',
};

const PROP_MAP: Record<string, WeaponProperty> = {
  A: 'ammunition', F: 'finesse', H: 'heavy', L: 'light', LD: 'loading',
  R: 'reach', T: 'thrown', '2H': 'two-handed', V: 'versatile', S: 'special',
};

// Valid die types — pick the nearest valid die for unusual damage dice
const VALID_DIES: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export function entryToWeapon(entry: CompendiumEntry): Weapon {
  const raw = entry.raw;

  // 5etools: `type` = 'M' (melee) | 'R' (ranged), `weaponCategory` = 'simple' | 'martial'
  const typeCode  = raw['type'] as string | undefined;
  const wCat      = raw['weaponCategory'] as string | undefined;
  const isRanged  = typeCode === 'R';
  let category: WeaponCategory = 'simple-melee';
  if      (wCat === 'martial' && !isRanged) category = 'martial-melee';
  else if (wCat === 'simple'  &&  isRanged) category = 'simple-ranged';
  else if (wCat === 'martial' &&  isRanged) category = 'martial-ranged';

  const damageDice  = (raw['dmg1'] as string | undefined) ?? '1d4';
  const damageType: DamageType = DMG_TYPE_MAP[raw['dmgType'] as string] ?? 'bludgeoning';
  const rawProps    = (raw['property'] as string[] | undefined) ?? [];
  const properties  = rawProps.map(p => PROP_MAP[p]).filter((p): p is WeaponProperty => !!p);

  // Nearest valid die
  const dieMatch = damageDice.match(/d(\d+)/);
  const dieNum   = dieMatch ? parseInt(dieMatch[1] ?? '6') : 6;
  const dieType  = VALID_DIES.find(d => parseInt(d.slice(1)) >= dieNum) ?? 'd6';

  // Ranged weapons and finesse weapons use Dexterity
  const useDex = isRanged || properties.includes('finesse');

  // Optional range (e.g. "80/320")
  const rangeStr = raw['range'] as string | undefined;
  let range: Weapon['range'];
  if (rangeStr) {
    const parts = rangeStr.split('/').map(Number);
    range = { normal: parts[0] ?? 30, long: parts[1] ?? (parts[0] ?? 30) * 3 };
  }

  return {
    id:                 entry.id,
    name:               entry.name,
    quantity:           1,
    weight:             (raw['weight'] as number | undefined) ?? 0,
    rarity:             normalizeRarity(raw['rarity']),
    description:        '',
    equipped:           false,
    requiresAttunement: !!raw['reqAttune'],
    category,
    damageDice,
    damageType,
    properties,
    attackBonus:        0,
    damageBonus:        0,
    abilityUsed:        useDex ? 'dexterity' : 'strength',
    versatileDamageDice: (raw['dmg2'] as string | undefined) ?? undefined,
    range,
    dieType,
  };
}

// ---------------------------------------------------------------------------
// Armor
// ---------------------------------------------------------------------------

const ARMOR_CAT_MAP: Record<string, ArmorCategory> = {
  LA: 'light', MA: 'medium', HA: 'heavy', S: 'shield',
};

export function entryToArmor(entry: CompendiumEntry): Armor {
  const raw = entry.raw;
  const typeCode  = raw['type'] as string | undefined;
  const category: ArmorCategory = ARMOR_CAT_MAP[typeCode ?? ''] ?? 'light';
  const maxDexBonus = category === 'light' ? undefined : category === 'medium' ? 2 : 0;

  return {
    id:                   entry.id,
    name:                 entry.name,
    quantity:             1,
    weight:               (raw['weight'] as number | undefined) ?? 0,
    rarity:               normalizeRarity(raw['rarity']),
    description:          '',
    equipped:             false,
    requiresAttunement:   !!raw['reqAttune'],
    category,
    baseArmorClass:       (raw['ac'] as number | undefined) ?? 10,
    maxDexBonus,
    strengthRequirement:  (raw['strength'] as number | undefined) ?? undefined,
    stealthDisadvantage:  !!(raw['stealth']),
  };
}

// ---------------------------------------------------------------------------
// Equipment (generic items)
// ---------------------------------------------------------------------------

export function entryToEquipment(entry: CompendiumEntry): EquipmentItem {
  const raw = entry.raw;
  return {
    id:                 entry.id,
    name:               entry.name,
    quantity:           1,
    weight:             (raw['weight'] as number | undefined) ?? 0,
    rarity:             normalizeRarity(raw['rarity']),
    description:        '',
    equipped:           false,
    attuned:            false,
    requiresAttunement: !!raw['reqAttune'],
  };
}

// ---------------------------------------------------------------------------
// Inventory item converters (new unified system)
// ---------------------------------------------------------------------------

function _inventoryId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function _costGp(raw: Record<string, unknown>): number | undefined {
  // 5etools stores item cost in copper pieces in `value` field (e.g. 1000 = 10 gp)
  return typeof raw['value'] === 'number' ? raw['value'] / 100 : undefined;
}

function _rawEntries(raw: Record<string, unknown>): unknown[] | undefined {
  const e = raw['entries'];
  return Array.isArray(e) && e.length > 0 ? e : undefined;
}

export function entryToInventoryWeapon(entry: CompendiumEntry): InventoryWeapon {
  const w = entryToWeapon(entry);
  return {
    type:                'weapon',
    id:                  _inventoryId(),
    name:                w.name,
    quantity:            1,
    weight:              w.weight,
    costGp:              _costGp(entry.raw),
    rarity:              w.rarity,
    description:         w.description,
    rawEntries:          _rawEntries(entry.raw),
    tier:                normalizeTier(entry.raw['tier']),
    itemType:            normalizeItemType(entry.raw),
    source:              entry.raw['source'] as string | undefined,
    containerId:         'default',
    requiresAttunement:  w.requiresAttunement,
    attuned:             false,
    category:            w.category,
    damageDice:          w.damageDice,
    damageType:          w.damageType,
    properties:          w.properties,
    attackBonus:         w.attackBonus,
    damageBonus:         w.damageBonus,
    abilityUsed:         w.abilityUsed,
    versatileDamageDice: w.versatileDamageDice,
    range:               w.range,
    dieType:             w.dieType,
  };
}

export function entryToInventoryArmor(entry: CompendiumEntry): InventoryArmor {
  const a = entryToArmor(entry);
  return {
    type:                'armor',
    id:                  _inventoryId(),
    name:                a.name,
    quantity:            1,
    weight:              a.weight,
    costGp:              _costGp(entry.raw),
    rarity:              a.rarity,
    description:         a.description,
    rawEntries:          _rawEntries(entry.raw),
    tier:                normalizeTier(entry.raw['tier']),
    itemType:            normalizeItemType(entry.raw),
    source:              entry.raw['source'] as string | undefined,
    containerId:         'default',
    requiresAttunement:  a.requiresAttunement,
    attuned:             false,
    category:            a.category,
    baseArmorClass:      a.baseArmorClass,
    maxDexBonus:         a.maxDexBonus,
    strengthRequirement: a.strengthRequirement,
    stealthDisadvantage: a.stealthDisadvantage,
  };
}

export function entryToInventoryEquipment(entry: CompendiumEntry): InventoryEquipment {
  const e = entryToEquipment(entry);
  return {
    type:               'equipment',
    id:                 _inventoryId(),
    name:               e.name,
    quantity:           1,
    weight:             e.weight,
    costGp:             _costGp(entry.raw),
    rarity:             e.rarity,
    description:        e.description,
    rawEntries:         _rawEntries(entry.raw),
    wondrous:           !!entry.raw['wondrous'],
    tier:               normalizeTier(entry.raw['tier']),
    itemType:           normalizeItemType(entry.raw),
    source:             entry.raw['source'] as string | undefined,
    containerId:        'default',
    requiresAttunement: e.requiresAttunement,
    attuned:            false,
  };
}

// ---------------------------------------------------------------------------
// Feature (feats, optional-features, backgrounds, etc.)
// ---------------------------------------------------------------------------

const FEATURE_SOURCE_TYPE: Partial<Record<CompendiumContentType, FeatureSourceType>> = {
  'feat':             'feat',
  'optional-feature': 'class',
  'background':       'background',
  'race':             'race',
  'class':            'class',
  'subclass':         'subclass',
};

// ---------------------------------------------------------------------------
// Known per-level HP bonus features
// ---------------------------------------------------------------------------

function _normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z ]/g, '').trim();
}

/** Known features that grant a flat HP bonus per level. */
const HP_BONUS_FEATURES: Record<string, { amount: number; classOnly?: boolean }> = {
  'tough':               { amount: 2 },
  'dwarven toughness':   { amount: 1 },
  'draconic resilience': { amount: 1, classOnly: true },
};

export function entryToFeature(entry: CompendiumEntry): Feature {
  const base: Feature = {
    id:         entry.id,
    name:       entry.name,
    source:     entry.source,
    sourceType: FEATURE_SOURCE_TYPE[entry.contentType] ?? 'feat',
    description: '',
    rawEntries: _rawEntries(entry.raw),
  };

  // Enrich feat/background entries with proficiency grants
  if (entry.contentType === 'feat' || entry.contentType === 'background') {
    const grant = extractFeatProficiencyGrant(entry.raw);
    if (grant) {
      if (grant.languages.length > 0) base.grantedLanguages = grant.languages;
      if (grant.proficiencies.length > 0) base.grantedProficiencies = grant.proficiencies;
      if (grant.choices.length > 0) base.choices = [...(base.choices ?? []), ...grant.choices];
    }
  }

  // Auto-set HP bonus for known feats
  const hpBonus = HP_BONUS_FEATURES[_normalizeName(entry.name)];
  if (hpBonus) {
    base.hpBonusPerLevel = hpBonus.amount;
    if (hpBonus.classOnly) base.hpBonusPerClassLevel = true;
  }

  return base;
}

// ---------------------------------------------------------------------------
// Feat proficiency grants (tools, languages, other)
// ---------------------------------------------------------------------------

/** Parsed proficiency grants from a feat's raw 5etools data. */
export interface FeatProficiencyGrant {
  /** Fixed language proficiencies (e.g. "Common") */
  languages: string[];
  /** Fixed tool/weapon/armor proficiencies (e.g. "Cook's Utensils") */
  proficiencies: string[];
  /** Choice-based grants rendered as FeatureChoice entries */
  choices: FeatureChoice[];
}

/**
 * Parse `toolProficiencies`, `languageProficiencies`, and `weaponProficiencies`
 * from a raw 5etools feat entry. Returns null if no proficiency grants found.
 */
export function extractFeatProficiencyGrant(raw: Record<string, unknown>): FeatProficiencyGrant | null {
  const languages: string[] = [];
  const proficiencies: string[] = [];
  const choices: FeatureChoice[] = [];

  // --- Tool proficiencies ---
  const toolProfs = raw['toolProficiencies'] as Record<string, unknown>[] | undefined;
  if (toolProfs?.[0]) {
    for (const [key, value] of Object.entries(toolProfs[0])) {
      if (key === 'choose') {
        const c = value as Record<string, unknown>;
        const from = (c['from'] as string[] | undefined) ?? [];
        const count = (c['count'] as number | undefined) ?? 1;
        for (let i = 0; i < count; i++) {
          choices.push({
            id: `tool-prof-choice-${i}`,
            label: 'Tool Proficiency',
            options: from.map(_capitalizeWords),
            selected: '',
            grantType: 'proficiency',
          });
        }
      } else if (value === true) {
        proficiencies.push(_capitalizeWords(key));
      }
    }
  }

  // --- Language proficiencies ---
  const langProfs = raw['languageProficiencies'] as Record<string, unknown>[] | undefined;
  if (langProfs?.[0]) {
    for (const [key, value] of Object.entries(langProfs[0])) {
      if (key === 'anyStandard' && typeof value === 'number') {
        for (let i = 0; i < value; i++) {
          choices.push({
            id: `lang-choice-${i}`,
            label: 'Language',
            options: [],  // free-text entry for "any standard language"
            selected: '',
            grantType: 'language',
          });
        }
      } else if (key === 'choose') {
        const c = value as Record<string, unknown>;
        const from = (c['from'] as string[] | undefined) ?? [];
        const count = (c['count'] as number | undefined) ?? 1;
        for (let i = 0; i < count; i++) {
          choices.push({
            id: `lang-choice-${i}`,
            label: 'Language',
            options: from.map(_capitalizeWords),
            selected: '',
            grantType: 'language',
          });
        }
      } else if (value === true && key !== 'other') {
        languages.push(_capitalizeWords(key));
      }
    }
  }

  // --- Weapon proficiencies ---
  const weaponProfs = raw['weaponProficiencies'] as Record<string, unknown>[] | undefined;
  if (weaponProfs?.[0]) {
    for (const [key, value] of Object.entries(weaponProfs[0])) {
      if (value === true) {
        proficiencies.push(_capitalizeWords(key));
      }
    }
  }

  // --- Armor proficiencies ---
  const armorProfs = raw['armorProficiencies'] as Record<string, unknown>[] | undefined;
  if (armorProfs?.[0]) {
    for (const [key, value] of Object.entries(armorProfs[0])) {
      if (value === true) {
        proficiencies.push(_capitalizeWords(key));
      }
    }
  }

  if (languages.length === 0 && proficiencies.length === 0 && choices.length === 0) return null;
  return { languages, proficiencies, choices };
}

// ---------------------------------------------------------------------------
// Feat ability score grants
// ---------------------------------------------------------------------------

/** Describes what ability score increases a feat offers. */
export interface FeatAbilityGrant {
  /** Fixed ability bonuses, e.g. Actor: { charisma: 1 } */
  fixed: Partial<Record<AbilityScore, number>>;
  /** "Choose N from these abilities for +amount each" */
  choices: AbilityBonusChoice[];
}

/**
 * Parse the `ability` array from a raw feat entry (5etools format) into a
 * structured grant. Returns null if the feat has no ability score increases.
 */
export function extractFeatAbilityGrant(raw: Record<string, unknown>): FeatAbilityGrant | null {
  const abilityArr = raw['ability'] as Record<string, unknown>[] | undefined;
  if (!abilityArr?.[0]) return null;

  const fixed: Partial<Record<AbilityScore, number>> = {};
  const choices: AbilityBonusChoice[] = [];

  for (const [abbr, val] of Object.entries(abilityArr[0])) {
    if (abbr === 'choose') {
      const choice = val as Record<string, unknown>;
      const fromRaw = (choice['from'] as string[]) ?? [];
      const from = fromRaw
        .map((a) => ABILITY_ABBR_MAP[a])
        .filter((a): a is AbilityScore => !!a);
      const count = (choice['count'] as number) ?? 1;
      const amount = (choice['amount'] as number) ?? 1;
      if (from.length > 0) choices.push({ from, count, amount });
      continue;
    }
    const fullName = ABILITY_ABBR_MAP[abbr];
    if (fullName && typeof val === 'number') {
      fixed[fullName] = val;
    }
  }

  if (Object.keys(fixed).length === 0 && choices.length === 0) return null;
  return { fixed, choices };
}

/** Convert a raw class/subclass feature entry (from IPC getClassFeatures) to a Feature. */
export function classFeatureEntryToFeature(
  entry: { name: string; entries: unknown[]; source: string; isSubclass: boolean; grantedLanguages?: string[]; grantedSpells?: Spell[]; knownChoiceOptions?: string[] },
  dndClass: string,
  classLevel: number,
): Feature {
  const hpBonus = HP_BONUS_FEATURES[_normalizeName(entry.name)];
  return {
    id: `class-feat::${dndClass}::${classLevel}::${entry.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: entry.name,
    source: entry.source,
    sourceType: entry.isSubclass ? 'subclass' : 'class',
    description: '',
    rawEntries: entry.entries.length > 0 ? entry.entries : undefined,
    grantedLanguages: entry.grantedLanguages?.length ? entry.grantedLanguages : undefined,
    grantedSpells: entry.grantedSpells?.length ? entry.grantedSpells : undefined,
    knownChoiceOptions: entry.knownChoiceOptions?.length ? entry.knownChoiceOptions : undefined,
    hpBonusPerLevel: hpBonus?.amount,
    hpBonusPerClassLevel: hpBonus?.classOnly || undefined,
  };
}

// ---------------------------------------------------------------------------
// Background data extraction
// ---------------------------------------------------------------------------

function _capitalizeWords(s: string): string {
  // Only capitalize after whitespace or start-of-string (not after apostrophes/hyphens)
  return s.replace(/(^|\s)\w/g, (c) => c.toUpperCase());
}

/** Convert a raw 5etools equipment entry to a BackgroundEquipmentItem, or null if unrecognisable. */
function _parseEquipmentItem(raw: unknown): BackgroundEquipmentItem | null {
  if (typeof raw === 'string') {
    // "item name|source" shorthand
    const name = _capitalizeWords(raw.split('|')[0]?.trim() ?? raw);
    return { name, quantity: 1 };
  }
  if (typeof raw !== 'object' || raw === null) return null;
  const obj = raw as Record<string, unknown>;

  // Pure GP value: { "value": 5000 } → 50 gp (no physical item)
  if ('value' in obj && !('item' in obj) && !('special' in obj)) {
    const gp = Math.floor((obj['value'] as number) / 100);
    return { name: `${gp} gp`, quantity: 1, gpValue: gp };
  }

  const quantity = (obj['quantity'] as number | undefined) ?? 1;
  const displayName = obj['displayName'] as string | undefined;

  if ('special' in obj) {
    const name = displayName ?? _capitalizeWords(String(obj['special']));
    return { name, quantity };
  }

  if ('item' in obj) {
    const rawName = (obj['item'] as string).split('|')[0]?.trim() ?? (obj['item'] as string);
    const name = displayName ?? _capitalizeWords(rawName);
    // containsValue — physical item that also holds gold
    const cv = obj['containsValue'] as number | undefined;
    const containedGold = cv !== undefined ? Math.floor(cv / 100) : undefined;
    const label = containedGold !== undefined ? `${name} (${containedGold} gp)` : name;
    return { name: label, quantity, containedGold };
  }

  return null;
}

/** Parse a startingEquipment array into fixed items and A/B choice groups. */
function _parseStartingEquipment(raw: unknown): {
  fixed: BackgroundEquipmentItem[];
  choiceA?: BackgroundEquipmentItem[];
  choiceB?: BackgroundEquipmentItem[];
} {
  const fixed: BackgroundEquipmentItem[] = [];
  let choiceA: BackgroundEquipmentItem[] | undefined;
  let choiceB: BackgroundEquipmentItem[] | undefined;

  if (!Array.isArray(raw)) return { fixed };

  for (const group of raw) {
    if (typeof group !== 'object' || group === null) continue;
    const g = group as Record<string, unknown>;

    // Fixed items — keyed by "_"
    if ('_' in g && Array.isArray(g['_'])) {
      for (const item of g['_']) {
        const eq = _parseEquipmentItem(item);
        if (eq) fixed.push(eq);
      }
      continue;
    }

    // A/B choice (lowercase or uppercase)
    const keyA = 'a' in g ? 'a' : 'A' in g ? 'A' : null;
    const keyB = 'b' in g ? 'b' : 'B' in g ? 'B' : null;
    if (keyA && keyB) {
      choiceA = (g[keyA] as unknown[]).map(_parseEquipmentItem).filter((x): x is BackgroundEquipmentItem => !!x);
      choiceB = (g[keyB] as unknown[]).map(_parseEquipmentItem).filter((x): x is BackgroundEquipmentItem => !!x);
    }
  }

  return { fixed, choiceA, choiceB };
}

export function extractBackgroundData(entry: CompendiumEntry): CharacterBackground {
  const raw = entry.raw;

  // Skill proficiencies — 5etools format: [{ "insight": true, "religion": true }]
  const skillProfs = raw['skillProficiencies'] as Record<string, unknown>[] | undefined;
  const skillProficiencies: string[] = [];
  if (skillProfs?.[0]) {
    for (const [key, value] of Object.entries(skillProfs[0])) {
      if (value === true) skillProficiencies.push(key);
    }
  }

  // Language count — 5etools format: [{ "anyStandard": 2 }]
  const langProfs = raw['languageProficiencies'] as Record<string, unknown>[] | undefined;
  const languageCount = (langProfs?.[0]?.['anyStandard'] as number | undefined) ?? 0;

  // Tool proficiencies
  const toolProfs = raw['toolProficiencies'] as Record<string, unknown>[] | undefined;
  const toolProficiencies: string[] = [];
  let toolChoices: { from: string[]; count: number } | undefined;
  if (toolProfs?.[0]) {
    for (const [key, value] of Object.entries(toolProfs[0])) {
      if (key === 'choose' && typeof value === 'object' && value !== null) {
        const c = value as Record<string, unknown>;
        const from = (c['from'] as string[] | undefined) ?? [];
        const count = (c['count'] as number | undefined) ?? 1;
        if (from.length > 0) toolChoices = { from, count };
      } else if (value === true) {
        toolProficiencies.push(_capitalizeWords(key));
      }
    }
  }

  // Starting equipment
  const { fixed, choiceA, choiceB } = _parseStartingEquipment(raw['startingEquipment']);

  const rawEntries = Array.isArray(raw['entries']) ? (raw['entries'] as unknown[]) : undefined;

  return {
    name: entry.name,
    source: entry.source,
    skillProficiencies,
    languageCount,
    toolProficiencies: toolProficiencies.length > 0 ? toolProficiencies : undefined,
    toolChoices,
    fixedEquipment: fixed.length > 0 ? fixed : undefined,
    equipmentChoiceA: choiceA,
    equipmentChoiceB: choiceB,
    rawEntries,
  };
}

// ---------------------------------------------------------------------------
// Race data extraction
// ---------------------------------------------------------------------------

const SIZE_MAP: Record<string, string> = {
  T: 'Tiny', S: 'Small', M: 'Medium', L: 'Large', H: 'Huge', G: 'Gargantuan',
};

const ABILITY_ABBR_MAP: Record<string, AbilityScore> = {
  str: 'strength', dex: 'dexterity', con: 'constitution',
  int: 'intelligence', wis: 'wisdom', cha: 'charisma',
};

/** A "choose N from these abilities" option from race data. */
export interface AbilityBonusChoice {
  from: AbilityScore[];
  count: number;
  amount: number;
}

/**
 * A weighted choice — "distribute these weights among abilities".
 * e.g. Tasha's Custom Origin: pick one ability +2 and another +1.
 */
export interface AbilityBonusWeightedChoice {
  from: AbilityScore[];
  weights: number[];
}

export interface RaceData {
  name: string;
  source: string;
  isSubrace: boolean;
  parentRace?: string;
  size: string;
  speed: number;
  darkvision?: number;
  languages: string[];
  abilityBonuses: Partial<Record<AbilityScore, number>>;
  abilityBonusChoices?: AbilityBonusChoice[];
  abilityBonusWeightedChoices?: AbilityBonusWeightedChoice[];
  features: Feature[];
}

function flattenEntries(entries: unknown[]): string {
  return entries
    .map((e) => {
      if (typeof e === 'string') return e;
      if (typeof e === 'object' && e !== null && 'entries' in e) {
        return flattenEntries((e as { entries: unknown[] }).entries);
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}

export function extractRaceData(entry: CompendiumEntry): RaceData {
  const raw = entry.raw;

  // Name & subrace
  const isSubrace = !!raw['raceName'];
  const parentRace = (raw['raceName'] as string) ?? undefined;
  const displayName = isSubrace ? `${entry.name} ${parentRace}` : entry.name;

  // Size
  const sizeArr = raw['size'] as string[] | undefined;
  const firstSize = sizeArr?.[0];
  const size = sizeArr && sizeArr.length > 0
    ? sizeArr.length > 1
      ? sizeArr.map((s) => SIZE_MAP[s] ?? s).join(' or ')
      : (firstSize ? (SIZE_MAP[firstSize] ?? firstSize) : 'Medium')
    : 'Medium';

  // Speed
  const rawSpeed = raw['speed'];
  const speed =
    typeof rawSpeed === 'number'
      ? rawSpeed
      : typeof rawSpeed === 'object' && rawSpeed !== null
        ? ((rawSpeed as Record<string, unknown>)['walk'] as number) ?? 30
        : 30;

  // Darkvision range in feet
  const darkvision = (raw['darkvision'] as number) ?? undefined;

  // Languages
  const langProfs = (raw['languageProficiencies'] as Record<string, unknown>[] | undefined)?.[0];
  const languages: string[] = [];
  if (langProfs) {
    for (const [key, value] of Object.entries(langProfs)) {
      if (value === true && key !== 'anyStandard' && key !== 'other') {
        languages.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    }
  }

  // Ability score bonuses
  const abilityBonuses: Partial<Record<AbilityScore, number>> = {};
  const abilityBonusChoices: AbilityBonusChoice[] = [];
  const abilityBonusWeightedChoices: AbilityBonusWeightedChoice[] = [];
  const abilityArr = raw['ability'] as Record<string, unknown>[] | undefined;
  if (abilityArr?.[0]) {
    for (const [abbr, val] of Object.entries(abilityArr[0])) {
      if (abbr === 'choose') {
        // Parse choice blocks: { from: string[], count: number, amount: number }
        // or weighted: { from: string[], weights: number[] }
        const choice = val as Record<string, unknown>;
        if (choice['weighted']) {
          const w = choice['weighted'] as Record<string, unknown>;
          const fromRaw = (w['from'] as string[]) ?? [];
          const from = fromRaw
            .map((a) => ABILITY_ABBR_MAP[a])
            .filter((a): a is AbilityScore => !!a);
          const weights = (w['weights'] as number[]) ?? [];
          if (from.length > 0 && weights.length > 0) {
            abilityBonusWeightedChoices.push({ from, weights });
          }
        } else {
          const fromRaw = (choice['from'] as string[]) ?? [];
          const from = fromRaw
            .map((a) => ABILITY_ABBR_MAP[a])
            .filter((a): a is AbilityScore => !!a);
          const count = (choice['count'] as number) ?? 1;
          const amount = (choice['amount'] as number) ?? 1;
          if (from.length > 0) {
            abilityBonusChoices.push({ from, count, amount });
          }
        }
        continue;
      }
      const fullName = ABILITY_ABBR_MAP[abbr];
      if (fullName && typeof val === 'number') {
        abilityBonuses[fullName] = val;
      }
    }
  }

  // Racial features from entries
  const features: Feature[] = [];
  const rawEntries = raw['entries'] as Array<Record<string, unknown>> | undefined;
  if (rawEntries) {
    for (const ent of rawEntries) {
      if (ent['type'] === 'entries' && ent['name']) {
        const desc = ent['entries'] ? flattenEntries(ent['entries'] as unknown[]) : '';
        const hpBonus = HP_BONUS_FEATURES[_normalizeName(ent['name'] as string)];
        features.push({
          id: `${entry.id}::${ent['name']}`,
          name: ent['name'] as string,
          source: entry.source,
          sourceType: 'race',
          description: desc,
          hpBonusPerLevel: hpBonus?.amount,
          hpBonusPerClassLevel: hpBonus?.classOnly || undefined,
        });
      }
    }
  }

  // Add darkvision as a synthetic feature if present (may be superseded by an entry-based one below)
  if (darkvision) {
    features.unshift({
      id: `${entry.id}::darkvision`,
      name: 'Darkvision',
      source: entry.source,
      sourceType: 'race',
      description: `You can see in dim light within ${darkvision} feet of you as if it were bright light, and in darkness as if it were dim light.`,
    });
  }

  // Deduplicate by name. Synthetic features are unshifted to the front; entry-based
  // features are pushed later and have richer content, so iterating in reverse and
  // keeping the last occurrence of each name preserves the entry-based version.
  const seenNames = new Set<string>();
  const dedupedFeatures: Feature[] = [];
  for (let i = features.length - 1; i >= 0; i--) {
    const f = features[i]!;
    if (!seenNames.has(f.name)) {
      seenNames.add(f.name);
      dedupedFeatures.unshift(f);
    }
  }

  return {
    name: displayName,
    source: entry.source,
    isSubrace,
    parentRace,
    size,
    speed,
    darkvision,
    languages,
    abilityBonuses,
    abilityBonusChoices: abilityBonusChoices.length > 0 ? abilityBonusChoices : undefined,
    abilityBonusWeightedChoices: abilityBonusWeightedChoices.length > 0 ? abilityBonusWeightedChoices : undefined,
    features: dedupedFeatures,
  };
}
