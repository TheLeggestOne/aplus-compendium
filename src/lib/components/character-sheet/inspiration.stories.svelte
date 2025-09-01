<script module>
    import {defineMeta} from "@storybook/addon-svelte-csf";
	import Inspiration from "./inspiration.svelte";

    const { Story } = defineMeta({
        title: "Components/CharacterSheet/Inspiration",
        component: Inspiration,
        args: {
            inspiration: true
        }
    });
</script>

<Story name="Swampy Waters"/>