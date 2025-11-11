<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import AppLayout from '$lib/components/AppLayout.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight, Plus } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { previewItem, previewOpen } from '$lib/stores/preview';

	let { children } = $props();
	
	// Sync previewOpen store with AppLayout's previewCollapsed state
	let previewCollapsed = $state(true);
	
	$effect(() => {
		const unsubscribe = previewOpen.subscribe(value => {
			if (value) {
				previewCollapsed = false;
			}
		});
		return unsubscribe;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppLayout bind:previewCollapsed>
	{#snippet leftNav()}
		<div class="p-2">
			<Accordion.Root class="w-full" type="single">
				<!-- Characters Section -->
				<Accordion.Item value="characters">
					<Accordion.Trigger class="text-sm font-semibold">Characters</Accordion.Trigger>
					<Accordion.Content>
						<div class="space-y-1 pl-2">
							<a href="/" class="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted flex items-center gap-2 no-underline {$page.url.pathname === '/' ? 'bg-muted' : ''}">
								<ChevronRight class="h-3 w-3" />
								Thorin Ironforge
							</a>
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
						<Accordion.Root class="w-full" type="multiple">
							<Accordion.Item value="player">
								<Accordion.Trigger class="text-sm pl-2">Player</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-0.5 pl-4">
										<a href="/resources/races" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/races' ? 'bg-muted' : ''}">Races</a>
										<a href="/resources/classes" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/classes' ? 'bg-muted' : ''}">Classes</a>
										<a href="/resources/backgrounds" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/backgrounds' ? 'bg-muted' : ''}">Backgrounds</a>
										<a href="/resources/feats" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/feats' ? 'bg-muted' : ''}">Feats</a>
										<a href="/resources/spells" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/spells' ? 'bg-muted' : ''}">Spells</a>
										<a href="/resources/items" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/items' ? 'bg-muted' : ''}">Items</a>
										<a href="/resources/optionalfeatures" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/optionalfeatures' ? 'bg-muted' : ''}">Optional Features</a>
										<a href="/resources/skills" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/skills' ? 'bg-muted' : ''}">Skills</a>
										<a href="/resources/languages" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/languages' ? 'bg-muted' : ''}">Languages</a>
									</div>
								</Accordion.Content>
							</Accordion.Item>

							<!-- DM Resources -->
							<Accordion.Item value="dm">
								<Accordion.Trigger class="text-sm pl-2">DM</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-0.5 pl-4">
										<a href="/resources/monsters" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/monsters' ? 'bg-muted' : ''}">Monsters</a>
										<a href="/resources/traps" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/traps' ? 'bg-muted' : ''}">Traps</a>
										<a href="/resources/objects" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/objects' ? 'bg-muted' : ''}">Objects</a>
									</div>
								</Accordion.Content>
							</Accordion.Item>

							<!-- Reference Resources -->
							<Accordion.Item value="reference">
								<Accordion.Trigger class="text-sm pl-2">Reference</Accordion.Trigger>
								<Accordion.Content>
									<div class="space-y-0.5 pl-4">
										<a href="/resources/conditions" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/conditions' ? 'bg-muted' : ''}">Conditions</a>
										<a href="/resources/senses" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/senses' ? 'bg-muted' : ''}">Senses</a>
										<a href="/resources/actions" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/actions' ? 'bg-muted' : ''}">Actions</a>
										<a href="/resources/deities" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/deities' ? 'bg-muted' : ''}">Deities</a>
										<a href="/resources/decks" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/decks' ? 'bg-muted' : ''}">Decks</a>
										<a href="/resources/rules" class="block w-full text-left px-2 py-1 text-xs rounded hover:bg-muted no-underline {$page.url.pathname === '/resources/rules' ? 'bg-muted' : ''}">Rules</a>
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
		{@render children()}
	{/snippet}

	{#snippet previewPane()}
		<div class="p-4">
			{#if $previewItem}
				<h3 class="font-semibold text-lg mb-2">{$previewItem.name}</h3>
				<div class="space-y-3">
					<div>
						<div class="text-xs text-muted-foreground uppercase mb-1">Type</div>
						<div class="text-sm">{$previewItem.type}</div>
					</div>
					{#if $previewItem.level}
						<div>
							<div class="text-xs text-muted-foreground uppercase mb-1">Level</div>
							<div class="text-sm">{$previewItem.level}</div>
						</div>
					{/if}
					<div>
						<div class="text-xs text-muted-foreground uppercase mb-1">Source</div>
						<div class="text-sm">{$previewItem.source}</div>
					</div>
				</div>
			{:else}
				<h3 class="font-semibold mb-2">Preview</h3>
				<div class="text-sm text-muted-foreground">
					Click on any content item to preview it here.
				</div>
			{/if}
		</div>
	{/snippet}
</AppLayout>
