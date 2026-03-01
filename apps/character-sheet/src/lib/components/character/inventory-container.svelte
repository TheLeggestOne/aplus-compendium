<script lang="ts">
  import type { InventoryContainer, InventoryItem } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { dndzone } from 'svelte-dnd-action';
  import InventoryItemRow from './inventory-item-row.svelte';
  import InventoryCustomItemDialog from './inventory-custom-item-dialog.svelte';
  import InventoryContainerEditDialog from './inventory-container-edit-dialog.svelte';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Settings2Icon from '@lucide/svelte/icons/settings-2';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

  interface DndItem { id: string; item: InventoryItem; }

  interface Props {
    container: InventoryContainer;
    items: InventoryItem[];
    defaultExpanded?: boolean;
  }

  const { container, items, defaultExpanded = false }: Props = $props();

  let expanded = $state(defaultExpanded || !!container.isDefault);
  let addItemOpen = $state(false);
  let editContainerOpen = $state(false);

  const containerWeight = $derived(items.reduce((sum, i) => sum + i.weight * i.quantity, 0));

  const weightPercent = $derived(
    container.capacityLbs
      ? Math.min(100, Math.round((containerWeight / container.capacityLbs) * 100))
      : 0
  );

  const overCapacity = $derived(!!container.capacityLbs && containerWeight > container.capacityLbs);

  // DnD zone — use $state so it can be temporarily mutated during drag
  let dndItems = $state<DndItem[]>([]);
  $effect(() => {
    dndItems = items.map((i) => ({ id: i.id, item: i }));
  });

  function handleDndConsider(e: CustomEvent<{ items: DndItem[] }>) {
    dndItems = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<{ items: DndItem[] }>) {
    // Update immediately so items stay draggable before the store re-syncs
    dndItems = e.detail.items;
    const previousIds = new Set(items.map((i) => i.id));
    for (const d of e.detail.items) {
      if (!previousIds.has(d.id)) {
        characterStore.moveItemToContainer(d.id, container.id);
      }
    }
  }
</script>

<div class="rounded-md border border-border bg-card">
  <!-- Header — use a div to avoid nesting buttons -->
  <div class="flex items-center gap-2 px-3 py-2">
    <button
      class="flex items-center gap-2 flex-1 min-w-0 hover:opacity-70 transition-opacity text-left"
      onclick={() => { expanded = !expanded; }}
    >
      <span class="text-muted-foreground shrink-0">
        {#if expanded}
          <ChevronDownIcon class="size-3.5" />
        {:else}
          <ChevronRightIcon class="size-3.5" />
        {/if}
      </span>
      <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">{container.name}</h2>
    </button>

    <!-- Weight display -->
    <span class="text-xs tabular-nums {overCapacity ? 'text-destructive' : 'text-muted-foreground'} shrink-0">
      {containerWeight.toFixed(1)}
      {#if container.capacityLbs}
        / {container.capacityLbs} lbs
      {:else}
        lbs
      {/if}
    </span>

    <!-- Edit button (non-default containers only) -->
    {#if !container.isDefault}
      <button
        onclick={() => { editContainerOpen = true; }}
        class="shrink-0 text-muted-foreground/50 hover:text-muted-foreground rounded p-0.5 transition-colors"
      >
        <Settings2Icon class="size-3.5" />
      </button>
    {/if}
  </div>

  <!-- Capacity bar for default container -->
  {#if container.isDefault}
    {@const carryCapacity = characterStore.carryCapacity}
    {@const totalWeight = characterStore.currentCarryWeight}
    {@const pct = Math.min(100, Math.round((totalWeight / carryCapacity) * 100))}
    <div class="px-3 pb-2">
      <div class="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span>Carry weight</span>
        <span class="tabular-nums">{totalWeight.toFixed(1)} / {carryCapacity} lbs</span>
      </div>
      <Progress value={pct} class="h-1" />
    </div>
  {:else if container.capacityLbs}
    <div class="px-3 pb-2">
      <Progress value={weightPercent} class="h-1 {overCapacity ? '[&>div]:bg-destructive' : ''}" />
    </div>
  {/if}

  <!-- Items list -->
  {#if expanded}
    <div
      use:dndzone={{ items: dndItems, dropFromOthersDisabled: false }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}
      class="min-h-[2.5rem] border-t border-border divide-y divide-border/40"
    >
      {#each dndItems as dndItem (dndItem.id)}
        <InventoryItemRow item={dndItem.item} />
      {:else}
        <p class="text-xs text-muted-foreground/40 text-center py-2">Empty — drag items here</p>
      {/each}
    </div>

    <!-- Add item row -->
    <div class="border-t border-border px-2 py-1.5">
      <button
        onclick={() => { addItemOpen = true; }}
        class="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <PlusIcon class="size-3" />
        Add custom item
      </button>
    </div>
  {/if}
</div>

{#if addItemOpen}
  <InventoryCustomItemDialog bind:open={addItemOpen} containerId={container.id} />
{/if}

{#if editContainerOpen && !container.isDefault}
  <InventoryContainerEditDialog {container} bind:open={editContainerOpen} />
{/if}
