<script lang="ts">
	import { Card } from '$lib/components/ui/card';

	interface Props {
		items: any[];
		loading?: boolean;
	}

	let { items = [], loading = false }: Props = $props();

	function getClassUrl(classItem: any): string {
		// Create URL-safe key from name and source
		const key = `${classItem.name}::${classItem.source}`;
		return `/resources/classes/${encodeURIComponent(key)}`;
	}
</script>

{#if loading}
	<Card class="p-8 text-center">
		<p class="text-muted-foreground">Loading classes...</p>
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
				{#each items as classItem}
					<tr class="border-b last:border-b-0 hover:bg-muted/50 transition-colors">
						<td class="p-3">
							<a 
								href={getClassUrl(classItem)}
								class="font-medium hover:underline block"
							>
								{classItem.name || '—'}
							</a>
						</td>
						<td class="p-3">
							<span class="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
								{classItem.source || '—'}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<Card class="p-8 text-center">
		<p class="text-muted-foreground">No classes found.</p>
	</Card>
{/if}
