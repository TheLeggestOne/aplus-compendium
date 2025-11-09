<script lang="ts">
    import { Label } from "bits-ui";

    let { proficiencyBonus, onChange } = $props<{
        proficiencyBonus?: string;
        onChange?: (data: { proficiencyBonus: string }) => void;
    }>();

    let localProficiencyBonus = $state(proficiencyBonus ?? "+2");

    $effect(() => {
        if (onChange) {
            onChange({ proficiencyBonus: localProficiencyBonus });
        }
    });



</script>
    <div class="flex flex-row items-center gap-3 select-none">
        <div class="w-14 h-14 flex items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm">
            <input id="proficiency-bonus" type="text" bind:value={localProficiencyBonus} placeholder="+2" class="text-center !text-xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none w-full h-full" />
        </div>
        <Label.Root for="proficiency-bonus" class="px-3 py-1 rounded-md border border-primary bg-background text-xs font-semibold tracking-wide uppercase text-muted-foreground shadow-sm">
            Proficiency Bonus
        </Label.Root>
    </div>
