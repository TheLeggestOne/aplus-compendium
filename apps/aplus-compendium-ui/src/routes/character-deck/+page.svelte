<script lang="ts">
	import CharacterSummaryCard from "../../components/character-summary-card.svelte";
	import type { Character } from "@aplus-compendium/types";

	let { characters = [] }: { characters?: Character[] } = $props();
</script>

<div class="container mx-auto p-6">
	<h1 class="text-3xl font-bold mb-8">Character Deck</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
		{#each characters as character}
			<CharacterSummaryCard {character} />
		{/each}
	</div>
</div>