<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import Speed from "../components/character-sheet/speed.svelte";

    const { Story } = defineMeta({
        title: 'Components/CharacterSheet/Speed',
        component: Speed,
        args: {
            speed: '30'
        }
    });
</script>

<Story name="Swampy Waters"/>