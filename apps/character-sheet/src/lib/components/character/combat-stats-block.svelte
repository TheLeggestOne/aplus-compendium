<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import KeyStatPill from './key-stat-pill.svelte';

  const { character } = $derived(characterStore);
</script>

<div class="flex flex-wrap gap-3">
  <KeyStatPill label="Armor Class" value={character.combat.armorClass} />
  <KeyStatPill
    label="Initiative"
    value={character.combat.initiative >= 0 ? `+${character.combat.initiative}` : character.combat.initiative}
  />
  <KeyStatPill label="Speed" value={`${character.combat.speed} ft`} />
  <KeyStatPill label="Prof Bonus" value={`+${character.proficiencyBonus}`} />
</div>
