<script lang="ts">
  import type { Spell, SpellLevel } from '@aplus-compendium/types';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import SpellEntry from './spell-entry.svelte';
  import SectionHeader from './section-header.svelte';

  interface Props {
    spells: Spell[];
    cantrips: Spell[];
  }

  let { spells, cantrips }: Props = $props();

  const LEVEL_LABELS: Record<SpellLevel, string> = {
    0: 'Cantrips',
    1: '1st Level',
    2: '2nd Level',
    3: '3rd Level',
    4: '4th Level',
    5: '5th Level',
    6: '6th Level',
    7: '7th Level',
    8: '8th Level',
    9: '9th Level',
  };

  // Group spells by level
  const spellsByLevel = $derived(() => {
    const groups = new Map<SpellLevel, Spell[]>();

    if (cantrips.length > 0) {
      groups.set(0, cantrips);
    }

    for (const spell of spells) {
      const existing = groups.get(spell.level) ?? [];
      groups.set(spell.level, [...existing, spell]);
    }

    // Sort by level
    return [...groups.entries()].sort(([a], [b]) => a - b);
  });
</script>

<div class="flex flex-col gap-2">
  <SectionHeader title="Spells" />

  <ScrollArea class="rounded-md border border-border bg-card px-2 py-1 max-h-[500px]">
    {#each spellsByLevel() as [level, levelSpells]}
      <div class="mb-3">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1">
          {LEVEL_LABELS[level]}
        </p>
        {#each levelSpells as spell}
          <SpellEntry {spell} />
        {/each}
      </div>
    {/each}

    {#if spells.length === 0 && cantrips.length === 0}
      <p class="py-4 text-sm text-center text-muted-foreground">No spells known.</p>
    {/if}
  </ScrollArea>
</div>
