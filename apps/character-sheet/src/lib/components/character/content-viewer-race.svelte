<script lang="ts">
  import type { RaceData } from '$lib/stores/content-viewer.svelte.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';

  interface Props {
    race: RaceData;
  }

  let { race }: Props = $props();

  const ABILITY_ABBREV: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  };

  const abilityBonusEntries = $derived(
    Object.entries(race.abilityBonuses ?? {}).filter(([_k, v]) => (v ?? 0) !== 0)
  );

  const raceFeatures = $derived(race.raceFeatures ?? []);
</script>

<div class="p-3 flex flex-col gap-3 text-sm text-foreground">

  <!-- Identity -->
  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    {#if race.subrace}
      <span><span class="text-foreground font-medium">{race.subrace}</span> ({race.race})</span>
    {/if}
    {#if race.size}
      <span>Size: <span class="text-foreground font-medium capitalize">{race.size}</span></span>
    {/if}
  </div>

  <!-- Ability bonuses -->
  {#if abilityBonusEntries.length > 0}
    <div>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Ability Score Increases</p>
      <div class="flex flex-wrap gap-2">
        {#each abilityBonusEntries as [ability, bonus]}
          <span class="text-xs bg-muted rounded px-2 py-0.5">
            {ABILITY_ABBREV[ability] ?? ability}
            <span class="font-semibold text-foreground">{bonus > 0 ? '+' : ''}{bonus}</span>
          </span>
        {/each}
      </div>
    </div>
    <Separator />
  {/if}

  <!-- Racial features -->
  {#if raceFeatures.length > 0}
    <div class="flex flex-col gap-3">
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Racial Traits</p>
      {#each raceFeatures as feature}
        <div>
          <p class="font-semibold text-sm">{feature.name}</p>
          {#if feature.rawEntries && feature.rawEntries.length > 0}
            <EntryRenderer entries={feature.rawEntries} />
          {:else if feature.description}
            <p class="text-sm text-muted-foreground mt-0.5">{feature.description}</p>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-xs text-muted-foreground italic">No racial traits recorded.</p>
  {/if}

  <!-- Race-granted spells -->
  {#if race.grantedSpells && race.grantedSpells.length > 0}
    <Separator />
    <div>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Granted Spells</p>
      <ul class="flex flex-col gap-0.5">
        {#each race.grantedSpells as spell}
          <li class="text-sm">{spell.name}</li>
        {/each}
      </ul>
    </div>
  {/if}

</div>
