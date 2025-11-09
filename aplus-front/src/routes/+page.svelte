<script lang="ts">
	// Add your TypeScript logic here
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Welcome to our site" />
</svelte:head>

<main>
	<h1>Welcome to SvelteKit!</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
		text-align: center;
	}

	h1 {
		font-size: 3rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.25rem;
	}

	a {
		color: #ff3e00;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>