<script lang="ts">
  import type { CompendiumEntry, CompendiumSearchResult } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';
  import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import {
    buildProgressionTable,
    groupFeaturesByLevel,
    extractSavingThrows,
    extractHitDie,
    extractStartingProficiencies,
    extractMulticlassingReqs,
  } from '$lib/utils/class-page-helpers.js';
  import type { PageData } from './$types.js';

  const { data } = $props<{ data: PageData }>();
  const entry = $derived(data.entry);
  const raw = $derived(entry.raw);

  // --- Class stats ---
  const hitDie = $derived(extractHitDie(raw));
  const savingThrows = $derived(extractSavingThrows(raw));
  const profs = $derived(extractStartingProficiencies(raw));
  const multiclassReqs = $derived(extractMulticlassingReqs(raw));
  const subclassTitle = $derived((raw['subclassTitle'] as string) ?? 'Subclass');

  // --- Progression table ---
  const progression = $derived(buildProgressionTable(raw));

  // --- Feature descriptions ---
  const featureEntries = $derived(
    (raw['_classFeatureEntries'] as unknown[]) ?? [],
  );
  const featuresByLevel = $derived(groupFeaturesByLevel(featureEntries));
  const featureLevels = $derived([...featuresByLevel.keys()].sort((a, b) => a - b));

  // --- Subclasses ---
  let subclassList = $state<CompendiumSearchResult[]>([]);
  let expandedSubclassId = $state<string | null>(null);
  let expandedSubclassEntry = $state<CompendiumEntry | null>(null);
  let loadingSubclass = $state(false);

  $effect(() => {
    void fetchSubclasses(entry.name);
    expandedSubclassId = null;
    expandedSubclassEntry = null;
  });

  async function fetchSubclasses(className: string) {
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.getSubclasses(className);
      if (result.ok) subclassList = result.data;
    } catch (e) {
      console.error('[class-page] getSubclasses error:', e);
    }
  }

  async function toggleSubclass(id: string) {
    if (expandedSubclassId === id) {
      expandedSubclassId = null;
      expandedSubclassEntry = null;
      return;
    }
    expandedSubclassId = id;
    expandedSubclassEntry = null;
    loadingSubclass = true;
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.get(id, 'subclass');
      if (result.ok && result.data) expandedSubclassEntry = result.data;
    } catch (e) {
      console.error('[class-page] get subclass error:', e);
    } finally {
      loadingSubclass = false;
    }
  }

  // Group subclass features by level
  const subclassFeaturesByLevel = $derived(() => {
    if (!expandedSubclassEntry) return new Map();
    const entries = (expandedSubclassEntry.raw['_subclassFeatureEntries'] as unknown[]) ?? [];
    return groupFeaturesByLevel(entries);
  });
</script>

