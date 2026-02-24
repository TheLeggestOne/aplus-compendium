<script lang="ts">
  import type { SkillName } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SkillEntry from './skill-entry.svelte';
  import SectionHeader from './section-header.svelte';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

  const SKILL_ORDER: SkillName[] = [
    'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
    'history', 'insight', 'intimidation', 'investigation', 'medicine',
    'nature', 'perception', 'performance', 'persuasion', 'religion',
    'sleight-of-hand', 'stealth', 'survival',
  ];

  const { character, passivePerception } = $derived(characterStore);
</script>

<div class="flex flex-col min-h-0 flex-1">
  <SectionHeader title="Skills" />

  <div class="rounded-md border border-border bg-card px-3 py-1 mb-2">
    <div class="flex items-center justify-between py-1">
      <span class="text-sm text-muted-foreground">Passive Perception</span>
      <span class="text-sm font-bold tabular-nums">{passivePerception}</span>
    </div>
  </div>

  <ScrollArea class="flex-1 rounded-md border border-border bg-card px-3 py-2">
    {#each SKILL_ORDER as skill}
      <SkillEntry {skill} entry={character.skills[skill]} />
    {/each}
  </ScrollArea>
</div>
