<script lang="ts">
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import ContentViewerSpell from './content-viewer-spell.svelte';
  import ContentViewerRace from './content-viewer-race.svelte';
  import ContentViewerClass from './content-viewer-class.svelte';
  import ContentViewerBackground from './content-viewer-background.svelte';
  import ContentViewerItem from './content-viewer-item.svelte';
  import XIcon from '@lucide/svelte/icons/x';

  const content = $derived(contentViewerStore.content);

  const title = $derived(content?.data.name ?? '');
  const typeLabel = $derived(content?.type ?? '');
</script>

{#if content}
  <div class="flex h-full flex-col overflow-hidden border-l border-border bg-background">

    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-2 shrink-0 border-b border-border">
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold truncate">{title}</p>
        <p class="text-[10px] text-muted-foreground capitalize">{typeLabel}</p>
      </div>

      <!-- Close -->
      <button
        class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        onclick={() => contentViewerStore.close()}
        title="Close"
        aria-label="Close viewer"
      >
        <XIcon class="size-3.5" />
      </button>
    </div>

    <Separator />

    <!-- Content area -->
    <ScrollArea class="flex-1 min-h-0">
      {#if content.type === 'spell'}
        <ContentViewerSpell
          spell={content.data}
          dndClass={content.context?.dndClass}
        />
      {:else if content.type === 'race'}
        <ContentViewerRace race={content.data} />
      {:else if content.type === 'class'}
        <ContentViewerClass classData={content.data} />
      {:else if content.type === 'background'}
        <ContentViewerBackground background={content.data} />
      {:else if content.type === 'item'}
        <ContentViewerItem item={content.data} />
      {/if}
    </ScrollArea>

  </div>
{/if}
