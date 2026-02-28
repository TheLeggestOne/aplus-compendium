<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';

  const { character, classString } = $derived(characterStore);

  const raceDisplay = $derived(
    character.subrace ?? character.race ?? '',
  );
</script>

<div class="flex flex-col gap-0.5 min-w-0">
  <h1 class="text-xl font-bold leading-none truncate">{character.name}</h1>
  <p class="text-sm text-muted-foreground truncate capitalize">
    {#if classString}
      {classString}
    {:else}
      <button
        class="italic text-amber-400/80 hover:text-amber-400 transition-colors"
        onclick={() => compendiumStore.openPanel('class')}
      >No class</button>
    {/if}
  </p>
  <p class="text-xs text-muted-foreground/70 truncate capitalize">
    {#if raceDisplay}
      {raceDisplay}
    {:else}
      <button
        class="italic text-amber-400/80 hover:text-amber-400 transition-colors"
        onclick={() => compendiumStore.openPanel('race')}
      >No race set</button>
    {/if}
    {#if character.background}
      · {character.background}
    {/if}
  </p>
</div>
