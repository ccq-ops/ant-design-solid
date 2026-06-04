# Docs Pages Navigation Design

## Goal

Refactor the docs app so page files live under `apps/docs/src/pages`, reusable site UI lives under `apps/docs/src/components`, and both top navigation and sidebar navigation are derived from the `pages/` directory structure.

## Architecture

- `apps/docs/src/routes.ts` owns route discovery and navigation derivation.
- `apps/docs/src/pages/index.tsx` maps to `/` and is not a top navigation group.
- Every first-level directory under `apps/docs/src/pages/` becomes a top navigation group.
- Pages inside a group become that group's sidebar menu items.
- `apps/docs/src/components/layout.tsx` renders top navigation from generated groups and renders only the current path's sidebar group.

## Conventions

- `pages/docs/getting-started.tsx` maps to `/docs/getting-started`.
- `pages/components/button.tsx` maps to `/components/button`.
- Top nav labels are title-cased from group directory names, such as `docs` to `Docs` and `design-guides` to `Design Guides`.
- Top nav links point at the sorted first page in each group.
- Test and spec files and `__tests__` folders are ignored by route discovery.

## File Moves

- Move `apps/docs/src/routes/` to `apps/docs/src/pages/`.
- Move `apps/docs/src/site/routes.ts` to `apps/docs/src/routes.ts`.
- Move `apps/docs/src/site/layout.tsx` to `apps/docs/src/components/layout.tsx`.
- Move `apps/docs/src/site/demo-block.tsx` to `apps/docs/src/components/demo-block.tsx`.

## Testing

Update route tests to cover page path conversion, top navigation grouping, sidebar grouping, and test-file exclusion. Update layout tests to cover convention-derived top navigation and current-section sidebar rendering.
