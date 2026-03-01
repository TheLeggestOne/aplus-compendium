<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import InventoryWornContainer from './inventory-worn-container.svelte';
  import InventoryContainer from './inventory-container.svelte';
  import CurrencyDisplay from './currency-display.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import PlusIcon from '@lucide/svelte/icons/plus';

  const { character } = $derived(characterStore);

  const containers = $derived(character.inventoryContainers ?? []);
  const allItems = $derived(character.inventoryItems ?? []);

  // Separate worn container from regular containers
  const wornContainer = $derived(containers.find((c) => c.isWornEquipped));
  const defaultContainer = $derived(containers.find((c) => c.isDefault));
  const userContainers = $derived(containers.filter((c) => !c.isWornEquipped && !c.isDefault));

  function itemsForContainer(containerId: string) {
    return allItems.filter((i) => i.containerId === containerId);
  }

  let addContainerName = $state('');
  let showAddContainer = $state(false);

  function submitAddContainer() {
    if (addContainerName.trim()) {
      characterStore.addContainer(addContainerName.trim());
      addContainerName = '';
      showAddContainer = false;
    }
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <!-- Worn / Equipped (always at top) -->
  {#if wornContainer}
    <InventoryWornContainer />
  {/if}

  <!-- Default container (Character Inventory) -->
  {#if defaultContainer}
    <InventoryContainer
      container={defaultContainer}
      items={itemsForContainer('default')}
      defaultExpanded={true}
    />
  {/if}

  <!-- User containers -->
  {#each userContainers as container (container.id)}
    <InventoryContainer
      {container}
      items={itemsForContainer(container.id)}
    />
  {/each}

  <!-- Add container row -->
  <div>
    {#if showAddContainer}
      <div class="flex items-center gap-2">
        <input
          bind:value={addContainerName}
          placeholder="Container name…"
          class="flex-1 h-7 rounded border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          onkeydown={(e) => { if (e.key === 'Enter') submitAddContainer(); if (e.key === 'Escape') { showAddContainer = false; } }}
        />
        <Button size="sm" class="h-7 text-xs" onclick={submitAddContainer}>Add</Button>
        <Button variant="ghost" size="sm" class="h-7 text-xs" onclick={() => { showAddContainer = false; }}>Cancel</Button>
      </div>
    {:else}
      <Button
        variant="outline"
        size="sm"
        class="h-7 text-xs gap-1"
        onclick={() => { showAddContainer = true; }}
      >
        <PlusIcon class="size-3" />
        New Container
      </Button>
    {/if}
  </div>

  <!-- Currency -->
  <CurrencyDisplay currency={character.currency} />
</div>
