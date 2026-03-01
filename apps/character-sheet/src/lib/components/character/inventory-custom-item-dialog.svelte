<script lang="ts">
  import type { InventoryItem, InventoryWeapon, InventoryArmor, InventoryEquipment } from '@aplus-compendium/types';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    open: boolean;
    containerId?: string;
  }

  let { open = $bindable(), containerId = 'default' }: Props = $props();

  type ItemType = 'equipment' | 'weapon' | 'armor';
  let itemType = $state<ItemType>('equipment');

  // Common
  let name = $state('');
  let quantity = $state(1);
  let weight = $state(0);
  let requiresAttunement = $state(false);

  // Weapon
  let damageDice = $state('1d6');
  let attackBonus = $state(0);
  let damageBonus = $state(0);

  // Armor
  let baseArmorClass = $state(11);

  $effect(() => {
    if (open) {
      itemType = 'equipment';
      name = '';
      quantity = 1;
      weight = 0;
      requiresAttunement = false;
      damageDice = '1d6';
      attackBonus = 0;
      damageBonus = 0;
      baseArmorClass = 11;
    }
  });

  function submit() {
    if (!name.trim()) return;
    const id = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let item: InventoryItem;

    if (itemType === 'weapon') {
      item = {
        type: 'weapon',
        id, name: name.trim(), quantity, weight, containerId,
        requiresAttunement, attuned: false,
        category: 'simple-melee',
        damageDice,
        damageType: 'bludgeoning',
        properties: [],
        attackBonus,
        damageBonus,
        abilityUsed: 'strength',
        dieType: 'd6',
      } satisfies InventoryWeapon;
    } else if (itemType === 'armor') {
      item = {
        type: 'armor',
        id, name: name.trim(), quantity, weight, containerId,
        requiresAttunement, attuned: false,
        category: 'light',
        baseArmorClass,
        stealthDisadvantage: false,
      } satisfies InventoryArmor;
    } else {
      item = {
        type: 'equipment',
        id, name: name.trim(), quantity, weight, containerId,
        requiresAttunement, attuned: false,
      } satisfies InventoryEquipment;
    }

    characterStore.addInventoryItem(item);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>Add Custom Item</Dialog.Title>
    </Dialog.Header>

    <div class="space-y-3 py-2">
      <!-- Type selector -->
      <div class="flex gap-1.5">
        {#each (['equipment', 'weapon', 'armor'] as ItemType[]) as t}
          <button
            class="flex-1 rounded border px-2 py-1 text-xs capitalize transition-colors {itemType === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:text-foreground'}"
            onclick={() => { itemType = t; }}
          >{t}</button>
        {/each}
      </div>

      <div class="space-y-1">
        <label class="text-xs font-medium text-muted-foreground">Name *</label>
        <Input bind:value={name} placeholder="Item name…" class="h-7 text-xs" />
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-muted-foreground">Quantity</label>
          <Input type="number" min="1" bind:value={quantity} class="h-7 text-xs" />
        </div>
        <div class="space-y-1">
          <label class="text-xs font-medium text-muted-foreground">Weight (lbs)</label>
          <Input type="number" min="0" step="0.1" bind:value={weight} class="h-7 text-xs" />
        </div>
      </div>

      {#if itemType === 'weapon'}
        <div class="grid grid-cols-3 gap-2">
          <div class="space-y-1">
            <label class="text-xs font-medium text-muted-foreground">Damage</label>
            <Input bind:value={damageDice} placeholder="1d6" class="h-7 text-xs" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-muted-foreground">Atk Bonus</label>
            <Input type="number" bind:value={attackBonus} class="h-7 text-xs" />
          </div>
          <div class="space-y-1">
            <label class="text-xs font-medium text-muted-foreground">Dmg Bonus</label>
            <Input type="number" bind:value={damageBonus} class="h-7 text-xs" />
          </div>
        </div>
      {/if}

      {#if itemType === 'armor'}
        <div class="space-y-1">
          <label class="text-xs font-medium text-muted-foreground">Base AC</label>
          <Input type="number" min="0" bind:value={baseArmorClass} class="h-7 text-xs" />
        </div>
      {/if}

      <div class="flex items-center gap-2">
        <input type="checkbox" id="req-attune" bind:checked={requiresAttunement} class="h-3.5 w-3.5" />
        <label for="req-attune" class="text-xs text-muted-foreground cursor-pointer">Requires attunement</label>
      </div>
    </div>

    <Dialog.Footer class="border-t border-border pt-3 mt-1 flex gap-2 justify-end">
      <Dialog.Close>
        <Button variant="outline" size="sm" class="h-7 text-xs">Cancel</Button>
      </Dialog.Close>
      <Button size="sm" class="h-7 text-xs" onclick={submit} disabled={!name.trim()}>Add Item</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
