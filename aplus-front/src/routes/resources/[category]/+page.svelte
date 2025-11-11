<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, Filter, SortAsc, SortDesc } from 'lucide-svelte';
	import { previewItem, previewOpen } from '$lib/stores/preview';
	
	const category = $derived($page.params.category ?? '');
	const categoryName = $derived(
		category ? category.charAt(0).toUpperCase() + category.slice(1) : ''
	);

	let searchQuery = $state('');
	let sortAscending = $state(true);

	function handleRowClick(item: any) {
		previewItem.set(item);
		previewOpen.set(true);
	}

	// Mock data for different categories with more detailed info
	const mockData: Record<string, Array<{ name: string; type: string; source: string; level?: string }>> = {
		spells: [
			{ name: 'Fireball', type: 'Evocation', source: 'PHB', level: '3' },
			{ name: 'Magic Missile', type: 'Evocation', source: 'PHB', level: '1' },
			{ name: 'Shield', type: 'Abjuration', source: 'PHB', level: '1' },
			{ name: 'Counterspell', type: 'Abjuration', source: 'PHB', level: '3' },
			{ name: 'Haste', type: 'Transmutation', source: 'PHB', level: '3' },
			{ name: 'Cure Wounds', type: 'Evocation', source: 'PHB', level: '1' },
			{ name: 'Healing Word', type: 'Evocation', source: 'PHB', level: '1' },
			{ name: 'Bless', type: 'Enchantment', source: 'PHB', level: '1' },
			{ name: 'Burning Hands', type: 'Evocation', source: 'PHB', level: '1' },
			{ name: 'Detect Magic', type: 'Divination', source: 'PHB', level: '1' }
		],
		races: [
			{ name: 'Dwarf', type: 'Humanoid', source: 'PHB' },
			{ name: 'Elf', type: 'Humanoid', source: 'PHB' },
			{ name: 'Halfling', type: 'Humanoid', source: 'PHB' },
			{ name: 'Human', type: 'Humanoid', source: 'PHB' },
			{ name: 'Dragonborn', type: 'Humanoid', source: 'PHB' },
			{ name: 'Gnome', type: 'Humanoid', source: 'PHB' },
			{ name: 'Half-Elf', type: 'Humanoid', source: 'PHB' },
			{ name: 'Half-Orc', type: 'Humanoid', source: 'PHB' },
			{ name: 'Tiefling', type: 'Humanoid', source: 'PHB' }
		],
		classes: [
			{ name: 'Barbarian', type: 'Martial', source: 'PHB' },
			{ name: 'Bard', type: 'Spellcaster', source: 'PHB' },
			{ name: 'Cleric', type: 'Spellcaster', source: 'PHB' },
			{ name: 'Druid', type: 'Spellcaster', source: 'PHB' },
			{ name: 'Fighter', type: 'Martial', source: 'PHB' },
			{ name: 'Monk', type: 'Martial', source: 'PHB' },
			{ name: 'Paladin', type: 'Half-Caster', source: 'PHB' },
			{ name: 'Ranger', type: 'Half-Caster', source: 'PHB' },
			{ name: 'Rogue', type: 'Martial', source: 'PHB' },
			{ name: 'Sorcerer', type: 'Spellcaster', source: 'PHB' },
			{ name: 'Warlock', type: 'Spellcaster', source: 'PHB' },
			{ name: 'Wizard', type: 'Spellcaster', source: 'PHB' }
		],
		monsters: [
			{ name: 'Ancient Red Dragon', type: 'Dragon', source: 'MM', level: 'CR 24' },
			{ name: 'Beholder', type: 'Aberration', source: 'MM', level: 'CR 13' },
			{ name: 'Goblin', type: 'Humanoid', source: 'MM', level: 'CR 1/4' },
			{ name: 'Owlbear', type: 'Monstrosity', source: 'MM', level: 'CR 3' },
			{ name: 'Kobold', type: 'Humanoid', source: 'MM', level: 'CR 1/8' },
			{ name: 'Orc', type: 'Humanoid', source: 'MM', level: 'CR 1/2' },
			{ name: 'Lich', type: 'Undead', source: 'MM', level: 'CR 21' },
			{ name: 'Tarrasque', type: 'Monstrosity', source: 'MM', level: 'CR 30' }
		],
		items: [
			{ name: 'Longsword', type: 'Weapon', source: 'PHB' },
			{ name: 'Plate Armor', type: 'Armor', source: 'PHB' },
			{ name: 'Potion of Healing', type: 'Potion', source: 'PHB' },
			{ name: 'Ring of Protection', type: 'Ring', source: 'DMG' },
			{ name: 'Bag of Holding', type: 'Wondrous Item', source: 'DMG' },
			{ name: 'Cloak of Invisibility', type: 'Wondrous Item', source: 'DMG' }
		],
		backgrounds: [
			{ name: 'Acolyte', type: 'Background', source: 'PHB' },
			{ name: 'Criminal', type: 'Background', source: 'PHB' },
			{ name: 'Folk Hero', type: 'Background', source: 'PHB' },
			{ name: 'Noble', type: 'Background', source: 'PHB' },
			{ name: 'Sage', type: 'Background', source: 'PHB' },
			{ name: 'Soldier', type: 'Background', source: 'PHB' }
		]
	};

	const items = $derived(mockData[category] || []);
	
	const filteredItems = $derived(
		items
			.filter(item => 
				searchQuery === '' || 
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.type.toLowerCase().includes(searchQuery.toLowerCase())
			)
			.sort((a, b) => {
				const comparison = a.name.localeCompare(b.name);
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
		{#if filteredItems.length > 0}
			<div class="border rounded-md overflow-hidden">
				<table class="w-full">
					<thead>
						<tr class="text-left text-sm border-b bg-background sticky top-0 shadow-sm">
							<th class="p-3 font-semibold bg-background">Name</th>
							<th class="p-3 font-semibold bg-background">Type</th>
							{#if filteredItems.some(item => item.level)}
								<th class="p-3 font-semibold bg-background">Level</th>
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
								<td class="p-3 text-sm text-muted-foreground">{item.type}</td>
								{#if filteredItems.some(i => i.level)}
									<td class="p-3 text-sm text-muted-foreground">{item.level || '—'}</td>
								{/if}
								<td class="p-3">
									<span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{item.source}</span>
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
