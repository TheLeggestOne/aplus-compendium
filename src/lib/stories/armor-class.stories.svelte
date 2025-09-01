<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import ArmorClass from "../components/character-sheet/armor-class.svelte";

    const { Story } = defineMeta({
        title: 'Components/CharacterSheet/ArmorClass',
        component: ArmorClass,
        args: {
            armorClass: '16'
        }
    });
</script>

<Story name="Swampy Waters"/>