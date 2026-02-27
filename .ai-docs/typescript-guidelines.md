# TypeScript Guidelines

## Type Safety

### Prefer Strict Types
- Avoid `any` - use `unknown` if the type is truly unknown
- Enable strict mode in tsconfig
- Use type guards for narrowing

```typescript
// Bad
function process(data: any) { ... }

// Good
function process(data: unknown) {
  if (isValidData(data)) {
    // data is now typed
  }
}
```

### Use Type Inference
- Let TypeScript infer types when obvious
- Explicitly type function parameters and return types
- Explicitly type when inference would be `any`

```typescript
// Unnecessary - TypeScript infers string
const name: string = 'Claude';

// Good - let it infer
const name = 'Claude';

// Good - explicit return type for public functions
function calculateDamage(attack: number, defense: number): number {
  return Math.max(0, attack - defense);
}
```

## Types vs Interfaces

### When to Use Interfaces
- For object shapes that may be extended
- For public API contracts
- When you need declaration merging

### When to Use Types
- For unions and intersections
- For computed/mapped types
- For simple type aliases

```typescript
// Interface - extendable object shape
interface Character {
  id: string;
  name: string;
}

// Type - union
type CharacterStatus = 'active' | 'inactive' | 'pending';

// Type - computed
type CharacterKeys = keyof Character;
```

## Generics

### Use Descriptive Generic Names
```typescript
// Less clear
function map<T, U>(arr: T[], fn: (item: T) => U): U[]

// More clear for complex generics
function transform<TInput, TOutput>(
  items: TInput[], 
  transformer: (item: TInput) => TOutput
): TOutput[]
```

### Constrain Generics When Possible
```typescript
// Too permissive
function getProperty<T>(obj: T, key: string) { ... }

// Better - constrained
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] { ... }
```

## Null Handling

### Use Optional Chaining and Nullish Coalescing
```typescript
// Good
const name = character?.profile?.name ?? 'Unknown';

// Avoid
const name = character && character.profile && character.profile.name 
  ? character.profile.name 
  : 'Unknown';
```

### Be Explicit About Nullable Types
```typescript
// Explicit that it might be null
function findCharacter(id: string): Character | null {
  // ...
}
```

## Enums

### Prefer String Enums or Union Types
```typescript
// String enum - good for debugging
enum CharacterClass {
  Warrior = 'warrior',
  Mage = 'mage',
  Rogue = 'rogue',
}

// Union type - simpler, no runtime cost
type CharacterClass = 'warrior' | 'mage' | 'rogue';
```

### Avoid Numeric Enums
- They can lead to confusing behavior
- String values are more debuggable

## Utility Types

### Common Patterns
```typescript
// Make all properties optional
type PartialCharacter = Partial<Character>;

// Make all properties required
type RequiredCharacter = Required<Character>;

// Pick specific properties
type CharacterPreview = Pick<Character, 'id' | 'name'>;

// Omit specific properties
type CharacterWithoutId = Omit<Character, 'id'>;

// Make properties readonly
type ImmutableCharacter = Readonly<Character>;
```

## Async Code

### Type Async Functions
```typescript
// Explicit Promise return type
async function fetchCharacter(id: string): Promise<Character> {
  const response = await fetch(`/api/characters/${id}`);
  return response.json();
}
```

### Handle Async Errors
```typescript
// With try/catch
async function safeGetCharacter(id: string): Promise<Character | null> {
  try {
    return await fetchCharacter(id);
  } catch {
    return null;
  }
}

// Or with Result pattern for more explicit error handling
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };
```
