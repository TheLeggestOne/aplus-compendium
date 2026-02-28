<script lang="ts">
  import type { AbilityScore, AbilityScoreSet } from '@aplus-compendium/types';
  import { abilityModifier } from '@aplus-compendium/types';
  import { Button } from '$lib/components/ui/button/index.js';
  import MinusIcon from '@lucide/svelte/icons/minus';
  import PlusIcon from '@lucide/svelte/icons/plus';

  const ABILITIES: { key: AbilityScore; label: string }[] = [
    { key: 'strength', label: 'STR' },
    { key: 'dexterity', label: 'DEX' },
    { key: 'constitution', label: 'CON' },
    { key: 'intelligence', label: 'INT' },
    { key: 'wisdom', label: 'WIS' },
    { key: 'charisma', label: 'CHA' },
  ];

  // Point buy cost table: score → cumulative cost
  const POINT_BUY_COST: Record<number, number> = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
  };
  const POINT_BUY_BUDGET = 27;

  interface Props {
    initial: AbilityScoreSet;
    onApply: (scores: AbilityScoreSet) => void;
    onCancel: () => void;
  }

  let { initial, onApply, onCancel }: Props = $props();

  // Working copy
  let scores = $state<AbilityScoreSet>({ ...initial });

  function costFor(score: number): number | null {
    return POINT_BUY_COST[score] ?? null;
  }

  const pointsSpent = $derived(
    ABILITIES.reduce((sum, { key }) => {
      const c = costFor(scores[key]);
      return c !== null ? sum + c : sum;
    }, 0),
  );

  const allInRange = $derived(
    ABILITIES.every(({ key }) => scores[key] >= 8 && scores[key] <= 15),
  );

  const pointsRemaining = $derived(POINT_BUY_BUDGET - pointsSpent);

  function adjust(ability: AbilityScore, delta: number) {
    const next = scores[ability] + delta;
    if (next < 1 || next > 30) return;
    scores = { ...scores, [ability]: next };
  }

  function handleInput(ability: AbilityScore, e: Event) {
    const val = parseInt((e.currentTarget as HTMLInputElement).value, 10);
    if (!isNaN(val) && val >= 1 && val <= 30) {
      scores = { ...scores, [ability]: val };
    }
  }

  function resetToEights() {
    scores = {
      strength: 8, dexterity: 8, constitution: 8,
      intelligence: 8, wisdom: 8, charisma: 8,
    };
  }

  function formatMod(score: number): string {
    const mod = abilityModifier(score);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }
</script>

<div class="rounded-lg border border-border bg-card p-3">
  <!-- Point buy budget -->
  <div class="mb-3 flex items-center justify-between">
    <div class="flex items-baseline gap-1.5">
      <span class="text-xs font-medium text-muted-foreground">Point Buy</span>
      {#if allInRange}
        <span class="text-sm font-bold tabular-nums {pointsRemaining >= 0 ? 'text-emerald-400' : 'text-destructive'}">
          {pointsRemaining}
        </span>
        <span class="text-[10px] text-muted-foreground">/ {POINT_BUY_BUDGET}</span>
      {:else}
        <span class="text-[10px] text-muted-foreground italic">scores outside 8–15</span>
      {/if}
    </div>
    <Button variant="ghost" size="sm" class="h-6 px-2 text-[10px]" onclick={resetToEights}>
      Reset 8s
    </Button>
  </div>

  <!-- Score rows -->
  <div class="flex flex-col gap-1">
    {#each ABILITIES as { key, label }, i}
      {@const score = scores[key]}
      {@const cost = costFor(score)}
      <div class="flex items-center gap-2 rounded px-1 py-0.5 {i % 2 === 1 ? 'bg-muted/20' : ''}">
        <span class="w-8 text-xs font-semibold text-muted-foreground">{label}</span>

        <button
          class="flex size-5 items-center justify-center rounded border border-border text-xs hover:bg-accent disabled:opacity-30"
          disabled={score <= 1}
          onclick={() => adjust(key, -1)}
        >
          <MinusIcon class="size-3" />
        </button>

        <input
          type="number"
          min="1"
          max="30"
          value={score}
          oninput={(e) => handleInput(key, e)}
          class="w-10 rounded border border-border bg-background px-1 py-0.5 text-center text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <button
          class="flex size-5 items-center justify-center rounded border border-border text-xs hover:bg-accent disabled:opacity-30"
          disabled={score >= 30}
          onclick={() => adjust(key, 1)}
        >
          <PlusIcon class="size-3" />
        </button>

        <span class="w-8 text-center text-xs tabular-nums text-muted-foreground">{formatMod(score)}</span>

        {#if cost !== null}
          <span class="w-6 text-right text-[10px] tabular-nums text-muted-foreground">{cost}pt</span>
        {:else}
          <span class="w-6 text-right text-[10px] text-muted-foreground/50">—</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Actions -->
  <div class="mt-3 flex justify-end gap-2">
    <Button variant="ghost" size="sm" class="h-7 text-xs" onclick={onCancel}>Cancel</Button>
    <Button size="sm" class="h-7 text-xs" onclick={() => onApply(scores)}>Apply</Button>
  </div>
</div>
