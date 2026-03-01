<script lang="ts">
  import type { InventoryWeapon } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SectionHeader from './section-header.svelte';
  import WeaponAttackRow from './weapon-attack-row.svelte';

  const { character } = $derived(characterStore);

  const weapons = $derived<InventoryWeapon[]>(
    (character.inventoryItems?.filter((i): i is InventoryWeapon => i.type === 'weapon') ?? [])
      .toSorted((a, b) => {
        const aEquipped = a.containerId === 'worn' ? 0 : 1;
        const bEquipped = b.containerId === 'worn' ? 0 : 1;
        return aEquipped - bEquipped;
      })
  );
</script>

<div>
  <SectionHeader title="Attacks" />
  <div class="rounded-md border border-border bg-card px-3">
    {#if weapons.length > 0}
      {#each weapons as weapon (weapon.id)}
        <WeaponAttackRow {weapon} />
      {/each}
    {:else}
      <p class="py-4 text-sm text-muted-foreground text-center">No weapons in inventory.</p>
    {/if}
  </div>
</div>
