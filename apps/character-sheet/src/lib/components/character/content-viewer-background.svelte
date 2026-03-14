<script lang="ts">
  import type { CharacterBackground } from '@aplus-compendium/types';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import EntryRenderer from '$lib/components/ui/entry-renderer.svelte';

  interface Props {
    background: CharacterBackground;
  }

  let { background }: Props = $props();

  const skillLabels = $derived(
    background.skillProficiencies.map((s) =>
      s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    ),
  );
</script>

<div class="p-3 flex flex-col gap-3 text-sm text-foreground">

  {#if skillLabels.length > 0}
    <div>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Skill Proficiencies</p>
      <p>{skillLabels.join(', ')}</p>
    </div>
    <Separator />
  {/if}

  {#if background.languageCount > 0}
    <div>
      <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Languages</p>
      <p>Any {background.languageCount} standard language{background.languageCount > 1 ? 's' : ''}</p>
    </div>
    <Separator />
  {/if}

  {#if background.rawEntries && background.rawEntries.length > 0}
    <EntryRenderer entries={background.rawEntries} />
  {:else}
    <p class="text-xs text-muted-foreground italic">No description available.</p>
  {/if}

</div>
