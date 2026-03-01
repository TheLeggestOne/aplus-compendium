<script lang="ts">
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import ContentViewerSpell from './content-viewer-spell.svelte';
  import XIcon from '@lucide/svelte/icons/x';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import EyeIcon from '@lucide/svelte/icons/eye';

  const content = $derived(contentViewerStore.content);
  const mode = $derived(contentViewerStore.mode);

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

      <!-- View/Edit toggle -->
      <button
        class="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        onclick={() => contentViewerStore.toggleMode()}
        title={mode === 'view' ? 'Edit' : 'View'}
        aria-label={mode === 'view' ? 'Switch to edit mode' : 'Switch to view mode'}
      >
        {#if mode === 'view'}
          <PencilIcon class="size-3.5" />
        {:else}
          <EyeIcon class="size-3.5" />
        {/if}
      </button>

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
      {/if}
    </ScrollArea>

  </div>
{/if}
