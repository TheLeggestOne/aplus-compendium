<script lang="ts">
  import type { CompendiumEntry, CompendiumSearchResult } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import type { AbilityScore } from '@aplus-compendium/types';
  import {
    entryToSpell,
    entryToWeapon,
    entryToArmor,
    entryToEquipment,
    entryToFeature,
    extractRaceData,
  } from '$lib/utils/compendium-to-character.js';
  import type { RaceData } from '$lib/utils/compendium-to-character.js';
  import RaceAsiChooser from './race-asi-chooser.svelte';
  import {
    extractHitDie,
    extractSavingThrows,
    extractStartingProficiencies,
  } from '$lib/utils/class-page-helpers.js';
  import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

  interface Props {
    entry: CompendiumEntry;
  }

  const { entry }: Props = $props();

  const raw = $derived(entry.raw);

  // --- Pick mode (spell selection via compendium) ---
  const inPickMode = $derived(compendiumStore.pickMode);

  function pickSpell() {
    if (!inPickMode) return;
    inPickMode.onPick(entryToSpell(entry));
    // Stay in pick mode so the user can keep adding spells
  }

  // --- Add to character ---
  let addedLabel = $state<string | null>(null);
  let _addedTimer: ReturnType<typeof setTimeout> | null = null;

  function flash(label: string) {
    if (_addedTimer) clearTimeout(_addedTimer);
    addedLabel = label;
    _addedTimer = setTimeout(() => { addedLabel = null; }, 2000);
  }

  function addToCharacter() {
    switch (entry.dropTarget) {
      case 'weapon':
        characterStore.addWeapon(entryToWeapon(entry));
        flash('Added to weapons!');
        break;
      case 'armor':
        characterStore.addArmor(entryToArmor(entry));
        flash('Added to armor!');
        break;
      case 'equipment':
        characterStore.addEquipment(entryToEquipment(entry));
        flash('Added to equipment!');
        break;
      case 'feature':
        characterStore.addFeature(entryToFeature(entry));
        flash('Feature added!');
        break;
    }
  }

  const addLabel = $derived(
    entry.dropTarget === 'weapon'   ? 'Add to Weapons'
    : entry.dropTarget === 'armor'    ? 'Add to Armor'
    : entry.dropTarget === 'equipment'? 'Add to Equipment'
    : entry.dropTarget === 'feature'  ? 'Add Feature'
    : null,
  );

  // --- Spell detail helpers ---
  const castingTime = $derived(raw['time']
    ? (raw['time'] as { number: number; unit: string }[]).map(t => `${t.number} ${t.unit}`).join(' or ')
    : entry.castingTime ?? '');

  const range = $derived(() => {
    const r = raw['range'];
    if (!r) return '';
    if (r.type === 'special') return 'Special';
    if (r.type === 'touch') return 'Touch';
    if (r.type === 'self') return 'Self';
    if (r.distance) return `${r.distance.amount ?? ''} ${r.distance.type}`.trim();
    return '';
  });

  const duration = $derived(() => {
    const d = raw['duration'];
    if (!Array.isArray(d) || d.length === 0) return '';
    const first = d[0] as Record<string, unknown>;
    if (first['type'] === 'instant') return 'Instantaneous';
    if (first['type'] === 'permanent') return 'Until dispelled';
    if (first['concentration']) {
      const dur = first['duration'] as Record<string, unknown> | undefined;
      if (dur) return `Concentration, up to ${dur['amount']} ${dur['type']}`;
      return 'Concentration';
    }
    const dur = first['duration'] as Record<string, unknown> | undefined;
    if (dur) return `${dur['amount']} ${dur['type']}`;
    return '';
  });

  const components = $derived(() => {
    const c = raw['components'] as Record<string, unknown> | undefined;
    if (!c) return '';
    const parts: string[] = [];
    if (c['v']) parts.push('V');
    if (c['s']) parts.push('S');
    if (c['m']) parts.push(`M (${typeof c['m'] === 'string' ? c['m'] : (c['m'] as Record<string,unknown>)['text'] ?? ''})`);
    return parts.join(', ');
  });

  const spellClasses = $derived(() => {
    const c = raw['classes'] as Record<string, { name: string }[]> | undefined;
    if (!c) return '';
    return (c['fromClassList'] ?? []).map((cl: { name: string }) => cl.name).join(', ');
  });

  // --- Item detail helpers ---
  const itemProperties = $derived(() => {
    const props = raw['property'] as string[] | undefined;
    if (!props || props.length === 0) return '';
    const map: Record<string, string> = {
      A: 'Ammunition', F: 'Finesse', H: 'Heavy', L: 'Light', LD: 'Loading',
      R: 'Reach', T: 'Thrown', TW: 'Two-Handed', V: 'Versatile', S: 'Special',
    };
    return props.map(p => map[p] ?? p).join(', ');
  });

  // --- Race detail helpers ---
  const isRace = $derived(entry.contentType === 'race');
  const raceData = $derived(isRace ? extractRaceData(entry) : null);

  const raceHasChoices = $derived(
    raceData
      ? (raceData.abilityBonusChoices && raceData.abilityBonusChoices.length > 0) ||
        (raceData.abilityBonusWeightedChoices && raceData.abilityBonusWeightedChoices.length > 0)
      : false,
  );

  // Whether the ASI chooser is visible (for base race or subrace)
  let showAsiChooser = $state(false);
  let asiChooserTarget = $state<'base' | 'subrace'>('base');

  const asiSummary = $derived(() => {
    if (!raceData) return '';
    const parts = Object.entries(raceData.abilityBonuses)
      .map(([ability, bonus]) => `+${bonus} ${ability.slice(0, 3).toUpperCase()}`);
    if (raceData.abilityBonusChoices) {
      for (const choice of raceData.abilityBonusChoices) {
        parts.push(`choose ${choice.count} for +${choice.amount}`);
      }
    }
    if (raceData.abilityBonusWeightedChoices) {
      for (const wc of raceData.abilityBonusWeightedChoices) {
        parts.push(`choose ${wc.weights.map(w => `+${w}`).join('/')}`);
      }
    }
    return parts.join(', ');
  });

  // Subraces — fetched when a base race is expanded
  let subraces = $state<CompendiumSearchResult[]>([]);
  let subracesFetched = $state(false);
  let expandedSubraceId = $state<string | null>(null);
  let expandedSubraceEntry = $state<CompendiumEntry | null>(null);
  let loadingSubraceEntry = $state(false);

  $effect(() => {
    // Reset subrace & chooser state when entry changes
    subraces = [];
    subracesFetched = false;
    expandedSubraceId = null;
    expandedSubraceEntry = null;
    showAsiChooser = false;

    // Fetch subraces for base races
    if (isRace && !entry.subraceOf) {
      void fetchSubraces(entry.name);
    }
  });

  async function fetchSubraces(raceName: string) {
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.getSubraces(raceName);
      if (result.ok) subraces = result.data;
    } catch (e) {
      console.error('[compendium] getSubraces error:', e);
    }
    subracesFetched = true;
  }

  async function toggleSubrace(id: string) {
    if (expandedSubraceId === id) {
      expandedSubraceId = null;
      expandedSubraceEntry = null;
      return;
    }
    expandedSubraceId = id;
    expandedSubraceEntry = null;
    loadingSubraceEntry = true;
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.get(id, 'race');
      if (result.ok && result.data) expandedSubraceEntry = result.data;
    } catch (e) {
      console.error('[compendium] get subrace error:', e);
    } finally {
      loadingSubraceEntry = false;
    }
  }

  function setAsRace() {
    if (!raceData) return;
    if (raceHasChoices) {
      asiChooserTarget = 'base';
      showAsiChooser = true;
      return;
    }
    characterStore.setRace(raceData);
    flash('Race set!');
  }

  function setSubraceAsRace() {
    if (!expandedSubraceEntry) return;
    const data = extractRaceData(expandedSubraceEntry);
    const hasChoices =
      (data.abilityBonusChoices && data.abilityBonusChoices.length > 0) ||
      (data.abilityBonusWeightedChoices && data.abilityBonusWeightedChoices.length > 0);
    if (hasChoices) {
      asiChooserTarget = 'subrace';
      showAsiChooser = true;
      return;
    }
    characterStore.setRace(data);
    flash('Race set!');
  }

  function confirmRaceWithBonuses(resolved: Partial<Record<AbilityScore, number>>) {
    const data = asiChooserTarget === 'subrace' && expandedSubraceEntry
      ? extractRaceData(expandedSubraceEntry)
      : raceData;
    if (!data) return;
    characterStore.setRace(data, resolved);
    showAsiChooser = false;
    flash('Race set!');
  }

  // Determine which section headings to show
  const isSpell = $derived(entry.contentType === 'spell');
  const isItem  = $derived(entry.contentType === 'item');
  const isClass = $derived(entry.contentType === 'class');
  const isSubclass = $derived(entry.contentType === 'subclass');

  // Class-specific data
  const classHitDie = $derived(isClass ? extractHitDie(raw) : '');
  const classSaves = $derived(isClass ? extractSavingThrows(raw) : '');
  const classProfs = $derived(isClass ? extractStartingProficiencies(raw) : { armor: '', weapons: '', skills: '' });
  const classPageUrl = $derived(
    isClass
      ? `/compendium/class/${encodeURIComponent(entry.id)}`
      : isSubclass && entry.className
        ? `/compendium/class/${encodeURIComponent(`${entry.className}|${(raw['classSource'] as string) ?? entry.source}`)}`
        : null,
  );

  const entries = $derived(raw['entries'] as unknown[] | undefined);
  const entriesHigherLevel = $derived(raw['entriesHigherLevel'] as unknown[] | undefined);
