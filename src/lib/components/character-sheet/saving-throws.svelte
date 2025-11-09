<script lang="ts">
	import { ATTRIBUTE_KEYS, type AttributeKey } from "$lib/constants/attributes";
	import SavingThrowSingle from "./saving-throw-single.svelte";

    const { savingThrows, onChange } = $props<{
        savingThrows?: Record<AttributeKey, { value: string; proficient: boolean }>;
        onChange?: (data: { savingThrows: Record<AttributeKey, { value: string; proficient: boolean }> }) => void;
    }>();
</script>

<div class="flex flex-col gap-2">
    <span class="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-1">Saving Throws</span>
    <div class="grid grid-cols-1 gap-2">
        {#each ATTRIBUTE_KEYS as ability}
            <SavingThrowSingle
                ability={ability}
                value={savingThrows[ability]?.value}
                isProficient={savingThrows[ability]?.proficient}
                onChange={(value) => {
                    if (onChange) {
                        onChange({
                            savingThrows: {
                                ...savingThrows,
                                [ability]: value,
                            },
                        });
                    }
                }}
            />
        {/each}
    </div>
</div>
