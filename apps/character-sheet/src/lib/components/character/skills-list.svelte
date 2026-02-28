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

  const { character } = $derived(characterStore);
</script>

<div class="flex flex-col min-h-0 flex-1 max-w-md">
  <SectionHeader title="Skills" />

  <ScrollArea class="flex-1 rounded-md border border-border bg-card">
    <div class="flex items-center px-3 py-1 border-b border-border/60 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span class="w-5"></span>
      <span class="flex-1">Skill</span>
      <span class="w-7 text-center">Mod</span>
      <span class="w-7 text-center">Pas</span>
    </div>
    {#each SKILL_ORDER as skill, i}
      <SkillEntry {skill} entry={character.skills[skill]} odd={i % 2 === 1} />
    {/each}
  </ScrollArea>
</div>
