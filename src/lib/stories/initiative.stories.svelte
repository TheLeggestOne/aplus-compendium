<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Initiative from "../components/character-sheet/initiative.svelte";

    const { Story } = defineMeta({
        title: 'Components/CharacterSheet/Initiative',
        component: Initiative,
        args: {
            initiative: '+3'
        }
    });
</script>

<Story name="Swampy Waters"/>