<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SectionHeader from './section-header.svelte';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Progress } from '$lib/components/ui/progress/index.js';

  const { character, carryCapacity, currentCarryWeight } = $derived(characterStore);

  const weightPercent = $derived(
    Math.min(100, Math.round((currentCarryWeight / carryCapacity) * 100))
  );
</script>

<div class="flex flex-col gap-4">
  <div>
    <SectionHeader title="Equipment" />

    <!-- Carry weight -->
    <div class="rounded-md border border-border bg-card px-3 py-2 mb-3">
      <div class="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Carry weight</span>
        <span class="tabular-nums">{currentCarryWeight.toFixed(1)} / {carryCapacity} lbs</span>
      </div>
      <Progress value={weightPercent} class="h-1.5" />
    </div>

    <!-- Armor -->
    {#if character.armor.length > 0}
      <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Armor & Shields</p>
      <div class="rounded-md border border-border bg-card px-3 mb-3">
        {#each character.armor as armor}
          <div class="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
            <span class="flex-1 text-sm">{armor.name}</span>
            <span class="text-xs text-muted-foreground tabular-nums">AC {armor.baseArmorClass}</span>
            {#if armor.equipped}
              <Badge variant="secondary" class="text-[10px] px-1.5 py-0">Equipped</Badge>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- General equipment -->
    {#if character.equipment.length > 0}
      <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Items</p>
      <div class="rounded-md border border-border bg-card px-3">
        {#each character.equipment as item}
          <div class="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
            <span class="flex-1 text-sm">{item.name}</span>
            {#if item.quantity > 1}
              <span class="text-xs text-muted-foreground">×{item.quantity}</span>
            {/if}
            {#if item.rarity && item.rarity !== 'common'}
              <Badge variant="outline" class="text-[10px] px-1.5 py-0 capitalize">{item.rarity}</Badge>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
