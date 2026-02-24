<script lang="ts">
  import { Toggle } from '$lib/components/ui/toggle/index.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import { Pencil, Eye } from '@lucide/svelte';
</script>

<Toggle
  pressed={uiStore.isEditMode}
  onPressedChange={() => uiStore.toggleEditMode()}
  variant="outline"
  size="sm"
  class="gap-1.5 text-xs"
>
  {#if uiStore.isEditMode}
    <Pencil class="size-3" />
    Editing
  {:else}
    <Eye class="size-3" />
    View
  {/if}
</Toggle>
