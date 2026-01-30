<script>
    import AttributeField from "$lib/components/attribute-field.svelte";
    import CheckboxWithLabel from "$lib/components/checkbox-with-label.svelte";
    import NumberField from "$lib/components/number-field.svelte";
    import SavingThrow from "$lib/components/saving-throw.svelte";
    import Skill from "$lib/components/skill.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import UnderlineField from "$lib/components/underline-field.svelte";

</script>

<UnderlineField name="Name" value="Threek" />
<UnderlineField name="Class & Level" value="Druid 8" />
<UnderlineField name="Background" value="Folk Hero" />
<UnderlineField name="Player Name" value="Stilts" />
<UnderlineField name="Race" value="Kobold" />
<UnderlineField name="Alignment" value="Chaotic Good" />
<UnderlineField name="Experience Points" value="34,000" />

<Separator />

<AttributeField label="STRENGTH" value="10" subValue="+0" />
<AttributeField label="DEXTERITY" value="14" subValue="+2" />
<AttributeField label="CONSTITUTION" value="12" subValue="+1" />
<AttributeField label="INTELLIGENCE" value="13" subValue="+1" />
<AttributeField label="WISDOM" value="16" subValue="+3" />
<AttributeField label="CHARISMA" value="8" subValue="-1" />

<Separator />

<CheckboxWithLabel labelText="Inspiration" checked={false} />

<Separator />

<NumberField label="Armor Class" value="15" />
<NumberField label="Initiative" value="+2"/>
<NumberField label="Speed" value="30 ft." />
<NumberField label="Proficiency Bonus" value="+3" />

<Separator />
<h1>Saving Throws</h1>
<Separator />

<SavingThrow name="Strength" bonus="+0" isProficient={false} />
<SavingThrow name="Dexterity" bonus="+5" isProficient={true} />
<SavingThrow name="Constitution" bonus="+1" isProficient={false} />
<SavingThrow name="Intelligence" bonus="+1" isProficient={false} />
<SavingThrow name="Wisdom" bonus="+6" isProficient={true} />
<SavingThrow name="Charisma" bonus="-1" isProficient={false} />

<Separator />
<h1>Skills</h1>
<Separator />

<Skill name="Acrobatics" bonus="+5" attribute="Dex" isProficient={true} />
<Skill name="Animal Handling" bonus="+3" attribute="Wis" isProficient={false} />
<Skill name="Arcana" bonus="+1" attribute="Int" isProficient={false} />
<Skill name="Athletics" bonus="+0" attribute="Str" isProficient={false} />
<Skill name="Deception" bonus="-1" attribute="Cha" isProficient={false} />
<Skill name="History" bonus="+1" attribute="Int" isProficient={false} />
<Skill name="Insight" bonus="+6" attribute="Wis" isProficient={true} />
<Skill name="Intimidation" bonus="-1" attribute="Cha" isProficient={false} />
<Skill name="Investigation" bonus="+1" attribute="Int" isProficient={false} />
<Skill name="Medicine" bonus="+6" attribute="Wis" isProficient={true} />
<Skill name="Nature" bonus="+1" attribute="Int" isProficient={false} />
<Skill name="Perception" bonus="+6" attribute="Wis" isProficient={true} />
<Skill name="Performance" bonus="-1" attribute="Cha" isProficient={false} />
<Skill name="Persuasion" bonus="-1" attribute="Cha" isProficient={false} />
<Skill name="Religion" bonus="+1" attribute="Int" isProficient={false} />
<Skill name="Sleight of Hand" bonus="+5" attribute="Dex" isProficient={true} />
<Skill name="Stealth" bonus="+5" attribute="Dex" isProficient={true} />
<Skill name="Survival" bonus="+3" attribute="Wis" isProficient={false} />
