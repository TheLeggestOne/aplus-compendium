<script lang="ts">
  import type { AbilityScore } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import AbilityScoreCard from './ability-score-card.svelte';

  const ABILITY_ORDER: AbilityScore[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
  ];

  const { character } = $derived(characterStore);
</script>

<div class="grid grid-cols-3 gap-2">
  {#each ABILITY_ORDER as ability}
    <AbilityScoreCard {ability} scores={character.abilityScores} />
  {/each}
</div>
