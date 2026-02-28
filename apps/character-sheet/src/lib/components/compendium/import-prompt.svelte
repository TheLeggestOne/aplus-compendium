<script lang="ts">
  import { Button } from '$lib/components/ui/button/index.js';
  import { Progress } from '$lib/components/ui/progress/index.js';
  import { compendiumStore } from '$lib/stores/compendium.svelte.js';

  const { isImporting, importProgress } = $derived(compendiumStore);
</script>

<div class="flex flex-col items-center justify-center gap-4 p-6 text-center">
  {#if isImporting}
    <div class="w-full space-y-2">
      <p class="text-sm font-medium">
        {importProgress ? `Importing ${importProgress.stage}…` : 'Starting import…'}
      </p>
      {#if importProgress && importProgress.total > 0}
        <Progress value={(importProgress.current / importProgress.total) * 100} class="h-2" />
        <p class="text-xs text-muted-foreground">
          {importProgress.current} / {importProgress.total}
        </p>
      {:else}
        <Progress value={undefined} class="h-2" />
      {/if}
    </div>
  {:else if importProgress?.error}
    <div class="space-y-2">
      <p class="text-sm text-destructive">Import failed</p>
      <p class="text-xs text-muted-foreground">{importProgress.error}</p>
      <Button size="sm" onclick={() => compendiumStore.triggerImport()}>
        Try Again
      </Button>
    </div>
  {:else}
    <div class="space-y-3">
      <div class="text-4xl opacity-30">📚</div>
      <div class="space-y-1">
        <p class="text-sm font-medium">No compendium data</p>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Select your 5etools data directory to import spells, items, feats, and more.
        </p>
      </div>
      <Button size="sm" onclick={() => compendiumStore.triggerImport()}>
        Import Data…
      </Button>
    </div>
  {/if}
</div>
