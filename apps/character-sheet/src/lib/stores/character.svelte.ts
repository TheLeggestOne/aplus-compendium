import type { Character, Spell, Weapon, Armor, EquipmentItem, Feature, AbilityScore, AbilityScoreSet, SkillName, SkillEntry } from '@aplus-compendium/types';
import { abilityModifier, SKILL_ABILITY_MAP } from '@aplus-compendium/types';
import { mockPaladinAerindel } from '$lib/mock-data/paladin-5.js';

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
    character = structuredClone(newChar);
  }

  // --- Derived values ---

  const totalLevel = $derived(
    character.classes.reduce((sum, c) => sum + c.level, 0),
  );

  const abilityModifiers = $derived({
    strength:     abilityModifier(character.abilityScores.strength),
    dexterity:    abilityModifier(character.abilityScores.dexterity),
    constitution: abilityModifier(character.abilityScores.constitution),
    intelligence: abilityModifier(character.abilityScores.intelligence),
    wisdom:       abilityModifier(character.abilityScores.wisdom),
    charisma:     abilityModifier(character.abilityScores.charisma),
  });

  const passivePerception = $derived(
    10 + character.skills['perception'].modifier,
  );

  const classString = $derived(
    character.classes
      .map((c) => `${c.subclass ? c.subclass + ' ' : ''}${c.class.charAt(0).toUpperCase() + c.class.slice(1)} ${c.level}`)
      .join(' / '),
  );

  const carryCapacity = $derived(character.abilityScores.strength * 15);

  const currentCarryWeight = $derived(() => {
    const weaponWeight = character.weapons.reduce((sum, w) => sum + w.weight * w.quantity, 0);
    const armorWeight = character.armor.reduce((sum, a) => sum + a.weight * a.quantity, 0);
    const equipmentWeight = character.equipment.reduce((sum, e) => sum + e.weight * e.quantity, 0);
    return weaponWeight + armorWeight + equipmentWeight;
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

  function useSpellSlot(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): void {
    if (!character.spellcasting) return;
    const slots = character.spellcasting.slots.map((s) =>
      s.level === level && s.used < s.total ? { ...s, used: s.used + 1 } : s,
    );
    character = {
      ...character,
      spellcasting: { ...character.spellcasting, slots },
    };
    queueSave();
  }

  function restoreSpellSlot(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9): void {
    if (!character.spellcasting) return;
    const slots = character.spellcasting.slots.map((s) =>
      s.level === level && s.used > 0 ? { ...s, used: s.used - 1 } : s,
    );
    character = {
      ...character,
      spellcasting: { ...character.spellcasting, slots },
    };
    queueSave();
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

  // --- Compendium add mutations ---

  function addSpell(spell: Spell): void {
    if (!character.spellcasting) return;
    if (spell.level === 0) {
      if (character.spellcasting.cantrips.some(s => s.id === spell.id)) return;
      character = {
        ...character,
        spellcasting: { ...character.spellcasting, cantrips: [...character.spellcasting.cantrips, spell] },
      };
    } else {
      if (character.spellcasting.spellsKnown.some(s => s.id === spell.id)) return;
      character = {
        ...character,
        spellcasting: { ...character.spellcasting, spellsKnown: [...character.spellcasting.spellsKnown, spell] },
      };
    }
    queueSave();
  }

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
    const profBonus = character.proficiencyBonus;

    // Recalculate skill modifiers
    const skills = {} as Record<SkillName, SkillEntry>;
    for (const [name, entry] of Object.entries(character.skills) as [SkillName, SkillEntry][]) {
      const ability = SKILL_ABILITY_MAP[name];
      const mod = abilityModifier(scores[ability]);
      const prof = entry.proficiency === 'expertise' ? profBonus * 2
                 : entry.proficiency === 'proficient' ? profBonus : 0;
      skills[name] = { ...entry, modifier: mod + prof };
    }

    // Recalculate saving throw modifiers
    const savingThrows = { ...character.savingThrows };
    for (const ability of ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as AbilityScore[]) {
      const entry = savingThrows[ability];
      const mod = abilityModifier(scores[ability]);
      savingThrows[ability] = { ...entry, modifier: mod + (entry.proficient ? profBonus : 0) };
    }

    character = {
      ...character,
      abilityScores: { ...scores },
      skills,
      savingThrows,
      combat: { ...character.combat, initiative: abilityModifier(scores.dexterity) },
    };
    queueSave();
  }

  function longRest(): void {
    const features = character.features.map((f) =>
      f.uses ? { ...f, uses: { ...f.uses, current: f.uses.maximum } } : f,
    );
    const slots = character.spellcasting?.slots.map((s) => ({ ...s, used: 0 }));
    const hitDicePools = character.combat.hitDicePools.map((p) => ({
      ...p,
      used: Math.max(0, p.used - Math.floor(p.total / 2)),
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

  return {
    get character() { return character; },
    get totalLevel() { return totalLevel; },
    get abilityModifiers() { return abilityModifiers; },
    get passivePerception() { return passivePerception; },
    get classString() { return classString; },
    get carryCapacity() { return carryCapacity; },
    get currentCarryWeight() { return currentCarryWeight(); },
    get xpProgress() { return xpProgress(); },
    get xpForNextLevel() {
      return xpForNextLevel[totalLevel] ?? Infinity;
    },
    reinit,
    setAbilityScores,
    addSpell,
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
  };
}

export const characterStore = createCharacterStore(mockPaladinAerindel);
