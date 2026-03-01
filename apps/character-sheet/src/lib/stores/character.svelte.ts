import type {
  Character, Spell, Weapon, Armor, EquipmentItem, Feature,
  AbilityScore, AbilityScoreSet, SkillName, SkillEntry, SkillProficiencyGrant, ProficiencyLevel,
  CharacterClass, ClassLevel, ClassSpellcasting, DndClass, DieType, HitDicePool, AsiChoice,
  InventoryItem, InventoryContainer, InventoryWeapon, InventoryArmor,
} from '@aplus-compendium/types';
import {
  abilityModifier, SKILL_ABILITY_MAP,
  CLASS_HIT_DICE, CLASS_CASTER_PROGRESSION, CLASS_SPELLCASTING_ABILITY, CLASS_SUBCLASS_LEVEL, CLASS_SAVING_THROWS, CLASS_SKILL_CHOICES,
  proficiencyBonusForLevel, combinedCasterLevel, multiclassSpellSlots,
  cantripCapacity, spellCapacity,
} from '@aplus-compendium/types';
import type { RaceData } from '$lib/utils/compendium-to-character.js';
import { migrateAbilityScoreLayers, migrateHpRoll, migrateSpellCapacity, migrateSkillGrants, migrateInventory } from '$lib/utils/migrate-character.js';
import { mockPaladinAerindel } from '$lib/mock-data/paladin-5.js';

// ---------------------------------------------------------------------------
// Level stack helpers (pure functions, used by store and migration)
// ---------------------------------------------------------------------------

/** Derive the CharacterClass[] summary from a level stack */
function deriveClassesSummary(stack: ClassLevel[]): CharacterClass[] {
  const map = new Map<DndClass, CharacterClass>();
  for (const lv of stack) {
    const existing = map.get(lv.class);
    if (existing) {
      existing.level = lv.classLevel;
      if (lv.subclassChoice) existing.subclass = lv.subclassChoice;
    } else {
      map.set(lv.class, {
        class: lv.class,
        level: lv.classLevel,
        subclass: lv.subclassChoice,
        hitDie: lv.hitDie,
      });
    }
  }
  // Inherit subclass from earlier levels for classes where it was set
  for (const lv of stack) {
    if (lv.subclassChoice) {
      const entry = map.get(lv.class);
      if (entry) entry.subclass = lv.subclassChoice;
    }
  }
  return [...map.values()];
}

/** Derive hit dice pools from a level stack, preserving used counts */
function deriveHitDicePools(stack: ClassLevel[], existingPools: HitDicePool[]): HitDicePool[] {
  const poolMap = new Map<DieType, number>();
  for (const lv of stack) {
    poolMap.set(lv.hitDie, (poolMap.get(lv.hitDie) ?? 0) + 1);
  }
  return [...poolMap.entries()].map(([dieType, total]) => {
    const existing = existingPools.find((p) => p.dieType === dieType);
    return { dieType, total, used: Math.min(existing?.used ?? 0, total) };
  });
}

// ---------------------------------------------------------------------------
// Ability score layer constants
// ---------------------------------------------------------------------------

