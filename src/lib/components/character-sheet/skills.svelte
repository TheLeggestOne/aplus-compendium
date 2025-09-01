<script lang="ts">
import { useDebouncedChange } from "./utilities/useDebouncedChange";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

const { skills, onChange } = $props<{
    skills?: Record<string, { value: string; proficient: boolean }>;
    onChange?: (data: { skills: Record<string, { value: string; proficient: boolean }> }) => void;
}>();


const SKILL_ATTRIBUTES: Record<string, string> = {
    "Acrobatics": "Dex",
    "Animal Handling": "Wis",
    "Arcana": "Int",
    "Athletics": "Str",
    "Deception": "Cha",
    "History": "Int",
    "Insight": "Wis",
    "Intimidation": "Cha",
    "Investigation": "Int",
    "Medicine": "Wis",
    "Nature": "Int",
    "Perception": "Wis",
    "Performance": "Cha",
    "Persuasion": "Cha",
    "Religion": "Int",
    "Sleight of Hand": "Dex",
    "Stealth": "Dex",
    "Survival": "Wis"
};

const SKILLS = Object.keys(SKILL_ATTRIBUTES);

let skillState = $state(skills ?? Object.fromEntries(
    SKILLS.map(s => [s, { value: "", proficient: false }])
));

let emitChange = useDebouncedChange(onChange, 800);

$effect(() => {
    if (emitChange) emitChange({ skills: skillState });
});
</script>

<div class="flex flex-col gap-2">
    <span class="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-1">Skills</span>
    <div class="grid grid-cols-1 gap-2">
        {#each SKILLS as skill}
            <div class="flex items-center gap-2">
                <Checkbox
                    bind:checked={skillState[skill].proficient}
                    aria-label={skillState[skill].proficient ? `Remove proficiency in ${skill}` : `Mark proficiency in ${skill}`}
                    class="w-6 h-6"
                />
                <Input
                    type="text"
                    bind:value={skillState[skill].value}
                    class="w-16 text-center font-bold bg-transparent border-none focus:ring-0 focus:outline-none"
                    placeholder="+0"
                    aria-label={`${skill} skill value`}
                />
                <span class="text-xs font-medium w-32">{skill} <span class="text-muted-foreground">({SKILL_ATTRIBUTES[skill]})</span></span>
            </div>
        {/each}
    </div>
</div>
