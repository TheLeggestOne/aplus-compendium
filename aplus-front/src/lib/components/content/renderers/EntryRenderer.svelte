<script lang="ts">
	import { onMount } from 'svelte';
	import RichTextRenderer from './RichTextRenderer.svelte';
	import TableRenderer from './TableRenderer.svelte';
	import { EMPTY_ENTRIES_PLACEHOLDER } from '$lib/config/contentDefaults';

	/**
	 * Recursively renders 5etools entry arrays
	 * Handles up to 5 levels of nesting with component-level memoization
	 * Supports: strings, {type: "entries"}, {type: "list"}, {type: "table"}, etc.
	 */
	export let entries: any[];
	export let contentType: string = '';
	export let itemKey: string = '';
	export let depth: number = 0;
	export let compact: boolean = false; // For preview pane vs full page

	// Component-level memoization
	let memoizedEntries: any[] = [];
	let lastEntriesJSON = '';

	$: {
		const currentJSON = JSON.stringify(entries);
		if (currentJSON !== lastEntriesJSON) {
			memoizedEntries = entries || [];
			lastEntriesJSON = currentJSON;
		}
	}

	// Prevent infinite recursion
	const MAX_DEPTH = 5;
	const shouldRecurse = depth < MAX_DEPTH;

	function isEntryObject(entry: any): boolean {
		return typeof entry === 'object' && entry !== null && 'type' in entry;
	}
</script>

{#if memoizedEntries.length === 0}
	<p class="text-sm italic text-gray-500">{EMPTY_ENTRIES_PLACEHOLDER}</p>
{:else}
	<div class="entry-content" class:compact>
		{#each memoizedEntries as entry, idx}
			{#if typeof entry === 'string'}
				<!-- Plain text entry -->
				<p class="entry-paragraph">
					<RichTextRenderer text={entry} />
				</p>
			{:else if isEntryObject(entry)}
				{#if entry.type === 'entries'}
					<!-- Named subsection with nested entries -->
					<div class="entry-subsection" class:nested={depth > 0}>
						{#if entry.name}
							<h4 class="subsection-title" class:depth-1={depth === 0} class:depth-2={depth === 1} class:depth-3={depth >= 2}>
								<RichTextRenderer text={entry.name} />
							</h4>
						{/if}
						{#if shouldRecurse && entry.entries}
							<svelte:self entries={entry.entries} {contentType} {itemKey} depth={depth + 1} {compact} />
						{/if}
					</div>
				{:else if entry.type === 'list'}
					<!-- Bulleted or numbered list -->
					<ul class="entry-list" class:numbered={entry.style === 'numbered'}>
						{#each entry.items as item}
							<li class="list-item">
								{#if typeof item === 'string'}
									<RichTextRenderer text={item} />
								{:else if item.type === 'item'}
									{#if item.name}
										<span class="item-name"><RichTextRenderer text={item.name} />:</span>
									{/if}
									{#if shouldRecurse && item.entries}
										<svelte:self entries={item.entries} {contentType} {itemKey} depth={depth + 1} {compact} />
									{/if}
								{:else if shouldRecurse}
									<svelte:self entries={[item]} {contentType} {itemKey} depth={depth + 1} {compact} />
								{/if}
							</li>
						{/each}
					</ul>
				{:else if entry.type === 'table'}
					<!-- Data table -->
					<TableRenderer table={entry} />
				{:else if entry.type === 'quote'}
					<!-- Block quote -->
					<blockquote class="entry-quote">
						{#if shouldRecurse && entry.entries}
							<svelte:self entries={entry.entries} {contentType} {itemKey} depth={depth + 1} {compact} />
						{/if}
						{#if entry.by}
							<cite class="quote-attribution">— {entry.by}</cite>
						{/if}
					</blockquote>
				{:else if entry.type === 'inset' || entry.type === 'insetReadaloud'}
					<!-- Inset box (often read-aloud text) -->
					<div class="entry-inset" class:readaloud={entry.type === 'insetReadaloud'}>
						{#if entry.name}
							<h5 class="inset-title"><RichTextRenderer text={entry.name} /></h5>
						{/if}
						{#if shouldRecurse && entry.entries}
							<svelte:self entries={entry.entries} {contentType} {itemKey} depth={depth + 1} {compact} />
						{/if}
					</div>
				{:else}
					<!-- Unknown entry type - render as JSON for debugging -->
					<div class="entry-unknown">
						<pre class="text-xs">{JSON.stringify(entry, null, 2)}</pre>
					</div>
				{/if}
			{/if}
		{/each}

		{#if !compact && depth === 0 && contentType && itemKey}
			<!-- Expand link for preview pane -->
			<div class="expand-link-container mt-4">
				<a
					href="/content/{contentType}/{encodeURIComponent(itemKey)}"
					class="expand-link text-sm font-semibold text-blue-600 hover:text-blue-800"
				>
					View Full Details →
				</a>
			</div>
		{/if}
	</div>
{/if}

<style>
	.entry-content {
		@apply space-y-3 text-sm leading-relaxed text-gray-800;
	}

	.entry-content.compact {
		@apply space-y-2;
	}

	.entry-paragraph {
		@apply mb-2;
	}

	.entry-subsection {
		@apply my-3;
	}

	.entry-subsection.nested {
		@apply ml-4;
	}

	.subsection-title {
		@apply mb-2 font-semibold;
	}

	.subsection-title.depth-1 {
		@apply text-lg text-gray-900;
	}

	.subsection-title.depth-2 {
		@apply text-base text-gray-800;
	}

	.subsection-title.depth-3 {
		@apply text-sm text-gray-700;
	}

	.entry-list {
		@apply ml-6 space-y-1;
		list-style-type: disc;
	}

	.entry-list.numbered {
		list-style-type: decimal;
	}

	.list-item {
		@apply leading-relaxed;
	}

	.item-name {
		@apply font-semibold;
	}

	.entry-quote {
		@apply my-3 border-l-4 border-gray-300 bg-gray-50 py-2 pl-4 pr-2 italic;
	}

	.quote-attribution {
		@apply mt-2 block text-right text-sm not-italic text-gray-600;
	}

	.entry-inset {
		@apply my-3 rounded border border-gray-300 bg-gray-50 p-3;
	}

	.entry-inset.readaloud {
		@apply border-blue-300 bg-blue-50;
	}

	.inset-title {
		@apply mb-2 text-sm font-semibold text-gray-800;
	}

	.entry-unknown {
		@apply my-2 rounded bg-yellow-50 p-2;
	}

	.expand-link-container {
		@apply border-t border-gray-200 pt-3;
	}
</style>
