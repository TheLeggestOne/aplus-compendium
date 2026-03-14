<script lang="ts">
  import type { CharacterBackground, BackgroundEquipmentItem } from '@aplus-compendium/types';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';

  export interface BackgroundChoices {
    languages: string[];
    toolProficiency?: string;
    equipmentItems: { name: string; quantity: number }[];
    startingGold: number;
  }

  interface Props {
    background: CharacterBackground;
    open: boolean;
    onconfirm: (choices: BackgroundChoices) => void;
  }

  let { background, open = $bindable(), onconfirm }: Props = $props();

  const STANDARD_LANGUAGES = [
    'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin',
    'Halfling', 'Orc', 'Abyssal', 'Celestial', 'Deep Speech',
    'Draconic', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon',
  ];

  // --- State ---
  let languageSelections = $state<string[]>([]);
  let selectedTool = $state('');
  let equipmentChoice = $state<'A' | 'B'>('A');
  let checkedFixed = $state<boolean[]>([]);
  let checkedChoice = $state<boolean[]>([]);

  // Reset when dialog opens
  $effect(() => {
    if (open) {
      languageSelections = Array<string>(background.languageCount).fill('');
      selectedTool = background.toolChoices?.from[0] ?? '';
      equipmentChoice = 'A';
      checkedFixed = (background.fixedEquipment ?? []).map(() => true);
      checkedChoice = (background.equipmentChoiceA ?? []).map(() => true);
    }
  });

  function switchEquipmentChoice(c: 'A' | 'B') {
    equipmentChoice = c;
    const items = c === 'A' ? background.equipmentChoiceA : background.equipmentChoiceB;
    checkedChoice = (items ?? []).map(() => true);
  }

  // --- Derived ---
  const skillLabels = $derived(
    (background.skillProficiencies ?? []).map((s) =>
      s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
  );

  const currentChoiceItems = $derived<BackgroundEquipmentItem[]>(
    equipmentChoice === 'A' ? (background.equipmentChoiceA ?? []) : (background.equipmentChoiceB ?? []),
  );

  const hasEquipment = $derived(
    (background.fixedEquipment?.length ?? 0) > 0 ||
    (background.equipmentChoiceA?.length ?? 0) > 0,
  );

  /** Sum of all gold coming from checked equipment items. */
  const startingGold = $derived.by(() => {
    let total = 0;
    (background.fixedEquipment ?? []).forEach((item, i) => {
      if (!checkedFixed[i]) return;
      if (item.gpValue !== undefined) total += item.gpValue;
      if (item.containedGold !== undefined) total += item.containedGold;
    });
    currentChoiceItems.forEach((item, i) => {
      if (!checkedChoice[i]) return;
      if (item.gpValue !== undefined) total += item.gpValue;
      if (item.containedGold !== undefined) total += item.containedGold;
    });
    return total;
  });

  function availableLanguages(slotIndex: number): string[] {
    const selected = new Set(languageSelections.filter((l, i) => l && i !== slotIndex));
    return STANDARD_LANGUAGES.filter((l) => !selected.has(l));
  }

  const isValid = $derived(
    languageSelections.every((l) => !!l) &&
    (!background.toolChoices || !!selectedTool),
  );

  // --- Confirm ---
  function confirm() {
    const equipmentItems: { name: string; quantity: number }[] = [];
    (background.fixedEquipment ?? []).forEach((item, i) => {
      if (checkedFixed[i] && item.gpValue === undefined) {
        equipmentItems.push({ name: item.name, quantity: item.quantity });
      }
    });
    currentChoiceItems.forEach((item, i) => {
      if (checkedChoice[i] && item.gpValue === undefined) {
        equipmentItems.push({ name: item.name, quantity: item.quantity });
      }
    });

    onconfirm({
      languages: languageSelections.filter(Boolean),
      toolProficiency: selectedTool || undefined,
      equipmentItems,
      startingGold,
    });

    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md max-h-[90vh] flex flex-col gap-0 p-0">

    <!-- Header -->
    <div class="px-4 pt-4 pb-3 shrink-0">
      <Dialog.Title class="text-base font-semibold">Set Background: {background.name}</Dialog.Title>
      <p class="text-xs text-muted-foreground mt-0.5">{background.source}</p>
    </div>

    <Separator />

    <ScrollArea class="flex-1 min-h-0">
      <div class="px-4 py-3 flex flex-col gap-4 text-sm">

        <!-- Skills (read-only) -->
        {#if skillLabels.length > 0}
          <section class="flex flex-col gap-1">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skill Proficiencies</h3>
            <p class="capitalize">{skillLabels.join(', ')}</p>
            <p class="text-xs text-muted-foreground">Automatically granted.</p>
          </section>
        {/if}

        <!-- Languages -->
        {#if background.languageCount > 0}
          {#if skillLabels.length > 0}<Separator />{/if}
          <section class="flex flex-col gap-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Languages — choose {background.languageCount}
            </h3>
            <div class="flex flex-wrap gap-2">
              {#each { length: background.languageCount } as _, i}
                <select
                  class="flex-1 min-w-28 h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  bind:value={languageSelections[i]}
                >
                  <option value="">Pick a language…</option>
                  {#each availableLanguages(i) as lang}
                    <option value={lang}>{lang}</option>
                  {/each}
                </select>
              {/each}
            </div>
          </section>
        {/if}

        <!-- Tool proficiencies -->
        {#if (background.toolProficiencies?.length ?? 0) > 0 || background.toolChoices}
          <Separator />
          <section class="flex flex-col gap-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tool Proficiency</h3>
            {#if background.toolProficiencies && background.toolProficiencies.length > 0}
              <p>{background.toolProficiencies.join(', ')}</p>
            {/if}
            {#if background.toolChoices}
              <div class="flex flex-col gap-1">
                <p class="text-xs text-muted-foreground">Choose one:</p>
                <select
                  class="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  bind:value={selectedTool}
                >
                  <option value="">Pick a tool…</option>
                  {#each background.toolChoices.from as tool}
                    <option value={tool}>{tool.replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  {/each}
                </select>
              </div>
            {/if}
          </section>
        {/if}

        <!-- Starting Equipment -->
        {#if hasEquipment}
          <Separator />
          <section class="flex flex-col gap-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Starting Equipment</h3>

            <!-- A/B option selector -->
            {#if (background.equipmentChoiceA?.length ?? 0) > 0}
              <div class="flex gap-2 text-xs">
                <button
                  class="px-3 py-1 rounded border transition-colors
                    {equipmentChoice === 'A' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:text-foreground'}"
                  onclick={() => switchEquipmentChoice('A')}
                >Option A</button>
                <button
                  class="px-3 py-1 rounded border transition-colors
                    {equipmentChoice === 'B' ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border text-muted-foreground hover:text-foreground'}"
                  onclick={() => switchEquipmentChoice('B')}
                >Option B</button>
              </div>
            {/if}

            <!-- Fixed items -->
            {#if background.fixedEquipment && background.fixedEquipment.length > 0}
              <div class="flex flex-col gap-0.5">
                {#each background.fixedEquipment as item, i}
                  {#if item.gpValue !== undefined}
                    <span class="text-xs text-amber-400/80 italic pl-5">{item.name}</span>
                  {:else}
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" class="size-3.5 accent-primary" bind:checked={checkedFixed[i]} />
                      <span>{item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}</span>
                    </label>
                  {/if}
                {/each}
              </div>
            {/if}

            <!-- Choice items -->
            {#if currentChoiceItems.length > 0}
              {#if background.fixedEquipment && background.fixedEquipment.length > 0}
                <p class="text-xs text-muted-foreground">Plus one of:</p>
              {/if}
              <div class="flex flex-col gap-0.5">
                {#each currentChoiceItems as item, i}
                  {#if item.gpValue !== undefined}
                    <span class="text-xs text-amber-400/80 italic pl-5">{item.name}</span>
                  {:else}
                    <label class="flex items-center gap-2 text-xs cursor-pointer">
                      <input type="checkbox" class="size-3.5 accent-primary" bind:checked={checkedChoice[i]} />
                      <span>{item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name}</span>
                    </label>
                  {/if}
                {/each}
              </div>
            {/if}

            <!-- Starting gold summary -->
            {#if startingGold > 0}
              <p class="text-xs text-amber-400/80">
                Starting gold: <span class="font-semibold">{startingGold} gp</span> — added to currency on confirm.
              </p>
            {/if}
          </section>
        {/if}

      </div>
    </ScrollArea>

    <Separator />

    <!-- Footer -->
    <div class="flex justify-end gap-2 px-4 py-3 shrink-0">
      <Dialog.Close>
        <Button variant="outline" size="sm">Cancel</Button>
      </Dialog.Close>
      <Button size="sm" onclick={confirm} disabled={!isValid}>
        Set Background
      </Button>
    </div>

  </Dialog.Content>
</Dialog.Root>
