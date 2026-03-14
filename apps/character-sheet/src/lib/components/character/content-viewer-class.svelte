<script lang="ts">
  import type { ClassData } from '$lib/stores/content-viewer.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

  interface Props {
    classData: ClassData;
  }

  let { classData }: Props = $props();

  const ABILITY_ABBREV: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  };

  const CASTER_LABEL: Record<string, string> = {
    full: 'Full caster',
    half: 'Half caster',
    third: 'Third caster',
    pact: 'Pact magic',
    none: 'Non-caster',
  };

  const saveDisplay = $derived(
    classData.savingThrows.map(s => ABILITY_ABBREV[s] ?? s).join(', ')
  );

  const isCaster = $derived(classData.casterProgression !== 'none');

  const upcomingAsiLevels = $derived(
    classData.asiLevels.filter(l => l > classData.level)
  );

  function openInCompendium() {
    const name = classData.class.charAt(0).toUpperCase() + classData.class.slice(1);
    contentViewerStore.close();
    compendiumStore.showClass(name);
  }
</script>

<div class="p-3 flex flex-col gap-3 text-sm text-foreground">

  <!-- Subclass -->
  {#if classData.subclass}
    <p class="text-xs text-muted-foreground">
      Subclass: <span class="text-foreground font-medium">{classData.subclass}</span>
    </p>
  {/if}

  <!-- Stat grid -->
  <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
    <div>
      <p class="text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Hit Die</p>
      <p class="font-medium">1{classData.hitDie}</p>
    </div>
    <div>
      <p class="text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Saving Throws</p>
      <p class="font-medium">{saveDisplay}</p>
    </div>
    <div>
      <p class="text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Spellcasting</p>
      {#if isCaster}
        <p class="font-medium">{CASTER_LABEL[classData.casterProgression]}</p>
        {#if classData.spellcastingAbility}
          <p class="text-muted-foreground">{ABILITY_ABBREV[classData.spellcastingAbility] ?? classData.spellcastingAbility}</p>
        {/if}
      {:else}
        <p class="text-muted-foreground">None</p>
      {/if}
    </div>
    <div>
      <p class="text-muted-foreground uppercase tracking-wide font-semibold mb-0.5">Class Level</p>
      <p class="font-medium">{classData.level}</p>
    </div>
  </div>

  <Separator />

  <!-- ASI levels -->
  <div>
    <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">ASI / Feat Levels</p>
    <div class="flex flex-wrap gap-1.5">
      {#each classData.asiLevels as level}
        <span class="text-xs rounded px-1.5 py-0.5 {level <= classData.level
          ? 'bg-primary/20 text-primary'
          : 'bg-muted text-muted-foreground'}">
          {level}
        </span>
      {/each}
    </div>
    {#if upcomingAsiLevels.length > 0}
      <p class="text-xs text-muted-foreground mt-1">
        Next ASI at level {upcomingAsiLevels[0]}
      </p>
    {/if}
  </div>

  <Separator />

  <!-- Compendium link -->
  <button
    class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors self-start"
    onclick={openInCompendium}
  >
    <ExternalLinkIcon class="size-3" />
    View full class in compendium
  </button>

</div>
