# SvelteKit Standards

## Componentization at Every Level
## Rigid shadcn + Runes Enforcement
Every UI or layout change must start from an existing shadcn-svelte primitive (prefer the CLI if it's not yet installed) and stay aligned with the runes-mode tokens; custom CSS only extends what the primitives cannot express.
Treat the `shadcn-llms.md` guide as the source for available components and their docs whenever you add or update elements; log any missing component as a candidate for CLI installation before inventing bespoke solutions.

- Follow the modern Svelte approach outlined at https://svelte.dev/docs/svelte/overview for component structure, props, slots, styling, and reactivity so the UI remains idiomatic while delivering the runes look.
- Pass data/slots into child components via props so each component stays reusable.
- Use shadcn-svelte primitives for layout, typography, and spacing; rely on its tokens via utility classes rather than replicating them manually whenever possible.
## Reusability Mindset
- Factor shared logic into hooks or helper modules under `/src/lib/hooks` or `/src/lib/utils`.
- Export types/interfaces for shared props to keep contracts consistent across the app.
- Keep stateful logic inside stores or modules so components remain declarative and easy to reuse.
