<script lang="ts">
  import type { Spell, SpellLevel } from '@aplus-compendium/types';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import SpellEntry from './spell-entry.svelte';
  import SectionHeader from './section-header.svelte';

  interface Props {
    spells: Spell[];
    raceName: string;
  }

  let { spells, raceName }: Props = $props();

  const LEVEL_LABELS: Record<SpellLevel, string> = {
    0: 'Cantrips',
    1: '1st Level', 2: '2nd Level', 3: '3rd Level',
    4: '4th Level', 5: '5th Level', 6: '6th Level',
    7: '7th Level', 8: '8th Level', 9: '9th Level',
  };

  function groupByLevel(spells: Spell[]): [SpellLevel, Spell[]][] {
    const groups = new Map<SpellLevel, Spell[]>();
    for (const spell of spells) {
      const existing = groups.get(spell.level) ?? [];
      groups.set(spell.level, [...existing, spell]);
    }
    return [...groups.entries()].sort(([a], [b]) => a - b) as [SpellLevel, Spell[]][];
  }

  const spellGroups = $derived(groupByLevel(spells));
</script>

<div>
  <SectionHeader title="{raceName} Spells" />
  <ScrollArea class="rounded-md border border-border bg-card px-2 py-1 max-h-[400px]">
    {#each spellGroups as [level, levelSpells] (level)}
      <div class="mb-2">
        <p class="text-[10px] text-muted-foreground/70 px-2 py-0.5">
          {LEVEL_LABELS[level]}
        </p>
        {#each levelSpells as spell (spell.id)}
          <div class="flex items-center">
            <div class="flex-1 min-w-0">
              <SpellEntry {spell} />
            </div>
            <!-- Lock spacer — race spells are not removable -->
            <div class="shrink-0 w-5"></div>
          </div>
        {/each}
      </div>
    {/each}
  </ScrollArea>
</div>
