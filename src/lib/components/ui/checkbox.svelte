<script lang="ts">
import Check from "@lucide/svelte/icons/check";
import Minus from "@lucide/svelte/icons/minus";
import { Checkbox } from "bits-ui";

let { checked = $bindable(false), indeterminate = $bindable(false), disabled = false, required = false, name, value, id, className = "", size = "w-6 h-6", iconSize = "w-4 h-4", ariaLabel } = $props<{
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    value?: string;
    id?: string;
    className?: string;
    size?: string; // e.g. 'w-6 h-6'
    iconSize?: string; // e.g. 'w-4 h-4'
    ariaLabel?: string;
}>();

</script>

<Checkbox.Root
    bind:checked={checked}
    bind:indeterminate={indeterminate}
    {disabled}
    {required}
    {name}
    {value}
    {id}
    aria-label={ariaLabel}
    class={`inline-flex items-center justify-center border rounded ${size} ${className} transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-background border-input text-primary-foreground`}
>
    {#snippet children({ checked, indeterminate })}
        <div class="text-background inline-flex items-center justify-center">
            {#if indeterminate}
                <Minus class={iconSize} />
            {:else if checked}
                <Check class={iconSize} />
            {/if}
        </div>
    {/snippet}
</Checkbox.Root>