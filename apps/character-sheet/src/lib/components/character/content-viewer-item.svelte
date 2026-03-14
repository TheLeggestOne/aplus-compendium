<script lang="ts">
  import type { InventoryItem, InventoryWeapon, InventoryArmor, ItemTier } from '@aplus-compendium/types';
  import type { ItemRarity, WeaponCategory, WeaponProperty, DamageType, ArmorCategory, DieType } from '@aplus-compendium/types';
  import type { AbilityScore } from '@aplus-compendium/types';
  import { contentViewerStore } from '$lib/stores/content-viewer.svelte.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { normalizeTier, normalizeItemType } from '$lib/utils/compendium-to-character.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';
  import RefreshCcwIcon from '@lucide/svelte/icons/refresh-ccw';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
  import XIcon from '@lucide/svelte/icons/x';

  const ALL_ITEM_TYPES = [
    'Adventuring Gear', 'Ammunition', "Artisan's Tools", 'Explosive',
    'Gaming Set', 'Generic Variant', 'Instrument', 'Mount',
    'Potion', 'Rod', 'Ring', 'Scroll', 'Spellcasting Focus', 'Staff',
    'Tack and Harness', 'Tool', 'Trade Good', 'Wand', 'Wondrous Item',
    'Simple Weapon', 'Martial Weapon', 'Melee Weapon', 'Ranged Weapon',
    'Light Armor', 'Medium Armor', 'Heavy Armor', 'Shield',
    'Vehicle (land)', 'Vehicle (water)', 'Other',
  ];

  interface Props {
    item: InventoryItem;
  }

  let { item }: Props = $props();

  const mode = $derived(contentViewerStore.mode);

  const ALL_RARITIES: Array<{ value: ItemRarity | ''; label: string }> = [
    { value: '',          label: 'None' },
    { value: 'common',    label: 'Common' },
    { value: 'uncommon',  label: 'Uncommon' },
    { value: 'rare',      label: 'Rare' },
    { value: 'very-rare', label: 'Very Rare' },
    { value: 'legendary', label: 'Legendary' },
    { value: 'artifact',  label: 'Artifact' },
  ];

  const ALL_WEAPON_PROPS: WeaponProperty[] = [
    'finesse', 'light', 'thrown', 'two-handed', 'versatile',
    'reach', 'loading', 'heavy', 'ammunition', 'special',
  ];

  const ALL_DAMAGE_TYPES: DamageType[] = [
    'bludgeoning', 'piercing', 'slashing',
    'acid', 'cold', 'fire', 'force', 'lightning',
    'necrotic', 'poison', 'psychic', 'radiant', 'thunder',
  ];

  const VALID_DIES: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
  function dieTypeFromDice(dice: string): DieType {
    const m = dice.match(/d(\d+)/);
    const n = m ? parseInt(m[1]!) : 6;
    return VALID_DIES.find((d) => parseInt(d.slice(1)) >= n) ?? 'd6';
  }

  const WEAPON_DEFAULTS = {
    category:            'simple-melee' as WeaponCategory,
    damageDice:          '1d4',
    damageType:          'bludgeoning' as DamageType,
    attackBonus:         0,
    damageBonus:         0,
    abilityUsed:         'strength' as AbilityScore,
    properties:          [] as WeaponProperty[],
    versatileDamageDice: '',
    hasRange:            false,
    rangeNormal:         20,
    rangeLong:           60,
  };

  const ARMOR_DEFAULTS = {
    category:            'light' as ArmorCategory,
    baseArmorClass:      11,
    hasMaxDex:           false,
    maxDexBonus:         2,
    hasStrReq:           false,
    strengthRequirement: 13,
    stealthDisadvantage: false,
  };

  function initWeapon() {
    const w = item as InventoryWeapon;
    return {
      category:            w.category as WeaponCategory,
      damageDice:          w.damageDice,
      damageType:          w.damageType as DamageType,
      attackBonus:         w.attackBonus,
      damageBonus:         w.damageBonus,
      abilityUsed:         w.abilityUsed as AbilityScore,
      properties:          [...w.properties] as WeaponProperty[],
      versatileDamageDice: w.versatileDamageDice ?? '',
      hasRange:            !!w.range,
      rangeNormal:         w.range?.normal ?? 20,
      rangeLong:           w.range?.long ?? 60,
    };
  }

  function initArmor() {
    const a = item as InventoryArmor;
    return {
      category:            a.category as ArmorCategory,
      baseArmorClass:      a.baseArmorClass,
      hasMaxDex:           a.maxDexBonus !== undefined,
      maxDexBonus:         a.maxDexBonus ?? 2,
      hasStrReq:           !!a.strengthRequirement,
      strengthRequirement: a.strengthRequirement ?? 13,
      stealthDisadvantage: a.stealthDisadvantage,
    };
  }

  // Base edit state
  let editType           = $state<'equipment' | 'weapon' | 'armor'>(item.type);
  let editName           = $state(item.name);
  let editQuantity       = $state(item.quantity);
  let editWeight         = $state(item.weight);
  let editCostGp         = $state(item.costGp ?? 0);
  let editRarity         = $state<ItemRarity | ''>(item.rarity ?? '');
  let editWondrous       = $state(item.type === 'equipment' ? !!(item as InventoryItem & { wondrous?: boolean }).wondrous : false);
  let editTier           = $state<ItemTier | ''>(item.tier ?? '');
  let editItemType       = $state(item.itemType ?? '');
  let editRequiresAttune = $state(item.requiresAttunement ?? false);
  let editDescription    = $state(item.description ?? '');

  // Weapon edit state (populated when editType === 'weapon')
  let ew = $state(item.type === 'weapon' ? initWeapon() : { ...WEAPON_DEFAULTS });

  // Armor edit state (populated when editType === 'armor')
  let ea = $state(item.type === 'armor' ? initArmor() : { ...ARMOR_DEFAULTS });

  $effect(() => {
    editType           = item.type;
    editName           = item.name;
    editQuantity       = item.quantity;
    editWeight         = item.weight;
    editCostGp         = item.costGp ?? 0;
    editRarity         = item.rarity ?? '';
    editTier           = item.tier ?? '';
    editItemType       = item.itemType ?? '';
    editRequiresAttune = item.requiresAttunement ?? false;
    editDescription    = item.description ?? '';
    ew = item.type === 'weapon' ? initWeapon() : { ...WEAPON_DEFAULTS };
    ea = item.type === 'armor'  ? initArmor()  : { ...ARMOR_DEFAULTS };
    editWondrous = item.type === 'equipment' ? !!(item as InventoryItem & { wondrous?: boolean }).wondrous : false;
  });

  function onTypeChange() {
    // Reset sub-states to defaults when switching away from their type
    if (editType !== 'weapon') ew = { ...WEAPON_DEFAULTS };
    if (editType !== 'armor')  ea = { ...ARMOR_DEFAULTS };
  }

  // Item type combobox state
  let itemTypeOpen = $state(false);
  let itemTypeSearch = $state('');
  const filteredItemTypes = $derived(
    itemTypeSearch
      ? ALL_ITEM_TYPES.filter((t) => t.toLowerCase().includes(itemTypeSearch.toLowerCase()))
      : ALL_ITEM_TYPES,
  );

  function selectItemType(value: string) {
    editItemType = value;
    itemTypeSearch = '';
    itemTypeOpen = false;
  }

  function clearItemType() {
    editItemType = '';
    itemTypeSearch = '';
  }

  function toggleProperty(prop: WeaponProperty) {
    const idx = ew.properties.indexOf(prop);
    if (idx === -1) ew.properties = [...ew.properties, prop];
    else ew.properties = ew.properties.filter((p) => p !== prop);
  }

  function save() {
    const descriptionChanged = editDescription !== (item.description ?? '');
    const base = {
      id:                 item.id,
      containerId:        item.containerId,
      equipSlot:          item.equipSlot,
      attuned:            item.attuned ?? false,
      name:               editName,
      quantity:           editQuantity,
      weight:             editWeight,
      costGp:             editCostGp || undefined,
      rarity:             editRarity || undefined,
      tier:               editTier || undefined,
      itemType:           editItemType || undefined,
      requiresAttunement: editRequiresAttune,
      description:        editDescription,
      rawEntries:         descriptionChanged ? undefined : item.rawEntries,
    };

    let updated: InventoryItem;
    if (editType === 'weapon') {
      updated = {
        ...base,
        type:                'weapon',
        category:            ew.category,
        damageDice:          ew.damageDice,
        damageType:          ew.damageType,
        attackBonus:         ew.attackBonus,
        damageBonus:         ew.damageBonus,
        abilityUsed:         ew.abilityUsed,
        properties:          ew.properties,
        versatileDamageDice: ew.versatileDamageDice || undefined,
        range:               ew.hasRange ? { normal: ew.rangeNormal, long: ew.rangeLong } : undefined,
        dieType:             dieTypeFromDice(ew.damageDice),
      };
    } else if (editType === 'armor') {
      updated = {
        ...base,
        type:                'armor',
        category:            ea.category,
        baseArmorClass:      ea.baseArmorClass,
        maxDexBonus:         ea.hasMaxDex ? ea.maxDexBonus : undefined,
        strengthRequirement: ea.hasStrReq ? ea.strengthRequirement : undefined,
        stealthDisadvantage: ea.stealthDisadvantage,
      };
    } else {
      updated = {
        ...base,
        type:     'equipment',
        wondrous: editWondrous,
      };
    }

    characterStore.replaceInventoryItem(updated);
    void characterStore.saveNow();
    contentViewerStore.update({ type: 'item', data: updated });
    contentViewerStore.setMode('view');
  }

  // Computed attack/damage totals for view mode
  const { abilityModifiers, derivedProficiencyBonus } = $derived(characterStore);
  const totalToHit = $derived(
    item.type === 'weapon'
      ? abilityModifiers[(item as InventoryWeapon).abilityUsed] + derivedProficiencyBonus + (item as InventoryWeapon).attackBonus
      : 0
  );
  const totalDmgBonus = $derived(
    item.type === 'weapon'
      ? abilityModifiers[(item as InventoryWeapon).abilityUsed] + (item as InventoryWeapon).damageBonus
      : 0
  );

  const RARITY_COLORS: Record<string, string> = {
    uncommon:    'text-green-500',
    rare:        'text-blue-500',
    'very-rare': 'text-purple-500',
    legendary:   'text-orange-500',
    artifact:    'text-red-500',
  };

  const rarityColor = $derived(item.rarity ? (RARITY_COLORS[item.rarity] ?? 'text-muted-foreground') : 'text-muted-foreground');

  function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '); }

  let refreshing = $state(false);
  let refreshStatus = $state<'idle' | 'not-found'>('idle');

  async function refreshFromCompendium() {
    const api = window.electronAPI;
    if (!api) return;
    refreshing = true;
    refreshStatus = 'idle';
    try {
      // Fetch enough results to find an exact name match (avoids "Scimitar of Speed" beating "Scimitar")
      const searchResult = await api.compendium.search(item.name, 'item', {}, 20, 0);
      if (!searchResult.ok || searchResult.data.length === 0) {
        refreshStatus = 'not-found';
        return;
      }
      const nameLower = item.name.toLowerCase().trim();
      const exact = searchResult.data.find((r) => r.name.toLowerCase().trim() === nameLower);
      if (!exact) {
        refreshStatus = 'not-found';
        return;
      }
      const entryResult = await api.compendium.get(exact.id, 'item');
      if (!entryResult.ok || !entryResult.data) {
        refreshStatus = 'not-found';
        return;
      }
      const raw = entryResult.data.raw as Record<string, unknown>;
      const rawEntries = Array.isArray(raw['entries']) && (raw['entries'] as unknown[]).length > 0
        ? (raw['entries'] as unknown[])
        : undefined;
      const costGp = typeof raw['value'] === 'number' ? (raw['value'] as number) / 100 : item.costGp;
      const patch = {
        rawEntries, costGp,
        wondrous: !!raw['wondrous'],
        tier: normalizeTier(raw['tier']),
        itemType: normalizeItemType(raw),
      };
      characterStore.updateInventoryItem(item.id, patch);
      await characterStore.saveNow();
      // Sync the viewer store — it holds a snapshot and won't see character store changes otherwise
      contentViewerStore.update({ type: 'item', data: { ...item, ...patch } });
    } finally {
      refreshing = false;
    }
  }

  function browseInSrd() {
    contentViewerStore.close();
    compendiumStore.openPanel('item');
    compendiumStore.setQuery(item.name);
  }

  // Italic subtitle in D&D stat-block style
  const subtitle = $derived(() => {
    const parts: string[] = [];
    if (item.itemType) {
      parts.push(item.itemType);
    } else if (item.wondrous) {
      parts.push('Wondrous Item');
    } else if (item.type === 'weapon') {
      parts.push(`${capitalize((item as InventoryWeapon).category)} weapon`);
    } else if (item.type === 'armor') {
      const cat = (item as InventoryArmor).category;
      parts.push(cat === 'shield' ? 'Shield' : `${capitalize(cat)} armor`);
    } else {
      parts.push('Adventuring Gear');
    }
    if (item.tier) parts.push(capitalize(item.tier));
    if (item.rarity && item.rarity !== 'common') parts.push(capitalize(item.rarity));
    if (item.requiresAttunement) parts.push('requires attunement');
    return parts.join(', ');
  });
