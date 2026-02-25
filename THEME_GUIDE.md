# Theme Guide

This project uses a **single source of truth** for design tokens.

## Source of Truth

All theme tokens are defined in:

- `app/globals.css`

This file contains:

- Base tokens for light mode (`:root`)
- Base tokens for dark mode (`.dark`)
- Brand typography token (`--font-brand`)
- Token mappings exposed to Tailwind via `@theme inline`
- Shared semantic utility classes (for badges/statuses)

## Core Rule

Use only token-based classes and semantic utilities.

Prefer:

- `bg-background`, `text-foreground`
- `bg-primary`, `text-primary-foreground`
- `bg-secondary`, `text-secondary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `bg-destructive`, `text-destructive-foreground`
- `border-border`, `ring-ring`

Avoid hardcoded palette classes:

- `bg-black`, `text-white`, `border-gray-200`
- `bg-red-500`, `text-blue-600`, etc.

## Semantic Badge Utilities

Use these as the canonical semantic classes for all status-like UI:

- `badge-pill` (shape/spacing/text)
- `badge-success`
- `badge-warning`
- `badge-info`
- `badge-neutral`
- `badge-danger`

Pattern:

- Plain element badge: `className="badge-pill badge-success"`
- `Badge` component tone: `className="badge-success"` (pill shape already provided by `Badge` primitive)

### Domain Status Aliases

For drive-specific labels, these aliases are provided:

Use these for status badges and similar UI states:

- `status-scheduled`
- `status-ongoing`
- `status-completed`
- `status-unknown`

These are true aliases that share the same style definitions as semantic badge classes in `app/globals.css` under `@layer utilities`.

If you need a new status style, add it there once and reuse it everywhere.

## How to Add / Update Theme Tokens

1. Edit `:root` in `app/globals.css` for light mode.
2. Edit `.dark` in `app/globals.css` for dark mode.
3. Ensure token is mapped in `@theme inline` as `--color-*` when needed by Tailwind utility usage.
4. Use token classes in components instead of literal color names.

## Component-Level Guidelines

1. Reuse `components/ui/*` primitives (`Button`, `Badge`, `Card`, etc.) first.
2. Keep visual intent semantic:
   - Primary action: `variant="default"`
   - Secondary action: `variant="secondary"` or `variant="outline"`
   - Dangerous action: `variant="destructive"`
3. For custom blocks, compose with token classes, not palette classes.

## Do / Don’t

Do:

```tsx
<div className="bg-card text-card-foreground border border-border" />
<Button variant="destructive">Delete</Button>
<span className="badge-pill badge-info">Live</span>
<Badge className="badge-success">Healthy</Badge>
<span className="status-ongoing">Ongoing</span>
```

Don’t:

```tsx
<div className="bg-white text-black border-gray-200" />
<button className="text-red-600">Delete</button>
<span className="bg-green-100 text-green-800">Ongoing</span>
```

## Quick Review Checklist (Before PR)

- No `bg-*`, `text-*`, `border-*` hardcoded palette colors in app code.
- All actions use shared button variants.
- Status/health labels use semantic badge classes (`badge-*`) or domain status aliases (`status-*`).
- Dark mode remains readable without per-component hacks.
- New visual variants are added centrally in `app/globals.css` or `components/ui/*`.

## Recommended Workflow for New Contributors

1. Start with existing UI primitives in `components/ui`.
2. Use token classes from this guide.
3. If a new semantic color/state is needed, add it once in `app/globals.css`.
4. Reuse the semantic class across pages/components.

This keeps the design system consistent, maintainable, and easy to evolve.
