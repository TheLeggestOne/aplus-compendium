<script lang="ts">
  import type { InventoryItem } from '@aplus-compendium/types';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    item: InventoryItem;
    open: boolean;
    onclose?: () => void;
  }

  let { item, open = $bindable(), onclose }: Props = $props();

  // Sliders use integer steps for smoother UX
  let percentStep = $state(50);   // 0–100 integer
  let sellQty = $state(1);
  let largestDenom = $state<'pp' | 'gp' | 'ep' | 'sp' | 'cp'>('gp');

  $effect(() => {
    if (open) {
      percentStep = 50;
      sellQty = item.quantity;
      largestDenom = 'gp';
    }
  });

  const fraction = $derived(percentStep / 100);
  const hasPrice = $derived((item.costGp ?? 0) > 0);

  // Total value in copper for precise denomination splitting
  const totalCp = $derived(Math.floor((item.costGp ?? 0) * sellQty * fraction * 100));

  // Denomination values in copper, ordered largest to smallest
  const DENOM_VALUES = [
    { key: 'pp' as const, cp: 1000, label: 'pp', color: 'text-slate-300' },
    { key: 'gp' as const, cp: 100, label: 'gp', color: 'text-yellow-400' },
    { key: 'ep' as const, cp: 50, label: 'ep', color: 'text-cyan-400' },
    { key: 'sp' as const, cp: 10, label: 'sp', color: 'text-slate-400' },
    { key: 'cp' as const, cp: 1, label: 'cp', color: 'text-orange-400' },
  ];

  const DENOM_OPTIONS = [
    { value: 'pp', label: 'PP' },
    { value: 'gp', label: 'GP' },
    { value: 'ep', label: 'EP' },
    { value: 'sp', label: 'SP' },
    { value: 'cp', label: 'CP' },
  ];

  // Split into denominations based on chosen largest denomination
  const proceeds = $derived.by(() => {
    const result: Record<string, number> = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
    const startIdx = DENOM_VALUES.findIndex((d) => d.key === largestDenom);
    let rem = totalCp;
    for (let i = startIdx; i < DENOM_VALUES.length; i++) {
      const d = DENOM_VALUES[i];
      result[d.key] = Math.floor(rem / d.cp);
      rem %= d.cp;
    }
    return result;
  });

  // Visible coin entries (non-zero only)
  const visibleCoins = $derived(
    DENOM_VALUES.filter((d) => proceeds[d.key] > 0)
  );

  function sell() {
    characterStore.sellItem(item.id, fraction, sellQty, largestDenom);
    open = false;
    onclose?.();
  }

  function cancel() {
    open = false;
    onclose?.();
  }

  // Nice percent label
  const percentLabel = $derived(
    percentStep === 50 ? '50% (half price)' :
    percentStep === 100 ? '100% (full price)' :
    `${percentStep}%`
  );

  function proceedsLabel(): string {
    return visibleCoins.map((c) => `${proceeds[c.key]} ${c.label}`).join(', ');
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-xs">
    <Dialog.Header>
      <Dialog.Title>Sell — {item.name}</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-5 py-2">

      <!-- Sell price slider -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Sell price</span>
          <span class="text-xs tabular-nums text-foreground">{percentLabel}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          bind:value={percentStep}
          class="w-full accent-primary"
        />
        <div class="flex justify-between text-[10px] text-muted-foreground/60">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <!-- Quantity slider (only if quantity > 1) -->
      {#if item.quantity > 1}
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-muted-foreground">Quantity to sell</span>
            <span class="text-xs tabular-nums text-foreground">{sellQty} / {item.quantity}</span>
          </div>
          <input
            type="range"
            min="1"
            max={item.quantity}
            step="1"
            bind:value={sellQty}
            class="w-full accent-primary"
          />
          <div class="flex justify-between text-[10px] text-muted-foreground/60">
            <span>1</span>
            <span>{item.quantity}</span>
          </div>
        </div>
      {/if}

      <!-- Largest denomination button group -->
      <div class="space-y-1.5">
        <span class="text-xs font-medium text-muted-foreground">Largest denomination</span>
        <div class="flex rounded-md border border-border overflow-hidden">
          {#each DENOM_OPTIONS as opt}
            <button
              class="flex-1 h-7 text-xs font-medium transition-colors {largestDenom === opt.value ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted/60'} {opt.value !== 'pp' ? 'border-l border-border' : ''}"
              onclick={() => { largestDenom = opt.value as typeof largestDenom; }}
            >
              {opt.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Summary -->
      <div class="rounded-md bg-muted/50 px-3 py-2 flex items-center justify-between">
        <span class="text-xs text-muted-foreground">
          {sellQty > 1 ? `${sellQty}× ` : ''}{item.name}
        </span>
        {#if hasPrice && totalCp > 0}
          <span class="text-sm font-semibold tabular-nums flex items-center gap-1.5">
            {#each visibleCoins as coin}
              <span class={coin.color}>{proceeds[coin.key]} {coin.label}</span>
            {/each}
          </span>
        {:else if hasPrice}
          <span class="text-xs text-muted-foreground/50 italic">0 gp</span>
        {:else}
          <span class="text-xs text-muted-foreground/50 italic">no price set</span>
        {/if}
      </div>

      {#if !hasPrice}
        <p class="text-[10px] text-muted-foreground/60 -mt-3">
          Set a cost in the item's Edit dialog to enable gold calculation.
          Selling will still remove the item.
        </p>
      {/if}

    </div>

    <Dialog.Footer class="flex gap-2 justify-end border-t border-border pt-3 mt-1">
      <Button variant="outline" size="sm" class="h-7 text-xs" onclick={cancel}>Cancel</Button>
      <Button size="sm" class="h-7 text-xs" onclick={sell}>
        {#if hasPrice && totalCp > 0}
          Sell for {proceedsLabel()}
        {:else}
          Sell
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
