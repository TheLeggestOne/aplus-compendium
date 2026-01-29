<script lang="ts">
    import Item from "./ui/item/item.svelte";
    import Label from "./ui/label/label.svelte";

  let {label, value, subValue} = $props();
</script>

<Item>
  <span class="text-2xl">{value}</span>
  <span class="text-sm">{subValue}</span>
</Item>
<Label>{label}</Label>