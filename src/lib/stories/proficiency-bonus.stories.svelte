<script module>
    import {defineMeta} from "@storybook/addon-svelte-csf";
	import ProficiencyBonus from "../components/character-sheet/proficiency-bonus.svelte";

    const { Story } = defineMeta({
        title: "Components/CharacterSheet/ProficiencyBonus",
        component: ProficiencyBonus,
        args: {
            proficiencyBonus: "+6"
        }
    });
</script>

<Story name="Swampy Waters"/>