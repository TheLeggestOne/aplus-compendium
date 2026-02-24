<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';

  interface Props {
    show: boolean;
  }

  let { show }: Props = $props();

  const { character } = $derived(characterStore);
</script>

{#if show}
  <div class="flex items-center gap-6">
    <div class="flex flex-col items-center gap-1">
      <span class="text-[10px] uppercase tracking-wider text-green-400 font-medium">Successes</span>
      <div class="flex gap-1.5">
        {#each [0, 1, 2] as i}
          <button
            class="size-5 rounded-full border-2 transition-colors
              {character.combat.deathSaves.successes > i
                ? 'border-green-500 bg-green-500'
                : 'border-muted-foreground/50 bg-transparent hover:border-green-500'}"
            onclick={() => characterStore.recordDeathSave('success')}
            aria-label="Record death save success"
          ></button>
        {/each}
      </div>
    </div>

    <div class="flex flex-col items-center gap-1">
      <span class="text-[10px] uppercase tracking-wider text-destructive font-medium">Failures</span>
      <div class="flex gap-1.5">
        {#each [0, 1, 2] as i}
          <button
            class="size-5 rounded-full border-2 transition-colors
              {character.combat.deathSaves.failures > i
                ? 'border-destructive bg-destructive'
                : 'border-muted-foreground/50 bg-transparent hover:border-destructive'}"
            onclick={() => characterStore.recordDeathSave('failure')}
            aria-label="Record death save failure"
          ></button>
        {/each}
      </div>
    </div>

    <button
      class="text-[10px] text-muted-foreground hover:text-foreground underline"
      onclick={() => characterStore.resetDeathSaves()}
    >
      Reset
    </button>
  </div>
{/if}
