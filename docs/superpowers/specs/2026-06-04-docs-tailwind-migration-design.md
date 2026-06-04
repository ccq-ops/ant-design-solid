# Docs Tailwind Migration Design

## Goal

Migrate the docs app styling foundation to Tailwind CSS while keeping the first implementation small and safe. This pass will set up Tailwind for `apps/docs` and convert the shared docs shell and common presentation components from custom CSS classes to Tailwind utility classes.

## Scope

In scope:

- Add Tailwind CSS support for `@ant-design-solid/docs`.
- Configure Tailwind content scanning for docs HTML and Solid TypeScript files.
- Convert shared docs layout styling in `apps/docs/src/site/layout.tsx`.
- Convert demo block styling in `apps/docs/src/site/demo-block.tsx`.
- Convert the docs home hero in `apps/docs/src/routes/index.tsx`.
- Reduce `apps/docs/src/app.css` to Tailwind directives and minimal global CSS only.
- Preserve the existing active sidebar link behavior.

Out of scope for this pass:

- Full conversion of every component demo page under `apps/docs/src/routes/components/**`.
- Refactoring component library internals under `packages/**`.
- Visual redesign of the docs site.

## Architecture

Tailwind will be scoped to the docs app configuration under `apps/docs` so the component library packages remain independent of Tailwind. The docs entry file will continue importing `./app.css`; that file becomes the Tailwind stylesheet entry point.

The docs app will use utility classes directly in JSX for page-level layout and documentation presentation. This keeps styling colocated with the small docs shell components and removes the custom selector coupling between `app.css` and JSX class names.

## Component Changes

### Layout

`Layout` will replace classes such as `site-header`, `site-sidebar`, `site-main`, and `site-sidebar-link-selected` with Tailwind utility class strings. The Solid Router `activeClass` behavior will be preserved by assigning a Tailwind utility string for the selected sidebar link.

### DemoBlock

`DemoBlock` will use Tailwind classes for spacing, border, radius, overflow, preview padding, and code block background/scrolling.

### Home route

The home hero section will use Tailwind classes for padding, rounded corners, gradient background, title typography, paragraph color, and line height.

## Global CSS

`app.css` will include Tailwind directives. Any remaining global rules must be minimal and intentional, such as base document sizing or anchor inheritance if needed. General docs component styling should move to Tailwind classes rather than stay as custom selectors.

## Existing Inline Styles

Component demo files contain inline styles for sample widths, dynamic heights, backgrounds, and component-specific visual fixtures. They will stay unchanged in this pass unless a directly touched file has a trivial static style that can be safely converted. A future pass can migrate static inline styles page by page.

## Testing and Verification

After implementation, run docs-focused verification first:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Also run formatting and lint checks when feasible:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

## Risks and Mitigations

- Tailwind version/config mismatch: prefer a Vite-compatible setup and keep config localized to `apps/docs`.
- Active link styling regression: preserve Solid Router `activeClass` semantics and keep existing layout tests passing.
- Accidental broad visual changes: do not redesign; match existing spacing, colors, and layout as closely as practical with Tailwind utilities.
- User work overwrite risk: merge with the current uncommitted layout/app CSS changes rather than reverting them.
