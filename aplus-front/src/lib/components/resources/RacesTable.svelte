<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { previewItem, previewOpen } from '$lib/stores/preview';

	interface Props {
		items: any[];
		loading?: boolean;
	}

	let { items = [], loading = false }: Props = $props();

	function handleRowClick(item: any) {
		previewItem.set(item);
		previewOpen.set(true);
	}

	function formatAbilities(item: any): string {
		if (!Array.isArray(item.ability)) return 'Lineage';
		
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
</script>

{#if loading}
	<Card class="p-8 text-center">
		<p class="text-muted-foreground">Loading races...</p>
	</Card>
{:else if items.length > 0}
	<div class="border rounded-md overflow-hidden">
		<table class="w-full">
			<thead>
				<tr class="text-left text-sm border-b bg-background sticky top-0 shadow-sm">
					<th class="p-3 font-semibold bg-background">Name</th>
					<th class="p-3 font-semibold bg-background">Ability</th>
					<th class="p-3 font-semibold bg-background">Size</th>
					<th class="p-3 font-semibold bg-background">Source</th>
				</tr>
			</thead>
			<tbody>
				{#each items as race}
					<tr 
						class="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors"
						onclick={() => handleRowClick(race)}
					>
						<td class="p-3 font-medium">{race.name || '—'}</td>
						<td class="p-3 text-sm text-muted-foreground">{formatAbilities(race)}</td>
						<td class="p-3 text-sm text-muted-foreground">{race.size || '—'}</td>
						<td class="p-3">
							<span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
								{race.source || '—'}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<Card class="p-8 text-center">
		<p class="text-muted-foreground">No races found.</p>
	</Card>
{/if}
