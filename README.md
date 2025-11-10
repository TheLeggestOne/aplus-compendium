# A+ Compendium

A lightweight, desktop-native D&D 5e character sheet application with an integrated content library. Built with Electron and designed for offline use with the complete SRD bundled.

## Overview

This project started as an over-engineered web app and was rebuilt from the ground up as a focused tool: a dynamic character sheet that understands D&D 5e content. Characters are self-contained JSON files that embed full copies of all selected content (classes, spells, items, etc.), while a shared content library prevents duplication and enables easy content browsing.

**Key Design Principles:**
- **Local-first**: All data stored in local files (no database, no cloud)
- **Self-contained characters**: Each character.json contains full copies of all referenced content
- **Content deduplication**: Shared library uses compound keys (`name::SOURCE`) to store unique items
- **Extensible**: Parser architecture auto-discovers new content types
- **SRD bundled**: 2,723 items from the 5e SRD load automatically on first run
- **User imports**: Accept 5etools JSON format for homebrew/published content

## Project Structure

```
aplus-compendium/
├── aplus-app/              # Electron backend (Node.js)
│   ├── src/
│   │   ├── fileHandler.js       # Low-level file operations
│   │   ├── contentManager.js    # Compound key operations & merging
│   │   ├── characterManager.js  # Character CRUD wrapper
│   │   ├── contentLoader.js     # 5etools JSON import system
│   │   ├── parsers/
│   │   │   ├── ContentParser.js      # Base parser class
│   │   │   ├── ParserRegistry.js     # Auto-discovery system
│   │   │   └── *Parser.js            # 18 content type parsers
│   │   ├── main.js              # Electron main process
│   │   └── preload.js           # IPC bridge
│   ├── tools/
│   │   └── extract-srd.js       # SRD extraction tool
│   ├── resources/
│   │   └── srd/                 # Bundled SRD content (18 JSON files)
│   └── test.js                  # Test suite
└── aplus-front/            # Svelte frontend (TODO)
    └── src/
        └── lib/
            └── electron.ts      # TypeScript API wrapper

User Data: %APPDATA%/aplus-app/data/
├── content/                # Shared content library
│   ├── actions.json
│   ├── backgrounds.json
│   ├── classes.json        # Base classes + subclasses
│   ├── conditions.json
│   ├── decks.json
│   ├── deities.json
│   ├── feats.json
│   ├── items.json
│   ├── languages.json
│   ├── monsters.json
│   ├── objects.json
│   ├── optionalfeatures.json
│   ├── races.json
│   ├── rules.json
│   ├── senses.json
│   ├── skills.json
│   ├── spells.json
│   └── traps.json
├── characters/             # Character files
│   └── {id}.json
└── .srd-loaded            # Flag file (prevents re-import)
```

## Architecture

### Content System

**Compound Keys:** All content items use `name::SOURCE` format for unique identification.
- Enables flat storage without nested source objects
- Allows multiple versions of same item from different sources
- Example: `"Fireball::PHB"`, `"Fireball::Homebrew Pyromancy"`

**Additive Merging:** When importing content, existing non-blank values are preserved.
- Never overwrites real data with nulls/blanks
- Allows gradual enrichment from multiple sources
- Handles missing fields gracefully

**Special Handling:**
- **Classes**: Base classes and subclasses stored as separate entries
  - Subclasses include `className` and `classSource` references
  - Enables flexible character building (mix/match subclasses)
- **Rules**: Uses `variantrule` array key (not `rule`)

### Parser Architecture

**Auto-Discovery:** `ParserRegistry` scans `parsers/` directory at runtime
- Automatically registers all `*Parser.js` files
- Skips base class and registry itself
- No hardcoded parser lists to maintain

**Base Class:** `ContentParser` defines standard interface
- `getContentType()`: Returns content type string
- `getArrayKey()`: Returns JSON array key for this content
- `parse(data, options)`: Extracts and transforms items
- `transformItem(item)`: Normalizes individual items
- Supports `options.srdOnly` filtering for SRD extraction

**18 Content Types:**
actions, backgrounds, classes, conditions, decks, deities, feats, items, languages, monsters, objects, optionalfeatures, races, rules, senses, skills, spells, traps

### Character System

**Character Files:** Stored as `{id}.json` in `characters/` directory
- User-chosen IDs (enables duplication/backups)
- No auto-timestamps (local files, no audit trail needed)
- Self-contained: Embed full copies of all referenced content

**Operations:**
- `getAll()`: List all characters
- `get(id)`: Load character data
- `save(id, data)`: Create or update character
- `delete(id)`: Remove character
- `duplicate(sourceId, newId)`: Copy character with new ID
- `exists(id)`: Check if ID is taken

### Content Loader

**Unified Import System:** Single mechanism for SRD and user content
- Accepts 5etools JSON format
- Filters by `srd`, `srd52`, or `basicRules` flags when needed
- Handles single files or entire directories
- Accumulates items across multiple files of same type

**First-Run SRD Loading:**
1. Check for `.srd-loaded` flag file
2. If missing, load all 18 files from `resources/srd/`
3. Import 2,723 items into content library
4. Create flag file to prevent re-import

## Data Format

