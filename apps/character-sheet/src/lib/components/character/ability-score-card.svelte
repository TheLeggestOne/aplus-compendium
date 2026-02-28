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
    baseScores?: AbilityScoreSet;
  }

  let { ability, scores, baseScores }: Props = $props();

  const score = $derived(scores[ability]);
  const base = $derived(baseScores ? baseScores[ability] : score);
  const mod = $derived(abilityModifier(score));
  const hasBonuses = $derived(score !== base);
</script>

<div class={cn(
  "flex flex-col items-center justify-center rounded-lg border bg-card p-3 gap-1 min-w-[76px]",
  hasBonuses ? 'border-primary/40' : 'border-border',
)}>
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
  <span class="text-xs tabular-nums {hasBonuses ? 'text-primary/80' : 'text-muted-foreground'}">
    {score}{#if hasBonuses}<span class="text-muted-foreground/50 text-[10px] ml-0.5">({base})</span>{/if}
  </span>
</div>
