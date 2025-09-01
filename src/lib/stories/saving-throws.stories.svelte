<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import SavingThrows from "../components/character-sheet/saving-throws.svelte";

    const { Story } = defineMeta({
        title: 'Components/CharacterSheet/SavingThrows',
        component: SavingThrows,
        args: {
            savingThrows: {
                Strength: { value: "+5", proficient: false },
                Dexterity: { value: "+7", proficient: true },
                Constitution: { value: "+3", proficient: false },
                Intelligence: { value: "-1", proficient: false },
                Wisdom: { value: "+2", proficient: false },
                Charisma: { value: "+11", proficient: true }
            }
        }
    });
</script>

<Story name="Swampy Waters"/>