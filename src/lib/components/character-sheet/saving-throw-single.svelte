<script lang="ts">
	import type { AttributeKey } from "$lib/constants/attributes";
    import { Checkbox } from "bits-ui";

    let { ability, value, isProficient, onChange } = $props<{
        ability: AttributeKey;
        value: string;
        isProficient: boolean;
        onChange: (ability: AttributeKey, value: string) => void;
    }>();

    let localValue = $state(value);
    let localProficient = $state(isProficient);

    $effect(() => {
        if (onChange) {
            onChange(ability, localValue);
        }
    });

</script>

<div class="flex items-center gap-2">
    <Checkbox.Root
        bind:checked={localProficient}
        aria-label={localProficient ? `Remove proficiency in ${ability}` : `Mark proficiency in ${ability}`}
        class="w-6 h-6"
    />
    <input
        type="text"
        bind:value={localValue}
        class="w-12 text-center font-bold bg-transparent border-none focus:ring-0 focus:outline-none"
        placeholder="+0"
        aria-label={`${ability} saving throw`}
    />
    <span class="text-xs font-medium w-20">{ability}</span>
</div>