<script lang="ts">
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SectionHeader from './section-header.svelte';

  const { character } = $derived(characterStore);

  const appearance = $derived(character.appearance);
  const narrative = $derived(character.narrative);

  const appearanceFields: { label: string; key: keyof NonNullable<typeof appearance> }[] = [
    { label: 'Age', key: 'age' },
    { label: 'Height', key: 'height' },
    { label: 'Weight', key: 'weight' },
    { label: 'Eyes', key: 'eyes' },
    { label: 'Skin', key: 'skin' },
    { label: 'Hair', key: 'hair' },
  ];
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <!-- Personality -->
  {#if narrative}
    <section>
      <SectionHeader title="Personality" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#if narrative.personalityTraits.length > 0}
          <div class="rounded-md border border-border bg-card p-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Traits</h3>
            {#each narrative.personalityTraits as trait}
              <p class="text-sm leading-relaxed">{trait}</p>
            {/each}
          </div>
        {/if}

        {#if narrative.ideals.length > 0}
          <div class="rounded-md border border-border bg-card p-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ideals</h3>
            {#each narrative.ideals as ideal}
              <p class="text-sm leading-relaxed">{ideal}</p>
            {/each}
          </div>
        {/if}

        {#if narrative.bonds.length > 0}
          <div class="rounded-md border border-border bg-card p-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bonds</h3>
            {#each narrative.bonds as bond}
              <p class="text-sm leading-relaxed">{bond}</p>
            {/each}
          </div>
        {/if}

        {#if narrative.flaws.length > 0}
          <div class="rounded-md border border-border bg-card p-3">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Flaws</h3>
            {#each narrative.flaws as flaw}
              <p class="text-sm leading-relaxed">{flaw}</p>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  {/if}

  <!-- Appearance -->
  {#if appearance}
    <section>
      <SectionHeader title="Appearance" />
      <div class="rounded-md border border-border bg-card">
        {#each appearanceFields as { label, key }, i}
          {#if appearance[key]}
            <div class="flex items-center px-3 py-1.5 text-sm {i % 2 === 1 ? 'bg-muted/30' : ''}">
              <span class="w-16 shrink-0 text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
              <span>{appearance[key]}</span>
            </div>
          {/if}
        {/each}
      </div>
    </section>
  {/if}

  <!-- Languages & Proficiencies side-by-side -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {#if character.languages?.length > 0}
      <section>
        <SectionHeader title="Languages" />
        <div class="rounded-md border border-border bg-card p-3">
          <div class="flex flex-wrap gap-1.5">
            {#each character.languages as lang}
              <span class="rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-xs">{lang}</span>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    {#if character.otherProficiencies?.length > 0}
      <section>
        <SectionHeader title="Other Proficiencies" />
        <div class="rounded-md border border-border bg-card p-3">
          <div class="flex flex-wrap gap-1.5">
            {#each character.otherProficiencies as prof}
              <span class="rounded-full border border-border bg-muted/30 px-2.5 py-0.5 text-xs">{prof}</span>
            {/each}
          </div>
        </div>
      </section>
    {/if}
  </div>

  <!-- Backstory -->
  {#if narrative?.backstory}
    <section>
      <SectionHeader title="Backstory" />
      <div class="rounded-md border border-border bg-card p-3">
        <p class="text-sm leading-relaxed whitespace-pre-line">{narrative.backstory}</p>
      </div>
    </section>
  {/if}

  <!-- Notes -->
  {#if narrative?.notes}
    <section>
      <SectionHeader title="Notes" />
      <div class="rounded-md border border-border bg-card p-3">
        <p class="text-sm leading-relaxed whitespace-pre-line">{narrative.notes}</p>
      </div>
    </section>
  {/if}
</div>
