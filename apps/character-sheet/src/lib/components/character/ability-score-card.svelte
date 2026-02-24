<script lang="ts">
  import type { AbilityScore, AbilityScoreSet } from '@aplus-compendium/types';
  import { abilityModifier } from '@aplus-compendium/types';
  import ModifierDisplay from './modifier-display.svelte';
  import { cn } from '$lib/utils.js';

  const ABILITY_LABELS: Record<AbilityScore, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  };

  interface Props {
    ability: AbilityScore;
    scores: AbilityScoreSet;
  }

  let { ability, scores }: Props = $props();

  const score = $derived(scores[ability]);
  const mod = $derived(abilityModifier(score));
</script>

<div class="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3 gap-1 min-w-[76px]">
  <span class="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
    {ABILITY_LABELS[ability]}
  </span>
  <ModifierDisplay
    value={mod}
    class={cn(
      'text-3xl font-bold leading-none',
      mod >= 4 ? 'text-emerald-400' :
      mod >= 2 ? 'text-foreground' :
      mod >= 0 ? 'text-muted-foreground' :
      'text-destructive'
    )}
  />
  <span class="text-xs text-muted-foreground tabular-nums">{score}</span>
</div>
