<script lang="ts">
	import { Input } from "../ui/input";
	import { useDebouncedChange } from "./utilities/useDebouncedChange";

    export type AttributeKeys = "Strength" | "Dexterity" | "Constitution" | "Intelligence" | "Wisdom" | "Charisma";

    const ATTRIBUTE_KEYS: AttributeKeys[] = [
        "Strength",
        "Dexterity",
        "Constitution",
        "Intelligence",
        "Wisdom",
        "Charisma"
    ];

    const { attributes = {
        Strength: "10",
        Dexterity: "10",
        Constitution: "10",
        Intelligence: "10",
        Wisdom: "10",
        Charisma: "10"
    }, onChange } = $props<{
        attributes?: Record<AttributeKeys, string>;
        onChange?: (data: { attributes: Record<AttributeKeys, string> }) => void;
    }>();

    let localAttributes = $state<Record<AttributeKeys, string>>({ ...attributes });

    const emitChange = useDebouncedChange(onChange, 800);

    $effect(() => {
        if (emitChange) {
            emitChange({
                attributes: attributes
            });
        }
    });

    function getAttributeModifier(attribute: number): number {
        return Math.floor((attribute - 10) / 2);
    }

    function updateAttributes(key: AttributeKeys, value: string) {
        // Allow empty string for editing
        if (value === "" || /^\d{0,2}$/.test(value)) {
            localAttributes = { ...localAttributes, [key]: value };
        }
    }

    function commitAttribute(key: AttributeKeys) {
        let value = localAttributes[key];
        if (value !== "") {
            let num = Math.floor(Math.abs(Number(value)));
            num = Number(String(num).replace(/^0+/, ''));
            num = Math.max(1, Math.min(30, isNaN(num) ? 10 : num));
            localAttributes = { ...localAttributes, [key]: String(num) };
        }
    }
</script>
    
<div class="grid gap-6 justify-center" style="grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));">
    {#each ATTRIBUTE_KEYS as key}
        <div class="flex flex-col items-center">
            <label for={key + '-input'} class="text-xs font-bold mb-1 tracking-wide">{key}</label>
            <div class="w-16 h-16 flex items-center justify-center bg-background border-2 border-input rounded-lg text-3xl font-extrabold mb-2">
                {(()=>{
                    const v = Number(localAttributes[key]);
                    if(isNaN(v)) return '';
                    const mod = getAttributeModifier(v);
                    return (mod >= 0 ? '+' : '') + mod;
                })()}
            </div>
            <div class="grid place-items-center w-12 h-12 -mt-6">
                <Input
                    id={key + '-input'}
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    value={localAttributes[key]}
                    oninput={(e) => updateAttributes(key, (e.target as HTMLInputElement).value)}
                    onblur={() => commitAttribute(key)}
                    min="1"
                    max="30"
                    class="circle-input w-12 h-12 border-2 border-input rounded-full bg-background shadow-none !text-lg font-bold -mt-6"
                    style="text-align: center; padding: 0; margin: 0;"
                    aria-labelledby={key + '-label'}
                />
            </div>
        </div>
    {/each}
</div>