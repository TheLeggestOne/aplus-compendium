# AI Context Loader

This document gathers the rulesets, standards, and references the AI should ingest at the start of every session. Whenever you add or update instructions elsewhere in `.ai-docs`, append them to this file so the AI can re-read them quickly.

## Active Instructions
1. [SvelteKit Standards](./sveltekit-instructions.md) – Componentization, composability, reuse, and shadcn-friendly styling rules.
2. [DnD Game Rule Instructions](./dnd-game-rule-instructions.md) – Anchor game features in the 2014-era 5E PHB/Basic Rules/SRD references, cite specific sections when describing spells/classes/equipment.
3. [Design Language](./design-language.md) – Stylistic tokens including palette, typography, motion, and layout notes.
4. [UX Interaction Rules](./ux-interaction.md) – Readonly versus interactive styling, focus states, accessibility, and motion guidance.
5. [Data Contracts](./data-contracts.md) – Canonical property lists for key models (character, spell, equipment, attributes).
6. [Feature Guidelines](./feature-guidelines.md) – Workflow/feature expectations such as modals, guided flows, 5etools import, and data export/import patterns.

## Usage Notes
- Before asking for any feature or change, open this file and use the VS Code Copilot Chat `Send to chat` button to load it into the current session.
- When you add a new instructions file under `.ai-docs`, link it here so the AI can find it and you can refer to all policies from a single doc.
- Treat the listed references as the current context; update the list only when a new requirement supersedes an old one.
