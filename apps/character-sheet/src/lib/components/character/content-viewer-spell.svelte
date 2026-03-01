<script lang="ts">
  import type { Spell, SpellComponents, DndClass, SpellLevel, SpellSchool } from '@aplus-compendium/types';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';

  interface Props {
    spell: Spell;
    dndClass?: DndClass;
  }

  let { spell, dndClass }: Props = $props();

  const LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

  const SCHOOLS: SpellSchool[] = [
    'abjuration', 'conjuration', 'divination', 'enchantment',
    'evocation', 'illusion', 'necromancy', 'transmutation',
  ];

  const LEVELS: SpellLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function formatComponents(c: SpellComponents): string {
    const parts: string[] = [];
    if (c.verbal) parts.push('V');
    if (c.somatic) parts.push('S');
    if (c.material) parts.push(`M${c.materialDescription ? ` (${c.materialDescription})` : ''}`);
    return parts.join(', ');
  }

  // Edit state — local copy of the spell fields
  let editName = $state(spell.name);
  let editLevel = $state<SpellLevel>(spell.level);
  let editSchool = $state<SpellSchool>(spell.school);
  let editCastingTime = $state(spell.castingTime);
  let editRange = $state(spell.range);
  let editDuration = $state(spell.duration);
  let editConcentration = $state(spell.concentration);
  let editRitual = $state(spell.ritual);
  let editVerbal = $state(spell.components.verbal);
  let editSomatic = $state(spell.components.somatic);
  let editMaterial = $state(spell.components.material);
  let editMaterialDesc = $state(spell.components.materialDescription ?? '');
  let editDescription = $state(spell.description);

  // Reset local edit state when the viewed spell changes
  $effect(() => {
    editName = spell.name;
    editLevel = spell.level;
    editSchool = spell.school;
    editCastingTime = spell.castingTime;
    editRange = spell.range;
    editDuration = spell.duration;
    editConcentration = spell.concentration;
    editRitual = spell.ritual;
    editVerbal = spell.components.verbal;
    editSomatic = spell.components.somatic;
    editMaterial = spell.components.material;
    editMaterialDesc = spell.components.materialDescription ?? '';
    editDescription = spell.description;
  });

  function save() {
    if (!dndClass) return;
    const updated: Spell = {
      ...spell,
      name: editName,
      level: editLevel,
      school: editSchool,
      castingTime: editCastingTime,
      range: editRange,
      duration: editDuration,
      concentration: editConcentration,
      ritual: editRitual,
      components: {
        verbal: editVerbal,
        somatic: editSomatic,
        material: editMaterial,
        materialDescription: editMaterial && editMaterialDesc ? editMaterialDesc : undefined,
      },
      description: editDescription,
      // Discard rawEntries if the user has edited the description
      rawEntries: editDescription !== spell.description ? undefined : spell.rawEntries,
    };
    characterStore.updateClassSpell(dndClass, updated);
    contentViewerStore.update({ type: 'spell', data: updated, context: dndClass ? { dndClass } : undefined });
    contentViewerStore.setMode('view');
  }

  function cancel() {
    contentViewerStore.setMode('view');
  }
</script>

