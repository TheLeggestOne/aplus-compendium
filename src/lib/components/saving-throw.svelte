<script>
    import NumberField from "./number-field.svelte";
    import Checkbox from "./ui/checkbox/checkbox.svelte";
    import Item from "./ui/item/item.svelte";

    let { isProficient = false, name, bonus } = $props();

</script>
<Item>
    <Checkbox bind:checked={isProficient} />
    <NumberField label={name} value={bonus} />
</Item>