<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<a href="#/">Characters</a>
	<a href="#/system-data">System Data</a>
	<a href="#/books">Books</a>
	<a href="#/import">Import</a>
</nav>

{@render children()}

<style>
	nav {
		background: #333;
		padding: 1rem 2rem;
		display: flex;
		gap: 2rem;
	}
	
	nav a {
		color: white;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}
	
	nav a:hover {
		color: #4CAF50;
	}
</style>
