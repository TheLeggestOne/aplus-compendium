<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';

  const { character, classString } = $derived(characterStore);
</script>

<div class="flex flex-col gap-0.5 min-w-0">
  <h1 class="text-xl font-bold leading-none truncate">{character.name}</h1>
  <p class="text-sm text-muted-foreground truncate capitalize">{classString}</p>
  <p class="text-xs text-muted-foreground/70 truncate capitalize">
    {character.subrace ? `${character.subrace} ${character.race}` : character.race}
    · {character.background}
  </p>
</div>
