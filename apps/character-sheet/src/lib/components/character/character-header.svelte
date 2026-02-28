<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import CharacterTitleBlock from './character-title-block.svelte';
  import KeyStatPill from './key-stat-pill.svelte';
  import HpDisplay from './hp-display.svelte';
  import DeathSavesTracker from './death-saves-tracker.svelte';
  import EditModeToggle from './edit-mode-toggle.svelte';
  import InspirationBadge from './inspiration-badge.svelte';

  const { character, passivePerception } = $derived(characterStore);
  const { panelOpen } = $derived(compendiumStore);

  const isDying = $derived(character.combat.currentHitPoints === 0);
</script>

<header class="shrink-0 border-b border-border bg-card/50 backdrop-blur px-4 py-3">
  <div class="flex items-center gap-4">
    <!-- Identity -->
    <CharacterTitleBlock />

    <Separator orientation="vertical" class="h-12 hidden sm:block" />

    <!-- HP (primary interactive element) -->
    <HpDisplay />

    {#if isDying}
      <Separator orientation="vertical" class="h-12" />
      <DeathSavesTracker show={isDying} />
    {:else}
      <Separator orientation="vertical" class="h-12 hidden md:block" />

      <!-- Key combat stats -->
      <div class="hidden md:flex items-center gap-2">
        <KeyStatPill label="AC" value={character.combat.armorClass} />
        <KeyStatPill label="Init" value={character.combat.initiative >= 0 ? `+${character.combat.initiative}` : character.combat.initiative} />
        <KeyStatPill label="Speed" value={`${character.combat.speed}ft`} />
        <KeyStatPill label="Prof" value={`+${character.proficiencyBonus}`} />
        <KeyStatPill label="Passive Perc" value={passivePerception} />
      </div>
    {/if}

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <InspirationBadge />
      <EditModeToggle />
      <Separator orientation="vertical" class="h-6" />
      <Button
        variant={panelOpen ? 'secondary' : 'ghost'}
        size="sm"
        class="h-8 px-2 text-xs"
        onclick={() => compendiumStore.togglePanel()}
        title="Toggle compendium"
      >
        📖
      </Button>
    </div>
  </div>
</header>
