<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Undo2Icon from '@lucide/svelte/icons/undo-2';
  import EllipsisVerticalIcon from '@lucide/svelte/icons/ellipsis-vertical';
  import PencilIcon from '@lucide/svelte/icons/pencil';
  import LevelUpDialog from './level-up-dialog.svelte';
  import EditLevelDialog from './edit-level-dialog.svelte';

  const { character, totalLevel, abilityModifiers } = $derived(characterStore);
  const conMod = $derived(abilityModifiers.constitution);
  const stack = $derived(character.levelStack ?? []);

  import { onMount } from 'svelte';

  let levelUpOpen = $state(false);
  let confirmUndo = $state(false);
  let editLevelOpen = $state(false);
  let editStackIndex = $state(0);

  onMount(() => {
    function handleXpLevelUp() {
      levelUpOpen = true;
    }
    window.addEventListener('xp-level-up', handleXpLevelUp);
    return () => window.removeEventListener('xp-level-up', handleXpLevelUp);
  });

  function undoLastLevel() {
    characterStore.removeLastLevel();
    confirmUndo = false;
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-lg font-semibold">Class Progression</h2>
      <p class="text-sm text-muted-foreground">
        Character Level {totalLevel}
        {#if character.classes.length > 0}
          — {character.classes.map(c => `${c.class.charAt(0).toUpperCase() + c.class.slice(1)} ${c.level}`).join(' / ')}
        {/if}
      </p>
    </div>
    <div class="flex items-center gap-2">
      {#if stack.length > 0}
        {#if confirmUndo}
          <div class="flex items-center gap-1">
            <span class="text-xs text-muted-foreground">Undo?</span>
            <Button variant="destructive" size="sm" class="h-7 text-xs" onclick={undoLastLevel}>
              Yes
            </Button>
            <Button variant="ghost" size="sm" class="h-7 text-xs" onclick={() => confirmUndo = false}>
              No
            </Button>
          </div>
        {:else}
          <Button variant="ghost" size="sm" class="h-8 text-xs gap-1" onclick={() => confirmUndo = true}>
            <Undo2Icon class="size-3.5" />
            Undo Last
          </Button>
        {/if}
      {/if}
      {#if totalLevel < 20}
        <Button size="sm" class="h-8 text-xs gap-1" onclick={() => levelUpOpen = true}>
          <PlusIcon class="size-3.5" />
          Level Up
        </Button>
      {/if}
    </div>
  </div>

  <Separator />

  <!-- Level Stack Timeline -->
  {#if stack.length === 0}
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <p class="text-sm text-muted-foreground mb-2">No progression history.</p>
      <p class="text-xs text-muted-foreground/70 mb-4">
        Use "Level Up" to start tracking class levels.
      </p>
      <Button size="sm" class="gap-1" onclick={() => levelUpOpen = true}>
        <PlusIcon class="size-3.5" />
        Add First Level
      </Button>
    </div>
  {:else}
    <div class="space-y-0">
      {#each [...stack].reverse() as level, reverseIdx}
        {@const overallLevel = stack.length - reverseIdx}
        {@const isLatest = reverseIdx === 0}
        <div class="relative flex gap-3 pb-4
          {reverseIdx < stack.length - 1 ? 'border-l-2 border-border/50 ml-3' : 'ml-3'}">
          <!-- Timeline dot -->
          <div class="absolute -left-[5px] top-1 size-2 rounded-full {isLatest ? 'bg-primary' : 'bg-muted-foreground/40'}"></div>

          <!-- Content -->
          <div class="ml-4 flex-1 min-w-0">
            <div class="flex items-baseline gap-2">
              <span class="text-xs font-mono text-muted-foreground/60 w-5 shrink-0">
                {overallLevel}
              </span>
              <span class="text-sm font-medium capitalize">{level.class}</span>
              <span class="text-xs text-muted-foreground">{level.classLevel}</span>
              <span class="text-xs text-muted-foreground/60">+{Math.max(1, level.hpRoll + conMod)} HP</span>
            </div>

            <!-- Badges for notable events -->
            <div class="flex flex-wrap gap-1 mt-1">
              {#if level.subclassChoice}
                <Badge variant="secondary" class="text-[10px] px-1.5 py-0 h-4">
                  {level.subclassChoice}
                </Badge>
              {/if}

              {#if level.asiChoice}
                <Badge variant="outline" class="text-[10px] px-1.5 py-0 h-4">
                  {#if level.asiChoice.type === 'asi'}
                    ASI: {Object.entries(level.asiChoice.increases).map(([a, v]) => `+${v} ${a.slice(0, 3).toUpperCase()}`).join(', ')}
                  {:else}
                    Feat: {level.asiChoice.featName}
                  {/if}
                </Badge>
              {/if}

              {#if level.featureIds.length > 0}
                <Badge variant="outline" class="text-[10px] px-1.5 py-0 h-4 opacity-60">
                  +{level.featureIds.length} feature{level.featureIds.length > 1 ? 's' : ''}
                </Badge>
              {/if}
            </div>
          </div>

          <!-- Edit menu -->
          <Popover.Root>
            <Popover.Trigger>
              <button
                class="shrink-0 p-1 rounded text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
                title="Edit level {overallLevel}"
              >
                <EllipsisVerticalIcon class="size-4" />
              </button>
            </Popover.Trigger>
            <Popover.Content class="w-auto p-1" align="end">
              <button
                class="flex items-center gap-2 w-full px-3 py-1.5 text-xs rounded hover:bg-muted/50 transition-colors"
                onclick={() => { editStackIndex = stack.length - 1 - reverseIdx; editLevelOpen = true; }}
              >
                <PencilIcon class="size-3" />
                Edit Choices
              </button>
            </Popover.Content>
          </Popover.Root>
        </div>
      {/each}
    </div>
  {/if}
</div>

<LevelUpDialog bind:open={levelUpOpen} />
<EditLevelDialog bind:open={editLevelOpen} stackIndex={editStackIndex} />
