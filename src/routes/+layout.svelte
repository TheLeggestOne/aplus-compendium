<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	let dark = $state(true);

	$effect(() => {
		if(typeof document !== 'undefined') {
			document.documentElement.classList.toggle('dark', dark);
		}
	})
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
