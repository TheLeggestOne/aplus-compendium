<script lang="ts">
  import type { InventoryItem, InventoryWeapon, InventoryArmor } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { dndzone } from 'svelte-dnd-action';
  import InventoryItemRow from './inventory-item-row.svelte';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';

  interface DndItem { id: string; item: InventoryItem; }

  const { wornItems, attuneCount } = $derived(characterStore);

  // Slot display
  const equippedArmor = $derived(
    wornItems.find((i): i is InventoryArmor => i.type === 'armor' && i.equipSlot === 'armor') as InventoryArmor | undefined
  );
  const mainhand = $derived(
    wornItems.find((i): i is InventoryWeapon => i.type === 'weapon' && i.equipSlot === 'mainhand') as InventoryWeapon | undefined
  );
  // Off-hand holds a weapon OR a shield
  const offhandItem = $derived(wornItems.find((i) => i.equipSlot === 'offhand'));
  const offhandWeapon = $derived(offhandItem?.type === 'weapon' ? offhandItem as InventoryWeapon : undefined);
  const offhandShield = $derived(offhandItem?.type === 'armor' ? offhandItem as InventoryArmor : undefined);

  const miscItems = $derived(wornItems.filter((i) => i.equipSlot === 'misc'));

  // DnD drop zone — synced via $effect, updated immediately in finalize
  let dndItems = $state<DndItem[]>([]);
  $effect(() => {
    dndItems = wornItems.map((i) => ({ id: i.id, item: i }));
  });

  function handleDndConsider(e: CustomEvent<{ items: DndItem[] }>) {
    dndItems = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<{ items: DndItem[] }>) {
    // Update dndzone state immediately so items stay draggable
    dndItems = e.detail.items;
    const previousWornIds = new Set(wornItems.map((i) => i.id));
    for (const d of e.detail.items) {
      if (!previousWornIds.has(d.id)) {
        characterStore.moveItemToContainer(d.id, 'worn');
      }
    }
  }

  function unequip(itemId: string) {
    characterStore.moveItemToContainer(itemId, 'default');
  }
</script>

<div class="rounded-md border border-border bg-card">
  <div class="flex items-center justify-between px-3 py-2 border-b border-border">
    <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Worn / Equipped</h2>
    <div class="flex items-center gap-1 text-xs text-muted-foreground">
      <SparklesIcon class="size-3 {attuneCount > 0 ? 'text-yellow-400' : 'text-muted-foreground/40'}" />
      <span class="tabular-nums">{attuneCount}/3</span>
    </div>
  </div>

  <!-- Slot grid: 3 slots (Armor, Main Hand, Off Hand) -->
  <div class="grid grid-cols-3 gap-px bg-border">
    <!-- Armor slot -->
    <div class="bg-card px-3 py-2">
      <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Armor</p>
      {#if equippedArmor}
        <div class="flex items-center gap-1">
          <span class="flex-1 text-xs truncate">{equippedArmor.name}</span>
          <span class="text-[10px] text-muted-foreground tabular-nums">AC {equippedArmor.baseArmorClass}</span>
          <button onclick={() => unequip(equippedArmor!.id)} class="text-muted-foreground/50 hover:text-muted-foreground text-xs leading-none ml-1">×</button>
        </div>
      {:else}
        <p class="text-xs text-muted-foreground/50 italic">Empty</p>
      {/if}
    </div>

    <!-- Main hand -->
    <div class="bg-card px-3 py-2">
      <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Main Hand</p>
      {#if mainhand}
        <div class="flex items-center gap-1">
          <span class="flex-1 text-xs truncate">{mainhand.name}</span>
          <span class="text-[10px] text-muted-foreground">{mainhand.damageDice}</span>
          <button onclick={() => unequip(mainhand!.id)} class="text-muted-foreground/50 hover:text-muted-foreground text-xs leading-none ml-1">×</button>
        </div>
      {:else}
        <p class="text-xs text-muted-foreground/50 italic">Empty</p>
      {/if}
    </div>

    <!-- Off hand — weapon or shield -->
    <div class="bg-card px-3 py-2">
      <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Off Hand</p>
      {#if offhandWeapon}
        <div class="flex items-center gap-1">
          <span class="flex-1 text-xs truncate">{offhandWeapon.name}</span>
          <span class="text-[10px] text-muted-foreground">{offhandWeapon.damageDice}</span>
          <button onclick={() => unequip(offhandWeapon!.id)} class="text-muted-foreground/50 hover:text-muted-foreground text-xs leading-none ml-1">×</button>
        </div>
      {:else if offhandShield}
        <div class="flex items-center gap-1">
          <span class="flex-1 text-xs truncate">{offhandShield.name}</span>
          <span class="text-[10px] text-muted-foreground tabular-nums">+{offhandShield.baseArmorClass} AC</span>
          <button onclick={() => unequip(offhandShield!.id)} class="text-muted-foreground/50 hover:text-muted-foreground text-xs leading-none ml-1">×</button>
        </div>
      {:else}
        <p class="text-xs text-muted-foreground/50 italic">Empty</p>
      {/if}
    </div>
  </div>

  <!-- Misc worn items (equipment items) + drop target for the whole container -->
  <div
    use:dndzone={{ items: dndItems, dropFromOthersDisabled: false, dragDisabled: true }}
    onconsider={handleDndConsider}
    onfinalize={handleDndFinalize}
    class="min-h-[2rem] px-1 py-1"
  >
    {#if miscItems.length > 0}
      <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-0.5">Worn Items</p>
      {#each miscItems as wornItem (wornItem.id)}
        <InventoryItemRow item={wornItem} />
      {/each}
    {:else}
      <p class="text-xs text-muted-foreground/40 text-center py-1">Drop items here to equip</p>
    {/if}
  </div>
</div>
