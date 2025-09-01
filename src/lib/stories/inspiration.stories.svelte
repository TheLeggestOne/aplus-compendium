<script module>
    import {defineMeta} from "@storybook/addon-svelte-csf";
	import Inspiration from "../components/character-sheet/inspiration.svelte";

    const { Story } = defineMeta({
        title: "Components/CharacterSheet/Inspiration",
        component: Inspiration,
        args: {
            inspiration: true
        }
    });
</script>

<Story name="Swampy Waters"/>