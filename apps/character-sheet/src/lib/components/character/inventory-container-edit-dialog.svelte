<script lang="ts">
  import type { InventoryContainer } from '@aplus-compendium/types';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    container: InventoryContainer;
    open: boolean;
  }

  let { container, open = $bindable() }: Props = $props();

  let name = $state(container.name);
  let hasCapacity = $state(container.capacityLbs !== undefined);
  let capacityLbs = $state(container.capacityLbs ?? 50);
  let confirmDelete = $state(false);

  $effect(() => {
    if (open) {
      name = container.name;
      hasCapacity = container.capacityLbs !== undefined;
      capacityLbs = container.capacityLbs ?? 50;
      confirmDelete = false;
    }
  });

  function save() {
    if (name.trim()) characterStore.renameContainer(container.id, name.trim());
    characterStore.setContainerCapacity(container.id, hasCapacity ? capacityLbs : undefined);
    open = false;
  }

  function deleteContainer() {
    if (!confirmDelete) { confirmDelete = true; return; }
    characterStore.removeContainer(container.id);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-xs">
    <Dialog.Header>
      <Dialog.Title>Edit Container</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-3 py-2">
      <div class="space-y-1">
        <label class="text-xs font-medium text-muted-foreground">Name</label>
        <Input bind:value={name} class="h-7 text-xs" />
      </div>

      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <input type="checkbox" id="has-cap" bind:checked={hasCapacity} class="h-3.5 w-3.5" />
          <label for="has-cap" class="text-xs text-muted-foreground cursor-pointer">Weight capacity limit</label>
        </div>
        {#if hasCapacity}
          <div class="flex items-center gap-2">
            <Input type="number" min="1" bind:value={capacityLbs} class="h-7 text-xs w-24" />
            <span class="text-xs text-muted-foreground">lbs</span>
          </div>
        {/if}
      </div>
    </div>

    <Dialog.Footer class="flex items-center justify-between border-t border-border pt-3 mt-1">
      <Button
        variant={confirmDelete ? 'destructive' : 'ghost'}
        size="sm"
        class="h-7 px-2 text-xs"
        onclick={deleteContainer}
      >
        {confirmDelete ? 'Confirm delete' : 'Delete container'}
      </Button>
      <div class="flex gap-2">
        <Dialog.Close>
          <Button variant="outline" size="sm" class="h-7 text-xs">Cancel</Button>
        </Dialog.Close>
        <Button size="sm" class="h-7 text-xs" onclick={save}>Save</Button>
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
