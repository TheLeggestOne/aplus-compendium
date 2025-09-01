<script lang="ts">
import Attributes from "./attributes.svelte";
import Inspiration from "./inspiration.svelte";
import ProficiencyBonus from "./proficiency-bonus.svelte";
import SavingThrows from "./saving-throws.svelte";
import Skills from "./skills.svelte";

const { attributes, inspiration, proficiencyBonus, savingThrows, skills, onChange } = $props<{
	attributes?: Record<string, string>;
	inspiration?: boolean;
	proficiencyBonus?: string;
	savingThrows?: Record<string, { value: string; proficient: boolean }>;
	skills?: Record<string, { value: string; proficient: boolean }>;
	onChange?: (data: any) => void;
}>();
</script>


<div class="flex flex-row gap-8 w-full">
	<div class="flex flex-col items-center justify-start">
		<Attributes attributes={attributes} onChange={onChange} />
	</div>
	<div class="flex flex-col gap-4 flex-1">
		<Inspiration inspiration={inspiration} onChange={onChange} />
		<ProficiencyBonus proficiencyBonus={proficiencyBonus} onChange={onChange} />
		<SavingThrows savingThrows={savingThrows} onChange={onChange} />
		<Skills skills={skills} onChange={onChange} />
	</div>
</div>
