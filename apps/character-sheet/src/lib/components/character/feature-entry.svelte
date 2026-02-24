<script lang="ts">
  import type { Feature } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import { cn } from '$lib/utils.js';
  import { ChevronRight } from '@lucide/svelte';
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    feature: Feature;
  }

  let { feature }: Props = $props();

  let open = $state(false);

  const sourceColors: Record<string, string> = {
    class:       'bg-blue-500/20 text-blue-400 border-blue-500/30',
    subclass:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
    race:        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    background:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
    feat:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
</script>

<Collapsible.Root bind:open>
  <div class="rounded-md border border-border bg-card mb-2">
    <Collapsible.Trigger class="w-full">
      <div class="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors rounded-md">
        <ChevronRight class={cn('size-3.5 text-muted-foreground transition-transform shrink-0', open && 'rotate-90')} />
        <span class="flex-1 text-sm font-medium text-left">{feature.name}</span>

        <div class="flex items-center gap-1.5 shrink-0">
          {#if feature.uses}
            <div class="flex gap-1">
              {#each Array(feature.uses.maximum) as _, i}
                <button
                  class={cn(
                    'size-3 rounded-full border transition-colors',
                    i < feature.uses.current
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30 bg-transparent',
                  )}
                  onclick={(e) => {
                    e.stopPropagation();
                    if (i < feature.uses!.current) {
                      if (i === feature.uses!.current - 1) {
                        characterStore.useFeature(feature.id);
                      }
                    } else if (i === feature.uses!.current) {
                      characterStore.restoreFeature(feature.id);
                    }
                  }}
                  aria-label={i < (feature.uses?.current ?? 0) ? 'Use charge' : 'Restore charge'}
                ></button>
              {/each}
            </div>
            <span class="text-[10px] text-muted-foreground tabular-nums">
              {feature.uses.current}/{feature.uses.maximum}
              {feature.uses.resetOn}
            </span>
          {/if}

          <Badge
            variant="outline"
            class={cn('text-[10px] px-1.5 py-0', sourceColors[feature.sourceType])}
          >
            {feature.source}
          </Badge>
        </div>
      </div>
    </Collapsible.Trigger>

    <Collapsible.Content>
      <div class="px-3 pb-3 pt-1 border-t border-border">
        <p class="text-xs text-muted-foreground leading-relaxed selectable">{feature.description}</p>
      </div>
    </Collapsible.Content>
  </div>
</Collapsible.Root>
