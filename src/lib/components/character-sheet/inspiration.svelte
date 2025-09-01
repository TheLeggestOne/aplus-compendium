<script lang="ts">
	import { useDebouncedChange } from "./utilities/useDebouncedChange";
    import { Checkbox } from "../ui/checkbox";

    const { inspiration, onChange } = $props<{
        inspiration?: boolean;
        onChange?: (data: { inspiration: boolean }) => void;
    }>();

    let isInspired = $state(inspiration ?? false);

    let emitChange = useDebouncedChange(onChange, 800);

    $effect(() => {
        if (emitChange) {
            emitChange({ inspiration: isInspired });
        }
    });

</script>
    <div class="flex flex-row items-center gap-3 select-none">
        <Checkbox id="inspiration-checkbox" bind:checked={isInspired} class="size-6"/>
        <label for="inspiration-checkbox" class="px-3 py-1 rounded-md border border-primary bg-background text-xs font-semibold tracking-wide uppercase text-muted-foreground shadow-sm">
            Inspiration
        </label>
    </div>
