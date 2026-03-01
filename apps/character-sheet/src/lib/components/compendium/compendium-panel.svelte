<script lang="ts">
  import type { CompendiumContentType } from '@aplus-compendium/types';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { entryToSpell } from '$lib/utils/compendium-to-character.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import FilterBar from './filter-bar.svelte';
  import EntryListItem from './entry-list-item.svelte';
  import EntryDetail from './entry-detail.svelte';
  import ImportPrompt from './import-prompt.svelte';

  const TYPE_LABELS: Record<CompendiumContentType, string> = {
    'spell': 'Spells',
    'item': 'Items',
    'feat': 'Feats',
    'background': 'Backgrounds',
    'race': 'Races',
    'class': 'Classes',
    'subclass': 'Subclasses',
    'optional-feature': 'Features',
    'condition': 'Conditions',
  };

  const {
    status,
    activeType,
    query,
    results,
    isSearching,
    hasMore,
    isLoadingMore,
    selectedId,
    selectedEntry,
    isLoadingEntry,
    contentTypes,
  } = $derived(compendiumStore);

  const pickMode = $derived(compendiumStore.pickMode);

  let filtersOpen = $state(false);
  const hasFilters = $derived(Object.keys(compendiumStore.filters).length > 0);

  // Close filters on click outside — scoped to this panel only
  let filterZoneEl = $state<HTMLElement | null>(null);

  // Infinite scroll — trigger loadMore when sentinel enters viewport
  let sentinelEl = $state<HTMLElement | null>(null);
  let observer: IntersectionObserver | null = null;

  $effect(() => {
    if (!sentinelEl) return;
    observer?.disconnect();
    observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) compendiumStore.loadMore(); },
      { rootMargin: '200px' },
    );
    observer.observe(sentinelEl);
    return () => observer?.disconnect();
  });

  function handlePanelClick(e: MouseEvent) {
    if (!filtersOpen || !filterZoneEl) return;
    if (filterZoneEl.contains(e.target as Node)) return;
    filtersOpen = false;
  }

  // --- Pick mode: inline "+" on each list row ---
  let justPickedId = $state<string | null>(null);
  let _pickTimer: ReturnType<typeof setTimeout> | null = null;

  async function pickFromRow(entryId: string) {
    if (!pickMode) return;
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.get(entryId, activeType);
      if (result.ok && result.data) {
        pickMode.onPick(entryToSpell(result.data));
        if (_pickTimer) clearTimeout(_pickTimer);
        justPickedId = entryId;
        _pickTimer = setTimeout(() => { justPickedId = null; }, 1200);
      }
    } catch (e) {
      console.error('[compendium] pick fetch error:', e);
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<aside class="flex h-full flex-col border-l border-border bg-card/30" onclick={handlePanelClick}>
  {#if pickMode}
    <!-- Pick mode banner -->
    <div class="flex shrink-0 items-center justify-between gap-2 px-3 py-2 border-b border-primary/30 bg-primary/5">
      <p class="text-xs font-medium text-primary truncate">
        Picking {pickMode.mode === 'cantrip' ? 'cantrip' : 'spell'} for {pickMode.className}
      </p>
      <Button
        variant="ghost"
        size="sm"
        class="h-6 px-2 text-xs shrink-0"
        onclick={() => { pickMode.onCancel(); compendiumStore.exitPickMode(); }}
      >
        Cancel
      </Button>
    </div>
  {:else}
    <!-- Type selector tabs -->
    <div class="flex shrink-0 overflow-x-auto border-b border-border">
      {#each contentTypes as type}
        <button
          class="shrink-0 px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap
            {activeType === type
              ? 'border-b-2 border-primary text-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => compendiumStore.setType(type)}
        >
          {TYPE_LABELS[type]}
          {#if status?.counts[type]}
            <span class="ml-1 text-[10px] opacity-50">{status.counts[type]}</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if !status?.imported}
    <!-- Import prompt -->
    <div class="flex-1 flex items-center justify-center">
      <ImportPrompt />
    </div>
  {:else}
    <!-- Search + filter zone (clicks inside here don't close the filter) -->
    <div bind:this={filterZoneEl} class="shrink-0">
      <!-- Search bar -->
      <div class="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Input
          type="search"
          placeholder="Search {TYPE_LABELS[activeType].toLowerCase()}…"
          value={query}
          oninput={(e: Event) => compendiumStore.setQuery((e.currentTarget as HTMLInputElement).value)}
          class="h-7 text-xs flex-1"
        />
        <Button
          variant={filtersOpen || hasFilters ? 'secondary' : 'ghost'}
          size="sm"
          class="h-7 px-2 text-xs shrink-0"
          onclick={() => { filtersOpen = !filtersOpen; }}
        >
          {hasFilters ? '⦿' : '☰'} Filter
        </Button>
      </div>

      <!-- Filter bar -->
      {#if filtersOpen}
        <div class="border-b border-border py-2 bg-muted/20">
          <FilterBar />
        </div>
      {/if}
    </div>

    <!-- Results + Detail -->
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      {#if isSearching && results.length === 0}
        <div class="flex flex-1 items-center justify-center">
          <p class="text-xs text-muted-foreground">Searching…</p>
        </div>
      {:else if results.length === 0}
        <div class="flex flex-1 items-center justify-center">
          <p class="text-xs text-muted-foreground">No results</p>
        </div>
      {:else}
        <div class="min-h-0 flex-1 overflow-y-auto">
          <div class="divide-y divide-border/40">
            {#each results as entry (entry.id)}
              <div>
                <EntryListItem
                  {entry}
                  selected={selectedId === entry.id}
                  onclick={() => compendiumStore.selectEntry(entry.id)}
                  onpick={pickMode ? () => pickFromRow(entry.id) : undefined}
                  justPicked={justPickedId === entry.id}
                />

                {#if selectedId === entry.id}
                  <!-- Inline expanded detail -->
                  <div class="border-t border-border/40 bg-muted/20">
                    {#if isLoadingEntry}
                      <div class="flex items-center justify-center py-6">
                        <p class="text-xs text-muted-foreground">Loading…</p>
                      </div>
                    {:else if selectedEntry}
                      <EntryDetail entry={selectedEntry} />
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          {#if hasMore}
            <!-- Sentinel triggers loadMore when scrolled into view -->
            <div bind:this={sentinelEl} class="shrink-0 px-3 py-2 text-center">
              {#if isLoadingMore}
                <p class="text-[10px] text-muted-foreground">Loading more…</p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</aside>
