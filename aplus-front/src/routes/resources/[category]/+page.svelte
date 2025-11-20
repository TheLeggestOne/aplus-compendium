<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Funnel, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-svelte';
	import { getAllContent, CONTENT_TYPES } from '$lib/api/electron';
	import RacesTable from '$lib/components/resources/RacesTable.svelte';
	import ClassesTable from '$lib/components/resources/ClassesTable.svelte';
	import SpellsTable from '$lib/components/resources/SpellsTable.svelte';
	import DefaultTable from '$lib/components/resources/DefaultTable.svelte';
	
	const category = $derived($page.params.category ?? '');
	const categoryName = $derived(
		category ? category.charAt(0).toUpperCase() + category.slice(1) : ''
	);

	let searchQuery = $state('');
	let sortAscending = $state(true);
	let items = $state<any[]>([]);
	let loading = $state(true);

	// Map URL categories to content types (backend expects plural forms)
	const categoryTypeMap: Record<string, string> = {
		actions: CONTENT_TYPES.ACTIONS,
		backgrounds: CONTENT_TYPES.BACKGROUNDS,
		classes: CONTENT_TYPES.CLASSES,
		conditions: CONTENT_TYPES.CONDITIONS,
		decks: CONTENT_TYPES.DECKS,
		deities: CONTENT_TYPES.DEITIES,
		feats: CONTENT_TYPES.FEATS,
		items: CONTENT_TYPES.ITEMS,
		languages: CONTENT_TYPES.LANGUAGES,
		monsters: CONTENT_TYPES.MONSTERS,
		objects: CONTENT_TYPES.OBJECTS,
		optionalfeatures: CONTENT_TYPES.OPTIONAL_FEATURES,
		races: CONTENT_TYPES.RACES,
		rules: CONTENT_TYPES.RULES,
		senses: CONTENT_TYPES.SENSES,
		skills: CONTENT_TYPES.SKILLS,
		spells: CONTENT_TYPES.SPELLS,
		traps: CONTENT_TYPES.TRAPS
	};

	// Load content when category changes
	async function loadContent() {
		loading = true;
		const contentType = categoryTypeMap[category];
		
		if (!contentType) {
			console.warn(`Unknown category: ${category}`);
			items = [];
			loading = false;
			return;
		}

		console.log(`Loading content for category: ${category}, type: ${contentType}`);
		
		try {
			const data = await getAllContent(contentType);
			console.log(`Loaded ${data.length} items for ${category}:`, data);
			items = data;
		} catch (error) {
			console.error(`Failed to load ${category}:`, error);
			items = [];
		} finally {
			loading = false;
		}
	}

	// Reload content when category changes
	$effect(() => {
		if (category) {
			console.log('Category changed to:', category);
			loadContent();
		}
	});
	
	const filteredItems = $derived(
		items
			.filter(item => 
				searchQuery === '' || 
				item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.type?.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.sort((a, b) => {
				const comparison = (a.name || '').localeCompare(b.name || '');
				return sortAscending ? comparison : -comparison;
			})
	);
</script>

<svelte:head>
	<title>{categoryName} - APlus Compendium</title>
</svelte:head>

<div class="p-6 pt-14 h-full flex flex-col">
	<div class="flex items-center justify-between mb-4">
		<div>
			<h1 class="text-2xl font-bold">{categoryName}</h1>
			<p class="text-sm text-muted-foreground">{filteredItems.length} items</p>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm">
				<Funnel class="h-4 w-4 mr-2" />
				Filters
			</Button>
			<Button 
				variant="outline" 
				size="sm"
				onclick={() => sortAscending = !sortAscending}
			>
				{#if sortAscending}
					<ArrowUpNarrowWide class="h-4 w-4 mr-2" />
				{:else}
					<ArrowDownWideNarrow class="h-4 w-4 mr-2" />
				{/if}
				Sort
			</Button>
		</div>
	</div>

	<div class="relative mb-4">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
		<Input 
			type="text" 
			placeholder="Search {categoryName.toLowerCase()}..." 
			class="pl-9"
			bind:value={searchQuery}
		/>
	</div>

	<div class="flex-1 overflow-y-scroll">
		{#if category === 'races'}
			<RacesTable items={filteredItems} {loading} />
		{:else if category === 'classes'}
			<ClassesTable items={filteredItems} {loading} />
		{:else if category === 'spells'}
			<SpellsTable items={filteredItems} {loading} />
		{:else}
			<DefaultTable 
				items={filteredItems} 
				{loading} 
				category={categoryName.toLowerCase()}
				contentType={categoryTypeMap[category]}
			/>
		{/if}
	</div>
</div>
