<script lang="ts">
  import type { CompendiumContentType } from '@aplus-compendium/types';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
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
    selectedId,
    selectedEntry,
    isLoadingEntry,
    contentTypes,
  } = $derived(compendiumStore);

  let filtersOpen = $state(false);
  const hasFilters = $derived(Object.keys(compendiumStore.filters).length > 0);
</script>

<aside class="flex h-full flex-col border-l border-border bg-card/30">
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

  {#if !status?.imported}
    <!-- Import prompt -->
    <div class="flex-1 flex items-center justify-center">
      <ImportPrompt />
    </div>
  {:else}
    <!-- Search bar -->
    <div class="shrink-0 flex items-center gap-2 px-3 py-2 border-b border-border">
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

    <!-- Filter bar (collapsible) -->
    <Collapsible.Root open={filtersOpen} class="shrink-0">
      <Collapsible.Content>
        <div class="border-b border-border py-2 bg-muted/20">
          <FilterBar />
        </div>
      </Collapsible.Content>
    </Collapsible.Root>

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
        <ScrollArea class="flex-1">
          <div class="divide-y divide-border/40">
            {#each results as entry (entry.id)}
              <div>
                <EntryListItem
                  {entry}
                  selected={selectedId === entry.id}
                  onclick={() => compendiumStore.selectEntry(entry.id)}
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
        </ScrollArea>

        {#if results.length >= 100}
          <div class="shrink-0 border-t border-border px-3 py-1.5">
            <p class="text-[10px] text-muted-foreground text-center">
              Showing first 100 results — refine your search
            </p>
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</aside>
