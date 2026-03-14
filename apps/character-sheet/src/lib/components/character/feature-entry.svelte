<script lang="ts">
  import type { Feature } from '@aplus-compendium/types';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import * as Collapsible from '$lib/components/ui/collapsible/index.js';
  import { cn } from '$lib/utils.js';
  import { ChevronRight, Plus, X } from '@lucide/svelte';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';
  import { extractOptions } from '$lib/utils/tag-renderer.js';

  interface Props {
    feature: Feature;
  }

  let { feature }: Props = $props();

  let open = $state(false);

  const sourceColors: Record<string, string> = {
    class:       'bg-blue-500/20 text-blue-400 border-blue-500/30',
    subclass:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
    race:        'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    background:  'bg-orange-500/20 text-orange-400 border-orange-500/30',
    feat:        'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };

  const extractedOptions = $derived(
    feature.rawEntries ? extractOptions(feature.rawEntries) : []
  );

  // Extra options loaded lazily for subclass-gate features (e.g. Martial Archetype)
  // where options aren't embedded in rawEntries and may not be stored on old characters.
  let lazySubclassOptions = $state<string[]>([]);

  $effect(() => {
    if (!open) return;
    if (extractedOptions.length > 0) return;
    if ((feature.knownChoiceOptions ?? []).length > 0) return;
    const sourceClass = feature.sourceClass;
    if (!sourceClass) return;
    window.electronAPI.compendium.getSubclassesIfGate(sourceClass, feature.name)
      .then((names: string[]) => { lazySubclassOptions = names; })
      .catch(() => {});
  });

  const availableOptions = $derived(
    extractedOptions.length > 0
      ? extractedOptions
      : (feature.knownChoiceOptions ?? []).length > 0
        ? (feature.knownChoiceOptions ?? [])
        : lazySubclassOptions
  );

  function selectOption(optionName: string) {
    const choices = feature.choices ?? [];
    // Fill the first empty choice slot if one exists
    const emptySlot = choices.find(c => !c.selected);
    if (emptySlot) {
      characterStore.updateFeatureChoice(feature.id, emptySlot.id, optionName);
    } else {
      // Add a new slot pre-filled with this option
      characterStore.addFeatureChoice(feature.id, {
        id: `choice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: '',
        options: availableOptions,
        selected: optionName,
      });
    }
  }

  function addChoice() {
    characterStore.addFeatureChoice(feature.id, {
      id: `choice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: '',
      options: availableOptions,
      selected: '',
    });
  }
</script>

<Collapsible.Root bind:open>
  <div class="rounded-md border border-border bg-card mb-2">
    <Collapsible.Trigger class="w-full">
      <div class="flex items-center gap-2 px-3 py-2 hover:bg-muted/30 transition-colors rounded-md">
        <ChevronRight class={cn('size-3.5 text-muted-foreground transition-transform shrink-0', open && 'rotate-90')} />
        <span class="flex-1 text-sm font-medium text-left">{feature.name}</span>

        <div class="flex items-center gap-1.5 shrink-0">
          {#if feature.uses}
            <div class="flex gap-1">
              {#each Array(feature.uses.maximum) as _, i}
                <button
                  class={cn(
                    'size-3 rounded-full border transition-colors',
                    i < feature.uses.current
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30 bg-transparent',
                  )}
                  onclick={(e) => {
                    e.stopPropagation();
                    if (i < feature.uses!.current) {
                      if (i === feature.uses!.current - 1) {
                        characterStore.useFeature(feature.id);
                      }
                    } else if (i === feature.uses!.current) {
                      characterStore.restoreFeature(feature.id);
                    }
                  }}
                  aria-label={i < (feature.uses?.current ?? 0) ? 'Use charge' : 'Restore charge'}
                ></button>
              {/each}
            </div>
            <span class="text-[10px] text-muted-foreground tabular-nums">
              {feature.uses.current}/{feature.uses.maximum}
              {feature.uses.resetOn}
            </span>
          {/if}

          <Badge
            variant="outline"
            class={cn('text-[10px] px-1.5 py-0', sourceColors[feature.sourceType])}
          >
            {feature.source}
          </Badge>
        </div>
      </div>
    </Collapsible.Trigger>

    <Collapsible.Content>
      <div class="px-3 pb-3 pt-1 border-t border-border text-xs text-muted-foreground">

        {#if feature.choices && feature.choices.length > 0}
          <div class="mb-3 flex flex-col gap-1.5">
            {#each feature.choices as choice (choice.id)}
              <div class="flex items-center gap-1.5">
                <input
                  class="w-28 shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Label"
                  value={choice.label}
                  oninput={(e) => characterStore.patchFeatureChoice(feature.id, choice.id, { label: (e.currentTarget as HTMLInputElement).value })}
                />

                {#if choice.options.length > 0}
                  <select
                    class="flex-1 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    value={choice.selected}
                    onchange={(e) => characterStore.updateFeatureChoice(feature.id, choice.id, (e.currentTarget as HTMLSelectElement).value)}
                  >
                    <option value="">— choose —</option>
                    {#each choice.options as opt}
                      <option value={opt}>{opt}</option>
                    {/each}
                  </select>
                {:else}
                  <input
                    class="flex-1 rounded border border-border bg-background px-1.5 py-0.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Selection"
                    value={choice.selected}
                    oninput={(e) => characterStore.updateFeatureChoice(feature.id, choice.id, (e.currentTarget as HTMLInputElement).value)}
                  />
                {/if}

                <button
                  class="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  onclick={() => characterStore.removeFeatureChoice(feature.id, choice.id)}
                  aria-label="Remove choice"
                >
                  <X class="size-3" />
                </button>
              </div>
            {/each}
          </div>
        {/if}

        {#if feature.rawEntries && feature.rawEntries.length > 0}
          <EntryRenderer entries={feature.rawEntries} />
        {:else if feature.description}
          <p class="leading-relaxed selectable">{feature.description}</p>
        {/if}

        {#if availableOptions.length > 0}
          <div class="mt-3 flex flex-wrap gap-1">
            {#each availableOptions as opt}
              <button
                class="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                onclick={() => selectOption(opt)}
              >
                {opt}
              </button>
            {/each}
          </div>
        {/if}

        <button
          class="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          onclick={addChoice}
        >
          <Plus class="size-3" />
          Add choice
        </button>
      </div>
    </Collapsible.Content>
  </div>
</Collapsible.Root>