</script>

<div class="p-3 space-y-3 text-sm">

  <!-- Title row -->
  <div class="flex items-start justify-between gap-2">
    <div>
      <h3 class="font-semibold leading-tight">
        {#if isRace && entry.subraceOf}
          {entry.name} {entry.subraceOf}
        {:else}
          {entry.name}
        {/if}
      </h3>
      <p class="text-xs text-muted-foreground">
        {entry.source}
        {#if isRace && entry.subraceOf}
          <span class="opacity-60">· {entry.subraceOf} subrace</span>
        {/if}
      </p>
    </div>
    <Badge variant="secondary" class="shrink-0 text-xs">{entry.contentType}</Badge>
  </div>

  <Separator />

  {#if isSpell}
    <!-- Spell stat block -->
    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      <div class="text-muted-foreground">Level</div>
      <div>{entry.level === 0 ? 'Cantrip' : `${entry.level}`} {entry.school ? `(${entry.school})` : ''}</div>

      <div class="text-muted-foreground">Casting Time</div>
      <div>{castingTime}</div>

      <div class="text-muted-foreground">Range</div>
      <div>{range()}</div>

      <div class="text-muted-foreground">Components</div>
      <div>{components()}</div>

      <div class="text-muted-foreground">Duration</div>
      <div>{duration()}</div>

      {#if spellClasses()}
        <div class="text-muted-foreground">Classes</div>
        <div>{spellClasses()}</div>
      {/if}
    </div>

    <Separator />
  {:else if isItem}
    <!-- Item stat block -->
    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {#if entry.rarity}
        <div class="text-muted-foreground">Rarity</div>
        <div class="capitalize">{entry.rarity}</div>
      {/if}
      {#if raw['weight']}
        <div class="text-muted-foreground">Weight</div>
        <div>{raw['weight']} lb.</div>
      {/if}
      {#if raw['value']}
        <div class="text-muted-foreground">Value</div>
        <div>{raw['value']} cp</div>
      {/if}
      {#if raw['dmg1']}
        <div class="text-muted-foreground">Damage</div>
        <div>{raw['dmg1']}{raw['dmgType'] ? ` ${raw['dmgType']}` : ''}</div>
      {/if}
      {#if raw['ac']}
        <div class="text-muted-foreground">AC</div>
        <div>{raw['ac']}</div>
      {/if}
      {#if itemProperties()}
        <div class="text-muted-foreground">Properties</div>
        <div>{itemProperties()}</div>
      {/if}
      {#if raw['reqAttune']}
        <div class="col-span-2 text-amber-400/80 italic text-xs">Requires Attunement</div>
      {/if}
    </div>

    {#if itemProperties() || raw['reqAttune']}
      <Separator />
    {/if}
  {:else if isRace && raceData}
    <!-- Race stat block -->
    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      <div class="text-muted-foreground">Size</div>
      <div>{raceData.size}</div>

      <div class="text-muted-foreground">Speed</div>
      <div>{raceData.speed} ft.</div>

      {#if raceData.darkvision}
        <div class="text-muted-foreground">Darkvision</div>
        <div>{raceData.darkvision} ft.</div>
      {/if}

      {#if raceData.languages.length > 0}
        <div class="text-muted-foreground">Languages</div>
        <div>{raceData.languages.join(', ')}</div>
      {/if}

      {#if asiSummary()}
        <div class="text-muted-foreground">ASI</div>
        <div>{asiSummary()}</div>
      {/if}
    </div>

    <Separator />
  {:else if isClass}
    <!-- Class stat block -->
    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {#if classHitDie}
        <div class="text-muted-foreground">Hit Die</div>
        <div>{classHitDie}</div>
      {/if}

      {#if classSaves}
        <div class="text-muted-foreground">Saving Throws</div>
        <div>{classSaves}</div>
      {/if}

      {#if classProfs.armor}
        <div class="text-muted-foreground">Armor</div>
        <div class="capitalize">{classProfs.armor}</div>
      {/if}

      {#if classProfs.weapons}
        <div class="text-muted-foreground">Weapons</div>
        <div class="capitalize">{classProfs.weapons}</div>
      {/if}
    </div>

    <Separator />
  {:else if isSubclass && entry.className}
    <div class="text-xs text-muted-foreground">
      Subclass of <span class="font-medium text-foreground">{entry.className}</span>
    </div>

    <Separator />
  {/if}

  <!-- View full class page link -->
  {#if classPageUrl}
    <a
      href={classPageUrl}
      class="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
    >
      <ExternalLinkIcon class="size-3" />
      {isClass ? 'View Full Class Details' : `View ${entry.className} Class`}
    </a>
    <Separator />
  {/if}

  <!-- Main description -->
  {#if entries}
    <EntryRenderer {entries} />
  {:else if raw['entries']}
    <p class="text-muted-foreground text-xs italic">No description available.</p>
  {/if}

  <!-- At Higher Levels -->
  {#if entriesHigherLevel}
    <div class="space-y-1">
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">At Higher Levels</p>
      <EntryRenderer entries={entriesHigherLevel} />
    </div>
  {/if}

  <!-- Subraces section (base races only) -->
  {#if isRace && !entry.subraceOf && subracesFetched && subraces.length > 0}
    <Separator />
    <div class="space-y-1">
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subraces</p>
      <div class="rounded-md border border-border/50 divide-y divide-border/30 overflow-hidden">
        {#each subraces as sr (sr.id)}
          <div>
            <button
              class="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-muted/50 transition-colors
                {expandedSubraceId === sr.id ? 'bg-muted/40' : ''}"
              onclick={() => toggleSubrace(sr.id)}
            >
              <ChevronRightIcon class="size-3 shrink-0 transition-transform {expandedSubraceId === sr.id ? 'rotate-90' : ''}" />
              <span class="font-medium">{sr.name} {sr.subraceOf}</span>
              <Badge variant="outline" class="ml-auto shrink-0 text-[10px] px-1 py-0 h-4 font-normal opacity-60">
                {sr.source}
              </Badge>
            </button>

            {#if expandedSubraceId === sr.id}
              <div class="border-t border-border/30 bg-muted/20">
                {#if loadingSubraceEntry}
                  <div class="flex items-center justify-center py-4">
                    <p class="text-[10px] text-muted-foreground">Loading…</p>
                  </div>
                {:else if expandedSubraceEntry}
                  {@const subRaceData = extractRaceData(expandedSubraceEntry)}
                  {@const subHasAsi = Object.keys(subRaceData.abilityBonuses).length > 0 || !!subRaceData.abilityBonusChoices || !!subRaceData.abilityBonusWeightedChoices}
                  <div class="px-3 py-2 space-y-2">
                    <!-- Subrace stat block -->
                    {#if subRaceData.speed !== raceData?.speed || subRaceData.darkvision || subHasAsi}
                      <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        {#if subRaceData.speed !== raceData?.speed}
                          <div class="text-muted-foreground">Speed</div>
                          <div>{subRaceData.speed} ft.</div>
                        {/if}
                        {#if subRaceData.darkvision}
                          <div class="text-muted-foreground">Darkvision</div>
                          <div>{subRaceData.darkvision} ft.</div>
                        {/if}
                        {#if subHasAsi}
                          <div class="text-muted-foreground">ASI</div>
                          <div>
                            {Object.entries(subRaceData.abilityBonuses).map(([a, b]) => `+${b} ${a.slice(0, 3).toUpperCase()}`).join(', ')}
                            {#if subRaceData.abilityBonusChoices}
                              {Object.keys(subRaceData.abilityBonuses).length > 0 ? ', ' : ''}{subRaceData.abilityBonusChoices.map(c => `choose ${c.count} for +${c.amount}`).join(', ')}
                            {/if}
                            {#if subRaceData.abilityBonusWeightedChoices}
                              {Object.keys(subRaceData.abilityBonuses).length > 0 || subRaceData.abilityBonusChoices ? ', ' : ''}{subRaceData.abilityBonusWeightedChoices.map(wc => `choose ${wc.weights.map(w => `+${w}`).join('/')}`).join(', ')}
                            {/if}
                          </div>
                        {/if}
                      </div>
                    {/if}

                    <!-- Subrace entries -->
                    {#if expandedSubraceEntry.raw['entries']}
                      <EntryRenderer entries={expandedSubraceEntry.raw['entries'] as unknown[]} />
                    {/if}

                    <!-- Set as Race for subrace -->
                    {#if showAsiChooser && asiChooserTarget === 'subrace'}
                      <RaceAsiChooser
                        fixedBonuses={subRaceData.abilityBonuses}
                        choices={subRaceData.abilityBonusChoices}
                        weightedChoices={subRaceData.abilityBonusWeightedChoices}
                        onconfirm={confirmRaceWithBonuses}
                        oncancel={() => { showAsiChooser = false; }}
                      />
                    {:else}
                      <div class="flex items-center gap-2 pt-1">
                        <Button size="sm" class="h-7 text-xs flex-1" onclick={setSubraceAsRace} disabled={!!addedLabel}>
                          {addedLabel ?? 'Set as Race'}
                        </Button>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Add to character / Pick spell -->
  {#if inPickMode && isSpell}
    <div class="flex items-center gap-2 pt-1">
      <Button size="sm" class="h-7 text-xs flex-1" onclick={pickSpell}>
        Pick
      </Button>
    </div>
    <Separator />
  {:else if addLabel}
    <div class="flex items-center gap-2 pt-1">
      <Button size="sm" class="h-7 text-xs flex-1" onclick={addToCharacter} disabled={!!addedLabel}>
        {addedLabel ?? addLabel}
      </Button>
    </div>
    <Separator />
  {/if}

  <!-- Set as Race (for base races without subraces, or subraces shown in search) -->
  {#if isRace}
    {#if entry.subraceOf || (subracesFetched && subraces.length === 0)}
      {#if showAsiChooser && asiChooserTarget === 'base' && raceData}
        <RaceAsiChooser
          fixedBonuses={raceData.abilityBonuses}
          choices={raceData.abilityBonusChoices}
          weightedChoices={raceData.abilityBonusWeightedChoices}
          onconfirm={confirmRaceWithBonuses}
          oncancel={() => { showAsiChooser = false; }}
        />
        <Separator />
      {:else}
        <div class="flex items-center gap-2 pt-1">
          <Button size="sm" class="h-7 text-xs flex-1" onclick={setAsRace} disabled={!!addedLabel}>
            {addedLabel ?? 'Set as Race'}
          </Button>
        </div>
        <Separator />
      {/if}
    {/if}
  {/if}

  <!-- Re-import control -->
  <div class="pt-1">
    <button
      class="text-xs text-muted-foreground hover:text-foreground transition-colors"
      onclick={() => compendiumStore.triggerImport()}
    >
      Re-import data…
    </button>
  </div>
</div>
