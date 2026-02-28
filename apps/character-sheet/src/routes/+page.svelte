<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    const lastId = localStorage.getItem('aplus:activeCharacterId');
    const target = lastId ? `/character/${lastId}` : '/characters';
    goto(target, { replaceState: true });
  });
</script>
