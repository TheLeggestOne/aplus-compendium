<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Funnel, ArrowUpNarrowWide, ArrowDownWideNarrow } from 'lucide-svelte';
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
		columns: Array<{
			label: string;
			field?: string; // Direct field path (e.g., "size", "school")
			render?: (item: any) => string; // Custom render function
		}>;
	}

	const displayConfig: Record<string, DisplayConfig> = {
		races: {
			columns: [
				{ label: 'Name', field: 'name' },
				{ 
					label: 'Ability', 
					render: (item) => {
						// ability is an array like [{str: 2, dex: 1}] or [{cha: 2, choose: {from: [...], count: 2}}]
						if (Array.isArray(item.ability)) {
							const parts: string[] = [];
							
							for (const ab of item.ability) {
								if (typeof ab === 'object') {
									// First add fixed ability scores
									Object.entries(ab).forEach(([key, value]) => {
										if (key !== 'choose' && !key.startsWith('_') && typeof value === 'number') {
											parts.push(`${key.toUpperCase()} +${value}`);
										}
									});
									
									// Then add choose options
									if (ab.choose) {
										const count = ab.choose.count || 1;
										const amount = ab.choose.amount || 1;
										if (ab.choose.from && ab.choose.from.length > 0) {
											parts.push(`Any other ${count} +${amount}`);
										} else {
											parts.push(`Any +${amount}`);
										}
									}
								}
							}
							
							return parts.length > 0 ? parts.join(', ') : 'Lineage';
						}
						return 'Lineage';
					}
				},
				{ label: 'Size', field: 'size' },
				{ label: 'Source', field: 'source' }
			]
		},
		// We'll add more configurations as we review each type
		spells: {
			columns: [
				{ label: 'Name', field: 'name' },
				{ label: 'School', field: 'school' },
				{ label: 'Level', field: 'level' },
				{ label: 'Source', field: 'source' }
			]
		}
	};

	const config = $derived(displayConfig[category] || {
		columns: [
			{ label: 'Name', field: 'name' },
			{ label: 'Source', field: 'source' }
		]
	});

	// Get value from item using field path or render function
	function getCellValue(item: any, column: any): string {
		if (column.render) {
			return column.render(item);
		}
		if (column.field) {
			const value = column.field.split('.').reduce((curr: any, prop: string) => curr?.[prop], item);
			return value !== undefined && value !== null ? String(value) : '—';
		}
		return '—';
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
		{#if loading}
			<Card class="p-8 text-center">
				<p class="text-muted-foreground">Loading {categoryName.toLowerCase()}...</p>
			</Card>
		{:else if filteredItems.length > 0}
			<div class="border rounded-md overflow-hidden">
				<table class="w-full">
					<thead>
						<tr class="text-left text-sm border-b bg-background sticky top-0 shadow-sm">
							{#each config.columns.slice(0, -1) as column}
								<th class="p-3 font-semibold bg-background">{column.label}</th>
							{/each}
							<!-- Source column always last with special styling -->
							<th class="p-3 font-semibold bg-background">{config.columns[config.columns.length - 1].label}</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredItems as item}
							<tr 
								class="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
								onclick={() => handleRowClick(item)}
							>
								{#each config.columns.slice(0, -1) as column, idx}
									<td class="p-3 {idx === 0 ? 'font-medium' : 'text-sm text-muted-foreground'}">
										{getCellValue(item, column)}
									</td>
								{/each}
								<!-- Source column with badge styling -->
								<td class="p-3">
									<span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
										{getCellValue(item, config.columns[config.columns.length - 1])}
									</span>
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
