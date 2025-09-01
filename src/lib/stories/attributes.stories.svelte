<script module>
    import {defineMeta} from "@storybook/addon-svelte-csf";
	import Attributes from "../components/character-sheet/attributes.svelte";

    const { Story } = defineMeta({
        title: "Components/CharacterSheet/Attributes",
        component: Attributes,
        args: {
            attributes:{
                "Strength": "20",
                "Dexterity": "12",
                "Constitution": "14",
                "Intelligence": "9",
                "Wisdom": "13",
                "Charisma": "19"
            }
        }
    });
</script>

<Story name="Swampy Waters"/>