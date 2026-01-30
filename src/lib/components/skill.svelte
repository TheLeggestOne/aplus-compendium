<script>
    import { Checkbox } from "./ui/checkbox";
    import { Item } from "./ui/item";
    import NumberField from "./number-field.svelte";
    import Label from "./ui/label/label.svelte";

    let { name, bonus, attribute, isProficient } = $props();
</script>
<Item>
    <Checkbox bind:checked={isProficient} />
    <NumberField label={name} value={bonus} />
    <Label class="text-foreground-secondary text-sm text-muted-foreground">({attribute})</Label>
</Item>