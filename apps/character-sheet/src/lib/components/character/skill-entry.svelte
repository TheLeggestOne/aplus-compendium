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
    odd?: boolean;
  }

  let { skill, entry, odd = false }: Props = $props();

  const ability = $derived(SKILL_ABILITY_MAP[skill]);
  const passive = $derived(10 + entry.modifier);
</script>

<div class="flex items-center gap-1.5 px-3 py-0.5 {odd ? 'bg-muted/30' : ''}">
  <ProficiencyDot level={entry.proficiency} />
  <span class="flex-1 text-xs">
    {titleCase(skill)}
    <span class="text-[10px] text-muted-foreground ml-0.5">{ABILITY_ABBREV[ability]}</span>
  </span>
  <ModifierDisplay value={entry.modifier} class="text-xs font-medium w-7 text-right tabular-nums" />
  <span class="text-xs tabular-nums w-7 text-center text-muted-foreground">{passive}</span>
</div>
