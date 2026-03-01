<script lang="ts">
  import type { InventoryWeapon } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import ModifierDisplay from './modifier-display.svelte';
  import ArrowLeftRightIcon from '@lucide/svelte/icons/arrow-left-right';

  interface Props {
    weapon: InventoryWeapon;
  }

  let { weapon }: Props = $props();

  const { abilityModifiers, derivedProficiencyBonus } = $derived(characterStore);

  const isEquipped = $derived(weapon.containerId === 'worn');

  // Total attack bonus = ability mod + proficiency + magic bonus
  const totalAttackBonus = $derived(
    abilityModifiers[weapon.abilityUsed] + derivedProficiencyBonus + weapon.attackBonus
  );

  // Total damage bonus = ability mod + magic bonus
  const totalDamageBonus = $derived(
    abilityModifiers[weapon.abilityUsed] + weapon.damageBonus
  );

  const damageString = $derived(
    `${weapon.damageDice}${totalDamageBonus > 0 ? `+${totalDamageBonus}` : totalDamageBonus < 0 ? totalDamageBonus : ''} ${weapon.damageType}`
  );

  const rangeString = $derived(
    weapon.range ? ` (${weapon.range.normal}/${weapon.range.long} ft)` : ''
  );

  function swap() {
    characterStore.moveItemToContainer(weapon.id, 'worn');
  }
</script>

<div class="flex items-center gap-3 py-2 border-b border-border last:border-0">
  <div class="flex-1 min-w-0 {isEquipped ? '' : 'opacity-40'}">
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

  {#if !isEquipped}
    <button
      onclick={swap}
      title="Equip this weapon"
      class="shrink-0 text-muted-foreground/50 hover:text-foreground rounded p-1 transition-colors"
    >
      <ArrowLeftRightIcon class="size-4" />
    </button>
  {/if}

  <div class="shrink-0 {isEquipped ? '' : 'opacity-40'}">
    <ModifierDisplay value={totalAttackBonus} class="text-lg font-bold" />
    <p class="text-[10px] text-muted-foreground text-center">to hit</p>
  </div>
</div>
