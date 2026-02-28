<script lang="ts">
  import type { AbilityScore } from '@aplus-compendium/types';
  import type { AbilityBonusChoice, AbilityBonusWeightedChoice } from '$lib/utils/compendium-to-character.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';

  const ABILITY_LABELS: Record<AbilityScore, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  };

  interface Props {
    fixedBonuses: Partial<Record<AbilityScore, number>>;
    choices?: AbilityBonusChoice[];
    weightedChoices?: AbilityBonusWeightedChoice[];
    onconfirm: (resolved: Partial<Record<AbilityScore, number>>) => void;
    oncancel: () => void;
  }

  const { fixedBonuses, choices, weightedChoices, onconfirm, oncancel }: Props = $props();

  // --- Standard choices: pick N abilities for +amount each ---
  // Track selections per choice group (index → selected abilities)
  let choiceSelections = $state<AbilityScore[][]>(initChoiceSelections());

  function initChoiceSelections(): AbilityScore[][] {
    return (choices ?? []).map(() => []);
  }

  function toggleChoice(choiceIdx: number, ability: AbilityScore) {
    const choice = choices![choiceIdx]!;
    const current = [...choiceSelections[choiceIdx]!];
    const idx = current.indexOf(ability);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else if (current.length < choice.count) {
      current.push(ability);
    }
    choiceSelections = choiceSelections.map((s, i) => (i === choiceIdx ? current : s));
  }

  // --- Weighted choices: assign each weight to an ability ---
  // Track which ability each weight slot is assigned to
  let weightedSelections = $state<(AbilityScore | null)[][]>(initWeightedSelections());

  function initWeightedSelections(): (AbilityScore | null)[][] {
    return (weightedChoices ?? []).map((wc) => wc.weights.map(() => null));
  }

  function setWeightedAbility(wcIdx: number, slotIdx: number, ability: AbilityScore) {
    const current = [...weightedSelections[wcIdx]!];
    // If this ability is already assigned to another slot, swap
    const existingSlot = current.indexOf(ability);
    if (existingSlot >= 0 && existingSlot !== slotIdx) {
      current[existingSlot] = current[slotIdx] ?? null;
    }
    current[slotIdx] = ability;
    weightedSelections = weightedSelections.map((s, i) => (i === wcIdx ? current : s));
  }

  // --- Validation ---
  const allChoicesMade = $derived.by(() => {
    if (choices) {
      for (let i = 0; i < choices.length; i++) {
        if ((choiceSelections[i]?.length ?? 0) < choices[i]!.count) return false;
      }
    }
    if (weightedChoices) {
      for (let i = 0; i < weightedChoices.length; i++) {
        if (weightedSelections[i]?.some((s) => s === null)) return false;
      }
    }
    return true;
  });

  // Collect all abilities already used by fixed bonuses (to show context)
  const fixedAbilities = $derived(new Set(Object.keys(fixedBonuses) as AbilityScore[]));

  // Collect abilities used across all choice groups to prevent duplicate assignments
  const allSelectedAbilities = $derived.by(() => {
    const used = new Set<AbilityScore>();
    for (const sel of choiceSelections) {
      for (const a of sel) used.add(a);
    }
    for (const sel of weightedSelections) {
      for (const a of sel) {
        if (a) used.add(a);
      }
    }
    return used;
  });

  function confirm() {
    const resolved: Partial<Record<AbilityScore, number>> = {};

    // Standard choices
    if (choices) {
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i]!;
        for (const ability of choiceSelections[i] ?? []) {
          resolved[ability] = (resolved[ability] ?? 0) + choice.amount;
        }
      }
    }

    // Weighted choices
    if (weightedChoices) {
      for (let i = 0; i < weightedChoices.length; i++) {
        const wc = weightedChoices[i]!;
        for (let j = 0; j < wc.weights.length; j++) {
          const ability = weightedSelections[i]?.[j];
          if (ability) {
            resolved[ability] = (resolved[ability] ?? 0) + wc.weights[j]!;
          }
        }
      }
    }

    onconfirm(resolved);
  }
</script>

<div class="space-y-3">
  <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
    Ability Score Bonuses
  </p>

  <!-- Fixed bonuses -->
  {#if Object.keys(fixedBonuses).length > 0}
    <div class="flex flex-wrap gap-1.5">
      {#each Object.entries(fixedBonuses) as [ability, bonus]}
        <Badge variant="secondary" class="text-xs">
          +{bonus} {ABILITY_LABELS[ability as AbilityScore]}
        </Badge>
      {/each}
    </div>
  {/if}

  <!-- Standard choices -->
  {#if choices}
    {#each choices as choice, choiceIdx}
      <div class="space-y-1.5">
        <p class="text-xs text-muted-foreground">
          Choose {choice.count} ability {choice.count === 1 ? 'score' : 'scores'} for +{choice.amount} each:
        </p>
        <div class="flex flex-wrap gap-1.5">
          {#each choice.from as ability}
            {@const selected = choiceSelections[choiceIdx]?.includes(ability) ?? false}
            {@const usedElsewhere = !selected && (fixedAbilities.has(ability) || allSelectedAbilities.has(ability))}
            <button
              class="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors
                {selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : usedElsewhere
                    ? 'border-border/50 bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                    : 'border-border bg-card hover:bg-accent/50 text-foreground'}"
              disabled={usedElsewhere && !selected}
              onclick={() => toggleChoice(choiceIdx, ability)}
            >
              {ABILITY_LABELS[ability]}
            </button>
          {/each}
        </div>
      </div>
    {/each}
  {/if}

  <!-- Weighted choices -->
  {#if weightedChoices}
    {#each weightedChoices as wc, wcIdx}
      <div class="space-y-1.5">
        <p class="text-xs text-muted-foreground">
          Assign ability score bonuses:
        </p>
        {#each wc.weights as weight, slotIdx}
          {@const currentAbility = weightedSelections[wcIdx]?.[slotIdx] ?? null}
          <div class="flex items-center gap-2">
            <Badge variant="outline" class="text-xs shrink-0 w-8 justify-center">+{weight}</Badge>
            <div class="flex flex-wrap gap-1">
              {#each wc.from as ability}
                {@const isSelected = currentAbility === ability}
                {@const usedInOtherSlot = !isSelected && (
                  fixedAbilities.has(ability) ||
                  weightedSelections[wcIdx]?.some((s, i) => i !== slotIdx && s === ability) ||
                  allSelectedAbilities.has(ability) && !weightedSelections[wcIdx]?.includes(ability)
                )}
                <button
                  class="rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors
                    {isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : usedInOtherSlot
                        ? 'border-border/50 bg-muted/30 text-muted-foreground/50 cursor-not-allowed'
                        : 'border-border bg-card hover:bg-accent/50 text-foreground'}"
                  disabled={usedInOtherSlot === true}
                  onclick={() => setWeightedAbility(wcIdx, slotIdx, ability)}
                >
                  {ABILITY_LABELS[ability]}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  {/if}

  <!-- Confirm/Cancel -->
  <div class="flex gap-2 pt-1">
    <Button size="sm" class="h-7 text-xs flex-1" onclick={confirm} disabled={!allChoicesMade}>
      Set as Race
    </Button>
    <Button size="sm" variant="ghost" class="h-7 text-xs" onclick={oncancel}>
      Cancel
    </Button>
  </div>
</div>
