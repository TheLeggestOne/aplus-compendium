# Data Contracts

## Character Model
- Entire character sheet is a plaintext JSON payload (often imported from 5E tools or manually entered) stored locally (file/localStorage) and editable per character.
- Metadata (`id`, `createdAt`, `updatedAt`) can be captured but every submodule lives directly under the character, so each instance is fully self-descriptive.
- `items`: array of rich `Item` records with all relevant definitions (name, description, quantities) plus flags like `isEquipped`, `isAttuned`, `source`, etc.; there is no separate equipment list—the item structure contains equip state.
- `spellbook`: object where each key is a spellcasting class name and the value is a list of spells; every spell keeps full descriptive data (name, level, school, casting time, components, duration, description, prepared) mirroring PHB/SRD 2014.
- `attributes`: collection of ability/skill entries storing the source value, modifiers, and any derived metadata so the UI can display and edit each score directly.
- `classLevels`: array where each element stores the entire `class` or `class+subclass`, including all feats/features so no additional fetches are necessary; each entry contains an integer `level` indicating the class level attained and optional notes/experience.

## Spell Record
- Fields: `name`, `level`, `school`, `castingTime`, `components` array (`V`, `S`, `M`), `range`, `ritual`, `concentration`, `duration`, `description`, `prepared`, `source`, `higherLevel`, optional `materials` notes.
- Always note the 2014 PHB/SRD citation so the UI can display source and verify mechanics.

## Item Record
- Fields: `name`, `type` (armor, weapon, consumable, gear, etc.), `rarity`, `weight`, `cost`, `description`, `source`, `quantity`, `attunement` status, `isEquipped`, `slot`, `properties`, `charges`, `damage`, `damageType` as needed.
- Items may also carry `magicEffects`, `usesPerDay`, or `consumable` metadata for UI tooling. Keep definitions editable so a user can import or adjust from 5E tools.

## Language Record
- Each language entry includes `name`, `script`, `source`, `notes`, and whether it was gained via background, race, or feats.

## Proficiencies
- Track proficiencies for `armor`, `weapons`, `tools`, `savingThrows`, `skills`, and `languages`. Each entry keeps `source` (class, race, background, feat) plus optional `notes` on special cases (e.g., `expertise`).

## Background/Feature Record
- Store backgrounds, feats, racial traits, and class features as records with `name`, `description`, `source`, `type`, and any prerequisites or usage limits. These entries can include field-specific metadata like `oncePerShortRest`, `oncePerLongRest`, `requiresConcentration`, and scaling values.
- Include metadata for `skillProficiencies`, `toolProficiencies`, `languages`, `equipment`, and `feature` descriptions so each background or racial trait can render itself without further lookups.

## Class/Subclass Record
- Each class or subclass captures the PHB 2014 definition: `name`, optional `subclass`, `hitDie`, `primaryAbility`, `savingThrows`, `spellcasting` details (spell list, ability, slots), `armorProficiencies`, `weaponProficiencies`, `toolProficiencies`, and `featureTiers` keyed by level.
- Include traits such as `feats`, `multiAttack`, `extraAttack`, and actions/reactions tied to the class features so the UI can annotate them (e.g., action economy, concentration). Store the `level` attained and optional `experience`, `notes`, or `source` pointer.
- Link each `classLevels` entry to its associated spellbook (if spellcasting) and ensure subclasses bring their unique features (e.g., monk traditions, rogue archetypes).

Document any new models under `/src/lib/models` and duplicate these summaries here as the canonical reference.