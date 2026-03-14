<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import {
    CLASS_HIT_DICE, CLASS_SAVING_THROWS, CLASS_CASTER_PROGRESSION,
    CLASS_SPELLCASTING_ABILITY, CLASS_ASI_LEVELS,
  } from '@aplus-compendium/types';
  import type { CharacterClass } from '@aplus-compendium/types';

  const { character } = $derived(characterStore);

  const raceDisplay = $derived(
    character.subrace ?? character.race ?? '',
  );

  function classLabel(c: CharacterClass): string {
    return `${c.subclass ? c.subclass + ' ' : ''}${c.class.charAt(0).toUpperCase() + c.class.slice(1)} ${c.level}`;
  }

  function openClassViewer(c: CharacterClass) {
    const label = classLabel(c);
    contentViewerStore.open({
      type: 'class',
      data: {
        name: label,
        class: c.class,
        level: c.level,
        subclass: c.subclass,
        hitDie: CLASS_HIT_DICE[c.class],
        savingThrows: CLASS_SAVING_THROWS[c.class],
        casterProgression: CLASS_CASTER_PROGRESSION[c.class],
        spellcastingAbility: CLASS_SPELLCASTING_ABILITY[c.class],
        asiLevels: CLASS_ASI_LEVELS[c.class],
      },
    });
  }

  const raceData = $derived({
    name: raceDisplay,
    race: character.race,
    subrace: character.subrace,
    size: character.size,
    abilityBonuses: character.raceAbilityBonuses,
    raceFeatures: (character.features ?? []).filter(f => f.sourceType === 'race'),
    grantedSpells: character.raceGrantedSpells,
  });
</script>

<div class="flex flex-col gap-0.5 min-w-0">
  <h1 class="text-xl font-bold leading-none truncate">{character.name}</h1>
  <p class="text-sm text-muted-foreground truncate capitalize">
    {#if character.classes.length > 0}
      {#each character.classes as cls, i}
        {#if i > 0}<span class="text-muted-foreground/50"> / </span>{/if}
        <button
          class="hover:underline hover:text-foreground transition-colors"
          onclick={() => openClassViewer(cls)}
        >{classLabel(cls)}</button>
      {/each}
    {:else}
      <button
        class="italic text-amber-400/80 hover:text-amber-400 transition-colors"
        onclick={() => compendiumStore.openPanel('class')}
      >No class</button>
    {/if}
  </p>
  <p class="text-xs text-muted-foreground/70 truncate capitalize">
    {#if raceDisplay}
      <button
        class="capitalize hover:underline hover:text-foreground transition-colors"
        onclick={() => contentViewerStore.open({ type: 'race', data: raceData })}
      >{raceDisplay}</button>
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
