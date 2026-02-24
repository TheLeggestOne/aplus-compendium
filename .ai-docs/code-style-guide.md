# Code Style Guide

## General Formatting

- Use 2-space indentation
- Use single quotes for strings (except in JSON)
- Add trailing commas in multi-line arrays/objects
- Keep line length under 100 characters
- End files with a newline

## Naming Conventions

### Variables & Functions
- Use `camelCase` for variables and functions
- Use descriptive names: `getUserById` not `getUser`
- Boolean variables should read as questions: `isLoading`, `hasPermission`, `canEdit`

### Types & Interfaces
- Use `PascalCase` for types, interfaces, classes, and enums
- Prefix interfaces with `I` only when necessary to distinguish from classes
- Use descriptive names: `CharacterStats` not `Stats`

### Files & Folders
- Use `kebab-case` for file names: `character-summary-card.svelte`
- Use `kebab-case` for folder names: `character-deck/`
- Group related files in folders

### Constants
- Use `SCREAMING_SNAKE_CASE` for true constants: `MAX_RETRY_COUNT`
- Use `camelCase` for configuration objects

## Code Organization

### Imports
Order imports as follows:
1. External libraries/packages
2. Internal packages (from monorepo)
3. Relative imports (components, utils)
4. Type imports

```typescript
// External
import { writable } from 'svelte/store';

// Internal packages
import type { Character } from '@aplus-compendium/types';

// Relative
import { formatDate } from '../utils';
import CharacterCard from './character-card.svelte';
```

### Functions
- Keep functions small and focused (under 30 lines ideally)
- Extract complex logic into well-named helper functions
- Place helper functions below the main function they support

### Components (Svelte)
Structure Svelte components in this order:
1. Script tag with imports, props, state, lifecycle, methods
2. HTML template
3. Style tag

```svelte
<script lang="ts">
  // 1. Imports
  // 2. Props
  // 3. State
  // 4. Derived values
  // 5. Lifecycle hooks
  // 6. Methods/handlers
</script>

<!-- Template -->

<style>
  /* Scoped styles */
</style>
```

## Comments

- Write comments for *why*, not *what*
- Use JSDoc for public functions and complex types
- Remove commented-out code before committing
- Use TODO comments with context: `// TODO(name): description`

```typescript
// Bad: Increments counter
counter++;

// Good: Compensate for 0-indexed array when displaying to users
counter++;
```
