<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
    import * as Sidebar from '$lib/components/ui/sidebar/index.js';
    import AppSidebar from '$lib/components/app-sidebar.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<main>
		<Sidebar.Trigger />
		{@render children?.()}
	</main>
</Sidebar.Provider>