<script lang="ts">
    import Label from "./ui/label/label.svelte";

    let {label, value } = $props();
</script>

<span class="font-semibold text-2xl" >{value}</span>
<Label>{label}</Label>
