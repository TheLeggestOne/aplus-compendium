<script lang="ts">
  import type { Character } from '@aplus-compendium/types';
  import { goto, invalidateAll } from '$app/navigation';
  import { Button } from '$lib/components/ui/button/index.js';
  import { Input } from '$lib/components/ui/input/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { createDefaultCharacter } from '$lib/default-character.js';
  import { uiStore } from '$lib/stores/ui-state.svelte.js';
  import PlusIcon from '@lucide/svelte/icons/plus';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';
  import type { PageData } from './$types.js';

  const { data } = $props<{ data: PageData }>();

  // New character dialog
  let createOpen = $state(false);
  let newName = $state('');

  // Delete confirmation
  let deleteTarget = $state<Character | null>(null);

  function classString(c: Character): string {
    return c.classes.map((cl) => {
      const name = cl.class.charAt(0).toUpperCase() + cl.class.slice(1);
      return cl.subclass ? `${name} (${cl.subclass}) ${cl.level}` : `${name} ${cl.level}`;
    }).join(' / ');
  }

  function totalLevel(c: Character): number {
    return c.classes.reduce((sum, cl) => sum + cl.level, 0);
  }

  async function createCharacter() {
    const name = newName.trim();
    if (!name) return;

    const api = window.electronAPI;
    if (!api) return;

    const character = createDefaultCharacter(name);
    const result = await api.characters.save(character);
    if (result.ok) {
      createOpen = false;
      newName = '';
      goto(`/character/${character.id}`);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const api = window.electronAPI;
    if (!api) return;

    const deletedId = deleteTarget.id;
    const result = await api.characters.delete(deletedId);
    if (result.ok) {
      if (uiStore.activeCharacterId === deletedId) {
        uiStore.clearActiveCharacter();
      }
      deleteTarget = null;
      await invalidateAll();
    }
  }
</script>

<div class="flex h-full flex-col overflow-auto p-6">
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-lg font-semibold">Characters</h1>
    <Button size="sm" onclick={() => { newName = ''; createOpen = true; }}>
      <PlusIcon class="size-4 mr-1" />
      New Character
    </Button>
  </div>

  {#if data.characters.length === 0}
    <div class="flex flex-1 items-center justify-center">
      <p class="text-muted-foreground">No characters yet. Create one to get started.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.characters as character (character.id)}
        <button
          class="group relative rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50"
          onclick={() => goto(`/character/${character.id}`)}
        >
          <h2 class="text-sm font-semibold">{character.name}</h2>
          <p class="mt-0.5 text-xs text-muted-foreground">
            {#if character.race}
              {character.race}{character.subrace ? ` (${character.subrace})` : ''}
              {' — '}
            {/if}
            {classString(character) || 'No class'}
          </p>
          <div class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Level {totalLevel(character)}</span>
            <span>HP {character.combat.currentHitPoints}/{character.combat.maxHitPoints}</span>
          </div>

          <!-- Delete button -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            role="button"
            tabindex="0"
            class="absolute right-2 top-2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
            onclick={(e) => { e.stopPropagation(); deleteTarget = character; }}
            onkeydown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); deleteTarget = character; } }}
          >
            <Trash2Icon class="size-3.5 text-destructive" />
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<!-- New Character Dialog -->
<Dialog.Root bind:open={createOpen}>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>New Character</Dialog.Title>
      <Dialog.Description>Enter a name to create a blank character sheet.</Dialog.Description>
    </Dialog.Header>
    <form
      onsubmit={(e) => { e.preventDefault(); createCharacter(); }}
      class="flex flex-col gap-4 pt-2"
    >
      <Input
        placeholder="Character name"
        bind:value={newName}
        autofocus
      />
      <Dialog.Footer>
        <Dialog.Close>
          <Button variant="ghost" type="button">Cancel</Button>
        </Dialog.Close>
        <Button type="submit" disabled={!newName.trim()}>Create</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<!-- Delete Confirmation Dialog -->
<Dialog.Root open={deleteTarget !== null} onOpenChange={(open) => { if (!open) deleteTarget = null; }}>
  <Dialog.Content class="sm:max-w-sm">
    <Dialog.Header>
      <Dialog.Title>Delete Character</Dialog.Title>
      <Dialog.Description>
        Permanently delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <Dialog.Footer>
      <Button variant="ghost" onclick={() => { deleteTarget = null; }}>Cancel</Button>
      <Button variant="destructive" onclick={confirmDelete}>Delete</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