### Content Item Structure
```json
{
  "Fireball::PHB": {
    "name": "Fireball",
    "source": "PHB",
    "level": 3,
    "school": "V",
    "time": [{"number": 1, "unit": "action"}],
    "range": {"type": "point", "distance": {"type": "feet", "amount": 150}},
    "components": {"v": true, "s": true, "m": "a tiny ball of bat guano and sulfur"},
    "duration": [{"type": "instant"}],
    "entries": ["A bright streak flashes..."],
    "damageInflict": ["fire"],
    "savingThrow": ["dexterity"],
    "areaTags": ["S"]
  }
}
```

### Character Structure (Example)
```json
{
  "id": "thorin-ironforge",
  "name": "Thorin Ironforge",
  "race": {
    "name": "Mountain Dwarf",
    "source": "PHB",
    "_fullData": { /* complete race entry */ }
  },
  "class": {
    "name": "Fighter",
    "source": "PHB",
    "level": 5,
    "subclass": "Champion",
    "_fullData": { /* complete class entry */ }
  },
  "background": {
    "name": "Soldier",
    "source": "PHB",
    "_fullData": { /* complete background entry */ }
  },
  "spells": [
    {
      "name": "Fireball",
      "source": "PHB",
      "_fullData": { /* complete spell entry */ }
    }
  ]
}
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm

### Installation

```powershell
# Clone repository
git clone <repo-url>
cd aplus-compendium

# Install backend dependencies
cd aplus-app
npm install

# Install frontend dependencies (when UI is built)
cd ../aplus-front
npm install
```

### Development

```powershell
# Run tests
cd aplus-app
npm test

# Start Electron app
npm start

# Frontend dev server (when UI is built)
cd ../aplus-front
npm run dev
```

### Building SRD Bundle

If you need to re-extract the SRD from 5etools data:

```powershell
cd aplus-app
node tools/extract-srd.js <path-to-5etools-data> resources/srd
```

**Input:** 5etools data directory (can have nested folders)
**Output:** 18 consolidated JSON files in `resources/srd/`
**Features:**
- Recursive directory scanning
- Intelligent content type detection
- Multi-file accumulation (combines multiple sources)
- SRD filtering (`srd`, `srd52`, `basicRules` flags)

## API Reference

### IPC Handlers (Electron Main → Renderer)

**Content Operations:**
```javascript
// Get all items of a type
await window.electronAPI.content.getAll(contentType)

// Import items
await window.electronAPI.content.import(contentType, items, source)

// Search content
await window.electronAPI.content.search(contentType, query)

// Get specific item
await window.electronAPI.content.get(contentType, key)

// Delete item
await window.electronAPI.content.delete(contentType, key)

// Load file
await window.electronAPI.content.loadFile(filePath, contentType, source)

// Load directory
await window.electronAPI.content.loadDirectory(dirPath, source)
```

**Character Operations:**
```javascript
// List all characters
await window.electronAPI.character.getAll()

// Load character
await window.electronAPI.character.get(id)

// Save character
await window.electronAPI.character.save(id, data)

// Delete character
await window.electronAPI.character.delete(id)

// Duplicate character
await window.electronAPI.character.duplicate(sourceId, newId)

// Check if ID exists
await window.electronAPI.character.exists(id)
```

### TypeScript Types

```typescript
export const CONTENT_TYPES = [
  'actions', 'backgrounds', 'classes', 'conditions', 'decks',
  'deities', 'feats', 'items', 'languages', 'monsters',
  'objects', 'optionalfeatures', 'races', 'rules', 'senses',
  'skills', 'spells', 'traps'
] as const;

export type ContentType = typeof CONTENT_TYPES[number];
```

## Testing

**Test Suite:** 10 tests covering core functionality
- FileHandler: initialization, paths, JSON operations
- ContentManager: compound keys, merging, CRUD
- CharacterManager: CRUD, duplication, existence checks

```powershell
cd aplus-app
npm test
```

**All tests passing ✅**

## SRD Content

**Bundled Items:** 2,723 total
- Actions: 35
- Backgrounds: 2
- Classes: 24 (base classes + subclasses)
- Conditions: 30
- Decks: 3
- Deities: 49
- Feats: 20
- Items: 972
- Languages: 37
- Monsters: 655
- Objects: 1
- Optional Features: 78
- Races: 15
- Rules: 118
- Senses: 8
- Skills: 36
- Spells: 624
- Traps: 16

## Roadmap

### ✅ Completed
- [x] Backend architecture
- [x] File handler (18 content types)
- [x] Content manager (compound keys, additive merge)
- [x] Character manager (CRUD, duplication)
- [x] Extensible parser system (auto-discovery)
- [x] 18 content type parsers
- [x] SRD extraction tool
- [x] Content loader (5etools format)
- [x] IPC layer
- [x] TypeScript wrappers
- [x] First-run SRD loading
- [x] Test suite
- [x] Live app verification

### 🚧 In Progress
- [ ] UI development (shadcn-svelte)
- [ ] Character sheet interface
- [ ] Content browser
- [ ] User import UI
- [ ] Character creation wizard

### 📋 Planned
- [ ] Character export/sharing
- [ ] Dice roller integration
- [ ] Homebrew content manager
- [ ] Campaign/session notes
- [ ] Multi-character management
- [ ] PDF character sheet export

## License

[To be determined]

## Credits

- Built with [Electron](https://www.electronjs.org/)
- SRD content from [5etools](https://5e.tools/)
- D&D 5e SRD © Wizards of the Coast
