<script lang="ts">
  import type { CompendiumContentType, CompendiumSearchFilters } from '@aplus-compendium/types';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';

  const SCHOOLS = ['Abjuration','Conjuration','Divination','Enchantment','Evocation','Illusion','Necromancy','Transmutation'];
  const SPELL_CLASSES = ['Artificer','Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Warlock','Wizard'];
  const RARITIES = ['none','common','uncommon','rare','very rare','legendary','artifact'];

  const { activeType, filters, availableSources } = $derived(compendiumStore);

  function toggle<T>(arr: T[] | undefined, val: T): T[] {
    if (!arr) return [val];
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }

  function isActive(key: keyof CompendiumSearchFilters, val: unknown): boolean {
    const f = filters as Record<string, unknown[]>;
    const arr = f[key];
    return Array.isArray(arr) && arr.includes(val);
  }

  function toggleFilter(key: keyof CompendiumSearchFilters, val: unknown) {
    compendiumStore.setFilters({
      ...filters,
      [key]: toggle((filters as Record<string, unknown[]>)[key], val),
    } as CompendiumSearchFilters);
  }

  function setBool(key: keyof CompendiumSearchFilters, val: boolean | undefined) {
    const next = { ...filters } as Record<string, unknown>;
    if (val === undefined) delete next[key];
    else next[key] = val;
    compendiumStore.setFilters(next as CompendiumSearchFilters);
  }

  const hasFilters = $derived(Object.keys(filters).length > 0);
</script>

<div class="space-y-2 px-3 pb-2 text-xs">

  {#if activeType === 'spell'}
    <!-- Spell level -->
    <div class="space-y-1">
      <span class="text-muted-foreground uppercase tracking-wide text-[10px]">Level</span>
      <div class="flex flex-wrap gap-1">
        <button
          class="px-1.5 py-0.5 rounded border text-xs transition-colors {isActive('level', 0) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
          onclick={() => toggleFilter('level', 0)}
        >C</button>
        {#each [1,2,3,4,5,6,7,8,9] as lvl}
          <button
            class="px-1.5 py-0.5 rounded border text-xs transition-colors {isActive('level', lvl) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
            onclick={() => toggleFilter('level', lvl)}
          >{lvl}</button>
        {/each}
      </div>
    </div>

    <!-- School -->
    <div class="space-y-1">
      <span class="text-muted-foreground uppercase tracking-wide text-[10px]">School</span>
      <div class="flex flex-wrap gap-1">
        {#each SCHOOLS as school}
          <button
            class="px-1.5 py-0.5 rounded border text-xs capitalize transition-colors {isActive('school', school) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
            onclick={() => toggleFilter('school', school)}
          >{school.slice(0, 3)}</button>
        {/each}
      </div>
    </div>

    <!-- Classes -->
    <div class="space-y-1">
      <span class="text-muted-foreground uppercase tracking-wide text-[10px]">Class</span>
      <div class="flex flex-wrap gap-1">
        {#each SPELL_CLASSES as cls}
          <button
            class="px-1.5 py-0.5 rounded border text-xs transition-colors {isActive('classes', cls) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
            onclick={() => toggleFilter('classes', cls)}
          >{cls.slice(0, 3)}</button>
        {/each}
      </div>
    </div>

    <!-- Ritual / Concentration -->
    <div class="flex gap-2">
      <button
        class="px-2 py-0.5 rounded border text-xs transition-colors {filters.ritual === true ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
        onclick={() => setBool('ritual', filters.ritual === true ? undefined : true)}
      >Ritual</button>
      <button
        class="px-2 py-0.5 rounded border text-xs transition-colors {filters.concentration === true ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
        onclick={() => setBool('concentration', filters.concentration === true ? undefined : true)}
      >Concentration</button>
    </div>

  {:else if activeType === 'item'}
    <!-- Rarity -->
    <div class="space-y-1">
      <span class="text-muted-foreground uppercase tracking-wide text-[10px]">Rarity</span>
      <div class="flex flex-wrap gap-1">
        {#each RARITIES as r}
          <button
            class="px-1.5 py-0.5 rounded border text-xs capitalize transition-colors {isActive('rarity', r) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
            onclick={() => toggleFilter('rarity', r)}
          >{r === 'none' ? 'None' : r}</button>
        {/each}
      </div>
    </div>
    <!-- Attunement -->
    <div>
      <button
        class="px-2 py-0.5 rounded border text-xs transition-colors {filters.requiresAttunement === true ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
        onclick={() => setBool('requiresAttunement', filters.requiresAttunement === true ? undefined : true)}
      >Requires Attunement</button>
    </div>
  {/if}

  <!-- Source filter (universal) -->
  {#if availableSources.length > 0}
    <div class="space-y-1">
      <span class="text-muted-foreground uppercase tracking-wide text-[10px]">Source</span>
      <div class="flex flex-wrap gap-1">
        {#each availableSources as src}
          <button
            class="px-1.5 py-0.5 rounded border text-xs transition-colors {isActive('source', src) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-muted-foreground'}"
            onclick={() => toggleFilter('source', src)}
          >{src}</button>
        {/each}
      </div>
    </div>
  {/if}

  {#if hasFilters}
    <Button variant="ghost" size="sm" class="h-6 text-xs px-2 text-muted-foreground" onclick={() => compendiumStore.clearFilters()}>
      Clear filters
    </Button>
  {/if}
</div>
