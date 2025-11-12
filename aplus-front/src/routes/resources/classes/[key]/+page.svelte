<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { ChevronLeft } from 'lucide-svelte';
	import { getElectronAPI, CONTENT_TYPES } from '$lib/api/electron';

	const key = $derived($page.params.key ?? '');
	
	let classData = $state<any>(null);
	let subclasses = $state<any[]>([]);
	let selectedSubclass = $state<any>(null);
	let loading = $state(true);

	// Load class and its subclasses
	async function loadClassData() {
		loading = true;
		const api = getElectronAPI();
		
		if (!api || !key) {
			loading = false;
			return;
		}

		try {
			// Parse the key to get name and source
			const [name, source] = key.split('::');
			
			// Load the class
			const classItem = await api.content.get(CONTENT_TYPES.CLASSES, name, source);
			classData = classItem;

			// Load all subclasses for this class
			const allSubclasses = await api.content.getAll(CONTENT_TYPES.SUBCLASSES);
			subclasses = allSubclasses.filter((sc: any) => 
				sc.className === name && sc.classSource === source
			);
		} catch (error) {
			console.error('Failed to load class:', error);
		} finally {
			loading = false;
		}
	}

	// Load data when key changes
	$effect(() => {
		if (key) {
			loadClassData();
		}
	});
</script>

<svelte:head>
	<title>{classData?.name || 'Class'} - APlus Compendium</title>
</svelte:head>

<div class="p-6 pt-14 h-full flex flex-col">
	<!-- Header -->
	<div class="mb-6">
		<Button variant="ghost" size="sm" class="mb-4" href="/resources/classes">
			<ChevronLeft class="h-4 w-4 mr-2" />
			Back to Classes
		</Button>
		
		{#if loading}
			<div class="h-8 w-48 bg-muted animate-pulse rounded"></div>
		{:else if classData}
			<div class="flex items-baseline gap-4">
				<h1 class="text-3xl font-bold">{classData.name}</h1>
				<span class="text-sm text-muted-foreground">{classData.source}</span>
			</div>
		{/if}
	</div>

	{#if loading}
		<Card class="p-8">
			<div class="space-y-4">
				<div class="h-4 bg-muted animate-pulse rounded w-3/4"></div>
				<div class="h-4 bg-muted animate-pulse rounded w-1/2"></div>
				<div class="h-4 bg-muted animate-pulse rounded w-5/6"></div>
			</div>
		</Card>
	{:else if classData}
		<div class="flex-1 overflow-y-auto space-y-6">
			<!-- Class Overview -->
			<Card class="p-6">
				<h2 class="text-xl font-semibold mb-4">Overview</h2>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<span class="text-sm text-muted-foreground">Hit Die</span>
						<p class="font-medium">d{classData.hd?.faces}</p>
					</div>
					<div>
						<span class="text-sm text-muted-foreground">Primary Ability</span>
						<p class="font-medium">{classData.proficiency?.join(', ').toUpperCase() || '—'}</p>
					</div>
				</div>
			</Card>

			<!-- Subclasses -->
			{#if subclasses.length > 0}
				<Card class="p-6">
					<h2 class="text-xl font-semibold mb-4">
						{classData.subclassTitle || 'Subclasses'} ({subclasses.length})
					</h2>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						{#each subclasses as subclass}
							<button
								class="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors {selectedSubclass === subclass ? 'border-primary bg-muted/50' : ''}"
								onclick={() => selectedSubclass = selectedSubclass === subclass ? null : subclass}
							>
								<div class="font-medium">{subclass.name}</div>
								<div class="text-sm text-muted-foreground">{subclass.source}</div>
							</button>
						{/each}
					</div>
				</Card>
			{/if}

			<!-- Selected Subclass Details -->
			{#if selectedSubclass}
				<Card class="p-6">
					<h2 class="text-xl font-semibold mb-4">{selectedSubclass.name}</h2>
					<div class="space-y-2">
						<div>
							<span class="text-sm text-muted-foreground">Source</span>
							<p class="font-medium">{selectedSubclass.source}</p>
						</div>
						{#if selectedSubclass.shortName}
							<div>
								<span class="text-sm text-muted-foreground">Short Name</span>
								<p class="font-medium">{selectedSubclass.shortName}</p>
							</div>
						{/if}
						<!-- Add more subclass details here -->
					</div>
				</Card>
			{/if}

			<!-- Class Features (placeholder) -->
			<Card class="p-6">
				<h2 class="text-xl font-semibold mb-4">Class Features</h2>
				<p class="text-sm text-muted-foreground">
					Feature rendering coming soon...
				</p>
			</Card>
		</div>
	{:else}
		<Card class="p-8 text-center">
			<p class="text-muted-foreground">Class not found.</p>
		</Card>
	{/if}
</div>
