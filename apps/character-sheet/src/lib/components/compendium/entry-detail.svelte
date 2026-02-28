<script lang="ts">
  import type { CompendiumEntry } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import {
    entryToSpell,
    entryToWeapon,
    entryToArmor,
    entryToEquipment,
    entryToFeature,
  } from '$lib/utils/compendium-to-character.js';

  interface Props {
    entry: CompendiumEntry;
  }

  const { entry }: Props = $props();

  const raw = $derived(entry.raw);

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
      case 'spell':
        characterStore.addSpell(entryToSpell(entry));
        flash(entry.level === 0 ? 'Cantrip added!' : 'Spell added!');
        break;
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
    entry.dropTarget === 'spell'
      ? (entry.level === 0 ? 'Add Cantrip' : 'Add Spell')
      : entry.dropTarget === 'weapon'   ? 'Add to Weapons'
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

  // Determine which section headings to show
  const isSpell = $derived(entry.contentType === 'spell');
  const isItem  = $derived(entry.contentType === 'item');

  const entries = $derived(raw['entries'] as unknown[] | undefined);
  const entriesHigherLevel = $derived(raw['entriesHigherLevel'] as unknown[] | undefined);
</script>

<div class="p-3 space-y-3 text-sm">

  <!-- Title row -->
  <div class="flex items-start justify-between gap-2">
    <div>
      <h3 class="font-semibold leading-tight">{entry.name}</h3>
      <p class="text-xs text-muted-foreground">{entry.source}</p>
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

  <!-- Add to character -->
  {#if addLabel}
    <div class="flex items-center gap-2 pt-1">
      <Button size="sm" class="h-7 text-xs flex-1" onclick={addToCharacter} disabled={!!addedLabel}>
        {addedLabel ?? addLabel}
      </Button>
    </div>
    <Separator />
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
