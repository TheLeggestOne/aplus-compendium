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
  import SpellSlotsGrid from '$lib/components/character/spell-slots-grid.svelte';
  import SpellList from '$lib/components/character/spell-list.svelte';
  import FeaturesList from '$lib/components/character/features-list.svelte';
  import InventoryTab from '$lib/components/character/inventory-tab.svelte';
  import CharacterDetails from '$lib/components/character/character-details.svelte';
  import ProgressionTab from '$lib/components/character/progression-tab.svelte';
  import CompendiumPanel from '$lib/components/compendium/compendium-panel.svelte';
  import ContentViewer from '$lib/components/character/content-viewer.svelte';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import type { PageData } from './$types.js';

  const { data } = $props<{ data: PageData }>();
  $effect(() => {
    characterStore.reinit(data.character);
    uiStore.setActiveCharacter(data.character.id);
  });
  $effect(() => { void compendiumStore.initialize(); });

  const { character } = $derived(characterStore);
  const { panelOpen } = $derived(compendiumStore);
  const viewerContent = $derived(contentViewerStore.content);
</script>

<div class="flex h-full flex-col overflow-hidden bg-background text-foreground">
  <!-- Sticky header -->
  <CharacterHeader />

  <!-- Body: resizable split when panel or viewer is open, plain column otherwise -->
  {#if panelOpen || viewerContent != null}
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
            {#if viewerContent != null}
              <ContentViewer />
            {:else}
              <CompendiumPanel />
            {/if}
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
      <Tabs.Trigger value="inventory">Inventory</Tabs.Trigger>
      <Tabs.Trigger value="progression">Progression</Tabs.Trigger>
      <Tabs.Trigger value="details">Details</Tabs.Trigger>
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
        {#if character.classSpellcasting && character.classSpellcasting.length > 0}
          <div class="flex flex-col gap-6 max-w-2xl">
            <SpellSlotsGrid slots={characterStore.derivedSpellSlots} />
            <SpellList
              classSpellcasting={character.classSpellcasting}
              capacities={characterStore.classSpellCapacities}
            />
          </div>
        {:else if character.spellcasting}
          <!-- Legacy fallback for characters without classSpellcasting -->
          <div class="flex flex-col gap-6 max-w-2xl">
            <SpellSlotsGrid slots={character.spellcasting.slots} />
          </div>
        {:else}
          <div class="flex items-center justify-center h-40">
            <p class="text-muted-foreground">This character does not have spellcasting.</p>
          </div>
        {/if}
      </Tabs.Content>

      <!-- Features & Equipment -->
      <Tabs.Content value="features-equipment" class="p-4">
        <FeaturesList />
      </Tabs.Content>

      <!-- Inventory -->
      <Tabs.Content value="inventory" class="p-4">
        <InventoryTab />
      </Tabs.Content>

      <!-- Progression -->
      <Tabs.Content value="progression" class="p-4">
        <ProgressionTab />
      </Tabs.Content>

      <!-- Details -->
      <Tabs.Content value="details" class="p-4">
        <CharacterDetails />
      </Tabs.Content>

    </div>
  </Tabs.Root>
{/snippet}
