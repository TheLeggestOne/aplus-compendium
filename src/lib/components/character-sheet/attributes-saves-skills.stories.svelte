<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import AttributesSavesSkills from "./attributes-saves-skills.svelte";

    const { Story } = defineMeta({
        title: "Components/CharacterSheet/AttributesSavesSkills",
        component: AttributesSavesSkills,
        args: {
            attributes: {
                "Strength": 20,
                "Dexterity": 12,
                "Constitution": 14,
                "Intelligence": 16,
                "Wisdom": 18,
                "Charisma": 20
            },
            inspiration: true,
            proficiencyBonus: "+3",
            savingThrows: {
                "Strength": { value: "+2", proficient: true },
                "Dexterity": { value: "+1", proficient: false },
                "Constitution": { value: "+3", proficient: true },
                "Intelligence": { value: "+4", proficient: false },
                "Wisdom": { value: "+5", proficient: false },
                "Charisma": { value: "+6", proficient: false }
            },
            skills: {
                "Acrobatics": { value: "+1", proficient: false },
                "Animal Handling": { value: "+2", proficient: true },
                "Arcana": { value: "+3", proficient: false },
                "Athletics": { value: "+4", proficient: true },
                "Deception": { value: "+5", proficient: false },
                "History": { value: "+6", proficient: true },
                "Insight": { value: "+7", proficient: true },
                "Intimidation": { value: "+8", proficient: true },
                "Investigation": { value: "+9", proficient: true },
                "Medicine": { value: "+10", proficient: true },
                "Nature": { value: "+11", proficient: true },
                "Perception": { value: "+12", proficient: true },
                "Performance": { value: "+13", proficient: true },
                "Persuasion": { value: "+14", proficient: true },
                "Religion": { value: "+15", proficient: true },
                "Sleight of Hand": { value: "+16", proficient: true },
                "Stealth": { value: "+17", proficient: true },
                "Survival": { value: "+18", proficient: true }
            }
        }
    });
</script>

<Story name="Default"/>
