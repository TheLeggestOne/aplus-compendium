import type { Character } from '@aplus-compendium/types';
import { abilityModifier } from '@aplus-compendium/types';
import { mockPaladinAerindel } from '$lib/mock-data/paladin-5.js';

function createCharacterStore(initial: Character) {
  let character = $state<Character>(structuredClone(initial));

  let _saveTimer: ReturnType<typeof setTimeout> | null = null;

  function queueSave(): void {
    if (_saveTimer !== null) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(async () => {
      _saveTimer = null;
      if (!window.electronAPI) return;
      await window.electronAPI.characters.save(character);
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
