<script lang="ts">
  import type { Spell, DndClass } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { cn } from '$lib/utils.js';

  interface Props {
    spell: Spell;
    dndClass?: DndClass;
  }

  let { spell, dndClass }: Props = $props();

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

<button
  class="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
  onclick={() => contentViewerStore.open({ type: 'spell', data: spell, context: dndClass ? { dndClass } : undefined })}
  title="View spell details"
>
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
  </div>
</button>
