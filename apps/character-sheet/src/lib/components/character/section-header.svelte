<script lang="ts">
  import { cn } from '$lib/utils.js';
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    class?: string;
    actions?: Snippet;
  }

  let { title, class: className, actions }: Props = $props();
</script>

<div class={cn('flex items-center justify-between mb-3', className)}>
  <h2 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
    {title}
  </h2>
  {#if actions}
    <div class="flex items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</div>
