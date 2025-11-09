import type { AttributeKey } from "./attributes";

export type SkillKey = "Acrobatics" | "Animal Handling" | "Arcana" | "Athletics" | "Deception" | "History" | "Insight" | "Intimidation" | "Investigation" | "Medicine" | "Nature" | "Perception" | "Performance" | "Persuasion" | "Religion" | "Sleight of Hand" | "Stealth" | "Survival";

export const SKILL_ATTRIBUTES: Record<SkillKey, string> = {
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

export function GetSkillAttribute(skill: SkillKey): AttributeKey {
    return SKILL_ATTRIBUTES[skill] as AttributeKey;
}