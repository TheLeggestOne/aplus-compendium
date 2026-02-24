<script lang="ts">
  import type { Feature } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import FeatureEntry from './feature-entry.svelte';
  import SectionHeader from './section-header.svelte';

  const { character } = $derived(characterStore);

  const grouped = $derived(() => {
    const class_: Feature[] = [];
    const subclass: Feature[] = [];
    const race: Feature[] = [];
    const background: Feature[] = [];
    const feat: Feature[] = [];

    for (const f of character.features) {
      if (f.sourceType === 'class') class_.push(f);
      else if (f.sourceType === 'subclass') subclass.push(f);
      else if (f.sourceType === 'race') race.push(f);
      else if (f.sourceType === 'background') background.push(f);
      else feat.push(f);
    }

    return { class_, subclass, race, background, feat };
  });
</script>

<div class="flex flex-col gap-2">
  <SectionHeader title="Features & Traits" />

  {#each [
    { label: 'Class Features', items: grouped().class_ },
    { label: 'Subclass Features', items: grouped().subclass },
    { label: 'Racial Traits', items: grouped().race },
    { label: 'Background', items: grouped().background },
    { label: 'Feats', items: grouped().feat },
  ] as group}
    {#if group.items.length > 0}
      <div>
        <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          {group.label}
        </p>
        {#each group.items as feature}
          <FeatureEntry {feature} />
        {/each}
      </div>
    {/if}
  {/each}
</div>