const ABILITY_KEYS: AbilityScore[] = [
  'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

function createCharacterStore(initial: Character) {
  let character = $state<Character>(structuredClone(initial));

  let _saveTimer: ReturnType<typeof setTimeout> | null = null;

  function queueSave(): void {
    if (_saveTimer !== null) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(async () => {
      _saveTimer = null;
      if (!window.electronAPI) return;
      try {
        // JSON round-trip strips Svelte 5 reactive proxies — passing a proxy directly
        // to Electron IPC causes a silent structured-clone failure.
        const plain = JSON.parse(JSON.stringify(character)) as Character;
        // Keep classes summary synced from level stack for backward compatibility
        if (plain.levelStack && plain.levelStack.length > 0) {
          plain.classes = deriveClassesSummary(plain.levelStack);
          plain.proficiencyBonus = proficiencyBonusForLevel(plain.levelStack.length);
        }
        const result = await window.electronAPI.characters.save(plain);
        if (!result.ok) console.error('[character] save failed:', result.error);
      } catch (e) {
        console.error('[character] save IPC error:', e);
      }
    }, 1500);
  }

  function reinit(newChar: Character): void {
    if (_saveTimer !== null) {
      clearTimeout(_saveTimer);
      _saveTimer = null;
    }
    character = migrateInventory(migrateSkillGrants(migrateSpellCapacity(migrateHpRoll(migrateAbilityScoreLayers(structuredClone(newChar))))));
  }

  // --- Derived values ---

  const totalLevel = $derived(
    character.classes.reduce((sum, c) => sum + c.level, 0),
  );

  // --- Layered ability scores ---
  // Base (point buy) + racial bonuses + ASI increases, with item overrides
  const effectiveAbilityScores = $derived.by((): AbilityScoreSet => {
    const base = character.abilityScores;
    const racial = character.raceAbilityBonuses ?? {};
    const overrides = character.abilityScoreOverrides ?? {};

    // Sum ASI increases from level stack
    const asiTotals: Partial<Record<AbilityScore, number>> = {};
    if (character.levelStack) {
      for (const lv of character.levelStack) {
        if (lv.asiChoice?.type === 'asi') {
          for (const [ability, increase] of Object.entries(lv.asiChoice.increases)) {
            const key = ability as AbilityScore;
            asiTotals[key] = (asiTotals[key] ?? 0) + (increase ?? 0);
          }
        }
      }
    }

    // Build effective scores
    const result = { ...base };
    for (const ability of ABILITY_KEYS) {
      const computed = base[ability] + (racial[ability] ?? 0) + (asiTotals[ability] ?? 0);
      result[ability] = overrides[ability] ?? computed;
    }
    return result;
  });

  const abilityModifiers = $derived({
    strength:     abilityModifier(effectiveAbilityScores.strength),
    dexterity:    abilityModifier(effectiveAbilityScores.dexterity),
    constitution: abilityModifier(effectiveAbilityScores.constitution),
    intelligence: abilityModifier(effectiveAbilityScores.intelligence),
    wisdom:       abilityModifier(effectiveAbilityScores.wisdom),
    charisma:     abilityModifier(effectiveAbilityScores.charisma),
  });

  const passivePerception = $derived(
    10 + character.skills['perception'].modifier,
  );

  const classString = $derived(
    character.classes
      .map((c) => `${c.subclass ? c.subclass + ' ' : ''}${c.class.charAt(0).toUpperCase() + c.class.slice(1)} ${c.level}`)
      .join(' / '),
  );

  const carryCapacity = $derived(effectiveAbilityScores.strength * 15);

  const currentCarryWeight = $derived(() => {
    const items = character.inventoryItems;
    if (items) {
      return items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    }
    // Fallback for unmigrated characters
    const weaponWeight = character.weapons.reduce((sum, w) => sum + w.weight * w.quantity, 0);
    const armorWeight = character.armor.reduce((sum, a) => sum + a.weight * a.quantity, 0);
    const equipmentWeight = character.equipment.reduce((sum, e) => sum + e.weight * e.quantity, 0);
    return weaponWeight + armorWeight + equipmentWeight;
  });

  const wornItems = $derived(character.inventoryItems?.filter((i) => i.containerId === 'worn') ?? []);

  const attuneCount = $derived(character.inventoryItems?.filter((i) => i.attuned).length ?? 0);

  /**
   * AC derived from equipped armor and shield. Falls back to `character.combat.armorClass`
   * when no armor is equipped (covers unarmored defense, Mage Armor, natural armor, etc.).
   * Shield (in offhand) always adds its AC bonus on top.
   */
  const derivedAC = $derived.by(() => {
    const dexMod = abilityModifier(effectiveAbilityScores.dexterity);
    const equippedArmor = wornItems.find(
      (i): i is InventoryArmor => i.type === 'armor' && i.equipSlot === 'armor',
    );
    const equippedShield = wornItems.find(
      (i): i is InventoryArmor => i.type === 'armor' && i.equipSlot === 'offhand',
    );

    let baseAC: number;
    if (equippedArmor) {
      // Resolve max DEX contribution: prefer stored maxDexBonus, fall back to category
      const maxDex =
        equippedArmor.maxDexBonus !== undefined
          ? equippedArmor.maxDexBonus
          : equippedArmor.category === 'heavy'
            ? 0
            : equippedArmor.category === 'medium'
              ? 2
              : undefined; // light = full DEX
      const dexContrib = maxDex === undefined ? dexMod : maxDex === 0 ? 0 : Math.min(dexMod, maxDex);
      baseAC = equippedArmor.baseArmorClass + dexContrib;
    } else {
      baseAC = character.combat.armorClass;
    }

    return baseAC + (equippedShield ? equippedShield.baseArmorClass : 0);
  });

  const xpForNextLevel: Record<number, number> = {
    1: 300, 2: 900, 3: 2700, 4: 6500, 5: 14000,
    6: 23000, 7: 34000, 8: 48000, 9: 64000, 10: 85000,
    11: 100000, 12: 120000, 13: 140000, 14: 165000, 15: 195000,
    16: 225000, 17: 265000, 18: 305000, 19: 355000, 20: Infinity,
  };

  const xpForCurrentLevel: Record<number, number> = {
    1: 0, 2: 300, 3: 900, 4: 2700, 5: 6500,
    6: 14000, 7: 23000, 8: 34000, 9: 48000, 10: 64000,
    11: 85000, 12: 100000, 13: 120000, 14: 140000, 15: 165000,
    16: 195000, 17: 225000, 18: 265000, 19: 305000, 20: 355000,
  };

  const xpProgress = $derived(() => {
    const level = totalLevel;
    const currentMin = xpForCurrentLevel[level] ?? 0;
    const currentMax = xpForNextLevel[level] ?? Infinity;
    if (!isFinite(currentMax)) return 100;
    return Math.round(((character.experience - currentMin) / (currentMax - currentMin)) * 100);
  });

  // --- Level stack derived values ---

  const hasLevelStack = $derived(
    !!character.levelStack && character.levelStack.length > 0,
  );

  const derivedProficiencyBonus = $derived(
    proficiencyBonusForLevel(totalLevel),
  );

  const derivedSpellSlots = $derived(() => {
    if (!character.classSpellcasting || character.classSpellcasting.length === 0) {
      return character.spellcasting?.slots ?? [];
    }
    const summary = character.levelStack
      ? deriveClassesSummary(character.levelStack)
      : character.classes;
    const classLevels = character.classSpellcasting
      .filter((cs) => cs.casterProgression !== 'none' && cs.casterProgression !== 'pact')
      .map((cs) => ({
        level: summary.find((c) => c.class === cs.class)?.level ?? 0,
        progression: cs.casterProgression,
      }));
    const casterLvl = combinedCasterLevel(classLevels);
    const slots = multiclassSpellSlots(casterLvl);
    // Preserve used counts from existing slots
    const existingSlots = character.spellcasting?.slots ?? [];
    for (const slot of slots) {
      const existing = existingSlots.find((s) => s.level === slot.level);
      if (existing) slot.used = existing.used;
    }
    return slots;
  });

  const derivedMaxHp = $derived.by(() => {
    const stack = character.levelStack;
    if (!stack || stack.length === 0) return character.combat.maxHitPoints;
    const conMod = abilityModifier(effectiveAbilityScores.constitution);
    return stack.reduce((sum, lv) => sum + Math.max(1, lv.hpRoll + conMod), 0);
  });

  // --- Per-class spell capacity ---

  // Per-class spellcasting stats: ability, save DC, attack bonus
  const classSpellcastingAbilities = $derived.by(() => {
    if (!character.classSpellcasting) return [];
    const profBonus = derivedProficiencyBonus;
    return character.classSpellcasting.map((cs) => {
      const mod = abilityModifier(effectiveAbilityScores[cs.abilityScore]);
      return {
        class: cs.class,
        abilityScore: cs.abilityScore,
        spellSaveDC: 8 + profBonus + mod,
        spellAttackBonus: profBonus + mod,
      };
    });
  });

  const classSpellCapacities = $derived.by(() => {
    if (!character.classSpellcasting) return [];
    const summary = character.levelStack
      ? deriveClassesSummary(character.levelStack)
      : character.classes;
    return character.classSpellcasting.map((cs) => {
      const classLevel = summary.find((c) => c.class === cs.class)?.level ?? 0;
      const aMod = abilityModifier(effectiveAbilityScores[cs.abilityScore]);
      return {
        class: cs.class,
        cantripCap: cantripCapacity(cs.class, classLevel),
        spellCap: spellCapacity(cs.class, classLevel, aMod),
        cantripCount: cs.cantrips.length,
        spellCount: cs.spellsKnown.length,
      };
    });
  });

  // --- Recalculate skills/saves from effective scores ---

  function getProfFromGrants(skill: SkillName, entry: SkillEntry): ProficiencyLevel {
    const grants = character.skillProficiencyGrants;
    if (!grants?.length) return entry.proficiency;
    let best: ProficiencyLevel = 'none';
    for (const grant of grants) {
      if (grant.selected.includes(skill)) {
        if ((grant.level ?? 'proficient') === 'expertise') return 'expertise';
        best = 'proficient';
      }
    }
    return best;
  }

  function recalculateSkillsAndSaves(): void {
    const scores = effectiveAbilityScores;
    const profBonus = character.proficiencyBonus;

    const skills = {} as Record<SkillName, SkillEntry>;
    for (const [name, entry] of Object.entries(character.skills) as [SkillName, SkillEntry][]) {
      const ability = SKILL_ABILITY_MAP[name];
      const mod = abilityModifier(scores[ability]);
      const proficiency = getProfFromGrants(name, entry);
      const prof =
        proficiency === 'expertise'
          ? profBonus * 2
          : proficiency === 'proficient'
            ? profBonus
            : 0;
      skills[name] = { ...entry, proficiency, modifier: mod + prof };
    }

    const savingThrows = { ...character.savingThrows };
    for (const ability of ABILITY_KEYS) {
      const entry = savingThrows[ability];
      const mod = abilityModifier(scores[ability]);
      savingThrows[ability] = { ...entry, modifier: mod + (entry.proficient ? profBonus : 0) };
    }

    character = {
      ...character,
      skills,
      savingThrows,
      combat: { ...character.combat, initiative: abilityModifier(scores.dexterity) },
    };
  }

  /**
   * Recompute max HP from the level stack using current effective CON mod.
   * Adjusts current HP by the same delta (5e rule: CON changes are retroactive).
   */
  function recomputeHp(): void {
    const stack = character.levelStack;
    if (!stack || stack.length === 0) return;
    const conMod = abilityModifier(effectiveAbilityScores.constitution);
    const newMax = stack.reduce((sum, lv) => sum + Math.max(1, lv.hpRoll + conMod), 0);
    const oldMax = character.combat.maxHitPoints;
    const delta = newMax - oldMax;
    character = {
      ...character,
      combat: {
        ...character.combat,
        maxHitPoints: newMax,
        currentHitPoints: Math.max(0, Math.min(newMax, character.combat.currentHitPoints + delta)),
      },
    };
  }

  // --- View Mode mutations ---

  function adjustHp(delta: number): void {
    const { currentHitPoints, maxHitPoints } = character.combat;
    const next = Math.max(0, Math.min(maxHitPoints, currentHitPoints + delta));
    character = {
      ...character,
      combat: { ...character.combat, currentHitPoints: next },
    };
    queueSave();
  }

  function setCurrentHp(value: number): void {
    const clamped = Math.max(0, Math.min(character.combat.maxHitPoints, value));
    character = {
      ...character,
      combat: { ...character.combat, currentHitPoints: clamped },
    };
    queueSave();
  }

  function setTempHp(hp: number): void {
    character = {
      ...character,
      combat: { ...character.combat, temporaryHitPoints: Math.max(0, hp) },
    };
    queueSave();
  }

  /**
   * Upsert spell slot usage into character.spellcasting.slots.
   * Works for both legacy characters (with existing spellcasting) and
   * classSpellcasting characters (which may have no legacy spellcasting field).
   */
  function _upsertSpellSlotUsed(level: number, delta: 1 | -1): void {
    // Use derivedSpellSlots to know the valid total for this level
    const derivedSlot = derivedSpellSlots().find((s) => s.level === level);
    if (!derivedSlot) return;

    const existingSlots = character.spellcasting?.slots ?? [];
    const existing = existingSlots.find((s) => s.level === level);
    const currentUsed = existing?.used ?? 0;

    if (delta === 1 && currentUsed >= derivedSlot.total) return;
    if (delta === -1 && currentUsed <= 0) return;

    const newUsed = currentUsed + delta;
    const newSlots = existing
      ? existingSlots.map((s) => (s.level === level ? { ...s, used: newUsed } : s))
      : [...existingSlots, { level: level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9, total: derivedSlot.total, used: newUsed }];

    character = {
      ...character,
      spellcasting: character.spellcasting
        ? { ...character.spellcasting, slots: newSlots }
        // Create minimal spellcasting stub just to hold slot tracking
        : { ability: { abilityScore: 'intelligence' as AbilityScore, spellSaveDC: 0, spellAttackBonus: 0 }, slots: newSlots, cantrips: [], spellsKnown: [] },
    };
    queueSave();
  }

  function useSpellSlot(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): void {
    _upsertSpellSlotUsed(level, 1);
  }

  function restoreSpellSlot(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): void {
    _upsertSpellSlotUsed(level, -1);
  }

  function useFeature(featureId: string): void {
    const features = character.features.map((f) => {
      if (f.id !== featureId || !f.uses || f.uses.current <= 0) return f;
      return { ...f, uses: { ...f.uses, current: f.uses.current - 1 } };
    });
    character = { ...character, features };
    queueSave();
  }

  function restoreFeature(featureId: string): void {
    const features = character.features.map((f) => {
      if (f.id !== featureId || !f.uses || f.uses.current >= f.uses.maximum) return f;
      return { ...f, uses: { ...f.uses, current: f.uses.current + 1 } };
    });
    character = { ...character, features };
    queueSave();
  }

  function useHitDie(dieType: string): void {
    const hitDicePools = character.combat.hitDicePools.map((p) =>
      p.dieType === dieType && p.used < p.total
        ? { ...p, used: p.used + 1 }
        : p,
    );
    character = { ...character, combat: { ...character.combat, hitDicePools } };
    queueSave();
  }

  function recordDeathSave(type: 'success' | 'failure'): void {
    const { deathSaves } = character.combat;
    const updated =
      type === 'success'
        ? { ...deathSaves, successes: Math.min(3, deathSaves.successes + 1) }
        : { ...deathSaves, failures: Math.min(3, deathSaves.failures + 1) };
    character = { ...character, combat: { ...character.combat, deathSaves: updated } };
    queueSave();
  }

  function resetDeathSaves(): void {
    character = {
      ...character,
      combat: { ...character.combat, deathSaves: { successes: 0, failures: 0 } },
    };
    queueSave();
  }

  function toggleInspiration(): void {
    character = { ...character, inspiration: !character.inspiration };
    queueSave();
  }

  function shortRest(): void {
    const features = character.features.map((f) =>
      f.uses?.resetOn === 'short' ? { ...f, uses: { ...f.uses, current: f.uses.maximum } } : f,
    );
    character = { ...character, features };
    queueSave();
  }

  // --- Legacy compendium add mutations (kept for backward compat) ---

  function addWeapon(weapon: Weapon): void {
    character = { ...character, weapons: [...character.weapons, weapon] };
    queueSave();
  }

  function addArmor(armor: Armor): void {
    character = { ...character, armor: [...character.armor, armor] };
    queueSave();
  }

  function addEquipment(item: EquipmentItem): void {
    character = { ...character, equipment: [...character.equipment, item] };
    queueSave();
  }

  function addFeature(feature: Feature): void {
    if (character.features.some(f => f.id === feature.id)) return;
    character = { ...character, features: [...character.features, feature] };
    queueSave();
  }

  function setAbilityScores(scores: AbilityScoreSet): void {
    character = { ...character, abilityScores: { ...scores } };
    // effectiveAbilityScores updates reactively, then recalculate downstream
    recalculateSkillsAndSaves();
    recomputeHp();
    queueSave();
  }

  function setRace(data: RaceData, resolvedBonuses?: Partial<Record<AbilityScore, number>>): void {
    // Replace old racial features with new ones
    const features = [
      ...character.features.filter((f) => f.sourceType !== 'race'),
      ...data.features,
    ];

    // Combine fixed bonuses with any resolved choices
    const newBonuses: Partial<Record<AbilityScore, number>> = { ...data.abilityBonuses };
    if (resolvedBonuses) {
      for (const [ability, bonus] of Object.entries(resolvedBonuses) as [AbilityScore, number][]) {
        newBonuses[ability] = (newBonuses[ability] ?? 0) + bonus;
      }
    }

    // Store racial bonuses — effectiveAbilityScores derives the total
    character = {
      ...character,
      race: data.isSubrace ? (data.parentRace ?? data.name) : data.name,
      subrace: data.isSubrace ? data.name : undefined,
      size: data.size,
      combat: { ...character.combat, speed: data.speed },
      languages: data.languages.length > 0 ? data.languages : character.languages,
      features,
      raceAbilityBonuses: Object.keys(newBonuses).length > 0 ? newBonuses : undefined,
    };

    recalculateSkillsAndSaves();
    recomputeHp();
    queueSave();
  }

  function longRest(): void {
    const features = character.features.map((f) =>
      f.uses ? { ...f, uses: { ...f.uses, current: f.uses.maximum } } : f,
    );
    const slots = character.spellcasting?.slots.map((s) => ({ ...s, used: 0 }));
    const hitDicePools = character.combat.hitDicePools.map((p) => ({
      ...p,
      used: Math.max(0, p.used - Math.max(1, Math.floor(p.total / 2))),
    }));
    character = {
      ...character,
      combat: {
        ...character.combat,
        currentHitPoints: character.combat.maxHitPoints,
        temporaryHitPoints: 0,
        deathSaves: { successes: 0, failures: 0 },
        hitDicePools,
      },
      features,
      spellcasting:
        character.spellcasting && slots
          ? { ...character.spellcasting, slots }
          : character.spellcasting,
    };
    queueSave();
  }

  // --- Class stack mutations ---

  function addClassLevel(params: {
    class: DndClass;
    hpRoll: number;
    subclassChoice?: string;
    asiChoice?: AsiChoice;
    features?: Feature[];
  }): void {
    const stack = character.levelStack ?? [];
    const classLevelCount = stack.filter((lv) => lv.class === params.class).length;
    const newClassLevel = classLevelCount + 1;
    const hitDie = CLASS_HIT_DICE[params.class];

    const newLevel: ClassLevel = {
      class: params.class,
      hitDie,
      classLevel: newClassLevel,
      hpRoll: params.hpRoll,
      featureIds: (params.features ?? []).map((f) => f.id),
      subclassChoice: params.subclassChoice,
      asiChoice: params.asiChoice,
    };

    // If first level in a caster class, initialize ClassSpellcasting
    const spellAbility = CLASS_SPELLCASTING_ABILITY[params.class];
    const classSpellcasting = character.classSpellcasting
      ? [...character.classSpellcasting]
      : [];
    if (spellAbility && newClassLevel === 1) {
      classSpellcasting.push({
        class: params.class,
        abilityScore: spellAbility,
        casterProgression: CLASS_CASTER_PROGRESSION[params.class],
        cantrips: [],
        spellsKnown: [],
      });
    }

    // Tag features with class source info
    const newFeatures = (params.features ?? []).map((f) => ({
      ...f,
      sourceClass: params.class,
      sourceClassLevel: newClassLevel,
    }));

    // ASI data is stored in the ClassLevel entry — effectiveAbilityScores derives the total

    // First class ever → set saving throw proficiencies + add skill grant
    if (stack.length === 0) {
      const [save1, save2] = CLASS_SAVING_THROWS[params.class];
      const savingThrows = { ...character.savingThrows };
      for (const ability of ABILITY_KEYS) {
        savingThrows[ability] = {
          ...savingThrows[ability],
          proficient: ability === save1 || ability === save2,
        };
      }
      const { count, choices } = CLASS_SKILL_CHOICES[params.class];
      const classGrant: SkillProficiencyGrant = {
        id: `class-${params.class}`,
        source: 'class',
        sourceLabel: params.class.charAt(0).toUpperCase() + params.class.slice(1),
        count,
        choices,
        // Auto-select when only one choice is available
        selected: choices.length === 1 ? [...choices] : [],
      };
      const existingGrants = character.skillProficiencyGrants ?? [];
      character = {
        ...character,
        savingThrows,
        skillProficiencyGrants: [...existingGrants, classGrant],
      };
    }

    const updatedStack = [...stack, newLevel];
    const updatedClasses = deriveClassesSummary(updatedStack);
    const newProfBonus = proficiencyBonusForLevel(updatedStack.length);

    character = {
      ...character,
      levelStack: updatedStack,
      classes: updatedClasses,
      classSpellcasting: classSpellcasting.length > 0 ? classSpellcasting : undefined,
      proficiencyBonus: newProfBonus,
      features: [...character.features, ...newFeatures],
      combat: {
        ...character.combat,
        hitDicePools: deriveHitDicePools(updatedStack, character.combat.hitDicePools),
      },
    };

    recalculateSkillsAndSaves();
    recomputeHp();
    queueSave();
  }

  function removeLastLevel(): void {
    const stack = character.levelStack;
    if (!stack || stack.length === 0) return;

    const removed = stack[stack.length - 1]!;
    const newStack = stack.slice(0, -1);

    // Remove features gained at this level
    const removedFeatureIds = new Set(removed.featureIds);
    const features = character.features.filter((f) => !removedFeatureIds.has(f.id));

    // ASI revert is automatic — effectiveAbilityScores derives from the remaining stack

    // If we removed the last level of a caster class, remove its ClassSpellcasting entry
    const remainingClassLevels = newStack.filter((lv) => lv.class === removed.class).length;
    let classSpellcasting = character.classSpellcasting
      ? [...character.classSpellcasting]
      : [];
    if (remainingClassLevels === 0) {
      classSpellcasting = classSpellcasting.filter((cs) => cs.class !== removed.class);
    } else {
      // Trim spells/cantrips that exceed the new (lower) capacity
      const newSummary = deriveClassesSummary(newStack);
      classSpellcasting = classSpellcasting.map((cs) => {
        if (cs.class !== removed.class) return cs;
        const classLvl = newSummary.find((c) => c.class === cs.class)?.level ?? 0;
        const aMod = abilityModifier(effectiveAbilityScores[cs.abilityScore]);
        const cCap = cantripCapacity(cs.class, classLvl);
        const sCap = spellCapacity(cs.class, classLvl, aMod);
        return {
          ...cs,
          cantrips: cs.cantrips.slice(0, cCap),
          spellsKnown: cs.spellsKnown.slice(0, sCap),
        };
      });
    }

    // Removing last level → clear saving throw proficiencies from the first class
    // Also remove the class skill grant if this was the last level of that class
    let skillProficiencyGrants = character.skillProficiencyGrants ? [...character.skillProficiencyGrants] : [];
    if (remainingClassLevels === 0) {
      skillProficiencyGrants = skillProficiencyGrants.filter((g) => g.id !== `class-${removed.class}`);
    }
    if (newStack.length === 0) {
      const savingThrows = { ...character.savingThrows };
      for (const ability of ABILITY_KEYS) {
        savingThrows[ability] = { ...savingThrows[ability], proficient: false };
      }
      character = { ...character, savingThrows };
    }

    const newProfBonus = proficiencyBonusForLevel(newStack.length);
    const updatedClasses = deriveClassesSummary(newStack);

    character = {
      ...character,
      levelStack: newStack,
      classes: updatedClasses,
      classSpellcasting: classSpellcasting.length > 0 ? classSpellcasting : undefined,
      proficiencyBonus: newProfBonus,
      features,
      skillProficiencyGrants: skillProficiencyGrants.length > 0 ? skillProficiencyGrants : [],
      combat: {
        ...character.combat,
        hitDicePools: deriveHitDicePools(newStack, character.combat.hitDicePools),
      },
    };

    recalculateSkillsAndSaves();
    recomputeHp();
    queueSave();
  }

  function setSubclass(dndClass: DndClass, subclass: string): void {
    const stack = character.levelStack;
    if (!stack) return;

    const subclassLevel = CLASS_SUBCLASS_LEVEL[dndClass];
    const idx = stack.findLastIndex(
      (lv) => lv.class === dndClass && lv.classLevel === subclassLevel,
    );
    if (idx === -1) return;

    const newStack = [...stack];
    newStack[idx] = { ...newStack[idx]!, subclassChoice: subclass };

    character = {
      ...character,
      levelStack: newStack,
      classes: deriveClassesSummary(newStack),
    };
    queueSave();
  }

  function addClassSpell(dndClass: DndClass, spell: Spell): boolean {
    if (!character.classSpellcasting) return false;

    // Find capacity for this class
    const cap = classSpellCapacities.find((c) => c.class === dndClass);

    const classSpellcasting = character.classSpellcasting.map((cs) => {
      if (cs.class !== dndClass) return cs;
      if (spell.level === 0) {
        if (cs.cantrips.some((s) => s.id === spell.id)) return cs;
        if (cap && cs.cantrips.length >= cap.cantripCap) return cs;
        return { ...cs, cantrips: [...cs.cantrips, spell] };
      } else {
        if (cs.spellsKnown.some((s) => s.id === spell.id)) return cs;
        if (cap && cs.spellsKnown.length >= cap.spellCap) return cs;
        return { ...cs, spellsKnown: [...cs.spellsKnown, spell] };
      }
    });

    character = { ...character, classSpellcasting };
    queueSave();
    return true;
  }

  function removeClassSpell(dndClass: DndClass, spellId: string): void {
    if (!character.classSpellcasting) return;

    const classSpellcasting = character.classSpellcasting.map((cs) => {
      if (cs.class !== dndClass) return cs;
      return {
        ...cs,
        cantrips: cs.cantrips.filter((s) => s.id !== spellId),
        spellsKnown: cs.spellsKnown.filter((s) => s.id !== spellId),
      };
    });

    character = { ...character, classSpellcasting };
    queueSave();
  }

  function updateClassSpell(dndClass: DndClass, spell: Spell): void {
    if (!character.classSpellcasting) return;
    const classSpellcasting = character.classSpellcasting.map((cs) => {
      if (cs.class !== dndClass) return cs;
      return {
        ...cs,
        cantrips: cs.cantrips.map((s) => (s.id === spell.id ? spell : s)),
        spellsKnown: cs.spellsKnown.map((s) => (s.id === spell.id ? spell : s)),
      };
    });
    character = { ...character, classSpellcasting };
    queueSave();
  }

  // --- Spell prepared mutations ---

  function setSpellPrepared(dndClass: DndClass, spellId: string, prepared: boolean): void {
    if (!character.classSpellcasting) return;
    const classSpellcasting = character.classSpellcasting.map((cs) => {
      if (cs.class !== dndClass) return cs;
      return {
        ...cs,
        spellsKnown: cs.spellsKnown.map((s) =>
          s.id === spellId ? { ...s, prepared } : s,
        ),
      };
    });
    character = { ...character, classSpellcasting };
    queueSave();
  }

  // --- Skill grant mutations ---

  function setSkillGrantSelections(grantId: string, selected: SkillName[]): void {
    const grants = (character.skillProficiencyGrants ?? []).map((g) =>
      g.id === grantId ? { ...g, selected } : g,
    );
    character = { ...character, skillProficiencyGrants: grants };
    recalculateSkillsAndSaves();
    queueSave();
  }

  function addManualSkillGrant(label: string, count: number): void {
    const grant: SkillProficiencyGrant = {
      id: `manual-${Date.now()}`,
      source: 'manual',
      sourceLabel: label,
      count,
      choices: [],
      selected: [],
    };
    character = {
      ...character,
      skillProficiencyGrants: [...(character.skillProficiencyGrants ?? []), grant],
    };
    queueSave();
  }

  function removeSkillGrant(grantId: string): void {
    const grants = (character.skillProficiencyGrants ?? []).filter((g) => g.id !== grantId);
    character = { ...character, skillProficiencyGrants: grants };
    recalculateSkillsAndSaves();
    queueSave();
  }

  // --- Inventory mutations ---

  function _itemId(): string {
    return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function addInventoryItem(item: InventoryItem): void {
    const items = character.inventoryItems ?? [];
    const newItem = { ...item, id: item.id || _itemId(), containerId: item.containerId || 'default' };
    character = { ...character, inventoryItems: [...items, newItem] };
    queueSave();
  }

  function removeInventoryItem(itemId: string): void {
    const items = (character.inventoryItems ?? []).filter((i) => i.id !== itemId);
    character = { ...character, inventoryItems: items };
    queueSave();
  }

  function updateInventoryItem(itemId: string, patch: Partial<InventoryItem>): void {
    const items = (character.inventoryItems ?? []).map((i) =>
      i.id === itemId ? ({ ...i, ...patch } as InventoryItem) : i,
    );
    character = { ...character, inventoryItems: items };
    queueSave();
  }

  function adjustItemQuantity(itemId: string, delta: number): void {
    const items = (character.inventoryItems ?? []).map((i) => {
      if (i.id !== itemId) return i;
      return { ...i, quantity: Math.max(0, i.quantity + delta) };
    });
    character = { ...character, inventoryItems: items };
    queueSave();
  }

  function setItemQuantity(itemId: string, qty: number): void {
    const items = (character.inventoryItems ?? []).map((i) =>
      i.id === itemId ? { ...i, quantity: Math.max(0, qty) } : i,
    );
    character = { ...character, inventoryItems: items };
    queueSave();
  }

  function toggleAttuned(itemId: string): void {
    const items = (character.inventoryItems ?? []).map((i) =>
      i.id === itemId ? { ...i, attuned: !i.attuned } : i,
    );
    character = { ...character, inventoryItems: items };
    queueSave();
  }

  function moveItemToContainer(itemId: string, targetContainerId: string): void {
    const allItems = character.inventoryItems ?? [];
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;

    // Moving out of worn — just clear equipSlot
    if (item.containerId === 'worn' && targetContainerId !== 'worn') {
      const items = allItems.map((i) =>
        i.id === itemId ? ({ ...i, containerId: targetContainerId, equipSlot: undefined } as InventoryItem) : i,
      );
      character = { ...character, inventoryItems: items };
      queueSave();
      return;
    }

    if (targetContainerId !== 'worn') {
      const items = allItems.map((i) =>
        i.id === itemId ? ({ ...i, containerId: targetContainerId, equipSlot: undefined } as InventoryItem) : i,
      );
      character = { ...character, inventoryItems: items };
      queueSave();
      return;
    }

    // Moving INTO worn — slot-aware logic
    const wornNow = allItems.filter((i) => i.containerId === 'worn');
    const updates = new Map<string, Partial<InventoryItem>>();

    if (item.type === 'armor') {
      const armorItem = item as InventoryArmor;
      if (armorItem.category === 'shield') {
        // Shield occupies the off-hand slot
        const conflict = wornNow.find((i) => i.equipSlot === 'offhand');
        if (conflict) updates.set(conflict.id, { containerId: 'default', equipSlot: undefined });
        updates.set(itemId, { containerId: 'worn', equipSlot: 'offhand' });
      } else {
        // Body armor occupies the armor slot
        const conflict = wornNow.find((i) => i.type === 'armor' && i.equipSlot === 'armor');
        if (conflict) updates.set(conflict.id, { containerId: 'default', equipSlot: undefined });
        updates.set(itemId, { containerId: 'worn', equipSlot: 'armor' });
      }

    } else if (item.type === 'weapon') {
      const weaponItem = item as InventoryWeapon;
      const isTwoHanded = weaponItem.properties.includes('two-handed');
      const mainhand = wornNow.find((i) => i.equipSlot === 'mainhand');
      const offhand = wornNow.find((i) => i.equipSlot === 'offhand');

      if (!mainhand) {
        // Mainhand free
        updates.set(itemId, { containerId: 'worn', equipSlot: 'mainhand' });
        // Two-handed clears offhand too
        if (isTwoHanded && offhand) {
          updates.set(offhand.id, { containerId: 'default', equipSlot: undefined });
        }
      } else {
        const mainhandWeapon = mainhand as InventoryWeapon;
        const mainIsTwoHanded = mainhandWeapon.properties.includes('two-handed');
        if (mainIsTwoHanded) {
          // Conflict: replace mainhand
          updates.set(mainhand.id, { containerId: 'default', equipSlot: undefined });
          updates.set(itemId, { containerId: 'worn', equipSlot: 'mainhand' });
        } else if (!offhand) {
          // Offhand free
          updates.set(itemId, { containerId: 'worn', equipSlot: isTwoHanded ? 'mainhand' : 'offhand' });
          if (isTwoHanded) {
            // New two-handed weapon goes mainhand, old mainhand displaced
            updates.set(mainhand.id, { containerId: 'default', equipSlot: undefined });
          }
        } else {
          // Both slots filled — replace offhand (unless new is two-handed, then replace mainhand)
          if (isTwoHanded) {
            updates.set(mainhand.id, { containerId: 'default', equipSlot: undefined });
            updates.set(offhand.id, { containerId: 'default', equipSlot: undefined });
            updates.set(itemId, { containerId: 'worn', equipSlot: 'mainhand' });
          } else {
            updates.set(offhand.id, { containerId: 'default', equipSlot: undefined });
            updates.set(itemId, { containerId: 'worn', equipSlot: 'offhand' });
          }
        }
      }
    } else {
      // Equipment items → misc slot, no limit
      updates.set(itemId, { containerId: 'worn', equipSlot: 'misc' });
    }

    const items = allItems.map((i) => {
      const patch = updates.get(i.id);
      return patch ? ({ ...i, ...patch } as InventoryItem) : i;
    });
    character = { ...character, inventoryItems: items };
    queueSave();
  }

  function addContainer(name: string, capacityLbs?: number): void {
    const containers = character.inventoryContainers ?? [];
    const newContainer: InventoryContainer = {
      id: `container-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      capacityLbs,
    };
    character = { ...character, inventoryContainers: [...containers, newContainer] };
    queueSave();
  }

  function removeContainer(containerId: string): void {
    // Move all items from this container to default
    const items = (character.inventoryItems ?? []).map((i) =>
      i.containerId === containerId
        ? ({ ...i, containerId: 'default', equipSlot: undefined } as InventoryItem)
        : i,
    );
    const containers = (character.inventoryContainers ?? []).filter((c) => c.id !== containerId);
    character = { ...character, inventoryContainers: containers, inventoryItems: items };
    queueSave();
  }

  function renameContainer(containerId: string, name: string): void {
    const containers = (character.inventoryContainers ?? []).map((c) =>
      c.id === containerId ? { ...c, name } : c,
    );
    character = { ...character, inventoryContainers: containers };
    queueSave();
  }

  function setContainerCapacity(containerId: string, capacityLbs: number | undefined): void {
    const containers = (character.inventoryContainers ?? []).map((c) =>
      c.id === containerId ? { ...c, capacityLbs } : c,
    );
    character = { ...character, inventoryContainers: containers };
    queueSave();
  }

  return {
    get character() { return character; },
    get totalLevel() { return totalLevel; },
    get abilityModifiers() { return abilityModifiers; },
    get passivePerception() { return passivePerception; },
    get classString() { return classString; },
    get effectiveAbilityScores() { return effectiveAbilityScores; },
    get carryCapacity() { return carryCapacity; },
    get currentCarryWeight() { return currentCarryWeight(); },
    get wornItems() { return wornItems; },
    get attuneCount() { return attuneCount; },
    get derivedAC() { return derivedAC; },
    get xpProgress() { return xpProgress(); },
    get xpForNextLevel() {
      return xpForNextLevel[totalLevel] ?? Infinity;
    },
    // Level stack derived values
    get hasLevelStack() { return hasLevelStack; },
    get derivedProficiencyBonus() { return derivedProficiencyBonus; },
    get derivedSpellSlots() { return derivedSpellSlots(); },
    get derivedMaxHp() { return derivedMaxHp; },
    get classSpellCapacities() { return classSpellCapacities; },
    get classSpellcastingAbilities() { return classSpellcastingAbilities; },
    // Existing mutations
    reinit,
    setAbilityScores,
    setRace,
    addWeapon,
    addArmor,
    addEquipment,
    addFeature,
    adjustHp,
    setCurrentHp,
    setTempHp,
    useSpellSlot,
    restoreSpellSlot,
    useFeature,
    restoreFeature,
    useHitDie,
    recordDeathSave,
    resetDeathSaves,
    toggleInspiration,
    shortRest,
    longRest,
    // Class stack mutations
    addClassLevel,
    removeLastLevel,
    setSubclass,
    addClassSpell,
    removeClassSpell,
    updateClassSpell,
    setSpellPrepared,
    // Skill grant mutations
    setSkillGrantSelections,
    addManualSkillGrant,
    removeSkillGrant,
    // Inventory mutations
    addInventoryItem,
    removeInventoryItem,
    updateInventoryItem,
    adjustItemQuantity,
    setItemQuantity,
    toggleAttuned,
    moveItemToContainer,
    addContainer,
    removeContainer,
    renameContainer,
    setContainerCapacity,
  };
}

export const characterStore = createCharacterStore(mockPaladinAerindel);
