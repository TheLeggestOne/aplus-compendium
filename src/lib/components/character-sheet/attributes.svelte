<script lang="ts">
	import { ATTRIBUTE_KEYS, type AttributeKey } from '$lib/constants/attributes';
    import AttributeSingle from './attribute-single.svelte';

    let {attributes, onChange} = $props<{
        attributes?: Record<AttributeKey, string>;
        onChange?: (data: { attributes: Record<AttributeKey, string> }) => void;
    }>();

    let localAttributes = $state(attributes);
</script>
    
<div class="grid gap-6 justify-center" style="grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));">
    {#each ATTRIBUTE_KEYS as key}
        <AttributeSingle attribute={key} value={localAttributes[key]} onChange={onChange} />
    {/each}
</div>