<script lang="ts">
	import AppLayout from '$lib/components/AppLayout.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight, Plus } from 'lucide-svelte';
</script>

<svelte:head>
	<title>APlus Compendium</title>
	<meta name="description" content="D&D 5e Character Manager" />
</svelte:head>

<AppLayout>
	{#snippet leftNav()}
		<div class="p-2">
			<Accordion.Root class="w-full">
				<!-- Characters Section -->
				<Accordion.Item value="characters">
					<Accordion.Trigger class="text-sm font-semibold">Characters</Accordion.Trigger>
					<Accordion.Content>
						<div class="space-y-1 pl-2">
							<button class="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted flex items-center gap-2">
								<ChevronRight class="h-3 w-3" />
								Thorin Ironforge
							</button>
							<button class="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted flex items-center gap-2">
								<ChevronRight class="h-3 w-3" />
								Lyra Moonshadow
							</button>
							<button class="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted flex items-center gap-2">
								<ChevronRight class="h-3 w-3" />
								Grimjaw
							</button>
							<Button variant="outline" size="sm" class="w-full mt-2">
								<Plus class="h-3 w-3 mr-1" />
								New Character
							</Button>
						</div>
					</Accordion.Content>
				</Accordion.Item>

				<!-- Resources Section -->
				<Accordion.Item value="resources">
					<Accordion.Trigger class="text-sm font-semibold">Resources</Accordion.Trigger>
					<Accordion.Content>
						<!-- Player Resources -->
						<Accordion.Root class="w-full">
							<Accordion.Item value="player">
								<Accordion.Trigger class="text-sm pl-2">Player</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-0.5 pl-4">
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Races</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Classes</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Backgrounds</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Feats</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Spells</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Items</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Optional Features</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Skills</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Languages</button>
									</div>
								</Accordion.Content>
							</Accordion.Item>

							<!-- DM Resources -->
							<Accordion.Item value="dm">
								<Accordion.Trigger class="text-sm pl-2">DM</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-0.5 pl-4">
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Monsters</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Traps</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Objects</button>
									</div>
								</Accordion.Content>
							</Accordion.Item>

							<!-- Reference Resources -->
							<Accordion.Item value="reference">
								<Accordion.Trigger class="text-sm pl-2">Reference</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-0.5 pl-4">
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Conditions</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Senses</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Actions</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Deities</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Decks</button>
										<button class="w-full text-left px-2 py-1 text-xs rounded hover:bg-muted">Rules</button>
									</div>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
		</div>
	{/snippet}
	
	{#snippet mainContent()}
		<div class="p-6">
			<h1 class="text-3xl font-bold mb-4">Thorin Ironforge</h1>
			<div class="grid grid-cols-2 gap-4 mb-6">
				<div class="p-4 border rounded">
					<div class="text-sm text-muted-foreground">Class</div>
					<div class="text-lg font-semibold">Fighter 5</div>
				</div>
				<div class="p-4 border rounded">
					<div class="text-sm text-muted-foreground">Race</div>
					<div class="text-lg font-semibold">Mountain Dwarf</div>
				</div>
				<div class="p-4 border rounded">
					<div class="text-sm text-muted-foreground">AC</div>
					<div class="text-lg font-semibold">18</div>
				</div>
				<div class="p-4 border rounded">
					<div class="text-sm text-muted-foreground">HP</div>
					<div class="text-lg font-semibold">42 / 42</div>
				</div>
			</div>
			
			<div class="space-y-4">
				<h2 class="text-xl font-semibold">Abilities</h2>
				<div class="grid grid-cols-6 gap-2">
					{#each ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as ability, i}
						<div class="p-3 border rounded text-center">
							<div class="text-xs text-muted-foreground">{ability}</div>
							<div class="text-2xl font-bold">{[16, 12, 14, 10, 13, 8][i]}</div>
							<div class="text-xs">{['+3', '+1', '+2', '+0', '+1', '-1'][i]}</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/snippet}
	
	{#snippet previewPane()}
		<div class="p-4">
			<h3 class="font-semibold mb-2">Fireball</h3>
			<div class="text-sm space-y-2">
				<div><span class="font-medium">Level:</span> 3rd-level evocation</div>
				<div><span class="font-medium">Casting Time:</span> 1 action</div>
				<div><span class="font-medium">Range:</span> 150 feet</div>
				<div><span class="font-medium">Components:</span> V, S, M</div>
				<div class="pt-2 border-t">
					A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame...
				</div>
			</div>
		</div>
	{/snippet}
</AppLayout>
