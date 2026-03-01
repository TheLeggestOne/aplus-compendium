<script lang="ts">
  import type { ClassSpellcasting, DndClass, Spell, SpellLevel } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import SpellEntry from './spell-entry.svelte';
  import SectionHeader from './section-header.svelte';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import XIcon from '@lucide/svelte/icons/x';

  interface ClassCapacity {
    class: DndClass;
    cantripCap: number;
    spellCap: number;
    cantripCount: number;
    spellCount: number;
  }

  interface Props {
    classSpellcasting: ClassSpellcasting[];
    capacities: ClassCapacity[];
  }

  let { classSpellcasting, capacities }: Props = $props();

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

  function groupByLevel(spells: Spell[]): [SpellLevel, Spell[]][] {
    const groups = new Map<SpellLevel, Spell[]>();
    for (const spell of spells) {
      const existing = groups.get(spell.level) ?? [];
      groups.set(spell.level, [...existing, spell]);
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function startPick(dndClass: DndClass, mode: 'cantrip' | 'spell') {
    const className = capitalize(dndClass);
    compendiumStore.enterPickMode({
      mode,
      className,
      onPick: (spell: Spell) => {
        characterStore.addClassSpell(dndClass, spell);
      },
      onCancel: () => {},
    });
  }

  function removeSpell(dndClass: DndClass, spellId: string) {
    characterStore.removeClassSpell(dndClass, spellId);
  }
</script>

<div class="flex flex-col gap-4">
  {#each classSpellcasting as cs (cs.class)}
    {@const cap = capacities.find(c => c.class === cs.class)}
    {@const spellGroups = groupByLevel(cs.spellsKnown)}

    <div class="flex flex-col gap-2">
      {#if classSpellcasting.length > 1}
        <SectionHeader title="{capitalize(cs.class)} Spells" />
      {:else}
        <SectionHeader title="Spells" />
      {/if}

      <ScrollArea class="rounded-md border border-border bg-card px-2 py-1 max-h-[500px]">
        <!-- Cantrips -->
        {#if cap && cap.cantripCap > 0}
          <div class="mb-3">
            <div class="flex items-center justify-between px-2 py-1">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cantrips
              </p>
              <span class="text-[10px] text-muted-foreground">
                {cs.cantrips.length}/{cap.cantripCap}
              </span>
            </div>
            {#each cs.cantrips as spell (spell.id)}
              <div class="flex items-center group">
                <div class="flex-1 min-w-0">
                  <SpellEntry {spell} />
                </div>
                <button
                  class="shrink-0 p-1 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                  onclick={() => removeSpell(cs.class, spell.id)}
                >
                  <XIcon class="size-3" />
                </button>
              </div>
            {/each}
            {#if cs.cantrips.length < cap.cantripCap}
              <button
                class="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                onclick={() => startPick(cs.class, 'cantrip')}
              >
                <PlusIcon class="size-3" />
                Add Cantrip
              </button>
            {/if}
          </div>
        {/if}

        <!-- Spells by level -->
        {#if cap && cap.spellCap > 0}
          <div class="flex items-center justify-between px-2 py-1">
            <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Spells Known
            </p>
            <span class="text-[10px] text-muted-foreground">
              {cs.spellsKnown.length}/{cap.spellCap}
            </span>
          </div>

          {#each spellGroups as [level, levelSpells] (level)}
            <div class="mb-2">
              <p class="text-[10px] text-muted-foreground/70 px-2 py-0.5">
                {LEVEL_LABELS[level]}
              </p>
              {#each levelSpells as spell (spell.id)}
                <div class="flex items-center group">
                  <div class="flex-1 min-w-0">
                    <SpellEntry {spell} />
                  </div>
                  <button
                    class="shrink-0 p-1 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                    onclick={() => removeSpell(cs.class, spell.id)}
                  >
                    <XIcon class="size-3" />
                  </button>
                </div>
              {/each}
            </div>
          {/each}

          {#if cs.spellsKnown.length < cap.spellCap}
            <button
              class="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              onclick={() => startPick(cs.class, 'spell')}
            >
              <PlusIcon class="size-3" />
              Add Spell
            </button>
          {/if}
        {/if}

        {#if cs.cantrips.length === 0 && cs.spellsKnown.length === 0}
          <p class="py-4 text-sm text-center text-muted-foreground">No spells known.</p>
        {/if}
      </ScrollArea>
    </div>
  {/each}
</div>
