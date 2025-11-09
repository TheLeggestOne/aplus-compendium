<script lang="ts">
	import SkillSingle from "./skill-single.svelte";

const { skills, onChange } = $props<{
    skills?: Record<string, { value: string; proficient: boolean }>;
    onChange?: (data: { skills: Record<string, { value: string; proficient: boolean }> }) => void;
}>();

let localSkills = $state(skills ?? {});

</script>

<div class="flex flex-col gap-2">
    <span class="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-1">Skills</span>
    <div class="grid grid-cols-1 gap-2">
        {#each localSkills as skill}
            <SkillSingle skill={skill} skillState={localSkills[skill]} />
        {/each}
    </div>
</div>
