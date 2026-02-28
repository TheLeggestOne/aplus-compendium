<script lang="ts">
  import type {
    DndClass, Spell, AsiChoice, AbilityScore,
    CompendiumSearchResult, CompendiumEntry,
  } from '@aplus-compendium/types';
  import {
    CLASS_HIT_DICE, CLASS_ASI_LEVELS, CLASS_SUBCLASS_LEVEL,
    CLASS_SPELLCASTING_ABILITY, CLASS_CASTER_PROGRESSION,
    abilityModifier,
  } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { entryToSpell } from '$lib/utils/compendium-to-character.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
  import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
  import CheckIcon from '@lucide/svelte/icons/check';
  import DicesIcon from '@lucide/svelte/icons/dices';
  import SearchIcon from '@lucide/svelte/icons/search';
  import XIcon from '@lucide/svelte/icons/x';

  interface Props {
    open: boolean;
  }

  let { open = $bindable() }: Props = $props();

  // ---- Constants ----
  const ALL_CLASSES: DndClass[] = [
    'artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter',
    'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard',
  ];

  const ABILITIES: AbilityScore[] = [
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
  ];

  const DIE_MAX: Record<string, number> = {
    d4: 4, d6: 6, d8: 8, d10: 10, d12: 12,
  };

  // ---- Wizard state ----
  type WizardStep = 'class' | 'hp' | 'subclass' | 'asi' | 'spells' | 'summary';
  let currentStep = $state<WizardStep>('class');

  // Collected data
  let selectedClass = $state<DndClass | null>(null);
  let newClassLevel = $state(0);
  let hpGained = $state(0);
  let hpMethod = $state<'max' | 'average' | 'roll' | 'custom'>('average');
  let subclassChoice = $state<string | undefined>(undefined);
  let asiChoice = $state<AsiChoice | undefined>(undefined);
  let asiMode = $state<'asi' | 'feat'>('asi');
  let asiAbility1 = $state<AbilityScore>('strength');
  let asiAbility2 = $state<AbilityScore>('dexterity');
  let asiAmount = $state<'+2 one' | '+1 two'>('+1 two');
  let cantripsGained = $state<Spell[]>([]);
  let spellsGained = $state<Spell[]>([]);
  let spellSwapped = $state<{ removed: Spell; added: Spell } | undefined>(undefined);

  // Subclass search
  let subclassResults = $state<CompendiumSearchResult[]>([]);
  let subclassFreeText = $state('');

  // Spell search
  let spellQuery = $state('');
  let spellResults = $state<CompendiumSearchResult[]>([]);
  let spellSearching = $state(false);
  let spellTab = $state<'cantrips' | 'spells' | 'swap'>('spells');

  // Feat search
  let featQuery = $state('');
  let featResults = $state<CompendiumSearchResult[]>([]);
  let featSearching = $state(false);
  let selectedFeatName = $state('');

  // Swap state
  let swapRemovedSpell = $state<Spell | null>(null);
  let swapAddedSpell = $state<Spell | null>(null);

  // ---- Derived ----
  const { character, totalLevel, abilityModifiers } = $derived(characterStore);
  const stack = $derived(character.levelStack ?? []);
  const conMod = $derived(abilityModifiers.constitution);

  const currentClasses = $derived.by(() => {
    const map = new Map<DndClass, number>();
    for (const lv of stack) {
      map.set(lv.class, (map.get(lv.class) ?? 0) + 1);
    }
    return map;
  });

  const needsSubclass = $derived(
    selectedClass !== null && newClassLevel === CLASS_SUBCLASS_LEVEL[selectedClass],
  );

  const needsAsi = $derived(
    selectedClass !== null && CLASS_ASI_LEVELS[selectedClass].includes(newClassLevel),
  );

  const hasCasting = $derived(
    selectedClass !== null && !!CLASS_SPELLCASTING_ABILITY[selectedClass],
  );

  // Build ordered step list based on class selection
  const stepOrder = $derived.by(() => {
    const steps: WizardStep[] = ['class', 'hp'];
    if (needsSubclass) steps.push('subclass');
    if (needsAsi) steps.push('asi');
    if (hasCasting) steps.push('spells');
    steps.push('summary');
    return steps;
  });

  const currentStepIndex = $derived(stepOrder.indexOf(currentStep));
  const isFirstStep = $derived(currentStepIndex <= 0);
  const isLastStep = $derived(currentStepIndex >= stepOrder.length - 1);
  const stepLabel = $derived.by(() => {
    switch (currentStep) {
      case 'class': return 'Choose Class';
      case 'hp': return 'Hit Points';
      case 'subclass': return 'Subclass';
      case 'asi': return 'Ability Score Improvement';
      case 'spells': return 'Spells';
      case 'summary': return 'Summary';
    }
  });

  const canAdvance = $derived.by(() => {
    switch (currentStep) {
      case 'class': return selectedClass !== null;
      case 'hp': return hpGained > 0;
      case 'subclass': return !!subclassChoice;
      case 'asi': return !!asiChoice;
      case 'spells': return true; // spells are optional
      case 'summary': return true;
    }
  });

  // ---- Reset on open ----
  $effect(() => {
    if (open) resetWizard();
  });

  function resetWizard() {
    currentStep = 'class';
    selectedClass = null;
    newClassLevel = 0;
    hpGained = 0;
    hpMethod = 'average';
    subclassChoice = undefined;
    asiChoice = undefined;
    asiMode = 'asi';
    asiAbility1 = 'strength';
    asiAbility2 = 'dexterity';
    asiAmount = '+1 two';
    cantripsGained = [];
    spellsGained = [];
    spellSwapped = undefined;
    subclassResults = [];
    subclassFreeText = '';
    spellQuery = '';
    spellResults = [];
    spellTab = 'spells';
    featQuery = '';
    featResults = [];
    selectedFeatName = '';
    swapRemovedSpell = null;
    swapAddedSpell = null;
  }

  // ---- Navigation ----
  function goNext() {
    if (!canAdvance) return;
    const steps = stepOrder;
    const idx = steps.indexOf(currentStep);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1]!;
      currentStep = nextStep;
      onStepEnter(nextStep);
    }
  }

  function goBack() {
    const steps = stepOrder;
    const idx = steps.indexOf(currentStep);
    if (idx > 0) currentStep = steps[idx - 1]!;
  }

  function onStepEnter(step: WizardStep) {
    if (step === 'subclass' && selectedClass) {
      void fetchSubclasses();
    }
    if (step === 'hp') {
      computeDefaultHp();
    }
    if (step === 'asi') {
      buildAsiChoice();
    }
  }

  // ---- Step: Class ----
  function selectClass(cls: DndClass) {
    selectedClass = cls;
    const existing = currentClasses.get(cls) ?? 0;
    newClassLevel = existing + 1;
  }

  // ---- Step: HP ----
  function computeDefaultHp() {
    if (!selectedClass) return;
    const die = CLASS_HIT_DICE[selectedClass];
    const max = DIE_MAX[die] ?? 8;

    // First ever level = max + CON mod
    if (stack.length === 0 && newClassLevel === 1) {
      hpMethod = 'max';
      hpGained = max + conMod;
      return;
    }

    // Default to average
    hpMethod = 'average';
    hpGained = Math.ceil(max / 2) + 1 + conMod; // 5e average = ceil(die/2) + 1? No, average = (max/2)+1 for even dice
    // Actually 5e average is (die_max / 2) + 1 for d6=4, d8=5, d10=6, d12=7
    hpGained = Math.floor(max / 2) + 1 + conMod;
  }

  function rollHp() {
    if (!selectedClass) return;
    const die = CLASS_HIT_DICE[selectedClass];
    const max = DIE_MAX[die] ?? 8;
    const roll = Math.floor(Math.random() * max) + 1;
    hpMethod = 'roll';
    hpGained = roll + conMod;
  }

  // ---- Step: Subclass ----
  async function fetchSubclasses() {
    if (!selectedClass) return;
    const api = window.electronAPI;
    if (!api) return;
    const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
    try {
      const result = await api.compendium.getSubclasses(className);
      if (result.ok) subclassResults = result.data;
    } catch (e) {
      console.error('[level-up] getSubclasses error:', e);
    }
  }

  // ---- Step: ASI ----
  function buildAsiChoice() {
    if (asiMode === 'asi') {
      if (asiAmount === '+2 one') {
        asiChoice = { type: 'asi', increases: { [asiAbility1]: 2 } as Partial<Record<AbilityScore, 1 | 2>> };
      } else {
        const increases: Partial<Record<AbilityScore, 1 | 2>> = {};
        increases[asiAbility1] = 1;
        if (asiAbility2 !== asiAbility1) increases[asiAbility2] = 1;
        asiChoice = { type: 'asi', increases };
      }
    }
    // feat mode is set via feat selection
  }

  // Reactively rebuild ASI choice when options change
  $effect(() => {
    if (currentStep === 'asi' && asiMode === 'asi') {
      // Touch reactive dependencies
      void asiAmount;
      void asiAbility1;
      void asiAbility2;
      buildAsiChoice();
    }
  });

  // ---- Step: Spells ----
  let _spellTimer: ReturnType<typeof setTimeout> | null = null;

  function searchSpells() {
    if (_spellTimer) clearTimeout(_spellTimer);
    _spellTimer = setTimeout(() => void _executeSpellSearch(), 300);
  }

  async function _executeSpellSearch() {
    const api = window.electronAPI;
    if (!api || !selectedClass) return;

    spellSearching = true;
    const className = selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
    const filters: Record<string, unknown> = {
      classes: [className],
    };
    if (spellTab === 'cantrips') {
      filters['level'] = [0];
    } else {
      // Exclude cantrips for non-cantrip tabs
      // Don't filter level for now — let user see all available
    }

    try {
      const result = await api.compendium.search(
        spellQuery.trim(), 'spell', filters as never, 30, 0,
      );
      if (result.ok) spellResults = result.data;
    } catch (e) {
      console.error('[level-up] spell search error:', e);
    } finally {
      spellSearching = false;
    }
  }

  async function addSpellFromResult(sr: CompendiumSearchResult) {
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.get(sr.id, 'spell');
      if (!result.ok || !result.data) return;
      const spell = entryToSpell(result.data);
      if (spellTab === 'cantrips') {
        if (!cantripsGained.some(s => s.id === spell.id)) {
          cantripsGained = [...cantripsGained, spell];
        }
      } else if (spellTab === 'swap') {
        swapAddedSpell = spell;
        if (swapRemovedSpell) {
          spellSwapped = { removed: swapRemovedSpell, added: spell };
        }
      } else {
        if (!spellsGained.some(s => s.id === spell.id)) {
          spellsGained = [...spellsGained, spell];
        }
      }
    } catch (e) {
      console.error('[level-up] get spell error:', e);
    }
  }

  function removeCantrip(id: string) {
    cantripsGained = cantripsGained.filter(s => s.id !== id);
  }

  function removeSpell(id: string) {
    spellsGained = spellsGained.filter(s => s.id !== id);
  }

  function clearSwap() {
    swapRemovedSpell = null;
    swapAddedSpell = null;
    spellSwapped = undefined;
  }

  // ---- Step: Feat search ----
  let _featTimer: ReturnType<typeof setTimeout> | null = null;

  function searchFeats() {
    if (_featTimer) clearTimeout(_featTimer);
    _featTimer = setTimeout(() => void _executeFeatSearch(), 300);
  }

  async function _executeFeatSearch() {
    const api = window.electronAPI;
    if (!api) return;

    featSearching = true;
    try {
      const result = await api.compendium.search(featQuery.trim(), 'feat', {} as never, 30, 0);
      if (result.ok) featResults = result.data;
    } catch (e) {
      console.error('[level-up] feat search error:', e);
    } finally {
      featSearching = false;
    }
  }

  function selectFeat(sr: CompendiumSearchResult) {
    asiChoice = { type: 'feat', featId: sr.id, featName: sr.name };
    selectedFeatName = sr.name;
  }

  // ---- Confirm ----
  function confirmLevelUp() {
    if (!selectedClass) return;

    characterStore.addClassLevel({
      class: selectedClass,
      hpGained,
      subclassChoice,
      asiChoice,
      cantripsGained: cantripsGained.length > 0 ? cantripsGained : undefined,
      spellsGained: spellsGained.length > 0 ? spellsGained : undefined,
      spellSwapped,
    });

    open = false;
  }

  // ---- Helpers ----
  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Get current spells known for the selected class (for swap)
  const currentClassSpells = $derived.by(() => {
    if (!selectedClass || !character.classSpellcasting) return [];
    const cs = character.classSpellcasting.find(c => c.class === selectedClass);
    return cs?.spellsKnown ?? [];
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-xl max-h-[85vh] flex flex-col" showCloseButton={false}>
    <!-- Header -->
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        Level Up
        {#if selectedClass}
          <Badge variant="secondary" class="text-xs capitalize">{selectedClass}</Badge>
          <span class="text-sm font-normal text-muted-foreground">
            → Level {newClassLevel}
          </span>
        {/if}
      </Dialog.Title>
      <Dialog.Description class="text-xs text-muted-foreground">
        Step {currentStepIndex + 1} of {stepOrder.length}: {stepLabel}
      </Dialog.Description>
    </Dialog.Header>

    <!-- Step content (scrollable) -->
    <div class="flex-1 overflow-auto py-2 space-y-4 min-h-0">

      <!-- STEP: Class Selection -->
      {#if currentStep === 'class'}
        <p class="text-sm text-muted-foreground">
          Character Level {totalLevel} → {totalLevel + 1}. Choose a class:
        </p>
        <div class="grid grid-cols-2 gap-2">
          {#each ALL_CLASSES as cls}
            {@const existing = currentClasses.get(cls)}
            <button
              class="text-left px-3 py-2 rounded-md border text-sm transition-colors
                {selectedClass === cls
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted/50'}"
              onclick={() => selectClass(cls)}
            >
              <span class="font-medium capitalize">{cls}</span>
              {#if existing}
                <span class="text-xs text-muted-foreground ml-1">Lv {existing}</span>
              {:else}
                <span class="text-xs text-muted-foreground/50 ml-1">new</span>
              {/if}
            </button>
          {/each}
        </div>

      <!-- STEP: HP -->
      {:else if currentStep === 'hp'}
        {@const die = selectedClass ? CLASS_HIT_DICE[selectedClass] : 'd8'}
        {@const dieMax = DIE_MAX[die] ?? 8}
        {@const avg = Math.floor(dieMax / 2) + 1}
        {@const isFirstLevel = stack.length === 0 && newClassLevel === 1}

        <div class="space-y-4">
          <div class="text-sm">
            <span class="text-muted-foreground">Hit Die:</span>
            <span class="font-medium">{die}</span>
            <span class="text-muted-foreground ml-2">CON mod:</span>
            <span class="font-medium">{conMod >= 0 ? `+${conMod}` : conMod}</span>
          </div>

          {#if isFirstLevel}
            <div class="rounded-md border border-border p-3 bg-muted/20">
              <p class="text-sm">First level: maximum hit die ({dieMax}) + CON modifier ({conMod})</p>
              <p class="text-lg font-bold mt-1">HP: {dieMax + conMod}</p>
            </div>
          {:else}
            <div class="flex gap-2">
              <Button
                variant={hpMethod === 'average' ? 'default' : 'outline'}
                size="sm"
                class="flex-1 text-xs"
                onclick={() => { hpMethod = 'average'; hpGained = avg + conMod; }}
              >
                Average ({avg} + {conMod} = {avg + conMod})
              </Button>
              <Button
                variant={hpMethod === 'roll' ? 'default' : 'outline'}
                size="sm"
                class="flex-1 text-xs gap-1"
                onclick={rollHp}
              >
                <DicesIcon class="size-3.5" />
                Roll {die}
              </Button>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs text-muted-foreground">Custom:</span>
              <Input
                type="number"
                class="w-20 h-8 text-sm"
                value={hpGained}
                oninput={(e: Event) => { hpGained = parseInt((e.target as HTMLInputElement).value) || 0; hpMethod = 'custom'; }}
              />
            </div>
          {/if}

          <div class="rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <span class="text-sm font-semibold">HP gained this level: {hpGained}</span>
          </div>
        </div>

      <!-- STEP: Subclass -->
      {:else if currentStep === 'subclass'}
        <p class="text-sm text-muted-foreground">
          At level {newClassLevel}, choose a subclass:
        </p>

        {#if subclassResults.length > 0}
          <div class="space-y-1 max-h-64 overflow-auto">
            {#each subclassResults as sc}
              <button
                class="w-full text-left px-3 py-2 rounded-md border text-sm transition-colors
                  {subclassChoice === sc.name
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'}"
                onclick={() => subclassChoice = sc.name}
              >
                <span class="font-medium">{sc.name}</span>
                <Badge variant="outline" class="ml-2 text-[10px] px-1 py-0 h-4 opacity-60">
                  {sc.source}
                </Badge>
              </button>
            {/each}
          </div>
        {:else}
          <p class="text-xs text-muted-foreground italic">
            No subclasses found in compendium. Enter manually:
          </p>
        {/if}

        <div class="flex items-center gap-2">
          <Input
            type="text"
            class="h-8 text-sm flex-1"
            placeholder="Or type subclass name..."
            value={subclassFreeText}
            oninput={(e: Event) => {
              subclassFreeText = (e.target as HTMLInputElement).value;
              subclassChoice = subclassFreeText || undefined;
            }}
          />
        </div>

      <!-- STEP: ASI / Feat -->
      {:else if currentStep === 'asi'}
        <div class="flex gap-2 mb-4">
          <Button
            variant={asiMode === 'asi' ? 'default' : 'outline'}
            size="sm" class="text-xs"
            onclick={() => { asiMode = 'asi'; buildAsiChoice(); }}
          >
            Ability Score Increase
          </Button>
          <Button
            variant={asiMode === 'feat' ? 'default' : 'outline'}
            size="sm" class="text-xs"
            onclick={() => { asiMode = 'feat'; asiChoice = undefined; }}
          >
            Feat
          </Button>
        </div>

        {#if asiMode === 'asi'}
          <div class="space-y-3">
            <div class="flex gap-2">
              <Button
                variant={asiAmount === '+2 one' ? 'default' : 'outline'}
                size="sm" class="text-xs flex-1"
                onclick={() => asiAmount = '+2 one'}
              >
                +2 to one ability
              </Button>
              <Button
                variant={asiAmount === '+1 two' ? 'default' : 'outline'}
                size="sm" class="text-xs flex-1"
                onclick={() => asiAmount = '+1 two'}
              >
                +1 to two abilities
              </Button>
            </div>

            <!-- Ability pickers -->
            <div class="grid grid-cols-3 gap-2">
              {#each ABILITIES as ability}
                {@const score = character.abilityScores[ability]}
                {@const isSelected1 = asiAbility1 === ability}
                {@const isSelected2 = asiAmount === '+1 two' && asiAbility2 === ability}
                {@const atMax = score >= 20}
                <button
                  class="text-left px-2 py-1.5 rounded border text-xs transition-colors
                    {isSelected1 ? 'border-primary bg-primary/10' : ''}
                    {isSelected2 && !isSelected1 ? 'border-blue-500 bg-blue-500/10' : ''}
                    {!isSelected1 && !isSelected2 ? 'border-border hover:bg-muted/50' : ''}
                    {atMax ? 'opacity-50' : ''}"
                  onclick={() => {
                    if (atMax) return;
                    if (isSelected1) return;
                    if (asiAmount === '+1 two' && !isSelected1) {
                      if (asiAbility1 === ability) return;
                      asiAbility2 = ability;
                    } else {
                      asiAbility1 = ability;
                    }
                  }}
                  disabled={atMax}
                >
                  <span class="capitalize font-medium">{ability.slice(0, 3)}</span>
                  <span class="text-muted-foreground ml-1">{score}</span>
                  {#if isSelected1}
                    <span class="text-primary ml-1">+{asiAmount === '+2 one' ? 2 : 1}</span>
                  {/if}
                  {#if isSelected2 && !isSelected1}
                    <span class="text-blue-400 ml-1">+1</span>
                  {/if}
                </button>
              {/each}
            </div>

            <p class="text-xs text-muted-foreground">
              {#if asiAmount === '+2 one'}
                Click an ability to give it +2.
              {:else}
                First click = +1 (primary), second click = +1 (secondary).
              {/if}
            </p>
          </div>
        {:else}
          <!-- Feat selection -->
          <div class="space-y-3">
            <div class="relative">
              <SearchIcon class="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                class="h-8 text-sm pl-8"
                placeholder="Search feats..."
                value={featQuery}
                oninput={(e: Event) => { featQuery = (e.target as HTMLInputElement).value; searchFeats(); }}
                onfocus={() => { if (featResults.length === 0) searchFeats(); }}
              />
            </div>

            {#if selectedFeatName}
              <div class="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
                <CheckIcon class="size-3.5 text-primary" />
                <span class="font-medium">{selectedFeatName}</span>
                <button class="ml-auto text-muted-foreground hover:text-foreground" onclick={() => { asiChoice = undefined; selectedFeatName = ''; }}>
                  <XIcon class="size-3.5" />
                </button>
              </div>
            {/if}

            <div class="space-y-1 max-h-48 overflow-auto">
              {#each featResults as feat}
                <button
                  class="w-full text-left px-3 py-1.5 rounded border border-border text-xs hover:bg-muted/50 transition-colors"
                  onclick={() => selectFeat(feat)}
                >
                  <span class="font-medium">{feat.name}</span>
                  <Badge variant="outline" class="ml-2 text-[10px] px-1 py-0 h-4 opacity-60">
                    {feat.source}
                  </Badge>
                  {#if feat.prerequisite}
                    <span class="text-muted-foreground/60 ml-2">{feat.prerequisite}</span>
                  {/if}
                </button>
              {/each}
              {#if featSearching}
                <p class="text-xs text-muted-foreground text-center py-2">Searching...</p>
              {/if}
            </div>
          </div>
        {/if}

      <!-- STEP: Spells -->
      {:else if currentStep === 'spells'}
        <div class="space-y-3">
          <!-- Tabs -->
          <div class="flex gap-1 border-b border-border">
            <button
              class="px-3 py-1.5 text-xs font-medium border-b-2 transition-colors
                {spellTab === 'cantrips' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
              onclick={() => { spellTab = 'cantrips'; spellQuery = ''; spellResults = []; }}
            >
              Cantrips
              {#if cantripsGained.length > 0}
                <Badge variant="secondary" class="ml-1 text-[10px] px-1 py-0 h-4">{cantripsGained.length}</Badge>
              {/if}
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium border-b-2 transition-colors
                {spellTab === 'spells' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
              onclick={() => { spellTab = 'spells'; spellQuery = ''; spellResults = []; }}
            >
              Spells
              {#if spellsGained.length > 0}
                <Badge variant="secondary" class="ml-1 text-[10px] px-1 py-0 h-4">{spellsGained.length}</Badge>
              {/if}
            </button>
            <button
              class="px-3 py-1.5 text-xs font-medium border-b-2 transition-colors
                {spellTab === 'swap' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}"
              onclick={() => { spellTab = 'swap'; spellQuery = ''; spellResults = []; }}
            >
              Swap
              {#if spellSwapped}
                <Badge variant="secondary" class="ml-1 text-[10px] px-1 py-0 h-4">1</Badge>
              {/if}
            </button>
          </div>

          {#if spellTab === 'swap'}
            <!-- Swap mode -->
            <div class="space-y-3">
              <p class="text-xs text-muted-foreground">
                Optionally swap one known spell for a different one of the same class.
              </p>

              <!-- Remove spell -->
              <div>
                <p class="text-xs font-medium text-muted-foreground mb-1">Remove:</p>
                {#if currentClassSpells.length === 0}
                  <p class="text-xs text-muted-foreground/60 italic">No known spells to swap.</p>
                {:else}
                  <div class="space-y-0.5 max-h-32 overflow-auto">
                    {#each currentClassSpells as spell}
                      <button
                        class="w-full text-left px-2 py-1 rounded text-xs transition-colors
                          {swapRemovedSpell?.id === spell.id ? 'bg-destructive/10 border border-destructive/30' : 'hover:bg-muted/50'}"
                        onclick={() => {
                          swapRemovedSpell = spell;
                          if (swapAddedSpell) spellSwapped = { removed: spell, added: swapAddedSpell };
                        }}
                      >
                        {spell.name}
                        <span class="text-muted-foreground/60 ml-1">Lv {spell.level}</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>

              {#if swapRemovedSpell}
                <Separator />
                <!-- Add replacement -->
                <div>
                  <p class="text-xs font-medium text-muted-foreground mb-1">Replace with:</p>
                  <div class="relative mb-2">
                    <SearchIcon class="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
                    <Input
                      type="text"
                      class="h-8 text-sm pl-8"
                      placeholder="Search for replacement..."
                      value={spellQuery}
                      oninput={(e: Event) => { spellQuery = (e.target as HTMLInputElement).value; searchSpells(); }}
                      onfocus={() => { if (spellResults.length === 0) searchSpells(); }}
                    />
                  </div>

                  {#if swapAddedSpell}
                    <div class="flex items-center gap-2 rounded border border-primary/30 bg-primary/5 px-2 py-1 text-xs mb-2">
                      <CheckIcon class="size-3 text-primary" />
                      <span>{swapAddedSpell.name}</span>
                      <button class="ml-auto" onclick={clearSwap}>
                        <XIcon class="size-3 text-muted-foreground" />
                      </button>
                    </div>
                  {/if}

                  <div class="space-y-0.5 max-h-32 overflow-auto">
                    {#each spellResults as sr}
                      {#if sr.level !== 0}
                        <button
                          class="w-full text-left px-2 py-1 rounded text-xs hover:bg-muted/50 transition-colors"
                          onclick={() => addSpellFromResult(sr)}
                        >
                          {sr.name}
                          <span class="text-muted-foreground/60 ml-1">Lv {sr.level}</span>
                          <Badge variant="outline" class="ml-1 text-[10px] px-1 py-0 h-3.5 opacity-50">{sr.source}</Badge>
                        </button>
                      {/if}
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <!-- Cantrips or Spells search -->
            <div class="relative">
              <SearchIcon class="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                class="h-8 text-sm pl-8"
                placeholder="Search {spellTab === 'cantrips' ? 'cantrips' : 'spells'}..."
                value={spellQuery}
                oninput={(e: Event) => { spellQuery = (e.target as HTMLInputElement).value; searchSpells(); }}
                onfocus={() => { if (spellResults.length === 0) searchSpells(); }}
              />
            </div>

            <!-- Selected list -->
            {@const selected = spellTab === 'cantrips' ? cantripsGained : spellsGained}
            {#if selected.length > 0}
              <div class="flex flex-wrap gap-1">
                {#each selected as spell}
                  <Badge variant="secondary" class="text-xs gap-1 pr-1">
                    {spell.name}
                    <button
                      class="hover:text-destructive transition-colors"
                      onclick={() => spellTab === 'cantrips' ? removeCantrip(spell.id) : removeSpell(spell.id)}
                    >
                      <XIcon class="size-3" />
                    </button>
                  </Badge>
                {/each}
              </div>
            {/if}

            <!-- Search results -->
            <div class="space-y-0.5 max-h-40 overflow-auto">
              {#each spellResults as sr}
                {@const isCantrip = sr.level === 0}
                {#if spellTab === 'cantrips' ? isCantrip : !isCantrip}
                  {@const alreadyAdded = selected.some(s => s.id === sr.id)}
                  <button
                    class="w-full text-left px-2 py-1 rounded text-xs transition-colors
                      {alreadyAdded ? 'opacity-40' : 'hover:bg-muted/50'}"
                    onclick={() => { if (!alreadyAdded) addSpellFromResult(sr); }}
                    disabled={alreadyAdded}
                  >
                    {sr.name}
                    {#if !isCantrip}
                      <span class="text-muted-foreground/60 ml-1">Lv {sr.level}</span>
                    {/if}
                    <Badge variant="outline" class="ml-1 text-[10px] px-1 py-0 h-3.5 opacity-50">{sr.source}</Badge>
                    {#if sr.concentration}
                      <span class="text-amber-400/60 ml-1">C</span>
                    {/if}
                    {#if sr.ritual}
                      <span class="text-blue-400/60 ml-1">R</span>
                    {/if}
                  </button>
                {/if}
              {/each}
              {#if spellSearching}
                <p class="text-xs text-muted-foreground text-center py-2">Searching...</p>
              {/if}
            </div>
          {/if}
        </div>

      <!-- STEP: Summary -->
      {:else if currentStep === 'summary'}
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div class="text-muted-foreground">Class</div>
            <div class="font-medium capitalize">{selectedClass} → Level {newClassLevel}</div>

            <div class="text-muted-foreground">HP Gained</div>
            <div class="font-medium">{hpGained}</div>

            {#if subclassChoice}
              <div class="text-muted-foreground">Subclass</div>
              <div class="font-medium">{subclassChoice}</div>
            {/if}

            {#if asiChoice}
              <div class="text-muted-foreground">ASI / Feat</div>
              <div class="font-medium">
                {#if asiChoice.type === 'asi'}
                  {Object.entries(asiChoice.increases).map(([a, v]) => `+${v} ${capitalize(a)}`).join(', ')}
                {:else}
                  Feat: {asiChoice.featName}
                {/if}
              </div>
            {/if}

            {#if cantripsGained.length > 0}
              <div class="text-muted-foreground">Cantrips</div>
              <div>{cantripsGained.map(s => s.name).join(', ')}</div>
            {/if}

            {#if spellsGained.length > 0}
              <div class="text-muted-foreground">Spells</div>
              <div>{spellsGained.map(s => s.name).join(', ')}</div>
            {/if}

            {#if spellSwapped}
              <div class="text-muted-foreground">Swap</div>
              <div>{spellSwapped.removed.name} → {spellSwapped.added.name}</div>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer navigation -->
    <Dialog.Footer class="flex justify-between border-t border-border pt-3 mt-2">
      <div>
        {#if !isFirstStep}
          <Button variant="ghost" size="sm" class="gap-1 text-xs" onclick={goBack}>
            <ChevronLeftIcon class="size-3.5" />
            Back
          </Button>
        {/if}
      </div>
      <div class="flex gap-2">
        <Dialog.Close>
          <Button variant="outline" size="sm" class="text-xs">Cancel</Button>
        </Dialog.Close>
        {#if currentStep === 'summary'}
          <Button size="sm" class="text-xs gap-1" onclick={confirmLevelUp}>
            <CheckIcon class="size-3.5" />
            Confirm Level Up
          </Button>
        {:else}
          <Button size="sm" class="text-xs gap-1" onclick={goNext} disabled={!canAdvance}>
            Next
            <ChevronRightIcon class="size-3.5" />
          </Button>
        {/if}
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
