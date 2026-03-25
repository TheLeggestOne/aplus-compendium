<script lang="ts">
  import type {
    DndClass, AsiChoice, AbilityScore, SkillName, ClassLevel,
    CompendiumSearchResult, Feature,
  } from '@aplus-compendium/types';
  import {
    CLASS_HIT_DICE, CLASS_ASI_LEVELS, CLASS_SUBCLASS_LEVEL,
    CLASS_SKILL_CHOICES, MULTICLASS_SKILL_CHOICES, SKILL_NAMES,
  } from '@aplus-compendium/types';
  import { entryToFeature } from '$lib/utils/compendium-to-character.js';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import DicesIcon from '@lucide/svelte/icons/dices';
  import CheckIcon from '@lucide/svelte/icons/check';
  import SearchIcon from '@lucide/svelte/icons/search';
  import XIcon from '@lucide/svelte/icons/x';

  interface Props {
    open: boolean;
    /** Index into character.levelStack */
    stackIndex: number;
  }

  let { open = $bindable(), stackIndex }: Props = $props();

  const ABILITIES: AbilityScore[] = [
    'strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma',
  ];

  const DIE_MAX: Record<string, number> = {
    d4: 4, d6: 6, d8: 8, d10: 10, d12: 12,
  };

  // ---- Derived from store ----
  const { character, abilityModifiers } = $derived(characterStore);
  const stack = $derived(character.levelStack ?? []);
  const conMod = $derived(abilityModifiers.constitution);
  const level = $derived<ClassLevel | undefined>(stack[stackIndex]);

  // ---- Editable state ----
  let hpRoll = $state(0);
  let hpMethod = $state<'max' | 'average' | 'roll' | 'custom'>('custom');
  let subclassChoice = $state<string | undefined>(undefined);
  let subclassFreeText = $state('');
  let subclassResults = $state<CompendiumSearchResult[]>([]);
  let asiMode = $state<'asi' | 'feat'>('asi');
  let asiChoice = $state<AsiChoice | undefined>(undefined);
  let asiAbility1 = $state<AbilityScore>('strength');
  let asiAbility2 = $state<AbilityScore>('dexterity');
  let asiAmount = $state<'+2 one' | '+1 two'>('+1 two');
  let featQuery = $state('');
  let featResults = $state<CompendiumSearchResult[]>([]);
  let featSearching = $state(false);
  let selectedFeatName = $state('');
  let skillSelections = $state<SkillName[]>([]);

  // ---- Derived context ----
  const dndClass = $derived(level?.class);
  const classLevel = $derived(level?.classLevel ?? 0);
  const overallLevel = $derived(stackIndex + 1);
  const isFirstLevel = $derived(stackIndex === 0);
  const die = $derived(dndClass ? CLASS_HIT_DICE[dndClass] : 'd8');
  const dieMax = $derived(DIE_MAX[die] ?? 8);

  const hasSubclass = $derived(
    dndClass !== null && dndClass !== undefined && classLevel === CLASS_SUBCLASS_LEVEL[dndClass!],
  );

  const hasAsi = $derived(
    dndClass !== null && dndClass !== undefined && CLASS_ASI_LEVELS[dndClass!].includes(classLevel),
  );

  // Skill grant: first class ever or multiclass new class
  const hasSkillGrant = $derived.by(() => {
    if (!dndClass) return false;
    if (stackIndex === 0) return true; // first class ever
    // Check if this is the first level of this class (multiclass)
    if (classLevel === 1 && stackIndex > 0) {
      return !!MULTICLASS_SKILL_CHOICES[dndClass];
    }
    return false;
  });

  const skillChoiceData = $derived.by(() => {
    if (!dndClass) return { count: 0, choices: [] as SkillName[] };
    if (stackIndex === 0) return CLASS_SKILL_CHOICES[dndClass];
    return MULTICLASS_SKILL_CHOICES[dndClass] ?? { count: 0, choices: [] as SkillName[] };
  });

  const hpGained = $derived(Math.max(1, hpRoll + conMod));
  const avg = $derived(Math.floor(dieMax / 2) + 1);

  // ---- Initialize from existing level when dialog opens ----
  $effect(() => {
    if (open && level) {
      hpRoll = level.hpRoll;
      hpMethod = 'custom';
      subclassChoice = level.subclassChoice;
      subclassFreeText = level.subclassChoice ?? '';
      asiChoice = level.asiChoice ? { ...level.asiChoice } : undefined;
      if (level.asiChoice?.type === 'asi') {
        asiMode = 'asi';
        const entries = Object.entries(level.asiChoice.increases) as [AbilityScore, number][];
        if (entries.length === 1 && entries[0]![1] === 2) {
          asiAmount = '+2 one';
          asiAbility1 = entries[0]![0];
        } else {
          asiAmount = '+1 two';
          asiAbility1 = entries[0]?.[0] ?? 'strength';
          asiAbility2 = entries[1]?.[0] ?? 'dexterity';
        }
      } else if (level.asiChoice?.type === 'feat') {
        asiMode = 'feat';
        selectedFeatName = level.asiChoice.featName ?? '';
      } else {
        asiMode = 'asi';
        selectedFeatName = '';
      }
      // Load existing skill selections from grant
      if (hasSkillGrant && dndClass) {
        const grant = character.skillProficiencyGrants?.find((g) => g.id === `class-${dndClass}`);
        skillSelections = grant?.selected ? [...grant.selected] : [];
      } else {
        skillSelections = [];
      }
      // Fetch subclasses if this level has a subclass slot
      if (hasSubclass && dndClass) void fetchSubclasses();
    }
  });

  // ---- Helpers ----
  function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function titleCase(s: string) {
    return s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // ---- HP ----
  function rollHp() {
    const roll = Math.floor(Math.random() * dieMax) + 1;
    hpMethod = 'roll';
    hpRoll = roll;
  }

  // ---- Subclass ----
  async function fetchSubclasses() {
    if (!dndClass) return;
    const api = window.electronAPI;
    if (!api) return;
    try {
      const result = await api.compendium.getSubclasses(capitalize(dndClass));
      if (result.ok) subclassResults = result.data;
    } catch (e) {
      console.error('[edit-level] getSubclasses error:', e);
    }
  }

  // ---- ASI ----
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
  }

  $effect(() => {
    if (open && hasAsi && asiMode === 'asi') {
      void asiAmount;
      void asiAbility1;
      void asiAbility2;
      buildAsiChoice();
    }
  });

  // ---- Feat search ----
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
      console.error('[edit-level] feat search error:', e);
    } finally {
      featSearching = false;
    }
  }

  function selectFeat(sr: CompendiumSearchResult) {
    asiChoice = { type: 'feat', featId: sr.id, featName: sr.name };
    selectedFeatName = sr.name;
  }

  // ---- Skills ----
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

  // ---- Save ----
  let saving = $state(false);

  async function save() {
    if (!level || saving) return;
    saving = true;
    try {
      // Fetch full feat data from compendium if a feat was chosen at the ASI level
      let asiFeatFeature: Feature | undefined;
      const effectiveAsi = hasAsi ? (asiChoice ?? null) : undefined;
      if (effectiveAsi?.type === 'feat') {
        const api = window.electronAPI;
        if (api) {
          try {
            const result = await api.compendium.get(effectiveAsi.featId, 'feat');
            if (result.ok && result.data) asiFeatFeature = entryToFeature(result.data);
          } catch (e) {
            console.warn('[edit-level] Failed to fetch feat data:', e);
          }
        }
      }

      characterStore.updateLevelChoices(stackIndex, {
        hpRoll,
        subclassChoice: hasSubclass ? (subclassChoice ?? null) : undefined,
        asiChoice: effectiveAsi,
        asiFeatFeature,
        skillSelections: hasSkillGrant ? skillSelections : undefined,
      });

      open = false;
    } finally {
      saving = false;
    }
  }
