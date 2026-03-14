<script lang="ts" module>
  // Per-session expanded state — shared across all instances, survives re-renders
  const containerExpandedState = new Map<string, boolean>();
</script>

<script lang="ts">
  import type { InventoryContainer, InventoryItem, InventoryEquipment } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { tick, untrack } from 'svelte';
  import { dndzone } from 'svelte-dnd-action';
  import InventoryItemRow from './inventory-item-row.svelte';
  import InventoryContainerEditDialog from './inventory-container-edit-dialog.svelte';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import SearchIcon from '@lucide/svelte/icons/search';
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

  let expanded = $state(containerExpandedState.get(container.id) ?? (defaultExpanded || !!container.isDefault));

  $effect(() => {
    containerExpandedState.set(container.id, expanded);
  });
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
    dndItems = e.detail.items;
    const previousIds = new Set(items.map((i) => i.id));
    for (const d of e.detail.items) {
      if (!previousIds.has(d.id)) {
        characterStore.moveItemToContainer(d.id, container.id);
      }
    }
  }

  // Inline search / add — syncs to the SRD compendium panel
  let searchQuery = $state('');
  let searchInput = $state<HTMLInputElement | null>(null);

  // When an item is added (any container), close the SRD panel
  let _prevItemCount = items.length;
  $effect(() => {
    const len = items.length;
    untrack(() => {
      if (len > _prevItemCount) compendiumStore.closePanel();
      _prevItemCount = len;
    });
  });

  // When the SRD panel closes, clear this container's search bar
  let _wasPanelOpen = compendiumStore.panelOpen;
  $effect(() => {
    const isOpen = compendiumStore.panelOpen;
    untrack(() => {
      if (!isOpen && _wasPanelOpen) searchQuery = '';
      _wasPanelOpen = isOpen;
    });
  });

  async function onSearchInput() {
    // Only act if query has at least one alphanumeric char (avoids opening panel for lone "+", "-", etc.)
    if (searchQuery.trim() && /[a-zA-Z0-9]/.test(searchQuery)) {
      // Only open/switch the panel if it isn't already showing items — avoids
      // re-rendering the right pane on every keystroke which steals focus
      if (!compendiumStore.panelOpen || compendiumStore.activeType !== 'item') {
        contentViewerStore.close();
        compendiumStore.openPanel('item');
        // Wait for Svelte to finish the DOM update (panel mount), then restore focus
        await tick();
        searchInput?.focus();
      }
      compendiumStore.setQuery(searchQuery.trim());
    }
  }

  function addCustomItem() {
    const name = searchQuery.trim();
    const item: InventoryEquipment = {
      type: 'equipment',
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name || 'New Item',
      quantity: 1,
      weight: 0,
      containerId: container.id,
      requiresAttunement: false,
      attuned: false,
    };
    characterStore.addInventoryItem(item);
    searchQuery = '';
  }
</script>

<div class="rounded-md border border-border bg-card">
  <!-- Header -->
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

    <!-- Settings button (non-default containers only) -->
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
        {#if dndItem.item}
          <InventoryItemRow item={dndItem.item} />
        {:else}
          <div class="h-8" />
        {/if}
      {:else}
        <p class="text-xs text-muted-foreground/40 text-center py-2">Empty — drag items here</p>
      {/each}
    </div>

    <!-- Inline search / add row -->
    <div class="border-t border-border px-2 py-1.5">
      <div class="flex items-center gap-1.5">
        <SearchIcon class="size-3 text-muted-foreground/40 shrink-0" />
        <input
          bind:this={searchInput}
          bind:value={searchQuery}
          oninput={onSearchInput}
          onkeydown={(e) => {
            if (e.key === 'Enter') addCustomItem();
            if (e.key === 'Escape') { searchQuery = ''; }
          }}
          placeholder="Search or add item…"
          class="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/40 min-w-0"
        />
        <button
          onclick={addCustomItem}
          title={searchQuery.trim() ? `Add "${searchQuery.trim()}" as custom item` : 'Add item'}
          class="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors rounded p-0.5"
        >
          <PlusIcon class="size-3" />
        </button>
      </div>
    </div>
  {/if}
</div>

{#if editContainerOpen && !container.isDefault}
  <InventoryContainerEditDialog {container} bind:open={editContainerOpen} />
{/if}