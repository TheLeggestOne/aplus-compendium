# Best Practices

## Production Code Standards

**This is production-ready code, not throwaway prototypes.** Every file, every structure, and every architectural decision should reflect principal engineer-level thinking. We're building something maintainable, scalable, and professional.

## Project Architecture

### Monorepo Structure

This is a pnpm workspace monorepo with three main sections:

```
apps/        - Deployable applications (UI, admin panels, etc.)
packages/    - Shared libraries used across multiple apps/services
services/    - Backend services (APIs, workers, etc.)
```

**Why this matters:**
- **Separation of deployment units**: Each app/service can be deployed independently
- **Code reuse without duplication**: Shared code lives in packages, not copy-pasted
- **Clear dependencies**: Packages define what's shared; apps/services are consumers
- **Independent versioning**: Services can evolve independently while sharing contracts

### Package Organization

#### `packages/types` - Shared Type Definitions

**Purpose**: Single source of truth for data structures shared across services and apps.

**Why separate from apps/services:**
- **Prevents circular dependencies**: UI shouldn't import from API, API shouldn't import from UI
- **Contract definition**: Types define the contract between frontend and backend
- **Reusability**: Multiple apps can consume the same types without coupling to a specific service
- **Type safety across boundaries**: Ensures frontend and backend agree on data shapes

**What goes here:**
- DTOs (Data Transfer Objects) - API request/response shapes
- Domain models - Character, Item, Spell, etc.
- Shared enums and constants
- Validation schemas (Zod, etc.)

```typescript
// packages/types/src/character.ts
export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
}

export enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue',
}
```

#### `packages/ui` - Shared UI Components

**Purpose**: Reusable React/Svelte components used across multiple apps.

**Why separate:**
- **Component library approach**: Build once, use everywhere
- **Consistent UX**: Same components = same user experience
- **Easier testing**: Test shared components once, thoroughly
- **Storybook-ready**: Document and showcase components in isolation

**What goes here:**
- Base UI components (Button, Card, Input, etc.)
- Complex shared components (DataTable, FormBuilder, etc.)
- NOT page-specific components - those stay in apps

#### `packages/eslint-config` & `packages/typescript-config`

**Purpose**: Shared tooling configuration.

**Why separate:**
- **Consistency**: All projects use the same rules
- **Single point of update**: Change once, affects all projects
- **Reduced boilerplate**: Apps just extend base configs

### Service Organization

#### `services/aplus-compendium-data-api`

**What belongs in a service:**
- Controllers/routes (API endpoints)
- Service layer (business logic)
- Data access layer (database queries, ORMs)
- Service-specific DTOs (internal only, not shared with frontend)
- Middleware, guards, decorators
- Database migrations

**What doesn't belong:**
- Shared types (→ `packages/types`)
- UI components (→ apps)
- Cross-service utilities (→ `packages/utils` if needed)

### App Organization

#### `apps/aplus-compendium-ui`

**Directory structure within an app:**

```
src/
  routes/              - SvelteKit pages and layouts
  components/          - App-specific components
  lib/
    components/ui/     - shadcn-svelte installed components
    hooks/             - Custom Svelte stores and hooks
    utils.ts           - App-specific utilities
    assets/            - Images, fonts, etc.
  stories/             - Storybook stories
  app.d.ts             - App type definitions
```

**File organization principles:**
- **Feature folders**: Group related files (route + components + tests)
- **Co-location**: Keep tests next to code (`component.svelte` + `component.spec.ts`)
- **Clear boundaries**: Pages orchestrate, components present, lib provides utilities
- **Reasonable file size**: 200-300 lines max; split at 150+ if natural boundaries exist

## Architecture Principles

### Separation of Concerns

**Code level:**
- Keep business logic separate from UI components
- Use services/utilities for reusable logic
- Components should focus on rendering and user interaction
- Data fetching separate from rendering (e.g., SvelteKit load functions)

**Project level:**
- API logic in services, not in UI apps
- Shared contracts in packages, not duplicated
- Each layer knows only about the layer below it

