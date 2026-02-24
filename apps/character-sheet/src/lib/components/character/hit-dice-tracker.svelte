<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SectionHeader from './section-header.svelte';
  import { cn } from '$lib/utils.js';

  const { character } = $derived(characterStore);
</script>

<div>
  <SectionHeader title="Hit Dice" />
  <div class="flex flex-wrap gap-3">
    {#each character.combat.hitDicePools as pool}
      {@const remaining = pool.total - pool.used}
      <div class="flex flex-col items-center gap-2 rounded-md border border-border bg-card p-3">
        <span class="text-sm font-semibold text-muted-foreground uppercase">{pool.dieType}</span>
        <div class="flex flex-wrap gap-1.5">
          {#each Array(pool.total) as _, i}
            <button
              class={cn(
                'size-7 rounded border-2 text-xs font-bold transition-colors',
                i < remaining
                  ? 'border-primary bg-primary/20 text-primary hover:bg-primary/40'
                  : 'border-muted-foreground/30 bg-transparent text-muted-foreground/50 cursor-not-allowed',
              )}
              onclick={() => i < remaining && characterStore.useHitDie(pool.dieType)}
              disabled={i >= remaining}
              aria-label="Use hit die"
            >
              {pool.dieType}
            </button>
          {/each}
        </div>
        <span class="text-xs text-muted-foreground">{remaining}/{pool.total} remaining</span>
      </div>
    {/each}
  </div>
</div>
