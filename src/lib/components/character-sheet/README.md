# Character Sheet Modules: Architecture & Patterns

This document explains the shared patterns, utilities, and conventions used in the character sheet modules of this project. Expand this file as new patterns/utilities are added.

---

## Debounced Change Handling

**Pattern:**
All character sheet modules (e.g., CharacterHeader, Attributes, Skills) use a shared debounced change handler to notify parent components of state changes, but only after the user has paused input for a short time.

**How it works:**
- Each module receives an optional `onChange` prop: a function called with the latest data when the module's state changes.
- The `useDebouncedChange` utility wraps this function, returning a debounced version.
- A Svelte `$effect` watches the module's state and calls the debounced handler with the latest data.

**Example usage in a module:**
```svelte
<script lang="ts">
  import { useDebouncedChange } from './utilities/useDebouncedChange';
  // ...
  const emitChange = useDebouncedChange(onChange, 800);
  $effect(() => {
    if (emitChange) emitChange({ ...data });
  });
</script>
```

**Why:**
- Prevents excessive updates (e.g., on every keystroke)
- Keeps code DRY and consistent across modules
- Easy to adjust debounce timing in one place

---

## Adding More Patterns

Add new sections here as you introduce new shared utilities, hooks, or architectural conventions.
