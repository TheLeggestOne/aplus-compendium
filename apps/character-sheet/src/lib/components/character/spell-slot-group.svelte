<script lang="ts">
  import type { SpellSlot } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { cn } from '$lib/utils.js';

  interface Props {
    slot: SpellSlot;
  }

  let { slot }: Props = $props();

  const LEVEL_LABELS = ['—', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];
</script>

<div class="flex flex-col items-center gap-2 rounded-md border border-border bg-card p-3">
  <span class="text-xs font-semibold text-muted-foreground uppercase">
    {LEVEL_LABELS[slot.level] ?? `${slot.level}th`}
  </span>

  <div class="flex gap-1.5">
    {#each Array(slot.total) as _, i}
      {@const isAvailable = i >= slot.used}
      <button
        class={cn(
          'size-5 rounded-full border-2 transition-all',
          isAvailable
            ? 'border-primary bg-primary hover:bg-primary/80 cursor-pointer'
            : 'border-muted-foreground/30 bg-transparent cursor-pointer hover:border-primary',
        )}
        onclick={() => {
          if (isAvailable) {
            characterStore.useSpellSlot(slot.level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
          } else {
            characterStore.restoreSpellSlot(slot.level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9);
          }
        }}
        aria-label={isAvailable ? 'Use spell slot' : 'Restore spell slot'}
        title={isAvailable ? 'Click to expend slot' : 'Click to restore slot'}
      ></button>
    {/each}
  </div>

  <span class="text-[10px] text-muted-foreground tabular-nums">
    {slot.total - slot.used}/{slot.total}
  </span>
</div>
