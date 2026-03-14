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

  $effect(() => {
    if (open) {
      percentStep = 50;
      sellQty = item.quantity;
    }
  });

  const fraction = $derived(percentStep / 100);
  const goldPerUnit = $derived((item.costGp ?? 0) * fraction);
  const totalGold = $derived(Math.floor(goldPerUnit * sellQty));
  const hasPrice = $derived((item.costGp ?? 0) > 0);

  function sell() {
    characterStore.sellItem(item.id, fraction, sellQty);
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

      <!-- Summary -->
      <div class="rounded-md bg-muted/50 px-3 py-2 flex items-center justify-between">
        <span class="text-xs text-muted-foreground">
          {sellQty > 1 ? `${sellQty}× ` : ''}{item.name}
        </span>
        {#if hasPrice}
          <span class="text-sm font-semibold text-yellow-400 tabular-nums">{totalGold} gp</span>
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
        Sell{hasPrice ? ` for ${totalGold} gp` : ''}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
