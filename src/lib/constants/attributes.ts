export type AttributeKey = "Strength" | "Dexterity" | "Constitution" | "Intelligence" | "Wisdom" | "Charisma";

export const ATTRIBUTE_KEYS: AttributeKey[] = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma"
];

export function GetAttributeShort(attribute: AttributeKey): string {
    switch (attribute) {
        case "Strength":
            return "Str";
        case "Dexterity":
            return "Dex";
        case "Constitution":
            return "Con";
        case "Intelligence":
            return "Int";
        case "Wisdom":
            return "Wis";
        case "Charisma":
            return "Cha";
    }
}