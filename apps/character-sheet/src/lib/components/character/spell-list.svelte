<script lang="ts">
  import type { ClassSpellcasting, DndClass, Spell, SpellLevel } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import SpellEntry from './spell-entry.svelte';
  import SectionHeader from './section-header.svelte';
  import KeyStatPill from './key-stat-pill.svelte';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import XIcon from '@lucide/svelte/icons/x';
  import BookOpenCheckIcon from '@lucide/svelte/icons/book-open-check';
  import EyeOffIcon from '@lucide/svelte/icons/eye-off';
  import EyeIcon from '@lucide/svelte/icons/eye';

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

  const ABILITY_LABELS: Record<string, string> = {
    strength: 'STR', dexterity: 'DEX', constitution: 'CON',
    intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
  };

  const LEVEL_LABELS: Record<SpellLevel, string> = {
    0: 'Cantrips',
    1: '1st Level', 2: '2nd Level', 3: '3rd Level',
    4: '4th Level', 5: '5th Level', 6: '6th Level',
    7: '7th Level', 8: '8th Level', 9: '9th Level',
  };

  // Per-class state for prepare mode and hide-unprepared
  let preparingClass = $state<DndClass | null>(null);
  let hideUnpreparedClasses = $state<DndClass[]>([]);

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

  function togglePrepared(dndClass: DndClass, spellId: string, current: boolean) {
    characterStore.setSpellPrepared(dndClass, spellId, !current);
  }

  function togglePrepareMode(dndClass: DndClass) {
    preparingClass = preparingClass === dndClass ? null : dndClass;
  }

  function toggleHideUnprepared(dndClass: DndClass) {
    if (hideUnpreparedClasses.includes(dndClass)) {
      hideUnpreparedClasses = hideUnpreparedClasses.filter((c) => c !== dndClass);
    } else {
      hideUnpreparedClasses = [...hideUnpreparedClasses, dndClass];
    }
  }

  function isPrepared(spell: Spell): boolean {
    return spell.prepared !== false;
  }
</script>

<div class="flex flex-col gap-6">
  {#each classSpellcasting as cs (cs.class)}
    {@const cap = capacities.find(c => c.class === cs.class)}
    {@const castAbility = characterStore.classSpellcastingAbilities.find(a => a.class === cs.class)}
    {@const isPrepareMode = preparingClass === cs.class}
    {@const isHidingUnprepared = hideUnpreparedClasses.includes(cs.class)}

    <div class="flex flex-col gap-2">
      <!-- Class section header with prepare mode button -->
      <div class="flex items-center gap-2">
        <div class="flex-1">
          {#if classSpellcasting.length > 1}
            <SectionHeader title="{capitalize(cs.class)} Spells" />
          {:else}
            <SectionHeader title="Spells" />
          {/if}
        </div>

        {#if cap && cap.spellCap > 0}
          <button
            class="mb-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors
              {isPrepareMode
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}"
            onclick={() => togglePrepareMode(cs.class)}
            title={isPrepareMode ? 'Exit prepare mode' : 'Manage prepared spells'}
          >
            <BookOpenCheckIcon class="size-3" />
            {isPrepareMode ? 'Done' : 'Prepare'}
          </button>

          {#if !isPrepareMode}
            <button
              class="mb-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] transition-colors
                {isHidingUnprepared
                  ? 'bg-muted text-foreground hover:bg-muted/70'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}"
              onclick={() => toggleHideUnprepared(cs.class)}
              title={isHidingUnprepared ? 'Show unprepared spells' : 'Hide unprepared spells'}
            >
              {#if isHidingUnprepared}
                <EyeOffIcon class="size-3" />
                Unprepared
              {:else}
                <EyeIcon class="size-3" />
                Unprepared
              {/if}
            </button>
          {/if}
        {/if}
      </div>

      <!-- Per-class spellcasting stats -->
      {#if castAbility}
        <div class="flex flex-wrap gap-2 mb-1">
          <KeyStatPill label="Ability" value={ABILITY_LABELS[castAbility.abilityScore] ?? castAbility.abilityScore.toUpperCase()} />
          <KeyStatPill label="Save DC" value={castAbility.spellSaveDC} />
          <KeyStatPill
            label="Spell Attack"
            value={castAbility.spellAttackBonus >= 0 ? `+${castAbility.spellAttackBonus}` : castAbility.spellAttackBonus}
          />
        </div>
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
                  <SpellEntry {spell} dndClass={cs.class} />
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
          {@const spellGroups = groupByLevel(
            isHidingUnprepared && !isPrepareMode
              ? cs.spellsKnown.filter(isPrepared)
              : cs.spellsKnown
          )}

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
                {@const prepared = isPrepared(spell)}
                <div class="flex items-center group {!prepared && !isPrepareMode ? 'opacity-50' : ''}">
                  {#if isPrepareMode}
                    <button
                      class="shrink-0 p-1 ml-1 mr-0.5 rounded transition-colors {prepared ? 'text-primary hover:text-primary/70' : 'text-muted-foreground hover:text-primary'}"
                      onclick={() => togglePrepared(cs.class, spell.id, prepared)}
                      title={prepared ? 'Mark as unprepared' : 'Mark as prepared'}
                    >
                      <div class="size-3.5 rounded-sm border-2 flex items-center justify-center {prepared ? 'border-primary bg-primary/20' : 'border-muted-foreground/40'}">
                        {#if prepared}
                          <div class="size-1.5 rounded-[1px] bg-primary"></div>
                        {/if}
                      </div>
                    </button>
                  {/if}
                  <div class="flex-1 min-w-0">
                    <SpellEntry {spell} dndClass={cs.class} />
                  </div>
                  {#if !isPrepareMode}
                    <button
                      class="shrink-0 p-1 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive transition-colors"
                      onclick={() => removeSpell(cs.class, spell.id)}
                    >
                      <XIcon class="size-3" />
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/each}

          {#if cs.spellsKnown.length < cap.spellCap && !isPrepareMode}
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
