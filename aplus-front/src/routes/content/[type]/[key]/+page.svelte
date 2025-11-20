<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import ContentDisplay from '$lib/components/content/ContentDisplay.svelte';
	import type { ContentType } from '$lib/electron';

	let contentType: ContentType;
	let itemKey: string;
	let item: any = null;
	let loading = true;
	let error: string | null = null;

	// Parse route params
	$: {
		contentType = $page.params.type as ContentType;
		itemKey = decodeURIComponent($page.params.key || '');
	}

	// Fetch content item
	async function loadContent() {
		loading = true;
		error = null;

		try {
			if (!window.electronAPI) {
				throw new Error('Electron API not available');
			}

			item = await window.electronAPI.content.get(contentType, itemKey);

			if (!item) {
				throw new Error(`Content not found: ${itemKey}`);
			}
		} catch (err) {
			console.error('Error loading content:', err);
			error = err instanceof Error ? err.message : 'Failed to load content';
		} finally {
			loading = false;
		}
	}

	// Load on mount and when params change
	$: if (contentType && itemKey) {
		loadContent();
	}

	// Open in new window
	function openInNewWindow() {
		if (window.electronAPI?.window?.openNew) {
			const url = `/content/${contentType}/${encodeURIComponent(itemKey)}`;
			window.electronAPI.window.openNew(url);
		}
	}
</script>

<svelte:head>
	<title>{item?.name || 'Loading...'} - APlus Compendium</title>
</svelte:head>

<div class="expanded-content-page">
	<!-- Header with actions -->
	<div class="page-header">
		<div class="header-content">
			<div class="breadcrumbs">
				<a href="/resources/player" class="breadcrumb-link">Resources</a>
				<span class="breadcrumb-separator">/</span>
				<span class="breadcrumb-current">{contentType}</span>
			</div>

			<div class="header-actions">
				<button
					on:click={openInNewWindow}
					class="action-button new-window-button"
					title="Open in new window"
					aria-label="Open in new window"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
					<span class="button-text">New Window</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Content area -->
	<div class="content-area">
		{#if loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p class="loading-text">Loading content...</p>
			</div>
		{:else if error}
			<div class="error-state">
				<div class="error-icon">⚠️</div>
				<h2 class="error-title">Error Loading Content</h2>
				<p class="error-message">{error}</p>
				<a href="/resources/player" class="back-link">← Back to Resources</a>
			</div>
		{:else if item}
			<div class="content-wrapper">
				<ContentDisplay {contentType} {item} {itemKey} />
			</div>
		{/if}
	</div>
</div>

<style>
	.expanded-content-page {
		@apply flex h-screen flex-col bg-gray-100;
	}

	.page-header {
		@apply border-b border-gray-300 bg-white shadow-sm;
	}

	.header-content {
		@apply mx-auto flex max-w-6xl items-center justify-between px-6 py-4;
	}

	.breadcrumbs {
		@apply flex items-center text-sm text-gray-600;
	}

	.breadcrumb-link {
		@apply hover:text-gray-900 hover:underline;
	}

	.breadcrumb-separator {
		@apply mx-2;
	}

	.breadcrumb-current {
		@apply font-semibold text-gray-900;
	}

	.header-actions {
		@apply flex gap-2;
	}

	.action-button {
		@apply flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
	}

	.new-window-button:hover {
		@apply border-blue-400 bg-blue-50 text-blue-700;
	}

	.button-text {
		@apply hidden sm:inline;
	}

	.content-area {
		@apply flex-1 overflow-auto;
	}

	.loading-state {
		@apply flex h-full flex-col items-center justify-center;
	}

	.loading-spinner {
		@apply h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600;
	}

	.loading-text {
		@apply mt-4 text-gray-600;
	}

	.error-state {
		@apply flex h-full flex-col items-center justify-center p-8 text-center;
	}

	.error-icon {
		@apply text-6xl;
	}

	.error-title {
		@apply mt-4 text-2xl font-bold text-gray-900;
	}

	.error-message {
		@apply mt-2 text-gray-600;
	}

	.back-link {
		@apply mt-6 text-blue-600 hover:text-blue-800 hover:underline;
	}

	.content-wrapper {
		@apply mx-auto max-w-4xl p-6;
	}
</style>
