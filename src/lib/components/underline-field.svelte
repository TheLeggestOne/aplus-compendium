<script lang="ts">
    import Separator from "./ui/separator/separator.svelte";

  let { name, value } = $props();
</script>

<div>
<span class="text-xl">{value}</span>
<Separator class="my-1" />
<span class="text-sm text-muted-foreground">{name}</span>
</div>
