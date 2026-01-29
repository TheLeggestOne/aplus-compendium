<script lang="ts">
    import Checkbox from "./ui/checkbox/checkbox.svelte";
    import Item from "./ui/item/item.svelte";
    import Label from "./ui/label/label.svelte";

    let {labelText, checked} = $props();
</script>

<Item>
    <Checkbox bind:checked={checked} /><Label>{labelText}</Label>
</Item>