**Why this matters:**
- **Testability**: Test business logic without rendering UI
- **Reusability**: Logic can be used in different contexts
- **Maintainability**: Changes to one concern don't cascade everywhere

### Single Responsibility

- Each module/function should do one thing well
- If a function needs "and" to describe it, consider splitting it
- Files should have a clear, singular purpose

**Examples:**
- ✅ `character-repository.ts` - handles data access for characters
- ✅ `character-validator.ts` - validates character data
- ❌ `character-utils.ts` - too vague, split into specific modules

### DRY (Don't Repeat Yourself)

- Extract repeated code into shared utilities
- Use the `packages/` folder for shared code across apps
- Balance DRY with readability - some duplication is acceptable
- **Don't extract too early**: Wait until you have 3 uses before abstracting

### Dependency Direction

**Golden rule**: Dependencies flow from apps/services → packages, never the reverse.

```
apps/aplus-compendium-ui  →  packages/types
                          →  packages/ui

services/data-api         →  packages/types

packages/types            →  (no dependencies on apps/services)
```

**Why:**
- Prevents circular dependencies
- Makes packages reusable
- Enables clear build order in monorepo

### Production Quality Expectations

#### Error Handling
- **Never swallow errors**: Log them, report them, handle them gracefully
- **Input validation at boundaries**: API endpoints, form submissions, external data
- **User-facing errors should be helpful**: Not just "Error occurred"

#### Type Safety
- **Avoid `any`**: Use `unknown` and narrow with type guards if needed
- **Prefer interfaces for public APIs**: Use types for unions/intersections
- **Export types from packages**: Don't duplicate type definitions

#### Edge Cases
- **Think about empty states**: What if there's no data?
- **Think about loading states**: What happens during async operations?
- **Think about error states**: What if the API fails?
- **Think about validation**: What if the user enters invalid data?

#### Code Quality
- **Descriptive names**: `getUsersByRole` not `getUsers2`
- **Early returns**: Reduce nesting with guard clauses
- **Extract complex logic**: Give it a name that explains what it does
- **Constants for magic values**: `MAX_RETRIES = 3` not just `3`
- **Single source of truth**: Don't duplicate data or logic

## Error Handling

### Always Handle Errors
```typescript
// Bad
const data = await fetchData();

// Good
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  // Handle gracefully - show user feedback, retry, or fallback
}
```

### Fail Fast
- Validate inputs early
- Return early for invalid states
- Use guard clauses to reduce nesting

```typescript
// Good: Guard clauses
function processCharacter(character: Character | null) {
  if (!character) return null;
  if (!character.isActive) return null;
  
  // Main logic here with valid character
}
```

## State Management

### Minimize State
- Derive values when possible instead of storing them
- Keep state close to where it's used
- Lift state up only when necessary for sharing

### Immutability
- Prefer immutable operations
- Don't mutate function arguments
- Use spread operators or utility functions for updates

```typescript
// Bad
user.name = newName;

// Good
const updatedUser = { ...user, name: newName };
```

## Testing

### Test Behavior, Not Implementation
- Test what the code does, not how it does it
- Focus on inputs and outputs
- Avoid testing private methods directly

### Test Structure
```typescript
describe('CharacterService', () => {
  describe('getCharacterById', () => {
    it('should return character when found', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should return null when not found', () => {
      // ...
    });
  });
});
```

### Coverage Goals
- Aim for meaningful coverage, not 100%
- Prioritize testing critical paths and edge cases
- Integration tests for user flows

## Performance

### Avoid Premature Optimization
- Write clear code first
- Optimize only when there's a measured problem
- Profile before optimizing

### Common Optimizations
- Memoize expensive computations
- Debounce/throttle frequent events
- Lazy load components and data when appropriate
- Use pagination for large lists

## Git & Version Control

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Keep subject line under 50 characters
- Reference issue numbers when applicable

```
feat: add character deck page

- Implement grid layout for character cards
- Add filtering by character class
- Connect to data API

Closes #123
```

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code improvements
- `docs/description` - Documentation changes
