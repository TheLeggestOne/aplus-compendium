<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import { Moon, Coffee } from '@lucide/svelte';
</script>

{#if !uiStore.isEditMode}
  <div class="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onclick={() => characterStore.shortRest()}
      class="gap-1.5"
    >
      <Coffee class="size-3.5" />
      Short Rest
    </Button>
    <Button
      variant="outline"
      size="sm"
      onclick={() => characterStore.longRest()}
      class="gap-1.5"
    >
      <Moon class="size-3.5" />
      Long Rest
    </Button>
  </div>
{/if}
