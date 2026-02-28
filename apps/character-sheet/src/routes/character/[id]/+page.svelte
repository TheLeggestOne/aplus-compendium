<script lang="ts">
  import * as Tabs from '$lib/components/ui/tabs/index.js';
  import * as Resizable from '$lib/components/ui/resizable/index.js';
  import CharacterHeader from '$lib/components/character/character-header.svelte';
  import AbilityScoresGrid from '$lib/components/character/ability-scores-grid.svelte';
  import SavingThrowsList from '$lib/components/character/saving-throws-list.svelte';
  import SkillsList from '$lib/components/character/skills-list.svelte';
  import HpBlock from '$lib/components/character/hp-block.svelte';
  import CombatStatsBlock from '$lib/components/character/combat-stats-block.svelte';
  import WeaponsList from '$lib/components/character/weapons-list.svelte';
  import SpellcastingHeader from '$lib/components/character/spellcasting-header.svelte';
  import SpellSlotsGrid from '$lib/components/character/spell-slots-grid.svelte';
  import SpellList from '$lib/components/character/spell-list.svelte';
  import FeaturesList from '$lib/components/character/features-list.svelte';
  import EquipmentList from '$lib/components/character/equipment-list.svelte';
  import CurrencyDisplay from '$lib/components/character/currency-display.svelte';
  import CompendiumPanel from '$lib/components/compendium/compendium-panel.svelte';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import type { PageData } from './$types.js';

  const { data } = $props<{ data: PageData }>();
  $effect(() => { characterStore.reinit(data.character); });
  $effect(() => { void compendiumStore.initialize(); });

  const { character } = $derived(characterStore);
  const { panelOpen } = $derived(compendiumStore);
</script>

<div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
  <!-- Sticky header -->
  <CharacterHeader />

  <!-- Body: resizable split when panel is open, plain column otherwise -->
  {#if panelOpen}
    <Resizable.PaneGroup direction="horizontal" class="min-h-0 flex-1">

      <Resizable.Pane defaultSize={68} minSize={35}>
        {#snippet children()}
          <div class="flex h-full flex-col overflow-hidden">
            {@render sheet()}
          </div>
        {/snippet}
      </Resizable.Pane>

      <Resizable.Handle withHandle />

      <Resizable.Pane defaultSize={32} minSize={18} maxSize={55}>
        {#snippet children()}
          <div class="h-full overflow-hidden">
            <CompendiumPanel />
          </div>
        {/snippet}
      </Resizable.Pane>

    </Resizable.PaneGroup>
  {:else}
    <div class="min-h-0 flex-1 overflow-hidden">
      {@render sheet()}
    </div>
  {/if}
</div>

{#snippet sheet()}
  <Tabs.Root
    value={uiStore.activeTab}
    onValueChange={(v) => uiStore.setActiveTab(v as typeof uiStore.activeTab)}
    class="flex h-full flex-col"
  >
    <Tabs.List class="mx-4 mt-3 shrink-0">
      <Tabs.Trigger value="core-stats">Core Stats</Tabs.Trigger>
      <Tabs.Trigger value="combat">Combat</Tabs.Trigger>
      <Tabs.Trigger value="spellcasting">
        Spellcasting{character.spellcasting ? '' : ' ✕'}
      </Tabs.Trigger>
      <Tabs.Trigger value="features-equipment">Features</Tabs.Trigger>
    </Tabs.List>

    <!-- Scrollable tab content -->
    <div class="min-h-0 flex-1 overflow-auto">

      <!-- Core Stats -->
      <Tabs.Content value="core-stats" class="p-4 h-full">
        <div class="flex gap-6 h-full">
          <div class="flex flex-col gap-4 shrink-0">
            <AbilityScoresGrid />
            <SavingThrowsList />
          </div>
          <div class="flex flex-col flex-1 min-h-0">
            <SkillsList />
          </div>
        </div>
      </Tabs.Content>

      <!-- Combat -->
      <Tabs.Content value="combat" class="p-4">
        <div class="flex flex-col gap-6 max-w-2xl">
          <CombatStatsBlock />
          <HpBlock />
          <WeaponsList />
        </div>
      </Tabs.Content>

      <!-- Spellcasting -->
      <Tabs.Content value="spellcasting" class="p-4">
        {#if character.spellcasting}
          <div class="flex flex-col gap-6 max-w-2xl">
            <SpellcastingHeader ability={character.spellcasting.ability} />
            <SpellSlotsGrid slots={character.spellcasting.slots} />
            <SpellList
              spells={character.spellcasting.spellsKnown}
              cantrips={character.spellcasting.cantrips}
            />
          </div>
        {:else}
          <div class="flex items-center justify-center h-40">
            <p class="text-muted-foreground">This character does not have spellcasting.</p>
          </div>
        {/if}
      </Tabs.Content>

      <!-- Features & Equipment -->
      <Tabs.Content value="features-equipment" class="p-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FeaturesList />
          <div class="flex flex-col gap-4">
            <EquipmentList />
            <CurrencyDisplay currency={character.currency} />
          </div>
        </div>
      </Tabs.Content>

    </div>
  </Tabs.Root>
{/snippet}
