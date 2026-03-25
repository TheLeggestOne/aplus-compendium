<script lang="ts">
  import type {
    DndClass, AsiChoice, AbilityScore, SkillName,
    CompendiumSearchResult, Feature,
  } from '@aplus-compendium/types';
  import { classFeatureEntryToFeature, entryToFeature } from '$lib/utils/compendium-to-character.js';
  import { extractProficiencyList, extractMulticlassProficiencyList } from '$lib/utils/class-page-helpers.js';
  import {
    CLASS_HIT_DICE, CLASS_ASI_LEVELS, CLASS_SUBCLASS_LEVEL, CLASS_SKILL_CHOICES, MULTICLASS_SKILL_CHOICES, SKILL_NAMES,
  } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
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
  type WizardStep = 'class' | 'hp' | 'skills' | 'subclass' | 'asi' | 'summary';
  let currentStep = $state<WizardStep>('class');

  // Collected data
  let selectedClass = $state<DndClass | null>(null);
  let newClassLevel = $state(0);
  let hpRoll = $state(0);
  let hpMethod = $state<'max' | 'average' | 'roll' | 'custom'>('average');
  let subclassChoice = $state<string | undefined>(undefined);
  let asiChoice = $state<AsiChoice | undefined>(undefined);
  let asiMode = $state<'asi' | 'feat'>('asi');
  let asiAbility1 = $state<AbilityScore>('strength');
  let asiAbility2 = $state<AbilityScore>('dexterity');
  let asiAmount = $state<'+2 one' | '+1 two'>('+1 two');
  // Subclass search
  let subclassResults = $state<CompendiumSearchResult[]>([]);
  let subclassFreeText = $state('');

  // Feat search
  let featQuery = $state('');
  let featResults = $state<CompendiumSearchResult[]>([]);
  let featSearching = $state(false);
  let selectedFeatName = $state('');

  // Skill selection state
  let skillSelections = $state<SkillName[]>([]);

  // ---- Derived ----
  const { character, totalLevel, abilityModifiers } = $derived(characterStore);
  const stack = $derived(character.levelStack ?? []);
  const conMod = $derived(abilityModifiers.constitution);
  const hpGained = $derived(Math.max(1, hpRoll + conMod));

  const currentClasses = $derived.by(() => {
    const map = new Map<DndClass, number>();
    for (const lv of stack) {
      map.set(lv.class, (map.get(lv.class) ?? 0) + 1);
    }
    return map;
  });

  // First class ever or multiclassing into a new class that grants skills
  const isFirstClassEver = $derived(stack.length === 0);
  const isMulticlassNew = $derived(
    selectedClass !== null && !isFirstClassEver && !currentClasses.has(selectedClass),
  );
  const needsSkills = $derived(
    selectedClass !== null && (isFirstClassEver || (isMulticlassNew && !!MULTICLASS_SKILL_CHOICES[selectedClass])),
  );

  const skillChoiceData = $derived.by(() => {
    if (!selectedClass) return { count: 0, choices: [] as SkillName[] };
    if (isFirstClassEver) return CLASS_SKILL_CHOICES[selectedClass];
    return MULTICLASS_SKILL_CHOICES[selectedClass] ?? { count: 0, choices: [] as SkillName[] };
  });

  const needsSubclass = $derived(
    selectedClass !== null && newClassLevel === CLASS_SUBCLASS_LEVEL[selectedClass],
  );

  const needsAsi = $derived(
    selectedClass !== null && CLASS_ASI_LEVELS[selectedClass].includes(newClassLevel),
  );

  // Build ordered step list based on class selection
  const stepOrder = $derived.by(() => {
    const steps: WizardStep[] = ['class', 'hp'];
    if (needsSkills) steps.push('skills');
    if (needsSubclass) steps.push('subclass');
    if (needsAsi) steps.push('asi');
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
      case 'skills': return 'Skill Proficiencies';
      case 'subclass': return 'Subclass';
      case 'asi': return 'Ability Score Improvement';
      case 'summary': return 'Summary';
    }
  });

  const canAdvance = $derived.by(() => {
    switch (currentStep) {
      case 'class': return selectedClass !== null;
      case 'hp': return hpRoll > 0;
      case 'skills': return skillSelections.length >= skillChoiceData.count;
      case 'subclass': return !!subclassChoice;
      case 'asi': return !!asiChoice;
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
    hpRoll = 0;
    hpMethod = 'average';
    subclassChoice = undefined;
    asiChoice = undefined;
    asiMode = 'asi';
    asiAbility1 = 'strength';
    asiAbility2 = 'dexterity';
    asiAmount = '+1 two';
    subclassResults = [];
    subclassFreeText = '';
    featQuery = '';
    featResults = [];
    selectedFeatName = '';
    skillSelections = [];
    summaryFeaturesPromise = null;
    summaryFeaturesLoading = false;
    raceSpellsPromise = null;
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
    if (step === 'summary') {
      summaryFeaturesLoading = true;
      const p = fetchFeaturesForSummary();
      summaryFeaturesPromise = p;
      p.then(() => { summaryFeaturesLoading = false; }, () => { summaryFeaturesLoading = false; });

      // Preview race spell grants at the new total level
      if (character.race && window.electronAPI) {
        const newTotalLevel = totalLevel + 1;
        raceSpellsPromise = window.electronAPI.compendium
          .getRaceSpellGrants(character.race, character.subrace, newTotalLevel, true)
          .then((r) => r.ok ? r.data : [])
          .catch(() => []);
      }
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

    // First ever level = max die
    if (stack.length === 0 && newClassLevel === 1) {
      hpMethod = 'max';
      hpRoll = max;
      return;
    }

    // Default to average: (die_max / 2) + 1 for d6=4, d8=5, d10=6, d12=7
    hpMethod = 'average';
    hpRoll = Math.floor(max / 2) + 1;
  }

  function rollHp() {
    if (!selectedClass) return;
    const die = CLASS_HIT_DICE[selectedClass];
    const max = DIE_MAX[die] ?? 8;
    const roll = Math.floor(Math.random() * max) + 1;
    hpMethod = 'roll';
    hpRoll = roll;
  }

  // ---- Step: Skills ----
  function titleCase(s: string) {
    return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function setSkillSlot(slotIndex: number, value: string) {
    const updated = [...skillSelections];
    if (value) {
      updated[slotIndex] = value as SkillName;
    } else {
      updated[slotIndex] = undefined as unknown as SkillName;
    }
    skillSelections = updated.filter(Boolean);
  }

  function skillOptionsForSlot(slotIndex: number): SkillName[] {
    const pool = skillChoiceData.choices.length > 0 ? skillChoiceData.choices : SKILL_NAMES;
    const otherSelected = new Set(skillSelections.filter((_, i) => i !== slotIndex));
    return pool.filter((s) => !otherSelected.has(s));
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

  // ---- Summary: pre-fetched features ----
  // Use a Promise stored in state so {#await} in the template handles pending/resolved/rejected
  // cleanly without relying on $state mutations from async callbacks.
  let summaryFeaturesPromise = $state<Promise<Feature[]> | null>(null);
  let summaryFeaturesLoading = $state(false);
  let raceSpellsPromise = $state<Promise<import('@aplus-compendium/types').Spell[]> | null>(null);

  async function fetchFeaturesForSummary(): Promise<Feature[]> {
    const cls = selectedClass;
    if (!cls) return [];
    const api = window.electronAPI;
    if (!api) return [];

    try {
      const existingSubclass = stack
        .filter((lv) => lv.class === cls)
        .find((lv) => lv.subclassChoice)?.subclassChoice;
      const effectiveSubclass = subclassChoice ?? existingSubclass;
      const className = capitalize(cls);

      const result = await api.compendium.getClassFeatures(className, newClassLevel, effectiveSubclass);

      if (result.ok) {
        return result.data.map((f) => classFeatureEntryToFeature(f, cls, newClassLevel));
      }
    } catch (e) {
      console.warn('[level-up] Failed to fetch features for summary:', e);
    }
    return [];
  }

  // ---- Confirm ----
  let confirming = $state(false);

  async function confirmLevelUp() {
    const cls = selectedClass;
    if (!cls || confirming || summaryFeaturesLoading) return;

    const features = summaryFeaturesPromise ? await summaryFeaturesPromise : [];

    confirming = true;
    try {
      const newTotalLevel = totalLevel + 1;

      // Fetch class proficiencies from compendium for first class or multiclass
      let proficiencies: string[] | undefined;
      if (isFirstClassEver || isMulticlassNew) {
        const api = window.electronAPI;
        if (api) {
          try {
            const className = capitalize(cls);
            // Try PHB first, then XPHB
            let result = await api.compendium.get(`${className}|PHB`, 'class');
            if (!result.ok) result = await api.compendium.get(`${className}|XPHB`, 'class');
            if (result.ok && result.data?.raw) {
              const raw = result.data.raw as Record<string, unknown>;
              proficiencies = isFirstClassEver
                ? extractProficiencyList(raw)
                : extractMulticlassProficiencyList(raw);
            }
          } catch (e) {
            console.warn('[level-up] Failed to fetch class proficiencies:', e);
          }
        }
      }

      // Fetch full feat data from compendium if a feat was chosen at the ASI level
      let asiFeatFeature: Feature | undefined;
      if (asiChoice?.type === 'feat') {
        const api = window.electronAPI;
        if (api) {
          try {
            const result = await api.compendium.get(asiChoice.featId, 'feat');
            if (result.ok && result.data) asiFeatFeature = entryToFeature(result.data);
          } catch (e) {
            console.warn('[level-up] Failed to fetch feat data:', e);
          }
        }
      }

      characterStore.addClassLevel({
        class: cls,
        hpRoll,
        subclassChoice,
        asiChoice,
        asiFeatFeature,
        features,
        skillSelections: skillSelections.length > 0 ? skillSelections : undefined,
        proficiencies,
      });
      await characterStore.addRaceSpellGrantsForLevel(newTotalLevel);

      open = false;
    } finally {
      confirming = false;
    }
  }

  // ---- Helpers ----
  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
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
              <p class="text-sm">First level: maximum hit die ({dieMax}) + CON modifier ({conMod >= 0 ? `+${conMod}` : conMod})</p>
              <p class="text-lg font-bold mt-1">HP: {hpGained}</p>
            </div>
          {:else}
            <div class="flex gap-2">
              <Button
                variant={hpMethod === 'average' ? 'default' : 'outline'}
                size="sm"
                class="flex-1 text-xs"
                onclick={() => { hpMethod = 'average'; hpRoll = avg; }}
              >
                Average ({avg} + {conMod >= 0 ? `+${conMod}` : conMod} = {Math.max(1, avg + conMod)})
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
              <span class="text-xs text-muted-foreground">Custom roll:</span>
              <Input
                type="number"
                class="w-20 h-8 text-sm"
                value={hpRoll}
                oninput={(e: Event) => { hpRoll = parseInt((e.target as HTMLInputElement).value) || 0; hpMethod = 'custom'; }}
              />
              <span class="text-xs text-muted-foreground">+ {conMod >= 0 ? `+${conMod}` : conMod} CON = {hpGained}</span>
            </div>
          {/if}

          <div class="rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
            <span class="text-sm font-semibold">HP gained this level: {hpGained}</span>
          </div>
        </div>

      <!-- STEP: Skills -->
      {:else if currentStep === 'skills'}
        {@const { count, choices } = skillChoiceData}
        <p class="text-sm text-muted-foreground">
          Choose {count} skill proficienc{count === 1 ? 'y' : 'ies'} for your {selectedClass}:
        </p>
        <div class="space-y-2">
          {#each { length: count } as _, i}
            {@const options = skillOptionsForSlot(i)}
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground w-12 shrink-0 tabular-nums">Skill {i + 1}</span>
              <select
                class="flex-1 h-8 rounded border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={skillSelections[i] ?? ''}
                onchange={(e) => setSkillSlot(i, (e.currentTarget as HTMLSelectElement).value)}
              >
                <option value="">— choose —</option>
                {#each options as skill}
                  <option value={skill} selected={skillSelections[i] === skill}>{titleCase(skill)}</option>
                {/each}
              </select>
            </div>
          {/each}
        </div>
        {#if choices.length > 0}
          <p class="text-xs text-muted-foreground">
            Available from: {choices.map(titleCase).join(', ')}
          </p>
        {:else}
          <p class="text-xs text-muted-foreground">
            Any skill is available.
          </p>
        {/if}

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

      <!-- STEP: Summary -->
      {:else if currentStep === 'summary'}
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div class="text-muted-foreground">Class</div>
            <div class="font-medium capitalize">{selectedClass} → Level {newClassLevel}</div>

            <div class="text-muted-foreground">HP Gained</div>
            <div class="font-medium">{hpGained}</div>

            {#if skillSelections.length > 0}
              <div class="text-muted-foreground">Skill Proficiencies</div>
              <div class="font-medium">{skillSelections.map(titleCase).join(', ')}</div>
            {/if}

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

            {#if summaryFeaturesPromise}
              {#await summaryFeaturesPromise}
                <div class="col-span-2 text-xs text-muted-foreground italic">Loading features…</div>
              {:then features}
                {@const grantedLangs = features.flatMap((f) => f.grantedLanguages ?? [])}
                {@const grantedSpells = features.flatMap((f) => f.grantedSpells ?? [])}
                {#if grantedLangs.length > 0}
                  <div class="text-muted-foreground">Languages Granted</div>
                  <div class="font-medium">{grantedLangs.join(', ')}</div>
                {/if}
                {#if grantedSpells.length > 0}
                  <div class="text-muted-foreground">Spells Granted</div>
                  <div class="font-medium">{grantedSpells.map((s) => s.name).join(', ')}</div>
                {/if}
              {:catch}
                <!-- silently ignore fetch errors in preview -->
              {/await}
            {/if}

            {#if raceSpellsPromise}
              {#await raceSpellsPromise then raceSpells}
                {#if raceSpells.length > 0}
                  <div class="text-muted-foreground">Race Spells Unlocked</div>
                  <div class="font-medium">{raceSpells.map((s) => s.name).join(', ')}</div>
                {/if}
              {/await}
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
          <Button size="sm" class="text-xs gap-1" onclick={confirmLevelUp} disabled={confirming || summaryFeaturesLoading}>
            <CheckIcon class="size-3.5" />
            {confirming ? 'Leveling up…' : 'Confirm Level Up'}
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
