<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import SectionHeader from './section-header.svelte';
  import HitDiceTracker from './hit-dice-tracker.svelte';
  import RestButton from './rest-button.svelte';

  const { character } = $derived(characterStore);

  const hpPercent = $derived(
    Math.round((character.combat.currentHitPoints / character.combat.maxHitPoints) * 100)
  );
</script>

<div class="flex flex-col gap-4">
  <div>
    <SectionHeader title="Hit Points">
      {#snippet actions()}
        <RestButton />
      {/snippet}
    </SectionHeader>

    <div class="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-baseline gap-1">
          <span class="text-4xl font-bold tabular-nums">{character.combat.currentHitPoints}</span>
          <span class="text-lg text-muted-foreground">/ {character.combat.maxHitPoints}</span>
        </div>
        {#if character.combat.temporaryHitPoints > 0}
          <div class="flex items-center gap-1 text-blue-400">
            <span class="text-sm font-medium">+{character.combat.temporaryHitPoints}</span>
            <span class="text-xs">temp</span>
          </div>
        {/if}
      </div>

      <Progress value={hpPercent} class="h-2" />

      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Click the HP in the header to adjust</span>
      </div>
    </div>
  </div>

  <HitDiceTracker />
</div>
