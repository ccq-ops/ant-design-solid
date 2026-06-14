# Docs Examples Tailwind Dark Design

## Goal

Review the component docs examples and migrate static example styling to Tailwind CSS where it is clear and safe, while keeping every example compatible with the docs light and dark themes.

## Scope

In scope:

- Component docs pages under `apps/docs/src/routes/components/*.mdx`.
- Static layout, spacing, sizing, positioning, demo wrappers, simple text colors, borders, and background colors.
- Replacing one-off docs helper classes such as `docs-surface-solid` and `docs-text-secondary` with Tailwind utility classes or Tailwind arbitrary values that read existing docs CSS variables.
- Adding `dark:` variants when semantic Tailwind colors are used.
- Expanding migration tests so representative pages stay Tailwind-first.

Out of scope:

- Component library internals under `packages/**`.
- Docs runtime/theme shell files outside component examples, unless a small test update is needed.
- Inline `style` and `styles` examples that intentionally demonstrate component APIs such as semantic DOM styling, dynamic token use, custom colors, ColorPicker values, Slider marks, Progress gradients, Badge colors, Masonry dynamic heights, table column widths, or popup/container measurement.
- Visual redesign of examples.

## Approach

Use a conservative migration. Convert static presentational wrappers first, especially in high-density pages found by source scanning: `layout.mdx`, `float-button.mdx`, `flex.mdx`, `badge.mdx`, `watermark.mdx`, `auto-complete.mdx`, `button.mdx`, `spin.mdx`, and `anchor.mdx`.

Prefer regular Tailwind utilities for static values:

- `class="flex flex-wrap gap-4"` instead of `style={{ display: 'flex', gap: '16px', 'flex-wrap': 'wrap' }}`.
- `class="relative h-40 border border-dashed border-[var(--docs-border)] bg-[var(--docs-surface-subtle)]"` for demo containers.
- `class="absolute right-6 bottom-6"` for static float-button positioning.
- `class="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100"` when semantic Tailwind colors are clearer than docs variables.
- `class="bg-[var(--docs-surface-solid)] text-[var(--docs-text-secondary)]"` when preserving docs token parity is clearer.

Keep inline styles when Tailwind would obscure the example's purpose or cannot express the value without losing API coverage. Examples include `styles={{ content: { color: token().colorPrimary } }}`, `style={{ background: props.background }}`, and component props whose purpose is to accept explicit colors.

## Testing

Extend `apps/docs/src/routes/components/style-migration.test.tsx` with targeted checks for representative migrated pages. The test should not ban all inline styles globally, because many component docs intentionally demonstrate `style` and `styles` APIs. Instead, assert that:

- selected static helper classes have been removed from high-value pages,
- representative static wrappers use expected Tailwind classes,
- representative dark-compatible color utilities are present,
- intentionally preserved API examples remain present.

Run docs-focused verification after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Also run repository formatting and lint checks:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

## Risks

- Over-converting semantic DOM examples would reduce API coverage. Mitigation: preserve `styles` examples whose purpose is to document component styling hooks.
- Hardcoded light colors can regress dark mode. Mitigation: use docs variables or paired Tailwind `dark:` utilities for containers and text.
- Bulk MDX edits can break generated demo previews. Mitigation: run docs tests and build, then inspect failures page by page.
- Existing uncommitted user changes could be overwritten. Mitigation: avoid currently dirty `masonry.mdx`, `masonry-runtime.test.tsx`, and `time-picker.test.tsx` unless explicitly required.
