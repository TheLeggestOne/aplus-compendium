# shadcn-svelte Component Guidelines

## Overview

This project uses [shadcn-svelte](https://shadcn-svelte.com/) for UI components. These are beautifully designed, accessible components that you can copy and paste into your apps.

**IMPORTANT: Before creating any UI component from scratch, always check if a shadcn-svelte component exists first.**

## For AI Assistants

Before creating any component, fetch the latest component list from:
```
https://shadcn-svelte.com/llms.txt
```

This provides an up-to-date, structured reference of all available shadcn-svelte components with descriptions and documentation links.

## Project Configuration

The shadcn-svelte configuration is in `apps/aplus-compendium-ui/components.json`:

```json
{
  "aliases": {
    "components": "$lib/components",
    "utils": "$lib/utils",
    "ui": "$lib/components/ui"
  }
}
```

Components are installed to: `src/lib/components/ui/`

## Workflow: Before Creating a Component

### Step 1: Check Existing Components

First, check if the component already exists in the project:

```
src/lib/components/ui/
├── button/
│   ├── button.svelte
│   └── index.ts
├── card/
│   ├── card.svelte
│   ├── card-header.svelte
│   ├── card-title.svelte
│   ├── card-description.svelte
│   ├── card-content.svelte
│   ├── card-footer.svelte
│   ├── card-action.svelte
│   └── index.ts
```

### Step 2: Check shadcn-svelte Registry

If the component doesn't exist locally, check if it's available in shadcn-svelte.

**For AI assistants:** Fetch `https://shadcn-svelte.com/llms.txt` to get the current component list.

**Available shadcn-svelte components by category:**

#### Form & Input
- **Button** ✓ (installed) - Displays a button or a component that looks like a button
- **Button Group** - Groups related buttons together with consistent styling
- **Calendar** - Allows users to select dates
- **Checkbox** - Toggle between checked and not checked
- **Combobox** - Autocomplete input with suggestions
- **Date Picker** - Date picker with range and presets
- **Field** - Compose accessible form fields and grouped inputs
- **Form (Formsnap)** - Building forms with Formsnap, Superforms, & Zod
- **Input** - Form input field
- **Input Group** - Additional information or actions for input/textarea
- **Input OTP** - Accessible one-time password component
- **Label** - Accessible label for controls
- **Native Select** - Styled native HTML select element
- **Radio Group** - Set of radio buttons
- **Select** - List of options triggered by a button
- **Slider** - Select value from within a range
- **Switch** - Toggle between checked and not checked
- **Textarea** - Form textarea component

#### Layout & Navigation
- **Accordion** - Vertically stacked interactive headings
- **Breadcrumb** - Path to current resource using hierarchy of links
- **Navigation Menu** - Collection of links for navigating
- **Resizable** - Accessible resizable panel groups
- **Scroll Area** - Custom cross-browser scroll styling
- **Separator** - Visually or semantically separates content
- **Sidebar** - Composable, themeable sidebar component
- **Tabs** - Layered sections displayed one at a time

#### Overlays & Dialogs
- **Alert Dialog** - Modal that interrupts with important content
- **Command** - Fast, composable command menu
- **Context Menu** - Menu triggered by right click
- **Dialog** - Window overlaid on primary window
- **Drawer** - Drawer component
- **Dropdown Menu** - Menu triggered by a button
- **Hover Card** - Preview content behind a link
- **Menubar** - Persistent menu for desktop applications
- **Popover** - Rich content in a portal
- **Sheet** - Content that complements main screen
- **Tooltip** - Popup displaying information on hover/focus

#### Feedback & Status
- **Alert** - Callout for user attention
- **Badge** - Badge component
- **Empty** - Empty state display
- **Progress** - Completion progress indicator
- **Skeleton** - Placeholder while content is loading
- **Sonner** - Toast notifications
- **Spinner** - Loading state indicator

#### Display & Media
- **Aspect Ratio** - Content within a desired ratio
- **Avatar** - Image with fallback for user representation
- **Card** ✓ (installed) - Header, content, and footer
- **Carousel** - Motion and swipe built using Embla
- **Chart** - Charts built using LayerChart
- **Data Table** - Powerful tables using TanStack Table
- **Item** - Versatile component for any content
- **Kbd** - Textual keyboard input display
- **Table** - Responsive table component
- **Typography** - Styles for headings, paragraphs, lists

#### Misc
- **Collapsible** - Expands/collapses a panel
- **Pagination** - Page navigation with next/previous
- **Range Calendar** - Select a range of dates
- **Toggle** - Two-state button (on/off)
- **Toggle Group** - Set of toggles

✓ = Already installed in this project

### Step 3: Install the Component

If the component exists in shadcn-svelte but not in the project, install it:

```bash
cd apps/aplus-compendium-ui
npx shadcn-svelte@latest add <component-name>
```

Examples:
```bash
npx shadcn-svelte@latest add dialog
npx shadcn-svelte@latest add dropdown-menu
npx shadcn-svelte@latest add input
npx shadcn-svelte@latest add tabs
```

### Step 4: Only Then Create Custom Components

If no shadcn-svelte component fits your needs:
1. Check if you can compose existing shadcn components
2. Extend an existing component with additional functionality
3. As a last resort, create a custom component following the project's patterns

## Importing Components

### From shadcn-svelte UI folder
```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
</script>

<Button variant="outline">Click me</Button>

<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Description>Description</Card.Description>
  </Card.Header>
  <Card.Content>
    Content goes here
  </Card.Content>
</Card.Root>
```

### Component Variants

shadcn-svelte components typically support variants via props:

```svelte
<!-- Button variants -->
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<!-- Sizes -->
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

## Extending Components

When extending shadcn components for project-specific needs:

1. Create a wrapper in `src/components/` (not in `ui/`)
2. Import and compose the base shadcn component
3. Add project-specific logic/styling

```svelte
<!-- src/components/character-card.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import type { Character } from '@aplus-compendium/types';
  
  export let character: Character;
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>{character.name}</Card.Title>
  </Card.Header>
  <Card.Content>
    <!-- Character-specific content -->
  </Card.Content>
</Card.Root>
```

## Styling

shadcn-svelte uses Tailwind CSS. To customize:

1. **Use Tailwind classes** directly on components
2. **Use the `class` prop** to add custom classes
3. **Modify CSS variables** in `layout.css` for theme changes

```svelte
<Button class="w-full mt-4">Full Width Button</Button>
```

## Decision Flowchart

```
Need a UI component?
        │
        ▼
┌───────────────────┐
│ Does it exist in  │──Yes──► Use it directly
│ src/lib/components│
│ /ui/ ?            │
└───────────────────┘
        │ No
        ▼
┌───────────────────┐
│ Fetch llms.txt:   │
│ shadcn-svelte.com │
│ /llms.txt         │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Is it available   │──Yes──► Run: npx shadcn-svelte@latest add <name>
│ in shadcn-svelte? │         Then use it
└───────────────────┘
        │ No
        ▼
┌───────────────────┐
│ Can you compose   │──Yes──► Create wrapper component using
│ existing shadcn   │         existing shadcn pieces
│ components?       │
└───────────────────┘
        │ No
        ▼
Create custom component following
project patterns in src/components/
```

## Common Patterns

### Forms
```bash
npx shadcn-svelte@latest add form input label
```

### Modals/Dialogs
```bash
npx shadcn-svelte@latest add dialog
# or for side panels:
npx shadcn-svelte@latest add sheet
```

### Navigation
```bash
npx shadcn-svelte@latest add navigation-menu dropdown-menu
```

### Data Display
```bash
npx shadcn-svelte@latest add table badge avatar
```
