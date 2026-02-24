<script lang="ts">
  import type { AbilityScore, SavingThrowEntry } from '@aplus-compendium/types';
  import ProficiencyDot from './proficiency-dot.svelte';
  import ModifierDisplay from './modifier-display.svelte';

  const LABELS: Record<AbilityScore, string> = {
    strength: 'Strength',
    dexterity: 'Dexterity',
    constitution: 'Constitution',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom',
    charisma: 'Charisma',
  };

  interface Props {
    ability: AbilityScore;
    entry: SavingThrowEntry;
  }

  let { ability, entry }: Props = $props();
</script>

<div class="flex items-center gap-2 py-0.5">
  <ProficiencyDot level={entry.proficient ? 'proficient' : 'none'} />
  <span class="flex-1 text-sm text-foreground">{LABELS[ability]}</span>
  <ModifierDisplay value={entry.modifier} class="text-sm font-medium w-8 text-right" />
</div>
