<script lang="ts">
  import type { AbilityScore, AbilityScoreSet } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import AbilityScoreCard from './ability-score-card.svelte';
  import AbilityScoreEditor from './ability-score-editor.svelte';
  import SectionHeader from './section-header.svelte';
  import { Button } from '$lib/components/ui/button/index.js';

  const ABILITY_ORDER: AbilityScore[] = [
    'strength', 'dexterity', 'constitution',
    'intelligence', 'wisdom', 'charisma',
  ];

  const { character, effectiveAbilityScores } = $derived(characterStore);

  let assigning = $state(false);

  function handleApply(scores: AbilityScoreSet) {
    characterStore.setAbilityScores(scores);
    assigning = false;
  }
</script>

<div>
  <SectionHeader title="Ability Scores">
    {#snippet actions()}
      {#if !assigning}
        <Button variant="ghost" size="sm" class="h-6 px-2 text-[10px]" onclick={() => { assigning = true; }}>
          Assign
        </Button>
      {/if}
    {/snippet}
  </SectionHeader>

  {#if assigning}
    <AbilityScoreEditor
      initial={character.abilityScores}
      onApply={handleApply}
      onCancel={() => { assigning = false; }}
    />
  {:else}
    <div class="grid grid-cols-3 gap-2">
      {#each ABILITY_ORDER as ability}
        <AbilityScoreCard {ability} scores={effectiveAbilityScores} baseScores={character.abilityScores} />
      {/each}
    </div>
  {/if}
</div>
