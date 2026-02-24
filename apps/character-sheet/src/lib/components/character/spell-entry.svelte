<script lang="ts">
  import type { Spell } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { cn } from '$lib/utils.js';

  interface Props {
    spell: Spell;
  }

  let { spell }: Props = $props();

  const LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

  const schoolColors: Record<string, string> = {
    abjuration: 'text-blue-400',
    conjuration: 'text-yellow-400',
    divination: 'text-cyan-400',
    enchantment: 'text-pink-400',
    evocation: 'text-orange-400',
    illusion: 'text-purple-400',
    necromancy: 'text-green-400',
    transmutation: 'text-emerald-400',
  };
</script>

<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger class="w-full text-left">
      <div class="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors cursor-default">
        <Badge
          variant="outline"
          class={cn('text-[10px] px-1.5 py-0 shrink-0', schoolColors[spell.school])}
        >
          {LEVEL_LABELS[spell.level]}
        </Badge>

        <span class="flex-1 text-sm font-medium">{spell.name}</span>

        <div class="flex items-center gap-1 shrink-0">
          {#if spell.concentration}
            <Badge variant="secondary" class="text-[10px] px-1 py-0">C</Badge>
          {/if}
          {#if spell.ritual}
            <Badge variant="secondary" class="text-[10px] px-1 py-0">R</Badge>
          {/if}
          {#if spell.prepared === false}
            <span class="text-[10px] text-muted-foreground/50">unprepared</span>
          {/if}
        </div>
      </div>
    </Tooltip.Trigger>
    <Tooltip.Content class="max-w-sm selectable" side="left">
      <div class="flex flex-col gap-1">
        <p class="font-semibold">{spell.name}</p>
        <p class="text-xs text-muted-foreground capitalize">
          {LEVEL_LABELS[spell.level]} {spell.school} ·
          {spell.castingTime} ·
          {spell.range} ·
          {spell.duration}
          {#if spell.components.material && spell.components.materialDescription}
            · M: {spell.components.materialDescription}
          {/if}
        </p>
        <p class="text-xs mt-1">{spell.description}</p>
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</Tooltip.Provider>
