<script lang="ts">
    import { Checkbox } from "bits-ui";
    import { type SkillKey, GetSkillAttribute } from "$lib/constants/skills";
	import { GetAttributeShort } from "$lib/constants/attributes";

    let { skill, skillState } = $props<{
        skill: SkillKey;
        skillState: Record<SkillKey, { proficient: boolean; value: string }>;
    }>();

    let localProficient = $state(skillState[skill].proficient);
    let localValue = $state(skillState[skill].value);

    $effect(() => {
        skillState[skill].proficient = localProficient;
        skillState[skill].value = localValue;
    });
</script>

<div class="flex items-center gap-2">
    <Checkbox.Root
        bind:checked={localProficient}
        aria-label={localProficient ? `Remove proficiency in ${skill}` : `Mark proficiency in ${skill}`}
        class="w-6 h-6"
    />
    <input
        type="text"
        bind:value={localValue}
        class="w-16 text-center font-bold bg-transparent border-none focus:ring-0 focus:outline-none"
        placeholder="+0"
        aria-label={`${skill} skill value`}
    />
    <span class="text-xs font-medium w-32">{skill} <span class="text-muted-foreground">({GetAttributeShort(GetSkillAttribute(skill))})</span></span>
</div>