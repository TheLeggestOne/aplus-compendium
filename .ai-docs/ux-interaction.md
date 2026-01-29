# UX Interaction Rules

- Treat complex entries (spells, items, feats, class features, backgrounds) as readonly summaries by default. Present a concise row showing their key stats/values and allow the user to expand/select it to open a detail modal for editing/viewing the full definition.
- Pieces that naturally fluctuate during gameplay (HP, inspiration, statuses, temporary bonuses, action counters) should be directly editable inline with clear affordances (glow, rune outline, focus halo) and maintain visible hover/focus states.
- Spell or item summaries should expose an interactive toggle (e.g., a chevron or detail button) that expands to preview or open the modal; structure the layout so preview + actions are accessible without cluttering the sheet.
- For anything that requires editing structured data (e.g., feats, traits, new class levels), route edits through modal forms or a guided drawer to keep the main sheet stable. Use shadcn modal/dialog components themed to the palette.
- When creating a new character or adding a level, surface a guided, multi-step flow (character creation wizard or class level editor) that walks through the necessary choices—each step uses readonly summaries and confirmation actions backed by the data contracts.
- Error/validation states use amber (#f97316) cues with short helper text; transitions are 200–300ms, subtle, and rely on shadcn motion helpers.
- Accessibility: interactive regions must have `aria-label`s, focus outlines, and not rely solely on color. Use readable contrast per the design language.