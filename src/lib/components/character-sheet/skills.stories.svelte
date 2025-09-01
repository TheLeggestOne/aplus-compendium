<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Skills from './skills.svelte';

  const { Story } = defineMeta({
    title: 'Components/CharacterSheet/Skills',
    component: Skills,
    args: {
      skills: {
        "Acrobatics": { value: "+2", proficient: false },
        "Animal Handling": { value: "+1", proficient: true },
        "Arcana": { value: "+0", proficient: false },
        "Athletics": { value: "+3", proficient: false },
        "Deception": { value: "+2", proficient: true },
        "History": { value: "+1", proficient: false },
        "Insight": { value: "+0", proficient: false },
        "Intimidation": { value: "+2", proficient: true },
        "Investigation": { value: "+1", proficient: false },
        "Medicine": { value: "+0", proficient: false },
        "Nature": { value: "+1", proficient: false },
        "Perception": { value: "+2", proficient: true },
        "Performance": { value: "+0", proficient: false },
        "Persuasion": { value: "+1", proficient: false },
        "Religion": { value: "+0", proficient: false },
        "Sleight of Hand": { value: "+2", proficient: true },
        "Stealth": { value: "+1", proficient: false },
        "Survival": { value: "+0", proficient: false }
      },
      proficiencyBonus: 2
    }
  });
</script>

<Story name="Swampy Waters"/>
