<script lang="ts">
  import type { SkillName } from '@aplus-compendium/types';
  import { characterStore } from '$lib/stores/character.svelte.js';
  import SkillEntry from './skill-entry.svelte';
  import SectionHeader from './section-header.svelte';
  import SkillProficiencyEditor from './skill-proficiency-editor.svelte';
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import PencilIcon from '@lucide/svelte/icons/pencil';

  const SKILL_ORDER: SkillName[] = [
    'acrobatics', 'animal-handling', 'arcana', 'athletics', 'deception',
    'history', 'insight', 'intimidation', 'investigation', 'medicine',
    'nature', 'perception', 'performance', 'persuasion', 'religion',
    'sleight-of-hand', 'stealth', 'survival',
  ];

  const { character } = $derived(characterStore);
  let editorOpen = $state(false);
</script>

<div class="flex flex-col min-h-0 flex-1 max-w-md">
  <div class="flex items-center">
    <div class="flex-1">
      <SectionHeader title="Skills" />
    </div>
    <button
      class="mb-1 flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
      onclick={() => editorOpen = true}
      title="Edit skill proficiencies"
    >
      <PencilIcon class="size-3" />
      Edit
    </button>
  </div>

  <SkillProficiencyEditor bind:open={editorOpen} />

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
