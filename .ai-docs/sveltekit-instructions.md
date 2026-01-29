# SvelteKit Standards

## Componentization at Every Level
- Break UI into small, focused components even for simple pieces; prefer composition over monolithic pages.
- Keep every component in `/src/lib/components` and reuse them across routes and layouts when possible.
- Every parent component should delegate visual concerns to child components rather than handling raw markup directly.

## Runes Mode Practice
- The app should default to a “runes mode” aesthetic across its layout and widgets (glowing strokes, sharp glyphs, crystalline surfaces) in line with the mystical tone; think elevated typography and subtle runic flourishes that still keep content legible.
- Follow the modern Svelte approach outlined at https://svelte.dev/docs/svelte/overview for component structure, props, slots, styling, and reactivity so the UI remains idiomatic while delivering the runes look.

## Composable Components
- Compose complex UI by combining smaller components; avoid duplicating markup or styles in multiple places.
- Pass data/slots into child components via props so each component stays reusable.
- Prefer `slot` usage for flexible content placement and expose customization points rather than hard-coding internals.

## Styling Guidelines
- Use shadcn-svelte primitives for layout, typography, and spacing; rely on its tokens via utility classes rather than replicating them manually whenever possible.
- Follow the latest guidance from https://shadcn-svelte.com/docs/components before writing custom components so you’re aligning with the supported component library.
- If a shadcn component isn’t present, guide the user to install it via `npx shadcn-svelte add <component>` before inventing a bespoke version. Keep custom CSS limited to adjunct work that the library doesn’t cover.

## Reusability Mindset
- Factor shared logic into hooks or helper modules under `/src/lib/hooks` or `/src/lib/utils`.
- Export types/interfaces for shared props to keep contracts consistent across the app.
- Keep stateful logic inside stores or modules so components remain declarative and easy to reuse.
