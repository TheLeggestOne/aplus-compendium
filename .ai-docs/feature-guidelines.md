# Feature Guidelines

- **Guided Flows**: Any workflow that introduces or updates a character (creation wizard, class level editor, spell/item editor) should be guided with a few clear steps. Start with readonly summaries, gather selections via shadcn inputs, and confirm changes before mutating the sheet data.
- **Modals/Drawers**: Complex edits (spells, items, feats, class levels, backgrounds) are handled in dedicated modal or drawer components. Keep the main sheet readonly while the modal is open and only apply changes once the user confirms.
- **5etools Integration**: Provide a search/import option in edit modals so the user can query https://5etools.org (or similar) for official 2014-era spell/item/feature definitions, then convert/import the result into the form fields.
- **Data Import/Export**: Keep the character definition data plaintext/JSON and support Base64-friendly import/export so users can move characters between devices without a centralized database.
- **Spellbooks & Class Spellcasting**: Keep spell data grouped by spellcasting class within a `spellbook` module so the UI can represent each class’s spells separately. Classes link to their spell lists when editing levels or features.
- **Feature Refresh**: When referencing game rules, consult the 2014 SRD/PHB (https://5thsrd.org/) so the implementation matches the original 5E rules rather than later errata.
