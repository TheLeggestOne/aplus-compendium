<script lang="ts">
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import UploadIcon from '@lucide/svelte/icons/upload';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';

  $effect(() => { void compendiumStore.initialize(); });

  const { status, isImporting, importProgress } = $derived(compendiumStore);

  let confirmingClear = $state(false);

  async function handleClear() {
    confirmingClear = false;
    await compendiumStore.clearData();
  }

  const CONTENT_TYPE_LABELS: Record<string, string> = {
    spell:              'Spells',
    item:               'Items',
    feat:               'Feats',
    background:         'Backgrounds',
    race:               'Races',
    class:              'Classes',
    subclass:           'Subclasses',
    'optional-feature': 'Optional Features',
    condition:          'Conditions',
  };

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
</script>

<div class="h-full overflow-auto p-8">
  <div class="mx-auto max-w-2xl space-y-8">

    <h1 class="text-2xl font-semibold">Options</h1>

    <!-- Compendium Data section -->
    <section class="rounded-lg border border-border p-6 space-y-5">
      <div>
        <h2 class="text-base font-semibold">Compendium Data</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Manage the imported 5etools dataset used for the compendium panel.
        </p>
      </div>

      <!-- Status block -->
      {#if status?.imported}
        <div class="rounded-md bg-muted/50 border border-border p-4 space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Last imported</span>
            <span class="font-mono text-xs">{status.importedAt ? formatDate(status.importedAt) : '—'}</span>
          </div>

          {#if status.counts}
            <div class="grid grid-cols-2 gap-x-8 gap-y-1">
              {#each Object.entries(status.counts) as [type, count]}
                <div class="flex justify-between">
                  <span class="text-muted-foreground">{CONTENT_TYPE_LABELS[type] ?? type}</span>
                  <span class="font-mono tabular-nums">{count?.toLocaleString()}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">No data imported yet.</p>
      {/if}

      <!-- Import progress -->
      {#if isImporting && importProgress}
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs text-muted-foreground">
            <span class="capitalize">{importProgress.stage}…</span>
            {#if importProgress.total > 0}
              <span>{importProgress.current} / {importProgress.total}</span>
            {/if}
          </div>
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full bg-primary transition-all duration-150"
              style="width: {importProgress.total > 0 ? Math.round(importProgress.current / importProgress.total * 100) : 0}%"
            ></div>
          </div>
          {#if importProgress.error}
            <p class="text-xs text-destructive">{importProgress.error}</p>
          {/if}
        </div>
      {/if}

      <!-- Actions -->
      <div class="flex items-center gap-3 flex-wrap pt-1">
        <Button
          onclick={() => compendiumStore.triggerImport()}
          disabled={isImporting}
        >
          <UploadIcon class="mr-2 size-4" />
          {status?.imported ? 'Re-import Data' : 'Import Data'}
        </Button>

        {#if status?.imported}
          {#if confirmingClear}
            <span class="text-sm text-muted-foreground">Are you sure? This cannot be undone.</span>
            <Button variant="destructive" size="sm" onclick={handleClear}>Yes, clear</Button>
            <Button variant="ghost" size="sm" onclick={() => confirmingClear = false}>Cancel</Button>
          {:else}
            <Button variant="outline" onclick={() => confirmingClear = true} disabled={isImporting}>
              <Trash2Icon class="mr-2 size-4" />
              Clear Data
            </Button>
          {/if}
        {/if}
      </div>
    </section>

  </div>
</div>
