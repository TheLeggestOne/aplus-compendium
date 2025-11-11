<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Filter, SortAsc, SortDesc } from 'lucide-svelte';
	import { previewItem, previewOpen } from '$lib/stores/preview';
	import { getAllContent, CONTENT_TYPES } from '$lib/api/electron';
	
	const category = $derived($page.params.category ?? '');
	const categoryName = $derived(
		category ? category.charAt(0).toUpperCase() + category.slice(1) : ''
	);

	let searchQuery = $state('');
	let sortAscending = $state(true);
	let items = $state<any[]>([]);
	let loading = $state(true);

	// Display configuration for each content type
	interface DisplayConfig {
		typeField?: string; // Field to show in the "Type" column
		levelField?: string; // Field to show in the "Level/CR" column
		levelLabel?: string; // Label for the level column
	}

	const displayConfig: Record<string, DisplayConfig> = {
		spells: {
			typeField: 'school',
			levelField: 'level',
			levelLabel: 'Level'
		},
		monsters: {
			typeField: 'type',
			levelField: 'cr',
			levelLabel: 'CR'
		},
		races: {
			typeField: 'size',
			levelField: undefined
		},
		classes: {
			typeField: 'hd.faces', // Hit dice type
			levelField: undefined
		},
		backgrounds: {
			typeField: undefined,
			levelField: undefined
		},
		items: {
			typeField: 'type',
			levelField: 'rarity',
			levelLabel: 'Rarity'
		},
		feats: {
			typeField: 'prerequisite',
			levelField: undefined
		},
		conditions: {
			typeField: undefined,
			levelField: undefined
		},
		languages: {
			typeField: 'type',
			levelField: undefined
		},
		skills: {
			typeField: 'ability',
			levelField: undefined
		}
	};

	const config = $derived(displayConfig[category] || {});

	// Get nested field value (e.g., "hd.faces")
	function getNestedValue(obj: any, path: string | undefined): string {
		if (!path) return '—';
		const value = path.split('.').reduce((curr, prop) => curr?.[prop], obj);
		return value !== undefined && value !== null ? String(value) : '—';
	}

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

	function handleRowClick(item: any) {
		previewItem.set(item);
		previewOpen.set(true);
	}

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
				<Filter class="h-4 w-4 mr-2" />
				Filters
			</Button>
			<Button 
				variant="outline" 
				size="sm"
				onclick={() => sortAscending = !sortAscending}
			>
				{#if sortAscending}
					<SortAsc class="h-4 w-4 mr-2" />
				{:else}
					<SortDesc class="h-4 w-4 mr-2" />
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
		{#if loading}
			<Card class="p-8 text-center">
				<p class="text-muted-foreground">Loading {categoryName.toLowerCase()}...</p>
			</Card>
		{:else if filteredItems.length > 0}
			<div class="border rounded-md overflow-hidden">
				<table class="w-full">
					<thead>
						<tr class="text-left text-sm border-b bg-background sticky top-0 shadow-sm">
							<th class="p-3 font-semibold bg-background">Name</th>
							{#if config.typeField}
								<th class="p-3 font-semibold bg-background">Type</th>
							{/if}
							{#if config.levelField}
								<th class="p-3 font-semibold bg-background">{config.levelLabel || 'Level'}</th>
							{/if}
							<th class="p-3 font-semibold bg-background">Source</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredItems as item}
							<tr 
								class="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
								onclick={() => handleRowClick(item)}
							>
								<td class="p-3 font-medium">{item.name}</td>
								{#if config.typeField}
									<td class="p-3 text-sm text-muted-foreground">
										{getNestedValue(item, config.typeField)}
									</td>
								{/if}
								{#if config.levelField}
									<td class="p-3 text-sm text-muted-foreground">
										{getNestedValue(item, config.levelField)}
									</td>
								{/if}
								<td class="p-3">
									<span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{item.source || 'Unknown'}</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<Card class="p-8 text-center">
				<p class="text-muted-foreground">No {categoryName.toLowerCase()} found.</p>
				<p class="text-sm text-muted-foreground mt-2">
					{searchQuery ? 'Try adjusting your search.' : 'Check back later or try a different category.'}
				</p>
			</Card>
		{/if}
	</div>
</div>
