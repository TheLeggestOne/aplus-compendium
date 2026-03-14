<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Popover from '$lib/components/ui/popover/index.js';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import MinusIcon from '@lucide/svelte/icons/minus';
  import ArrowUpCircleIcon from '@lucide/svelte/icons/arrow-up-circle';

  const { character, totalLevel, xpProgress, xpForNextLevel, xpForCurrentLevel, canLevelUp } = $derived(characterStore);

  let popoverOpen = $state(false);
  let adjustValue = $state('');
  let confirmSet = $state(false);

  function applyAdjust(sign: 1 | -1) {
    const val = parseInt(adjustValue);
    if (!val || val <= 0) return;
    characterStore.adjustExperience(sign * val);
    adjustValue = '';
  }

  function handleLevelUp() {
    popoverOpen = false;
    uiStore.setActiveTab('progression');
    // Small delay to allow progression tab to mount before opening dialog
    setTimeout(() => window.dispatchEvent(new CustomEvent('xp-level-up')), 50);
  }

  const xpDisplay = $derived(() => {
    if (totalLevel >= 20) return `${character.experience.toLocaleString()} XP`;
    return `${character.experience.toLocaleString()} / ${xpForNextLevel.toLocaleString()} XP`;
  });
</script>

<Popover.Root bind:open={popoverOpen}>
  <Popover.Trigger>
    {#snippet child({ props })}
      <button
        {...props}
        class="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 hover:bg-accent/50 transition-colors min-w-[140px] {canLevelUp ? 'border-yellow-500/60 bg-yellow-500/10' : 'bg-card/50'}"
      >
        <div class="flex flex-col items-start gap-0.5 flex-1">
          <span class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-none">XP</span>
          <span class="text-xs font-semibold leading-none tabular-nums">{xpDisplay()}</span>
        </div>
        {#if totalLevel < 20}
          <div class="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              class="h-full rounded-full transition-all {canLevelUp ? 'bg-yellow-500' : 'bg-primary'}"
              style="width: {xpProgress}%"
            ></div>
          </div>
        {/if}
        {#if canLevelUp}
          <ArrowUpCircleIcon class="size-4 text-yellow-500 animate-pulse" />
        {/if}
      </button>
    {/snippet}
  </Popover.Trigger>

  <Popover.Content class="w-64 p-3" align="center">
    <div class="flex flex-col gap-3">
      <div class="text-center">
        <p class="text-sm font-medium">Experience Points</p>
        <p class="text-2xl font-bold tabular-nums">{character.experience.toLocaleString()}</p>
        {#if totalLevel < 20}
          <p class="text-xs text-muted-foreground">
            {(xpForNextLevel - character.experience).toLocaleString()} XP to level {totalLevel + 1}
          </p>
          <div class="w-full h-2 rounded-full bg-muted mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all {canLevelUp ? 'bg-yellow-500' : 'bg-primary'}"
              style="width: {xpProgress}%"
            ></div>
          </div>
          <div class="flex justify-between text-[10px] text-muted-foreground mt-0.5 tabular-nums">
            <span>{xpForCurrentLevel.toLocaleString()}</span>
            <span>{xpForNextLevel.toLocaleString()}</span>
          </div>
        {:else}
          <p class="text-xs text-muted-foreground">Max level reached</p>
        {/if}
      </div>

      <div class="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          class="size-8 shrink-0"
          onclick={() => applyAdjust(-1)}
          disabled={!adjustValue || parseInt(adjustValue) <= 0}
        >
          <MinusIcon class="size-3.5" />
        </Button>
        <Input
          type="number"
          placeholder="Amount"
          class="h-8 text-center text-sm"
          bind:value={adjustValue}
          onkeydown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') applyAdjust(1);
          }}
        />
        <Button
          variant="outline"
          size="icon"
          class="size-8 shrink-0"
          onclick={() => applyAdjust(1)}
          disabled={!adjustValue || parseInt(adjustValue) <= 0}
        >
          <PlusIcon class="size-3.5" />
        </Button>
      </div>

      {#if confirmSet}
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-muted-foreground flex-1">Set XP to {parseInt(adjustValue).toLocaleString()}?</span>
          <Button
            variant="default"
            size="sm"
            class="h-7 text-xs"
            onclick={() => {
              characterStore.setExperience(parseInt(adjustValue));
              adjustValue = '';
              confirmSet = false;
            }}
          >
            Yes
          </Button>
          <Button variant="ghost" size="sm" class="h-7 text-xs" onclick={() => confirmSet = false}>
            No
          </Button>
        </div>
      {:else}
        <Button
          variant="outline"
          size="sm"
          class="w-full text-xs"
          onclick={() => confirmSet = true}
          disabled={!adjustValue || isNaN(parseInt(adjustValue)) || parseInt(adjustValue) < 0}
        >
          Set XP to {adjustValue && !isNaN(parseInt(adjustValue)) ? parseInt(adjustValue).toLocaleString() : '...'}
        </Button>
      {/if}

      {#if canLevelUp}
        <Button
          class="w-full gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white"
          size="sm"
          onclick={handleLevelUp}
        >
          <ArrowUpCircleIcon class="size-4" />
          Level Up!
        </Button>
      {/if}
    </div>
  </Popover.Content>
</Popover.Root>