</script>

{#if level}
<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-lg max-h-[85vh] flex flex-col" showCloseButton={false}>
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        Edit Level {overallLevel}
        <Badge variant="secondary" class="text-xs capitalize">{level.class} {classLevel}</Badge>
      </Dialog.Title>
      <Dialog.Description class="text-xs text-muted-foreground">
        Change choices made at this level.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex-1 overflow-auto py-2 space-y-5 min-h-0">

      <!-- HP -->
      <div class="space-y-2">
        <h3 class="text-sm font-medium">Hit Points</h3>

        {#if isFirstLevel}
          <div class="rounded-md border border-border p-3 bg-muted/20">
            <p class="text-sm">First level: maximum hit die ({dieMax}) + CON modifier ({conMod >= 0 ? `+${conMod}` : conMod})</p>
            <p class="text-lg font-bold mt-1">HP: {hpGained}</p>
          </div>
        {:else}
          <div class="flex gap-2">
            <Button
              variant={hpMethod === 'average' ? 'default' : 'outline'}
              size="sm" class="text-xs flex-1"
              onclick={() => { hpMethod = 'average'; hpRoll = avg; }}
            >
              Average ({avg})
            </Button>
            <Button
              variant={hpMethod === 'roll' ? 'default' : 'outline'}
              size="sm" class="text-xs flex-1 gap-1"
              onclick={rollHp}
            >
              <DicesIcon class="size-3.5" />
              Roll {die}
            </Button>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-muted-foreground">Die result:</span>
            <Input
              type="number"
              class="w-20 h-8 text-sm"
              value={hpRoll}
              oninput={(e: Event) => { hpRoll = parseInt((e.target as HTMLInputElement).value) || 0; hpMethod = 'custom'; }}
            />
            <span class="text-xs text-muted-foreground">+ CON ({conMod >= 0 ? `+${conMod}` : conMod}) = {hpGained} HP</span>
          </div>
        {/if}
      </div>

      <!-- Skill Proficiencies -->
      {#if hasSkillGrant}
        {@const { count, choices } = skillChoiceData}
        <div class="space-y-2">
          <h3 class="text-sm font-medium">Skill Proficiencies</h3>
          <div class="space-y-1.5">
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
            <p class="text-xs text-muted-foreground">Any skill is available.</p>
          {/if}
        </div>
      {/if}

      <!-- Subclass -->
      {#if hasSubclass}
        <div class="space-y-2">
          <h3 class="text-sm font-medium">Subclass</h3>
          {#if subclassResults.length > 0}
            <div class="space-y-1 max-h-48 overflow-auto">
              {#each subclassResults as sc}
                <button
                  class="w-full text-left px-3 py-1.5 rounded-md border text-sm transition-colors
                    {subclassChoice === sc.name
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'}"
                  onclick={() => { subclassChoice = sc.name; subclassFreeText = sc.name; }}
                >
                  <span class="font-medium">{sc.name}</span>
                  <Badge variant="outline" class="ml-2 text-[10px] px-1 py-0 h-4 opacity-60">
                    {sc.source}
                  </Badge>
                </button>
              {/each}
            </div>
          {/if}
          <Input
            type="text"
            class="h-8 text-sm"
            placeholder="Or type subclass name..."
            value={subclassFreeText}
            oninput={(e: Event) => {
              subclassFreeText = (e.target as HTMLInputElement).value;
              subclassChoice = subclassFreeText || undefined;
            }}
          />
        </div>
      {/if}

      <!-- ASI / Feat -->
      {#if hasAsi}
        <div class="space-y-3">
          <h3 class="text-sm font-medium">Ability Score Improvement</h3>
          <div class="flex gap-2">
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
              <div class="grid grid-cols-3 gap-2">
                {#each ABILITIES as ability}
                  {@const score = character.abilityScores[ability]}
                  {@const isSelected1 = asiAbility1 === ability}
                  {@const isSelected2 = asiAmount === '+1 two' && asiAbility2 === ability}
                  <button
                    class="text-left px-2 py-1.5 rounded border text-xs transition-colors
                      {isSelected1 ? 'border-primary bg-primary/10' : ''}
                      {isSelected2 && !isSelected1 ? 'border-blue-500 bg-blue-500/10' : ''}
                      {!isSelected1 && !isSelected2 ? 'border-border hover:bg-muted/50' : ''}"
                    onclick={() => {
                      if (isSelected1) return;
                      if (asiAmount === '+1 two' && !isSelected1) {
                        if (asiAbility1 === ability) return;
                        asiAbility2 = ability;
                      } else {
                        asiAbility1 = ability;
                      }
                    }}
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
            </div>
          {:else}
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
                  </button>
                {/each}
                {#if featSearching}
                  <p class="text-xs text-muted-foreground text-center py-2">Searching...</p>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      {/if}

    </div>

    <Dialog.Footer class="flex justify-end gap-2 border-t border-border pt-3 mt-2">
      <Dialog.Close>
        <Button variant="outline" size="sm" class="text-xs">Cancel</Button>
      </Dialog.Close>
      <Button size="sm" class="text-xs gap-1" onclick={save} disabled={saving}>
        <CheckIcon class="size-3.5" />
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
{/if}
