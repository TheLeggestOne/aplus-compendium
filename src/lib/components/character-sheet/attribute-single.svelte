<script lang="ts">
	import type { AttributeKey } from '$lib/constants/attributes';
    import { Label } from 'bits-ui';

    let { attribute, value = "10", onChange } = $props<{
        attribute: AttributeKey;
        value: string;
        onChange?: (data: { attribute: AttributeKey; value: string }) => void;
    }>();

    let localValue = $state(value);

    function getAttributeModifier(value: string): number {
        return Math.floor((Number(localValue) - 10) / 2);
    }

    let attributeModifier = $derived(getAttributeModifier(localValue));

    $effect(() => {
        if (onChange) {
            onChange({ attribute: localValue });
        }
    });
</script>


<div class="flex flex-col items-center">

    <Label.Root for={attribute + '-input'} class="text-xs font-bold mb-1 tracking-wide">{attribute}</Label.Root>

    <div class="w-16 h-16 flex items-center justify-center bg-background border-2 border-input rounded-lg text-3xl font-extrabold mb-2">
        {attributeModifier}
    </div>
    <div class="grid place-items-center w-12 h-12 -mt-6">

        <input id={attribute + '-input'}
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            bind:value={localValue}
            min="1"
            max="30"
            class="circle-input w-12 h-12 border-2 border-input rounded-full bg-background shadow-none !text-lg font-bold -mt-6"
            style="text-align: center; padding: 0; margin: 0;"
            aria-labelledby={attribute + '-label'}
        />

    </div>
</div>