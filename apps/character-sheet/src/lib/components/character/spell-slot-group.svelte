<script lang="ts">
  import type { SpellSlot } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    slot: SpellSlot;
  }

  let { slot }: Props = $props();

  const LEVEL_LABELS = ['—', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

  const available = $derived(slot.total - slot.used);
</script>

<div class="flex items-center gap-1.5 rounded border border-border bg-card px-2.5 py-1.5">
  <span class="text-[10px] font-semibold uppercase text-muted-foreground w-7 shrink-0">
    {LEVEL_LABELS[slot.level] ?? `${slot.level}th`}
  </span>

  <button
    class="size-5 flex items-center justify-center rounded text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    onclick={() => characterStore.useSpellSlot(slot.level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)}
    disabled={slot.used >= slot.total}
    title="Use slot"
  >−</button>

  <span class="text-sm tabular-nums font-medium w-8 text-center">
    {available}/{slot.total}
  </span>

  <button
    class="size-5 flex items-center justify-center rounded text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    onclick={() => characterStore.restoreSpellSlot(slot.level as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9)}
    disabled={slot.used <= 0}
    title="Restore slot"
  >+</button>
</div>
