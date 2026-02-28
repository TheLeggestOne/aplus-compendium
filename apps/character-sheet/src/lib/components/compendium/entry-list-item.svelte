<script lang="ts">
  import type { CompendiumSearchResult } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';

  interface Props {
    entry: CompendiumSearchResult;
    selected: boolean;
    onclick: () => void;
  }

  const { entry, selected, onclick }: Props = $props();

  function spellLevelLabel(level: number | undefined): string {
    if (level === undefined) return '';
    if (level === 0) return 'Cantrip';
    const ordinals = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
    return `${ordinals[level] ?? level} level`;
  }

  function schoolAbbr(school: string | undefined): string {
    if (!school) return '';
    return school.charAt(0).toUpperCase() + school.slice(1, 3);
  }

  const rarityColor: Record<string, string> = {
    'common': 'text-foreground',
    'uncommon': 'text-green-400',
    'rare': 'text-blue-400',
    'very rare': 'text-purple-400',
    'legendary': 'text-orange-400',
    'artifact': 'text-red-400',
  };
</script>

<button
  class="w-full text-left px-3 py-2 transition-colors hover:bg-muted/50 {selected ? 'bg-muted' : ''}"
  {onclick}
>
  <div class="flex items-start justify-between gap-2">
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium leading-tight">{entry.name}</p>

      <div class="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {#if entry.contentType === 'spell'}
          <span>{spellLevelLabel(entry.level)}</span>
          {#if entry.school}
            <span class="opacity-50">·</span>
            <span class="capitalize">{schoolAbbr(entry.school)}</span>
          {/if}
          {#if entry.concentration}
            <span class="opacity-50">·</span>
            <span class="text-amber-400/80">C</span>
          {/if}
          {#if entry.ritual}
            <span class="opacity-50">·</span>
            <span class="text-teal-400/80">R</span>
          {/if}
        {:else if entry.contentType === 'item'}
          {#if entry.rarity && entry.rarity !== 'none'}
            <span class={rarityColor[entry.rarity] ?? 'text-foreground'}>
              {entry.rarity}
            </span>
          {/if}
          {#if entry.itemType}
            <span class="opacity-50">·</span>
            <span>{entry.itemType}</span>
          {/if}
        {:else if entry.contentType === 'subclass'}
          {#if entry.className}
            <span>{entry.className}</span>
          {/if}
        {:else if entry.contentType === 'optional-feature'}
          {#if entry.featureType}
            <span>{entry.featureType}</span>
          {/if}
        {:else if entry.contentType === 'feat'}
          {#if entry.prerequisite}
            <span class="italic">Req: {entry.prerequisite}</span>
          {/if}
        {/if}
      </div>
    </div>

    <Badge variant="outline" class="shrink-0 text-[10px] px-1 py-0 h-4 font-normal opacity-60">
      {entry.source}
    </Badge>
  </div>
</button>
