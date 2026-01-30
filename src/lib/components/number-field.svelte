<script lang="ts">
    import Label from "./ui/label/label.svelte";

    let { label, value } = $props();
</script>

<span class="block min-w-[1rem] text-xl" aria-live="polite">{value || "\u00A0"}</span>
<Label>{label}</Label>