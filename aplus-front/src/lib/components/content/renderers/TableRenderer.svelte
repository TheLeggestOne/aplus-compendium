<script lang="ts">
	/**
	 * Renders 5etools table entry objects
	 * Handles: {type: "table", caption: "...", colLabels: [...], rows: [...]}
	 */
	export let table: {
		type: 'table';
		caption?: string;
		colLabels?: string[];
		colStyles?: string[];
		rows: any[][];
	};
</script>

<div class="table-container my-4 overflow-x-auto">
	{#if table.caption}
		<div class="table-caption mb-2 text-sm font-semibold text-gray-700">{table.caption}</div>
	{/if}
	<table class="min-w-full border-collapse border border-gray-300 text-sm">
		{#if table.colLabels}
			<thead>
				<tr class="bg-gray-100">
					{#each table.colLabels as label, idx}
						<th
							class="border border-gray-300 px-3 py-2 text-left font-semibold"
							style={table.colStyles?.[idx] || ''}
						>
							{label}
						</th>
					{/each}
				</tr>
			</thead>
		{/if}
		<tbody>
			{#each table.rows as row}
				<tr class="even:bg-gray-50">
					{#each row as cell, idx}
						<td class="border border-gray-300 px-3 py-2" style={table.colStyles?.[idx] || ''}>
							{#if typeof cell === 'object' && cell !== null}
								{#if 'type' in cell && cell.type === 'bonus'}
									+{cell.value}
								{:else}
									{JSON.stringify(cell)}
								{/if}
							{:else}
								{cell}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		@apply rounded border border-gray-200 bg-white p-2;
	}
</style>
