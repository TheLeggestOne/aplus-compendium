<script>
    import Checkbox from "./ui/checkbox/checkbox.svelte";

    let { checked = false } = $props();
</script>

<Checkbox bind:checked={checked} />