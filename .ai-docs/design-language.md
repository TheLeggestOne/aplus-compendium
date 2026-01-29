# Design Language

## Palette
- Rely on shadcn/svelte theme tokens for the palette; base values are derived from its `primary` (muted cyan #26c6da) and `accent` (warm amber #f5c071) tokens.
- Surfaces should layer on shadcn’s `surface`/`card` tones—dark slate (#0c0f1f) with translucent fills—so the design stays consistent across components.
- Text colors should reuse shadcn’s token set: `text-high` (#f5f7fb), `text-muted` (#9ca3af), and `text-subtle` (#6b7280) so typography stays aligned with the system.

- Value text: still bold and geometric ("Plus Jakarta Sans"/"Inter") but keep tracking tighter to maximize space.
- Labels: keep uppercase, subtle letter-spacing (~0.12em), and medium weight for legibility.
- Secondary narrative copy can use a lighter sans ("Sora"/"Space Grotesk") to feel minimalist.
## Typography
- Build onto shadcn typography utilities (e.g., `text-xl`, `font-semibold`) to keep the typographic hierarchy consistent.
- Value text stays bold/geometric ("Plus Jakarta Sans"/"Inter") for numbers, while labels lean into `text-xs`/`uppercase` utilities with ~0.12em letter spacing.
- Secondary copy can layer shadcn’s `text-sm` with lighter sans choices like "Sora" or "Space Grotesk" for a minimalist tone.
- Value text: still bold and geometric ("Plus Jakarta Sans"/"Inter") but keep tracking tighter to maximize space.
- Labels: keep uppercase, subtle letter-spacing (~0.12em), and medium weight for legibility.
- Secondary narrative copy can use a lighter sans ("Sora"/"Space Grotesk") to feel minimalist.

- Lean on generous spacing (1.25rem padding, 0.6rem gap) per card to keep the UI airy even in dark mode.
- Motion should be minimal: soft fades with 150-200ms timing when toggling readonly vs editable states.
- Use translucent borders and overshadowed surfaces to separate sections without harsh lines.
## Layout & Motion
- Compose layouts with shadcn’s spacing tokens (`gap-4`, `p-5`) so spacing remains modular and easy to reproduce.
- Motion should leverage CSS variables from the shadcn system, favoring short fades (150-200ms) when toggling readonly vs editable states.
- Use shadcn-inspired translucent borders and subtle shadows for separation, keeping the interface airy without custom gradients.
- Lean on generous spacing (1.25rem padding, 0.6rem gap) per card to keep the UI airy even in dark mode.
- Motion should be minimal: soft fades with 150-200ms timing when toggling readonly vs editable states.
- Use translucent borders and overshadowed surfaces to separate sections without harsh lines.

Keep all styling tied to shadcn/svelte classes and theme tokens; only add raw CSS when a shadcn utility cannot express the need.