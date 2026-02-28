<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import Sidebar from '$lib/components/nav/sidebar.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <title>A+ Compendium</title>
</svelte:head>

<div class="flex h-screen overflow-hidden bg-background text-foreground">
  <Sidebar />
  <main class="min-w-0 flex-1 overflow-hidden">
    {@render children()}
  </main>
</div>
