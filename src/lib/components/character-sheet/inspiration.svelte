<script lang="ts">
	import Checkbox from "../ui/checkbox.svelte";
    import { Label } from "bits-ui";

    let {isInspired, onChange} = $props<{
        inspiration?: boolean;
        onChange?: (data: { inspiration: boolean }) => void;
    }>();

    let localInspiration = $state(isInspired ?? false);

    $effect(() => {
        if (onChange) {
            onChange({ inspiration: localInspiration });
        }
    });

</script>

<div class="flex flex-row items-center gap-3 select-none">
    <Checkbox id="inspiration-checkbox" bind:checked={localInspiration} name="hasInspiration"/>
    <Label.Root id="inspiration-checkbox-label" for="inspiration-checkbox" class="px-3 py-1 rounded-md border border-primary bg-background text-xs font-semibold tracking-wide uppercase text-muted-foreground shadow-sm">
        Inspiration
    </Label.Root>
</div>
