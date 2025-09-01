<script lang="ts">
	import { useDebouncedChange } from "./utilities/useDebouncedChange";
	import { Input } from "../ui/input";

    const { proficiencyBonus, onChange } = $props<{
        proficiencyBonus?: string;
        onChange?: (data: { proficiencyBonus: string }) => void;
    }>();

    let characterProficiencyBonus = $state(proficiencyBonus ?? "+2");

    let emitChange = useDebouncedChange(onChange, 800);

    $effect(() => {
        if (emitChange) {
            emitChange({ proficiencyBonus: characterProficiencyBonus });
        }
    });

</script>
    <div class="flex flex-row items-center gap-3 select-none">
        <div class="w-14 h-14 flex items-center justify-center rounded-full border-2 border-primary bg-background shadow-sm">
            <Input id="proficiency-bonus" type="text" bind:value={characterProficiencyBonus} placeholder="+2" class="text-center !text-xl font-bold bg-transparent border-none focus:ring-0 focus:outline-none w-full h-full" />
        </div>
        <label for="proficiency-bonus" class="px-3 py-1 rounded-md border border-primary bg-background text-xs font-semibold tracking-wide uppercase text-muted-foreground shadow-sm">
            Proficiency Bonus
        </label>
    </div>