</script>

{#if mode === 'view'}
  <!-- ── View mode ── -->
  <div class="p-4 space-y-4">

    <!-- Italic subtitle -->
    <p class="text-xs italic {rarityColor}">{subtitle()}</p>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Qty</p>
        <p class="text-sm font-semibold tabular-nums">{item.quantity}</p>
      </div>
      <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Weight</p>
        <p class="text-sm font-semibold tabular-nums">{item.weight} lb</p>
      </div>
      <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
        <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Cost</p>
        <p class="text-sm font-semibold tabular-nums {item.costGp ? 'text-yellow-400' : 'text-muted-foreground/40'}">
          {item.costGp ? `${item.costGp} gp` : '—'}
        </p>
      </div>
    </div>

    {#if item.type === 'weapon'}
      {@const w = item as InventoryWeapon}
      <Separator />
      <div class="space-y-2">
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Damage</p>
            <p class="text-sm font-semibold">{w.damageDice} <span class="text-xs text-muted-foreground capitalize">{w.damageType}</span></p>
          </div>
          <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">To Hit</p>
            <p class="text-sm font-semibold tabular-nums">{totalToHit >= 0 ? `+${totalToHit}` : totalToHit}</p>
          </div>
          <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Ability</p>
            <p class="text-sm font-semibold capitalize">{w.abilityUsed.slice(0, 3)}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {#if w.versatileDamageDice}
            <span>Versatile: <span class="text-foreground">{w.versatileDamageDice}</span></span>
          {/if}
          {#if w.range}
            <span>Range: <span class="text-foreground">{w.range.normal}/{w.range.long} ft</span></span>
          {/if}
          {#if totalDmgBonus !== 0}
            <span>Dmg bonus: <span class="text-foreground">{totalDmgBonus >= 0 ? `+${totalDmgBonus}` : totalDmgBonus}</span></span>
          {/if}
        </div>
        {#if w.properties.length > 0}
          <div class="flex flex-wrap gap-1">
            {#each w.properties as prop}
              <span class="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{prop}</span>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    {#if item.type === 'armor'}
      {@const a = item as InventoryArmor}
      <Separator />
      <div class="space-y-2">
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
            <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Base AC</p>
            <p class="text-sm font-semibold tabular-nums">{a.baseArmorClass}</p>
          </div>
          {#if a.maxDexBonus !== undefined}
            <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
              <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Max Dex</p>
              <p class="text-sm font-semibold tabular-nums">{a.maxDexBonus === 0 ? 'None' : `+${a.maxDexBonus}`}</p>
            </div>
          {/if}
          {#if a.strengthRequirement}
            <div class="rounded-md bg-muted/30 px-3 py-2 text-center">
              <p class="text-[10px] text-muted-foreground uppercase tracking-wide">Str Req</p>
              <p class="text-sm font-semibold tabular-nums">{a.strengthRequirement}</p>
            </div>
          {/if}
        </div>
        {#if a.stealthDisadvantage}
          <p class="text-xs text-muted-foreground italic">Disadvantage on Stealth checks.</p>
        {/if}
      </div>
    {/if}

    <!-- Description — prefer rich rawEntries, fall back to plain text -->
    {#if item.rawEntries && item.rawEntries.length > 0}
      <Separator />
      <div class="text-xs leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">
        <EntryRenderer entries={item.rawEntries} />
      </div>
    {:else if item.description}
      <Separator />
      <p class="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{item.description}</p>
    {/if}

    <!-- Refresh from compendium -->
    <Separator />
    <div class="flex flex-col items-center gap-1 py-2">
      <button
        onclick={refreshFromCompendium}
        disabled={refreshing}
        class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        title="Re-fetch description, cost, and rarity from compendium"
      >
        <RefreshCcwIcon class="size-3.5 {refreshing ? 'animate-spin' : ''}" />
        {refreshing ? 'Refreshing…' : 'Refresh from compendium'}
      </button>
      {#if refreshStatus === 'not-found'}
        <p class="text-xs text-muted-foreground/60 italic">Not found in compendium — custom items can't be refreshed.</p>
      {/if}
    </div>

  </div>

{:else}
  <!-- ── Edit mode ── -->
  <div class="p-4 space-y-3">

    <!-- Name -->
    <div class="space-y-1">
      <p class="text-xs font-medium text-muted-foreground">Name</p>
      <Input bind:value={editName} class="h-7 text-xs" />
    </div>

    <!-- Qty / Weight / Cost -->
    <div class="grid grid-cols-3 gap-2">
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Quantity</p>
        <Input type="number" min="0" bind:value={editQuantity} class="h-7 text-xs" />
      </div>
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Weight (lbs)</p>
        <Input type="number" min="0" step="0.1" bind:value={editWeight} class="h-7 text-xs" />
      </div>
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Cost (gp)</p>
        <Input type="number" min="0" step="0.01" bind:value={editCostGp} class="h-7 text-xs" />
      </div>
    </div>

    <!-- Base type + Category -->
    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Base Type</p>
        <select
          bind:value={editType}
          onchange={onTypeChange}
          class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="equipment">Equipment</option>
          <option value="weapon">Weapon</option>
          <option value="armor">Armor / Shield</option>
        </select>
      </div>
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Category</p>
        <Popover.Root bind:open={itemTypeOpen}>
          <Popover.Trigger
            class="flex items-center justify-between w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <span class="truncate {editItemType ? 'text-foreground' : 'text-muted-foreground'}">
              {editItemType || 'Select…'}
            </span>
            <span class="flex items-center gap-0.5 shrink-0">
              {#if editItemType}
                <button
                  type="button"
                  onclick={(e) => { e.stopPropagation(); clearItemType(); }}
                  class="p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <XIcon class="size-3" />
                </button>
              {/if}
              <ChevronDownIcon class="size-3 text-muted-foreground" />
            </span>
          </Popover.Trigger>
          <Popover.Content align="start" side="bottom" avoidCollisions class="w-56 p-0">
            <div class="p-1.5 border-b border-border">
              <input
                type="text"
                placeholder="Search types…"
                bind:value={itemTypeSearch}
                class="w-full h-6 rounded bg-transparent px-1.5 text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div class="max-h-48 overflow-y-auto p-1">
              {#each filteredItemTypes as t}
                <button
                  type="button"
                  onclick={() => selectItemType(t)}
                  class="w-full text-left px-2 py-1 rounded text-xs hover:bg-muted transition-colors {t === editItemType ? 'bg-muted font-medium' : ''}"
                >
                  {t}
                </button>
              {/each}
              {#if filteredItemTypes.length === 0}
                <p class="px-2 py-1 text-xs text-muted-foreground italic">No matches</p>
              {/if}
            </div>
          </Popover.Content>
        </Popover.Root>
      </div>
    </div>

    <!-- Rarity / Tier -->
    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Rarity</p>
        <select
          bind:value={editRarity}
          class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {#each ALL_RARITIES as r}
            <option value={r.value}>{r.label}</option>
          {/each}
        </select>
      </div>
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Tier</p>
        <select
          bind:value={editTier}
          class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">None</option>
          <option value="minor">Minor</option>
          <option value="major">Major</option>
        </select>
      </div>
    </div>

    <!-- Flags row -->
    <div class="flex gap-4">
      <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
        <input type="checkbox" bind:checked={editRequiresAttune} class="rounded border-border" />
        Requires attunement
      </label>
      {#if editType === 'equipment'}
        <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" bind:checked={editWondrous} class="rounded border-border" />
          Wondrous item
        </label>
      {/if}
    </div>

    <!-- ── Weapon fields ── -->
    {#if editType === 'weapon'}
      <Separator />

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Category</p>
          <select bind:value={ew.category} class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="simple-melee">Simple Melee</option>
            <option value="simple-ranged">Simple Ranged</option>
            <option value="martial-melee">Martial Melee</option>
            <option value="martial-ranged">Martial Ranged</option>
          </select>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Ability Used</p>
          <select bind:value={ew.abilityUsed} class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="strength">Strength</option>
            <option value="dexterity">Dexterity</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Damage Dice</p>
          <Input bind:value={ew.damageDice} placeholder="1d6" class="h-7 text-xs" />
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Damage Type</p>
          <select bind:value={ew.damageType} class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
            {#each ALL_DAMAGE_TYPES as dt}
              <option value={dt}>{dt.charAt(0).toUpperCase() + dt.slice(1)}</option>
            {/each}
          </select>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Versatile</p>
          <Input bind:value={ew.versatileDamageDice} placeholder="1d8" class="h-7 text-xs" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Attack Bonus</p>
          <Input type="number" bind:value={ew.attackBonus} class="h-7 text-xs" />
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Damage Bonus</p>
          <Input type="number" bind:value={ew.damageBonus} class="h-7 text-xs" />
        </div>
      </div>

      <!-- Range -->
      <div class="space-y-1.5">
        <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" bind:checked={ew.hasRange} class="rounded border-border" />
          Has range
        </label>
        {#if ew.hasRange}
          <div class="grid grid-cols-2 gap-2 pl-5">
            <div class="space-y-1">
              <p class="text-xs font-medium text-muted-foreground">Normal (ft)</p>
              <Input type="number" min="0" bind:value={ew.rangeNormal} class="h-7 text-xs" />
            </div>
            <div class="space-y-1">
              <p class="text-xs font-medium text-muted-foreground">Long (ft)</p>
              <Input type="number" min="0" bind:value={ew.rangeLong} class="h-7 text-xs" />
            </div>
          </div>
        {/if}
      </div>

      <!-- Properties toggle -->
      <div class="space-y-1">
        <p class="text-xs font-medium text-muted-foreground">Properties</p>
        <div class="flex flex-wrap gap-1">
          {#each ALL_WEAPON_PROPS as prop}
            {@const active = ew.properties.includes(prop)}
            <button
              type="button"
              onclick={() => toggleProperty(prop)}
              class="rounded px-1.5 py-0.5 text-[10px] capitalize transition-colors {active ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}"
            >{prop}</button>
          {/each}
        </div>
      </div>
    {/if}

    <!-- ── Armor fields ── -->
    {#if editType === 'armor'}
      <Separator />

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Category</p>
          <select bind:value={ea.category} class="w-full h-7 rounded-md border border-border bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
            <option value="shield">Shield</option>
          </select>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">Base AC</p>
          <Input type="number" min="0" bind:value={ea.baseArmorClass} class="h-7 text-xs" />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" bind:checked={ea.hasMaxDex} class="rounded border-border" />
          Max Dex bonus
        </label>
        {#if ea.hasMaxDex}
          <div class="pl-5">
            <Input type="number" min="0" bind:value={ea.maxDexBonus} class="h-7 text-xs w-24" />
          </div>
        {/if}
      </div>

      <div class="space-y-1.5">
        <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" bind:checked={ea.hasStrReq} class="rounded border-border" />
          Strength requirement
        </label>
        {#if ea.hasStrReq}
          <div class="pl-5">
            <Input type="number" min="0" bind:value={ea.strengthRequirement} class="h-7 text-xs w-24" />
          </div>
        {/if}
      </div>

      <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
        <input type="checkbox" bind:checked={ea.stealthDisadvantage} class="rounded border-border" />
        Stealth disadvantage
      </label>
    {/if}

    <!-- Description -->
    <Separator />
    <div class="space-y-1">
      <p class="text-xs font-medium text-muted-foreground">
        Description
        {#if item.rawEntries && item.rawEntries.length > 0}
          <span class="font-normal text-muted-foreground/50">(editing clears rich text)</span>
        {/if}
      </p>
      <textarea
        bind:value={editDescription}
        rows="5"
        class="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
      ></textarea>
    </div>

    <div class="flex gap-2 pt-1">
      <Button size="sm" class="h-7 text-xs flex-1" onclick={save}>Save</Button>
      <Button variant="outline" size="sm" class="h-7 text-xs" onclick={() => contentViewerStore.setMode('view')}>Cancel</Button>
    </div>

  </div>
{/if}
