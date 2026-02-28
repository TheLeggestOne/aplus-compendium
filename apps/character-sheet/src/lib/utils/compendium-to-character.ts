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
  Feature,
  FeatureSourceType,
  CompendiumContentType,
  AbilityScore,
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

export function entryToFeature(entry: CompendiumEntry): Feature {
  return {
    id:         entry.id,
    name:       entry.name,
    source:     entry.source,
    sourceType: FEATURE_SOURCE_TYPE[entry.contentType] ?? 'feat',
    description: '',
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

  // Darkvision
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
        features.push({
          id: `${entry.id}::${ent['name']}`,
          name: ent['name'] as string,
          source: entry.source,
          sourceType: 'race',
          description: desc,
        });
      }
    }
  }

  // Add darkvision as a feature if present
  if (darkvision) {
    features.unshift({
      id: `${entry.id}::darkvision`,
      name: 'Darkvision',
      source: entry.source,
      sourceType: 'race',
      description: `You can see in dim light within ${darkvision} feet of you as if it were bright light, and in darkness as if it were dim light.`,
    });
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
    features,
  };
}
