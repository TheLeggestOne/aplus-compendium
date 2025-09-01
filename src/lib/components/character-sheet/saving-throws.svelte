<script lang="ts">
    import { useDebouncedChange } from "./utilities/useDebouncedChange";
    import { Input } from "../ui/input";
    import { Checkbox } from "../ui/checkbox";

    const { savingThrows, onChange } = $props<{
        savingThrows?: Record<AttributeKeys, { value: string; proficient: boolean }>;
        onChange?: (data: { savingThrows: Record<AttributeKeys, { value: string; proficient: boolean }> }) => void;
    }>();

    export type AttributeKeys = "Strength" | "Dexterity" | "Constitution" | "Intelligence" | "Wisdom" | "Charisma";

    const ATTRIBUTE_KEYS : AttributeKeys[] = [
        "Strength",
        "Dexterity",
        "Constitution",
        "Intelligence",
        "Wisdom",
        "Charisma"
    ];

    let throws = $state<Record<AttributeKeys, { value: string; proficient: boolean }>>(savingThrows ?? Object.fromEntries(
        ATTRIBUTE_KEYS.map(a => [a, { value: "", proficient: false }])
    ));

    let emitChange = useDebouncedChange(onChange, 800);

    $effect(() => {
        if (emitChange) emitChange({ savingThrows: throws });
    });
</script>

<div class="flex flex-col gap-2">
    <span class="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-1">Saving Throws</span>
    <div class="grid grid-cols-1 gap-2">
        {#each ATTRIBUTE_KEYS as ability}
            <div class="flex items-center gap-2">
                <Checkbox
                    bind:checked={throws[ability].proficient}
                    aria-label={throws[ability].proficient ? `Remove proficiency in ${ability}` : `Mark proficiency in ${ability}`}
                    class="w-6 h-6"
                />
                <Input
                    type="text"
                    bind:value={throws[ability].value}
                    class="w-12 text-center font-bold bg-transparent border-none focus:ring-0 focus:outline-none"
                    placeholder="+0"
                    aria-label={`${ability} saving throw`}
                />
                <span class="text-xs font-medium w-20">{ability}</span>
            </div>
        {/each}
    </div>
</div>
