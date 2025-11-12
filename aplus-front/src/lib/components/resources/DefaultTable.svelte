<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { previewItem, previewOpen } from '$lib/stores/preview';

	interface Props {
		items: any[];
		loading?: boolean;
		category?: string;
	}

	let { items = [], loading = false, category = '' }: Props = $props();

	function handleRowClick(item: any) {
		previewItem.set(item);
		previewOpen.set(true);
	}
</script>

{#if loading}
	<Card class="p-8 text-center">
		<p class="text-muted-foreground">Loading {category}...</p>
	</Card>
{:else if items.length > 0}
	<div class="border rounded-md overflow-hidden">
		<table class="w-full">
			<thead>
				<tr class="text-left text-sm border-b bg-background sticky top-0 shadow-sm">
					<th class="p-3 font-semibold bg-background">Name</th>
					<th class="p-3 font-semibold bg-background">Source</th>
				</tr>
			</thead>
			<tbody>
				{#each items as item}
					<tr 
						class="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
						onclick={() => handleRowClick(item)}
					>
						<td class="p-3 font-medium">{item.name || '—'}</td>
						<td class="p-3">
							<span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
								{item.source || '—'}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<Card class="p-8 text-center">
		<p class="text-muted-foreground">No {category} found.</p>
	</Card>
{/if}
