<script>
    import AttributeField from "$lib/components/attribute-field.svelte";
    import CheckboxWithLabel from "$lib/components/checkbox-with-label.svelte";
    import NumberField from "$lib/components/number-field.svelte";
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