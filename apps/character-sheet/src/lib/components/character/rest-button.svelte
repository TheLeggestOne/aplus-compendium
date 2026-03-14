<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';

  import { Moon, Coffee } from '@lucide/svelte';
</script>

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
