<script lang="ts">
	import { ResizablePaneGroup, ResizablePane, ResizableHandle } from '$lib/components/ui/resizable';
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';
	
	let {
		leftNav = $bindable(),
		mainContent = $bindable(),
		previewPane = $bindable()
	}: {
		leftNav?: any;
		mainContent?: any;
		previewPane?: any;
	} = $props();
	
	// Collapse state for each column
	let leftCollapsed = $state(false);
	let previewCollapsed = $state(true); // Start collapsed
</script>

<div class="h-screen flex">
	<ResizablePaneGroup direction="horizontal" class="h-full">
		<!-- Left Navigation Column -->
		{#if !leftCollapsed}
			<ResizablePane defaultSize={20} minSize={15} maxSize={30}>
				<div class="h-full border-r bg-muted/10 flex flex-col">
					<div class="flex items-center justify-between p-2 border-b">
						<h2 class="font-semibold text-sm">Navigation</h2>
						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6"
							onclick={() => (leftCollapsed = true)}
						>
							<ChevronLeft class="h-4 w-4" />
						</Button>
					</div>
					<div class="flex-1 overflow-auto">
						{@render leftNav?.()}
					</div>
				</div>
			</ResizablePane>
			<ResizableHandle />
		{:else}
			<div class="w-8 border-r bg-muted/10 flex flex-col items-center py-2">
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6"
					onclick={() => (leftCollapsed = false)}
				>
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		{/if}

		<!-- Main Content Column (always visible) -->
		<ResizablePane defaultSize={previewCollapsed ? 80 : 60} minSize={40}>
			<div class="h-full flex flex-col">
				{@render mainContent?.()}
			</div>
		</ResizablePane>

		<!-- Preview Pane Column -->
		{#if !previewCollapsed}
			<ResizableHandle />
			<ResizablePane defaultSize={20} minSize={15} maxSize={40}>
				<div class="h-full border-l bg-muted/10 flex flex-col">
					<div class="flex items-center justify-between p-2 border-b">
						<h2 class="font-semibold text-sm">Preview</h2>
						<Button
							variant="ghost"
							size="icon"
							class="h-6 w-6"
							onclick={() => (previewCollapsed = true)}
						>
							<X class="h-4 w-4" />
						</Button>
					</div>
					<div class="flex-1 overflow-auto">
						{@render previewPane?.()}
					</div>
				</div>
			</ResizablePane>
		{/if}
	</ResizablePaneGroup>

	<!-- Preview pane toggle button when collapsed -->
	{#if previewCollapsed}
		<div class="absolute right-4 top-4">
			<Button variant="outline" size="sm" onclick={() => (previewCollapsed = false)}>
				<ChevronLeft class="h-4 w-4 mr-1" />
				Preview
			</Button>
		</div>
	{/if}
</div>