<div class="flex h-full flex-col overflow-hidden bg-background text-foreground">

  <!-- Header bar -->
  <div class="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
    <Button variant="ghost" size="icon" class="size-8" onclick={() => history.back()}>
      <ArrowLeftIcon class="size-4" />
    </Button>
    <div class="flex-1 min-w-0">
      <h1 class="text-lg font-semibold leading-tight truncate">{entry.name}</h1>
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary" class="text-[10px] px-1.5 py-0 h-4">{entry.source}</Badge>
        {#if hitDie}
          <span>Hit Die: {hitDie}</span>
        {/if}
      </div>
    </div>
  </div>

  <!-- Scrollable content -->
  <div class="flex-1 overflow-auto">
    <div class="max-w-4xl mx-auto px-6 py-6 space-y-8">

      <!-- Stats block -->
      <section class="space-y-3">
        <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {#if hitDie}
            <div class="text-muted-foreground">Hit Die</div>
            <div>{hitDie}</div>
          {/if}

          {#if savingThrows}
            <div class="text-muted-foreground">Saving Throws</div>
            <div>{savingThrows}</div>
          {/if}

          {#if profs.armor}
            <div class="text-muted-foreground">Armor</div>
            <div class="capitalize">{profs.armor}</div>
          {/if}

          {#if profs.weapons}
            <div class="text-muted-foreground">Weapons</div>
            <div class="capitalize">{profs.weapons}</div>
          {/if}

          {#if profs.skills}
            <div class="text-muted-foreground">Skills</div>
            <div class="capitalize">{profs.skills}</div>
          {/if}

          {#if multiclassReqs}
            <div class="text-muted-foreground">Multiclassing</div>
            <div>{multiclassReqs}</div>
          {/if}
        </div>
      </section>

      <Separator />

      <!-- Class progression table -->
      <section class="space-y-3">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Class Progression
        </h2>
        <div class="overflow-x-auto rounded-md border border-border">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-muted/40 text-left">
                <th class="px-2 py-1.5 font-medium w-12">Level</th>
                <th class="px-2 py-1.5 font-medium w-12">Prof.</th>
                <th class="px-2 py-1.5 font-medium">Features</th>
                {#each progression.extraColLabels as label}
                  <th class="px-2 py-1.5 font-medium text-center whitespace-nowrap">
                    {@html label}
                  </th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each progression.rows as row}
                <tr class="border-t border-border/40 hover:bg-muted/20 transition-colors">
                  <td class="px-2 py-1.5 text-muted-foreground">{row.level}</td>
                  <td class="px-2 py-1.5">{row.profBonus}</td>
                  <td class="px-2 py-1.5">
                    {#each row.features as feat, i}
                      {#if i > 0}, {/if}
                      <span class={feat.isSubclassFeature ? 'italic text-muted-foreground' : ''}>
                        {feat.name}
                      </span>
                    {/each}
                    {#if row.features.length === 0}
                      <span class="text-muted-foreground">&mdash;</span>
                    {/if}
                  </td>
                  {#each row.extraCells as cell}
                    <td class="px-2 py-1.5 text-center">
                      {@html cell}
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <Separator />

      <!-- Class features by level -->
      <section class="space-y-6">
        <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Class Features
        </h2>

        {#each featureLevels as level}
          <div class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/30 pb-1">
              Level {level}
            </h3>
            {#each featuresByLevel.get(level) ?? [] as feature}
              <div class="space-y-1">
                <h4 class="text-sm font-semibold">{feature.name}</h4>
                <EntryRenderer entries={feature.entries} />
              </div>
            {/each}
          </div>
        {/each}

        {#if featureLevels.length === 0}
          <p class="text-sm text-muted-foreground italic">
            No feature descriptions available. Try re-importing compendium data.
          </p>
        {/if}
      </section>

      <!-- Subclasses -->
      {#if subclassList.length > 0}
        <Separator />

        <section class="space-y-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {subclassTitle} Options
          </h2>

          <div class="rounded-md border border-border divide-y divide-border/50 overflow-hidden">
            {#each subclassList as sc (sc.id)}
              <div>
                <button
                  class="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors
                    {expandedSubclassId === sc.id ? 'bg-muted/40' : ''}"
                  onclick={() => toggleSubclass(sc.id)}
                >
                  <ChevronRightIcon
                    class="size-4 shrink-0 transition-transform {expandedSubclassId === sc.id ? 'rotate-90' : ''}"
                  />
                  <span class="font-medium">{sc.name}</span>
                  <Badge variant="outline" class="ml-auto shrink-0 text-[10px] px-1.5 py-0 h-4 font-normal opacity-60">
                    {sc.source}
                  </Badge>
                </button>

                {#if expandedSubclassId === sc.id}
                  <div class="border-t border-border/30 bg-muted/10 px-4 py-4 space-y-4">
                    {#if loadingSubclass}
                      <p class="text-xs text-muted-foreground">Loading…</p>
                    {:else if expandedSubclassEntry}
                      <!-- Subclass description -->
                      {#if expandedSubclassEntry.raw['entries']}
                        <EntryRenderer entries={expandedSubclassEntry.raw['entries'] as unknown[]} />
                      {/if}

                      <!-- Subclass features by level -->
                      {@const scFeatures = subclassFeaturesByLevel()}
                      {#each [...scFeatures.keys()].sort((a, b) => a - b) as level}
                        <div class="space-y-2">
                          <h4 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/30 pb-1">
                            Level {level}
                          </h4>
                          {#each scFeatures.get(level) ?? [] as feature}
                            <div class="space-y-1">
                              <h5 class="text-sm font-semibold">{feature.name}</h5>
                              <EntryRenderer entries={feature.entries} />
                            </div>
                          {/each}
                        </div>
                      {/each}
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Bottom spacer -->
      <div class="h-8"></div>
    </div>
  </div>
</div>
