<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	
	const category = $derived($page.params.category ?? '');
	const categoryName = $derived(
		category ? category.charAt(0).toUpperCase() + category.slice(1) : ''
	);

	// Mock data for different categories
	const mockData: Record<string, Array<{ name: string; description: string }>> = {
		spells: [
			{ name: 'Fireball', description: '3rd-level evocation' },
			{ name: 'Magic Missile', description: '1st-level evocation' },
			{ name: 'Shield', description: '1st-level abjuration' },
			{ name: 'Counterspell', description: '3rd-level abjuration' },
			{ name: 'Haste', description: '3rd-level transmutation' }
		],
		races: [
			{ name: 'Dwarf', description: 'Bold and hardy, dwarves are known as skilled warriors' },
			{ name: 'Elf', description: 'Magical people of otherworldly grace' },
			{ name: 'Halfling', description: 'Small and practical folk' },
			{ name: 'Human', description: 'Versatile and ambitious' }
		],
		classes: [
			{ name: 'Fighter', description: 'A master of martial combat' },
			{ name: 'Wizard', description: 'A scholarly magic-user' },
			{ name: 'Cleric', description: 'A priestly champion' },
			{ name: 'Rogue', description: 'A scoundrel who uses stealth and trickery' }
		],
		monsters: [
			{ name: 'Dragon', description: 'Powerful and magical creatures' },
			{ name: 'Goblin', description: 'Small, black-hearted humanoids' },
			{ name: 'Owlbear', description: 'A cross between a bear and an owl' },
			{ name: 'Beholder', description: 'A floating orb with many eyes' }
		]
	};

	const items = $derived(mockData[category] || []);
</script>

<svelte:head>
	<title>{categoryName} - APlus Compendium</title>
</svelte:head>

<div class="p-6 pt-14">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">{categoryName}</h1>
		<div class="flex gap-2">
			<input 
				type="text" 
				placeholder="Search {categoryName.toLowerCase()}..." 
				class="px-3 py-2 border rounded-md w-64"
			/>
			<Button variant="outline">Filter</Button>
		</div>
	</div>

	{#if items.length > 0}
		<div class="space-y-2">
			{#each items as item}
				<Card class="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="font-semibold">{item.name}</h3>
							<p class="text-sm text-muted-foreground">{item.description}</p>
						</div>
						<Button variant="ghost" size="sm">View</Button>
					</div>
				</Card>
			{/each}
		</div>
	{:else}
		<Card class="p-8 text-center">
			<p class="text-muted-foreground">No {categoryName.toLowerCase()} found.</p>
			<p class="text-sm text-muted-foreground mt-2">Check back later or try a different category.</p>
		</Card>
	{/if}
</div>
