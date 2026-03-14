<script lang="ts">
  import type { Currency } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SectionHeader from './section-header.svelte';
  import { Button } from '$lib/components/ui/button/index.js';
  import MinusIcon from '@lucide/svelte/icons/minus';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
  import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';

  interface Props {
    currency: Currency;
  }

  let { currency }: Props = $props();

  const COINS: { key: keyof Currency; label: string; color: string; border: string; bg: string }[] = [
    { key: 'platinum', label: 'PP', color: 'text-slate-300', border: 'border-slate-500/40', bg: 'bg-slate-500/20' },
    { key: 'gold', label: 'GP', color: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/20' },
    { key: 'electrum', label: 'EP', color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/20' },
    { key: 'silver', label: 'SP', color: 'text-slate-400', border: 'border-slate-400/40', bg: 'bg-slate-400/20' },
    { key: 'copper', label: 'CP', color: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/20' },
  ];

  let editing = $state(false);
  let addAmount = $state(0);
  let isDragging = $state(false);
  let dropTarget = $state<keyof Currency | null>(null);

  function handleInput(key: keyof Currency, e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (!isNaN(val)) {
      characterStore.setCurrencyDenomination(key, val);
    }
  }

  function handleBlur(key: keyof Currency, e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (isNaN(val) || val < 0) {
      characterStore.setCurrencyDenomination(key, 0);
    }
  }

  function handleAddInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (!isNaN(val)) {
      addAmount = Math.max(0, val);
    }
  }

  function handleAddBlur(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (isNaN(val) || val < 0) {
      addAmount = 0;
    }
  }

  // Drag handlers for the add coin
  function onDragStart(e: DragEvent) {
    if (addAmount <= 0) {
      e.preventDefault();
      return;
    }
    isDragging = true;
    e.dataTransfer!.effectAllowed = 'copy';
    e.dataTransfer!.setData('text/plain', String(addAmount));
  }

  function onDragEnd() {
    isDragging = false;
    dropTarget = null;
  }

  // Drop handlers for denomination boxes
  function onDragOver(e: DragEvent, key: keyof Currency) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
    dropTarget = key;
  }

  function onDragLeave(key: keyof Currency) {
    if (dropTarget === key) {
      dropTarget = null;
    }
  }

  function onDrop(e: DragEvent, key: keyof Currency) {
    e.preventDefault();
    dropTarget = null;
    isDragging = false;
    if (addAmount > 0) {
      characterStore.adjustCurrencyDenomination(key, addAmount);
      addAmount = 0;
    }
  }
</script>

<div>
  <div class="flex items-center justify-between mb-1">
    <SectionHeader title="Currency" />
    <Button
      variant="ghost"
      size="sm"
      class="h-6 text-[10px] px-2 text-muted-foreground"
      onclick={() => { editing = !editing; }}
    >
      {editing ? 'Done' : 'Edit'}
    </Button>
  </div>

  <div class="flex gap-2 flex-wrap">
    {#each COINS as coin}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="flex flex-col items-center rounded-md border bg-card min-w-[56px] overflow-hidden transition-all duration-150
          {coin.border}
          {editing && dropTarget === coin.key ? `${coin.bg} ring-2 ring-primary scale-105` : ''}
          {editing && isDragging && dropTarget !== coin.key ? 'opacity-80' : ''}"
        ondragover={editing ? (e: DragEvent) => onDragOver(e, coin.key) : undefined}
        ondragleave={editing ? () => onDragLeave(coin.key) : undefined}
        ondrop={editing ? (e: DragEvent) => onDrop(e, coin.key) : undefined}
      >
        {#if editing}
          <!-- Edit mode: +/- buttons and input -->
          <button
            class="w-full flex items-center justify-center h-5 hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            onclick={() => characterStore.adjustCurrencyDenomination(coin.key, 1)}
          >
            <PlusIcon class="size-3" />
          </button>
          <input
            type="number"
            min="0"
            value={currency[coin.key]}
            oninput={(e) => handleInput(coin.key, e)}
            onblur={(e) => handleBlur(coin.key, e)}
            class="w-full text-center text-sm font-bold tabular-nums bg-transparent border-y border-border py-0.5 {coin.color} focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            class="w-full flex items-center justify-center h-5 hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
            onclick={() => characterStore.adjustCurrencyDenomination(coin.key, -1)}
          >
            <MinusIcon class="size-3" />
          </button>
          <!-- Reset button -->
          <button
            class="w-full flex items-center justify-center h-5 border-t border-border hover:bg-destructive/10 transition-colors text-muted-foreground/50 hover:text-destructive"
            onclick={() => characterStore.setCurrencyDenomination(coin.key, 0)}
            title="Reset to 0"
          >
            <RotateCcwIcon class="size-2.5" />
          </button>
        {:else}
          <!-- View mode -->
          <span class="text-lg font-bold tabular-nums px-3 pt-1 {coin.color}">{currency[coin.key]}</span>
        {/if}
        <span class="text-[10px] font-medium text-muted-foreground pb-1">{coin.label}</span>
      </div>
    {/each}

    <!-- Add amount box (edit mode only) -->
    {#if editing}
      <div class="flex flex-col items-center rounded-md border border-dashed border-primary/40 bg-card min-w-[56px] overflow-hidden">
        <!-- Draggable coin handle -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="w-full flex items-center justify-center h-5 cursor-grab active:cursor-grabbing transition-colors
            {addAmount > 0 ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground/30'}"
          draggable={addAmount > 0 ? 'true' : 'false'}
          ondragstart={onDragStart}
          ondragend={onDragEnd}
          title={addAmount > 0 ? 'Drag onto a coin type to add this amount' : 'Enter an amount first'}
        >
          <GripVerticalIcon class="size-3" />
        </div>
        <input
          type="number"
          min="0"
          value={addAmount}
          oninput={handleAddInput}
          onblur={handleAddBlur}
          class="w-full text-center text-sm font-bold tabular-nums bg-transparent border-y border-border py-0.5 text-primary focus:outline-none focus:ring-1 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <!-- Reset add amount -->
        <button
          class="w-full flex items-center justify-center h-5 border-t border-border transition-colors
            {addAmount > 0 ? 'text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10' : 'text-muted-foreground/20'}"
          onclick={() => { addAmount = 0; }}
          title="Clear"
          disabled={addAmount <= 0}
        >
          <RotateCcwIcon class="size-2.5" />
        </button>
        <span class="text-[10px] font-medium text-muted-foreground pb-1">Add</span>
      </div>
      {#if addAmount > 0}
        <p class="w-full text-[10px] text-muted-foreground/60 mt-1">Drag the handle onto a coin type to add {addAmount}.</p>
      {/if}
    {/if}
  </div>
</div>
