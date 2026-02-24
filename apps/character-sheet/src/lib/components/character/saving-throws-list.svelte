<script lang="ts">
  import type { AbilityScore } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SavingThrowEntry from './saving-throw-entry.svelte';
  import SectionHeader from './section-header.svelte';

  const ABILITY_ORDER: AbilityScore[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
  ];

  const { character } = $derived(characterStore);
</script>

<div>
  <SectionHeader title="Saving Throws" />
  <div class="rounded-md border border-border bg-card px-3 py-2">
    {#each ABILITY_ORDER as ability}
      <SavingThrowEntry {ability} entry={character.savingThrows[ability]} />
    {/each}
  </div>
</div>
