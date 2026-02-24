<script lang="ts">
  import type { SpellcastingAbility } from '@aplus-compendium/types';
  import KeyStatPill from './key-stat-pill.svelte';

  const ABILITY_LABELS: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  };

  interface Props {
    ability: SpellcastingAbility;
  }

  let { ability }: Props = $props();
</script>

<div class="flex flex-wrap gap-3">
  <KeyStatPill label="Spell Ability" value={ABILITY_LABELS[ability.abilityScore] ?? ability.abilityScore.toUpperCase()} />
  <KeyStatPill label="Save DC" value={ability.spellSaveDC} />
  <KeyStatPill
    label="Spell Attack"
    value={ability.spellAttackBonus >= 0 ? `+${ability.spellAttackBonus}` : ability.spellAttackBonus}
  />
</div>
