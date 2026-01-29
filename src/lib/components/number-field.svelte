<script lang="ts">
    import Item from "./ui/item/item.svelte";
    import Label from "./ui/label/label.svelte";

    let {label, value } = $props();
</script>

<Item>
    <span class="font-semibold text-2xl" >{value}</span>
</Item>
<Label>{label}</Label>