<script lang="ts">
  import type { SkillName, SkillEntry } from '@aplus-compendium/types';
  import { SKILL_ABILITY_MAP } from '@aplus-compendium/types';
  import ProficiencyDot from './proficiency-dot.svelte';
  import ModifierDisplay from './modifier-display.svelte';

  const ABILITY_ABBREV: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    constitution: 'CON',
    intelligence: 'INT',
    wisdom: 'WIS',
    charisma: 'CHA',
  };

  function titleCase(s: string) {
    return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  interface Props {
    skill: SkillName;
    entry: SkillEntry;
  }

  let { skill, entry }: Props = $props();

  const ability = $derived(SKILL_ABILITY_MAP[skill]);
</script>

<div class="flex items-center gap-2 py-0.5">
  <ProficiencyDot level={entry.proficiency} />
  <span class="flex-1 text-sm">{titleCase(skill)}</span>
  <span class="text-[10px] text-muted-foreground w-6 text-center">{ABILITY_ABBREV[ability]}</span>
  <ModifierDisplay value={entry.modifier} class="text-sm font-medium w-8 text-right" />
</div>
