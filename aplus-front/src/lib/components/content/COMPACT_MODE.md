# Compact/Preview Mode Usage

All content display components now support a `compact` prop for narrow preview panes.

## Overview

When `compact={true}`:
- Shows only the first paragraph/entry of descriptions
- Displays core metadata and stats
- Adds "Read more →" links to full content view
- Reduces padding for tighter layout
- Perfect for 300-400px wide preview columns

## Components with Compact Mode

### Stat Blocks/Cards
- **SpellCard**: Shows level, school, casting info + first paragraph
- **MonsterStatBlock**: Shows CR, AC, HP, first trait/action only
- **ItemCard**: Shows type, rarity, attunement + first paragraph

### Display Components
- **ClassDisplay**: Shows hit die, primary ability + first paragraph
- **RaceDisplay**: Shows size, speed, abilities + first racial trait
- **FeatDisplay**: Shows prerequisites + first benefit
- **SimpleContentDisplay**: Shows metadata badges + first paragraph

### Router
- **ContentDisplay**: Passes `compact` prop to all child components

## Usage Examples

### Preview Pane Component
```svelte
<script>
  import { ContentDisplay } from '$lib/components/content';
  
  export let selectedItem;
  export let contentType;
</script>

<!-- Narrow preview pane (compact mode) -->
<div class="preview-pane w-96">
  <ContentDisplay 
    {contentType} 
    item={selectedItem} 
    itemKey="{selectedItem.name}::{selectedItem.source}"
    compact={true}
  />
</div>
```

### Full Page Display
```svelte
<script>
  import { ContentDisplay } from '$lib/components/content';
  
  export let data; // from +page.ts
</script>

<!-- Full-width content display (default mode) -->
<div class="content-page">
  <ContentDisplay 
    contentType={data.type} 
    item={data.content} 
    itemKey={data.key}
    compact={false}
  />
</div>
```

### Side-by-Side Layout
```svelte
<div class="flex gap-4">
  <!-- Preview on left -->
  <aside class="w-96">
    <ContentDisplay {contentType} item={selectedItem} compact={true} />
  </aside>
  
  <!-- Full content on right -->
  <main class="flex-1">
    <ContentDisplay {contentType} item={detailedItem} compact={false} />
  </main>
</div>
```

## Implementation Pattern

Each component follows this pattern:

```svelte
<script lang="ts">
  export let compact: boolean = false;
  $: entries = data.entries ?? [];
</script>

<div class="content-section" class:compact>
  {#if compact}
    <EntryRenderer entries={entries.slice(0, 1)} {contentType} {itemKey} compact />
    {#if entries.length > 1}
      <a href="/content/{contentType}/{encodeURIComponent(itemKey)}" class="read-more-link">
        Read more →
      </a>
    {/if}
  {:else}
    <EntryRenderer {entries} {contentType} {itemKey} />
  {/if}
</div>

<style>
  .content-section { @apply p-4; }
  .content-section.compact { @apply p-3; }
  .read-more-link { 
    @apply mt-2 inline-block text-sm font-semibold text-blue-600 hover:text-blue-800; 
  }
</style>
```

## Design Decisions

1. **First Entry Only**: Show only `entries[0]` to keep previews concise
2. **"Read more →" Links**: All truncated content links to `/content/{type}/{key}`
3. **Reduced Padding**: `p-4` → `p-3` for tighter spacing
4. **Metadata Preserved**: All stat blocks, badges, and key info remain visible
5. **Recursive**: `EntryRenderer` also receives `compact` prop for nested content

## Recommended Widths

- **Compact Mode**: 300-500px (preview panes, sidebars)
- **Full Mode**: 600px+ (main content area, full pages)
- **Transition Point**: Around 500-600px is ideal for switching modes
