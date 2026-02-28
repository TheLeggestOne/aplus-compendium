<script lang="ts">
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import UploadIcon from '@lucide/svelte/icons/upload';
  import Trash2Icon from '@lucide/svelte/icons/trash-2';
  import WrenchIcon from '@lucide/svelte/icons/wrench';
  import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';

  $effect(() => { void compendiumStore.initialize(); });

  const { status, isImporting, importProgress } = $derived(compendiumStore);

  let confirmingClear = $state(false);

  async function handleClear() {
    confirmingClear = false;
    await compendiumStore.clearData();
  }

  // Repair class associations from spells/sources.json
  let repairResult = $state<{ updated: number; cancelled: boolean } | null>(null);
  let repairLoading = $state(false);

  async function repairClasses() {
    const api = window.electronAPI;
    if (!api) return;
    repairLoading = true;
    repairResult = null;
    try {
      const result = await api.compendium.repairClasses();
      if (result.ok) repairResult = result.data;
    } catch (e) {
      console.error(e);
    } finally {
      repairLoading = false;
    }
  }

  // Diagnostics — class data check
  type ClassDebug = { total: number; withClasses: number; sample: { name: string; classes_json: string }[] };
  let classDebug = $state<ClassDebug | null>(null);
  let classDebugError = $state<string | null>(null);
  let classDebugLoading = $state(false);

  async function runClassDiagnostic() {
    const api = window.electronAPI;
    if (!api) return;
    classDebugLoading = true;
    classDebug = null;
    classDebugError = null;
    try {
      const result = await api.compendium.debugClasses();
      if (result.ok) classDebug = result.data;
      else classDebugError = result.error;
    } catch (e) {
      classDebugError = String(e);
    } finally {
      classDebugLoading = false;
    }
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

    <!-- Repairs section -->
    {#if status?.imported}
      <section class="rounded-lg border border-border p-6 space-y-5">
        <div>
          <h2 class="text-base font-semibold">Repairs</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Fix data issues without doing a full re-import.
          </p>
        </div>

        <div class="space-y-3">
          <div class="flex items-start gap-4">
            <div class="flex-1 space-y-1">
              <p class="text-sm font-medium">Spell class associations</p>
              <p class="text-xs text-muted-foreground">
                Reads <code class="font-mono">spells/sources.json</code> from your data directory and patches
                <code class="font-mono">classes_json</code> for all matching spells. Use this if class filters
                return no results after import.
              </p>
            </div>
            <Button variant="outline" size="sm" onclick={repairClasses} disabled={repairLoading} class="shrink-0">
              <WrenchIcon class="mr-2 size-4" />
              {repairLoading ? 'Repairing…' : 'Repair'}
            </Button>
          </div>

          {#if repairResult && !repairResult.cancelled}
            <p class="text-sm {repairResult.updated > 0 ? 'text-green-500' : 'text-muted-foreground'}">
              {repairResult.updated > 0
                ? `Updated class data for ${repairResult.updated} spell${repairResult.updated === 1 ? '' : 's'}.`
                : 'No spells were updated (sources.json may be missing or spell names may not match).'}
            </p>
          {/if}
        </div>
      </section>

      <!-- Diagnostics section -->
      <section class="rounded-lg border border-border p-6 space-y-5">
        <div>
          <h2 class="text-base font-semibold">Diagnostics</h2>
          <p class="mt-1 text-sm text-muted-foreground">
            Inspect the imported data to help debug filter issues.
          </p>
        </div>

        <div class="space-y-3">
          <Button variant="outline" size="sm" onclick={runClassDiagnostic} disabled={classDebugLoading}>
            <FlaskConicalIcon class="mr-2 size-4" />
            {classDebugLoading ? 'Checking…' : 'Check spell class data'}
          </Button>

          {#if classDebugError}
            <p class="text-xs text-destructive">{classDebugError}</p>
          {/if}

          {#if classDebug}
            <div class="rounded-md bg-muted/50 border border-border p-4 space-y-3 text-sm font-mono">
              <div class="flex gap-8">
                <span>Total spells: <strong>{classDebug.total}</strong></span>
                <span>With class data: <strong class="{classDebug.withClasses === 0 ? 'text-destructive' : 'text-green-500'}">{classDebug.withClasses}</strong></span>
              </div>
              {#if classDebug.withClasses === 0}
                <p class="text-xs text-destructive font-sans">
                  No class associations found — try the "Repair" above.
                </p>
              {/if}
              <div class="space-y-1 text-xs">
                <p class="text-muted-foreground font-sans">Sample (first 5 spells):</p>
                {#each classDebug.sample as row}
                  <div class="flex gap-3">
                    <span class="w-40 truncate text-muted-foreground">{row.name}</span>
                    <span class="text-foreground">{row.classes_json}</span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </section>
    {/if}

  </div>
</div>
