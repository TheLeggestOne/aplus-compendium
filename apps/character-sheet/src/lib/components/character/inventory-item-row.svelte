<script lang="ts">
  import type { InventoryItem, InventoryWeapon } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import InventoryItemEditDialog from './inventory-item-edit-dialog.svelte';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import SwordIcon from '@lucide/svelte/icons/sword';
  import ShieldIcon from '@lucide/svelte/icons/shield';
  import BoxIcon from '@lucide/svelte/icons/box';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';

  interface Props {
    item: InventoryItem;
  }

  const { item }: Props = $props();

  let editOpen = $state(false);

  function decrement() { characterStore.adjustItemQuantity(item.id, -1); }
  function increment() { characterStore.adjustItemQuantity(item.id, 1); }
  function toggleAttuned() { characterStore.toggleAttuned(item.id); }

  const RARITY_COLORS: Record<string, string> = {
    uncommon:  'text-green-500',
    rare:      'text-blue-500',
    'very-rare': 'text-purple-500',
    legendary: 'text-orange-500',
    artifact:  'text-red-500',
  };

  const rarityColor = $derived(item.rarity ? (RARITY_COLORS[item.rarity] ?? '') : '');

  const weaponSummary = $derived(
    item.type === 'weapon'
      ? (() => {
          const w = item as InventoryWeapon;
          const atk = w.attackBonus >= 0 ? `+${w.attackBonus}` : `${w.attackBonus}`;
          return `${atk} | ${w.damageDice}`;
        })()
      : null
  );
</script>

<div class="flex items-center gap-1.5 py-1.5 px-2 group">
  <!-- Type icon -->
  <span class="shrink-0 text-muted-foreground w-4">
    {#if item.type === 'weapon'}
      <SwordIcon class="size-3.5" />
    {:else if item.type === 'armor'}
      <ShieldIcon class="size-3.5" />
    {:else}
      <BoxIcon class="size-3.5" />
    {/if}
  </span>

  <!-- Name + summary -->
  <div class="flex-1 min-w-0">
    <span class="text-xs truncate {rarityColor}">{item.name}</span>
    {#if weaponSummary}
      <span class="ml-1.5 text-[10px] text-muted-foreground tabular-nums">{weaponSummary}</span>
    {/if}
  </div>

  <!-- Attunement toggle -->
  {#if item.requiresAttunement}
    <button
      onclick={toggleAttuned}
      title={item.attuned ? 'Attuned — click to un-attune' : 'Click to attune'}
      class="shrink-0 rounded p-0.5 transition-colors {item.attuned ? 'text-yellow-400' : 'text-muted-foreground/40 hover:text-muted-foreground'}"
    >
      <SparklesIcon class="size-3" />
    </button>
  {/if}

  <!-- Qty controls -->
  <div class="flex items-center gap-0.5 shrink-0">
    <button
      onclick={decrement}
      class="size-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs leading-none"
    >−</button>
    <button
      onclick={() => { editOpen = true; }}
      class="min-w-[1.5rem] text-center text-xs tabular-nums text-muted-foreground hover:text-foreground"
    >{item.quantity}</button>
    <button
      onclick={increment}
      class="size-4 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs leading-none"
    >+</button>
  </div>

  <!-- Edit button -->
  <button
    onclick={() => { editOpen = true; }}
    class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-foreground"
  >
    <PencilIcon class="size-3" />
  </button>
</div>

{#if editOpen}
  <InventoryItemEditDialog {item} bind:open={editOpen} />
{/if}
