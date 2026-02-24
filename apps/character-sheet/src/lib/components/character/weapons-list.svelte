<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SectionHeader from './section-header.svelte';
  import WeaponAttackRow from './weapon-attack-row.svelte';

  const { character } = $derived(characterStore);
</script>

<div>
  <SectionHeader title="Attacks" />
  <div class="rounded-md border border-border bg-card px-3">
    {#if character.weapons.length > 0}
      {#each character.weapons as weapon}
        <WeaponAttackRow {weapon} />
      {/each}
    {:else}
      <p class="py-4 text-sm text-muted-foreground text-center">No weapons equipped.</p>
    {/if}
  </div>
</div>
