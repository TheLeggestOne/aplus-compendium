<script lang="ts">
  import type { Weapon } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import ModifierDisplay from './modifier-display.svelte';

  interface Props {
    weapon: Weapon;
  }

  let { weapon }: Props = $props();

  const damageString = $derived(
    `${weapon.damageDice}${weapon.damageBonus > 0 ? `+${weapon.damageBonus}` : weapon.damageBonus < 0 ? weapon.damageBonus : ''} ${weapon.damageType}`
  );

  const rangeString = $derived(
    weapon.range ? ` (${weapon.range.normal}/${weapon.range.long} ft)` : ''
  );
</script>

<div class="flex items-center gap-3 py-2 border-b border-border last:border-0">
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm font-medium">{weapon.name}</span>
      {#if weapon.quantity > 1}
        <span class="text-xs text-muted-foreground">×{weapon.quantity}</span>
      {/if}
      {#each weapon.properties as prop}
        <Badge variant="outline" class="text-[10px] px-1.5 py-0 capitalize">{prop}</Badge>
      {/each}
    </div>
    <p class="text-xs text-muted-foreground mt-0.5">
      {damageString}{rangeString}
    </p>
  </div>
  <div class="shrink-0">
    <ModifierDisplay value={weapon.attackBonus} class="text-lg font-bold" />
    <p class="text-[10px] text-muted-foreground text-center">to hit</p>
  </div>
</div>
