<script lang="ts">
  import type { InventoryItem, InventoryWeapon, InventoryArmor } from '@aplus-compendium/types';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    item: InventoryItem;
    open: boolean;
    onclose?: () => void;
  }

  let { item, open = $bindable(), onclose }: Props = $props();

  let name = $state(item.name);
  let quantity = $state(item.quantity);
  let weight = $state(item.weight);
  let description = $state(item.description ?? '');
  let attuned = $state(item.attuned ?? false);
  // Weapon-specific
  let attackBonus = $state(item.type === 'weapon' ? (item as InventoryWeapon).attackBonus : 0);
  let damageBonus = $state(item.type === 'weapon' ? (item as InventoryWeapon).damageBonus : 0);
  // Armor-specific
  let baseArmorClass = $state(item.type === 'armor' ? (item as InventoryArmor).baseArmorClass : 10);

  let confirmDelete = $state(false);

  $effect(() => {
    if (open) {
      name = item.name;
      quantity = item.quantity;
      weight = item.weight;
      description = item.description ?? '';
      attuned = item.attuned ?? false;
      if (item.type === 'weapon') attackBonus = (item as InventoryWeapon).attackBonus;
      if (item.type === 'weapon') damageBonus = (item as InventoryWeapon).damageBonus;
      if (item.type === 'armor') baseArmorClass = (item as InventoryArmor).baseArmorClass;
      confirmDelete = false;
    }
  });

  function save() {
    const patch: Partial<InventoryItem> = { name, quantity, weight, description, attuned };
    if (item.type === 'weapon') {
      Object.assign(patch, { attackBonus, damageBonus });
    }
    if (item.type === 'armor') {
      Object.assign(patch, { baseArmorClass });
    }
    characterStore.updateInventoryItem(item.id, patch);
    open = false;
    onclose?.();
  }

  function deleteItem() {
    if (!confirmDelete) { confirmDelete = true; return; }
    characterStore.removeInventoryItem(item.id);
    open = false;
    onclose?.();
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>Edit Item</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-3 py-2">
      <div class="space-y-1">
        <label class="text-xs font-medium text-muted-foreground">Name</label>
        <Input bind:value={name} class="h-7 text-xs" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-muted-foreground">Quantity</label>
          <Input type="number" min="0" bind:value={quantity} class="h-7 text-xs" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-muted-foreground">Weight (lbs)</label>
          <Input type="number" min="0" step="0.1" bind:value={weight} class="h-7 text-xs" />
        </div>
      </div>

      {#if item.type === 'weapon'}
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <label class="text-xs font-medium text-muted-foreground">Attack Bonus</label>
            <Input type="number" bind:value={attackBonus} class="h-7 text-xs" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-muted-foreground">Damage Bonus</label>
            <Input type="number" bind:value={damageBonus} class="h-7 text-xs" />
          </div>
        </div>
      {/if}

      {#if item.type === 'armor'}
        <div class="space-y-1">
          <label class="text-xs font-medium text-muted-foreground">Base AC</label>
          <Input type="number" min="0" bind:value={baseArmorClass} class="h-7 text-xs" />
        </div>
      {/if}

      {#if item.requiresAttunement}
        <div class="flex items-center gap-2">
          <input type="checkbox" id="attuned-toggle" bind:checked={attuned} class="h-3.5 w-3.5" />
          <label for="attuned-toggle" class="text-xs text-muted-foreground cursor-pointer">Attuned</label>
        </div>
      {/if}

      <div class="space-y-1">
        <label class="text-xs font-medium text-muted-foreground">Description</label>
        <textarea
          bind:value={description}
          rows="3"
          class="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        ></textarea>
      </div>
    </div>

    <Dialog.Footer class="flex items-center justify-between border-t border-border pt-3 mt-1">
      <Button
        variant={confirmDelete ? 'destructive' : 'ghost'}
        size="sm"
        class="h-7 px-2 text-xs"
        onclick={deleteItem}
      >
        {confirmDelete ? 'Confirm delete' : 'Delete'}
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
