# shadcn LLMS Guide

The [shadcn-svelte llms.txt](https://shadcn-svelte.com/llms.txt) snapshot acts as the canonical component registry.

## Key takeaways
- Use the shadcn-svelte CLI (`npx shadcn-svelte add <component>`) for installing supported primitives; never recreate them manually if the CLI already offers an equivalent component unless the design language explicitly calls for a customization.
- The published catalog includes the full suite (Button, Input, Card, Tabs, Sheet, Dialog, Tooltip, ScrollArea, Command palette, etc.); consult the linked component docs before inventing wrappers.
- The repo also documents theming (`/docs/theming.md`), registry usage (`/docs/registry/*.md`), and migration paths (Svelte 5, Tailwind v4). Those references should be consulted before deviating from standard styling.

## Enforcement requirements
- Every UI implementation must layer on shadcn-svelte primitives whenever a matching component exists; if a component is missing, document the gap and use the CLI to install it before building a bespoke widget.
- When rewriting or composing layouts, default to the shadcn component APIs (slots, props, card/content wrappers) and avoid side-stepping their accessibility hooks (focus, aria, transitions).
