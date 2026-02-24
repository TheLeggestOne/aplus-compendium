<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import { cn } from '$lib/utils.js';

  const { character } = $derived(characterStore);

  let hpInput = $state('');

  function openDialog() {
    if (!uiStore.isEditMode) {
      hpInput = String(character.combat.currentHitPoints);
      uiStore.setHpDialogOpen(true);
    }
  }

  function adjustAndClose(delta: number) {
    characterStore.adjustHp(delta);
    uiStore.setHpDialogOpen(false);
  }

  function setAndClose() {
    const val = parseInt(hpInput, 10);
    if (!isNaN(val)) characterStore.setCurrentHp(val);
    uiStore.setHpDialogOpen(false);
  }

  const hpPercent = $derived(
    Math.round((character.combat.currentHitPoints / character.combat.maxHitPoints) * 100)
  );

  const hpColor = $derived(
    hpPercent > 50 ? 'text-foreground' :
    hpPercent > 25 ? 'text-yellow-400' :
    'text-destructive'
  );
</script>

<div class="flex flex-col items-center gap-0.5">
  <span class="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">HP</span>

  <button
    class="flex items-baseline gap-0.5 hover:opacity-80 transition-opacity cursor-pointer"
    onclick={openDialog}
    aria-label="Adjust hit points"
  >
    <span class={cn('text-2xl font-bold leading-none tabular-nums', hpColor)}>
      {character.combat.currentHitPoints}
    </span>
    <span class="text-sm text-muted-foreground leading-none">
      / {character.combat.maxHitPoints}
    </span>
  </button>

  {#if character.combat.temporaryHitPoints > 0}
    <span class="text-[10px] text-blue-400 font-medium">
      +{character.combat.temporaryHitPoints} temp
    </span>
  {/if}
</div>

<Dialog.Root
  open={uiStore.hpDialogOpen}
  onOpenChange={(o) => uiStore.setHpDialogOpen(o)}
>
  <Dialog.Content class="max-w-sm">
    <Dialog.Header>
      <Dialog.Title>Adjust Hit Points</Dialog.Title>
      <Dialog.Description>
        Current: {character.combat.currentHitPoints} / {character.combat.maxHitPoints}
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-4 py-2">
      <!-- Quick adjust buttons -->
      <div class="grid grid-cols-4 gap-2">
        {#each [-10, -5, -1, 1, 5, 10] as delta}
          <Button
            variant={delta < 0 ? 'destructive' : 'default'}
            size="sm"
            onclick={() => adjustAndClose(delta)}
            class="tabular-nums"
          >
            {delta > 0 ? '+' : ''}{delta}
          </Button>
        {/each}
      </div>

      <!-- Set exact value -->
      <div class="flex gap-2">
        <Input
          type="number"
          bind:value={hpInput}
          min="0"
          max={character.combat.maxHitPoints}
          placeholder="Set exact HP"
          class="selectable"
        />
        <Button onclick={setAndClose} variant="outline" size="sm">Set</Button>
      </div>

      <!-- Temp HP -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Temp HP:</span>
        <Input
          type="number"
          value={character.combat.temporaryHitPoints}
          min="0"
          oninput={(e) => {
            const val = parseInt((e.target as HTMLInputElement).value, 10);
            if (!isNaN(val)) characterStore.setTempHp(val);
          }}
          class="w-20 selectable"
        />
      </div>
    </div>

    <Dialog.Footer>
      <Button variant="ghost" onclick={() => uiStore.setHpDialogOpen(false)}>Close</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
