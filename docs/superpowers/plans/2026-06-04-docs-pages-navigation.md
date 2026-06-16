# Docs Pages Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move docs app page routing to `src/pages`, move reusable site UI to `src/components`, and derive top/side navigation from `pages/` first-level directories.

**Architecture:** `src/routes.ts` scans `./pages/**/*.tsx`, creates Solid Router route definitions, and groups page nav by first-level directory. `components/layout.tsx` consumes generated navigation and `useLocation()` to show only the active group sidebar.

**Tech Stack:** SolidJS, `@solidjs/router`, Vite `import.meta.glob`, Vitest, Testing Library.

---

### Task 1: Add failing route derivation tests

**Files:**

- Create/modify: `apps/docs/src/routes.test.ts`

- [ ] Write tests importing `createSiteRoutesFromModules` and `routePathFromFilePath` from `./routes`.
- [ ] Assert `./pages/index.tsx` maps to `/`.
- [ ] Assert grouped pages create `topNavItems` for every first-level directory.
- [ ] Assert each group has its own `sideNavGroups` items.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes.test.ts` and verify it fails before implementation because `src/routes.ts` does not exist or lacks the new API.

### Task 2: Move files and implement route grouping

**Files:**

- Move: `apps/docs/src/routes/` -> `apps/docs/src/pages/`
- Move: `apps/docs/src/site/routes.ts` -> `apps/docs/src/routes.ts`
- Modify: `apps/docs/src/routes.ts`

- [ ] Use `git mv` for tracked files/directories.
- [ ] Change route discovery from `routes` to `pages`.
- [ ] Add `topNavItems` derived from first-level page directories.
- [ ] Add `sideNavGroups` keyed by group name.
- [ ] Keep test/spec and `__tests__` exclusion.
- [ ] Run the route test and verify it passes.

### Task 3: Move components and update imports

**Files:**

- Move: `apps/docs/src/site/layout.tsx` -> `apps/docs/src/components/layout.tsx`
- Move: `apps/docs/src/site/demo-block.tsx` -> `apps/docs/src/components/demo-block.tsx`
- Modify: `apps/docs/src/app.tsx`
- Modify: all `apps/docs/src/pages/**/*.tsx` importing `site/demo-block`

- [ ] Use `git mv` for tracked files.
- [ ] Update `App` imports to `./components/layout` and `./routes`.
- [ ] Update page `DemoBlock` imports to `../../components/demo-block`.
- [ ] Move related tests to `components/` and update relative imports.

### Task 4: Add failing layout navigation tests and implement dynamic layout

**Files:**

- Modify: `apps/docs/src/components/layout.test.tsx`
- Modify: `apps/docs/src/components/layout.tsx`

- [ ] Test that top navigation includes groups generated from routes data.
- [ ] Test that `/components/button` displays component sidebar items and not docs items.
- [ ] Mock `useLocation()` in the router test double.
- [ ] Implement layout with generated `topNavItems` and active `sideNavGroups` lookup.
- [ ] Run the layout test and verify it passes.

### Task 5: Verify the docs app

**Files:**

- No code files expected.

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs lint`.
- [ ] Run repository verification commands as time permits: lint, format:check, recursive typecheck/test/build.
