# SvelteKit Standards

## Componentization at Every Level
- Break UI into small, focused components even for simple pieces; prefer composition over monolithic pages.
- Keep every component in `/src/lib/components` and reuse them across routes and layouts when possible.
- Every parent component should delegate visual concerns to child components rather than handling raw markup directly.

## Composable Components
- Compose complex UI by combining smaller components; avoid duplicating markup or styles in multiple places.
- Pass data/slots into child components via props so each component stays reusable.
- Prefer `slot` usage for flexible content placement and expose customization points rather than hard-coding internals.

## Styling Guidelines
- Use shadcn-ui/Svelte-friendly primitives for layout and spacing; rely on their tokens instead of writing new utility CSS whenever possible.
- Avoid custom CSS-in-JS or styled-components; rely on Svelte’s scoped `<style>` blocks or existing class utilities from shadcn.
- When custom styles are necessary, keep them scoped to the component, use CSS variables, and prefer atomic class names that can be reused.

## Reusability Mindset
- Factor shared logic into hooks or helper modules under `/src/lib/hooks` or `/src/lib/utils`.
- Export types/interfaces for shared props to keep contracts consistent across the app.
- Keep stateful logic inside stores or modules so components remain declarative and easy to reuse.
