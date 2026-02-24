<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Sparkles } from '@lucide/svelte';
  import { cn } from '$lib/utils.js';

  const { character } = $derived(characterStore);
</script>

<button
  class={cn(
    'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all border',
    character.inspiration
      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      : 'bg-transparent border-muted-foreground/30 text-muted-foreground hover:border-yellow-500/50 hover:text-yellow-400',
  )}
  onclick={() => characterStore.toggleInspiration()}
  title="Toggle inspiration"
>
  <Sparkles class="size-3" />
  {character.inspiration ? 'Inspired' : 'Inspiration'}
</button>