{#if contentViewerStore.mode === 'view'}
  <!-- View mode -->
  <div class="p-3 space-y-3 text-sm">
    <!-- Stat block -->
    <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
      <div class="text-muted-foreground">Level</div>
      <div>
        {spell.level === 0 ? 'Cantrip' : LEVEL_LABELS[spell.level]}
        <span class="text-muted-foreground">({capitalize(spell.school)})</span>
      </div>

      <div class="text-muted-foreground">Casting Time</div>
      <div>{spell.castingTime}</div>

      <div class="text-muted-foreground">Range</div>
      <div>{spell.range}</div>

      <div class="text-muted-foreground">Components</div>
      <div>{formatComponents(spell.components)}</div>

      <div class="text-muted-foreground">Duration</div>
      <div>{spell.duration}</div>
    </div>

    {#if spell.concentration || spell.ritual}
      <div class="flex gap-2">
        {#if spell.concentration}
          <span class="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">Concentration</span>
        {/if}
        {#if spell.ritual}
          <span class="text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground">Ritual</span>
        {/if}
      </div>
    {/if}

    <Separator />

    <!-- Description -->
    {#if spell.rawEntries && spell.rawEntries.length > 0}
      <EntryRenderer entries={spell.rawEntries} />
    {:else if spell.description}
      <p class="text-sm leading-relaxed">{spell.description}</p>
    {:else}
      <p class="text-xs text-muted-foreground italic">No description available.</p>
    {/if}
  </div>

{:else}
  <!-- Edit mode -->
  <div class="p-3 space-y-3 text-sm">
    <div class="flex flex-col gap-3">

      <!-- Name -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-muted-foreground" for="edit-name">Name</label>
        <input
          id="edit-name"
          class="h-8 rounded border border-input bg-background px-2 text-sm"
          bind:value={editName}
        />
      </div>

      <!-- Level + School -->
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground" for="edit-level">Level</label>
          <select
            id="edit-level"
            class="h-8 rounded border border-input bg-background px-2 text-sm"
            bind:value={editLevel}
          >
            {#each LEVELS as lvl}
              <option value={lvl}>{LEVEL_LABELS[lvl]}</option>
            {/each}
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground" for="edit-school">School</label>
          <select
            id="edit-school"
            class="h-8 rounded border border-input bg-background px-2 text-sm"
            bind:value={editSchool}
          >
            {#each SCHOOLS as school}
              <option value={school}>{capitalize(school)}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Casting Time + Range -->
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground" for="edit-casting-time">Casting Time</label>
          <input
            id="edit-casting-time"
            class="h-8 rounded border border-input bg-background px-2 text-sm"
            bind:value={editCastingTime}
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground" for="edit-range">Range</label>
          <input
            id="edit-range"
            class="h-8 rounded border border-input bg-background px-2 text-sm"
            bind:value={editRange}
          />
        </div>
      </div>

      <!-- Duration -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-muted-foreground" for="edit-duration">Duration</label>
        <input
          id="edit-duration"
          class="h-8 rounded border border-input bg-background px-2 text-sm"
          bind:value={editDuration}
        />
      </div>

      <!-- Components -->
      <div class="flex flex-col gap-1.5">
        <span class="text-xs text-muted-foreground">Components</span>
        <div class="flex gap-3">
          <label class="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" bind:checked={editVerbal} />
            Verbal
          </label>
          <label class="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" bind:checked={editSomatic} />
            Somatic
          </label>
          <label class="flex items-center gap-1.5 text-xs cursor-pointer">
            <input type="checkbox" bind:checked={editMaterial} />
            Material
          </label>
        </div>
        {#if editMaterial}
          <input
            class="h-8 rounded border border-input bg-background px-2 text-sm"
            placeholder="Material description…"
            bind:value={editMaterialDesc}
          />
        {/if}
      </div>

      <!-- Flags -->
      <div class="flex gap-4">
        <label class="flex items-center gap-1.5 text-xs cursor-pointer">
          <input type="checkbox" bind:checked={editConcentration} />
          Concentration
        </label>
        <label class="flex items-center gap-1.5 text-xs cursor-pointer">
          <input type="checkbox" bind:checked={editRitual} />
          Ritual
        </label>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-muted-foreground" for="edit-description">Description</label>
        <textarea
          id="edit-description"
          class="min-h-[120px] rounded border border-input bg-background px-2 py-1.5 text-sm resize-y"
          placeholder="Spell description…"
          bind:value={editDescription}
        ></textarea>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-1">
      <Button size="sm" class="flex-1 h-8 text-xs" onclick={save} disabled={!dndClass}>
        Save
      </Button>
      <Button size="sm" variant="outline" class="h-8 text-xs" onclick={cancel}>
        Cancel
      </Button>
    </div>
    {#if !dndClass}
      <p class="text-xs text-muted-foreground italic">Editing unavailable — spell class unknown.</p>
    {/if}
  </div>
{/if}
