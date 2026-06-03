# Layout Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a SolidJS Ant Design-style Layout component family with Header, Footer, Content, and Sider, plus docs and exports.

**Architecture:** Implement Layout as a small component module following existing component patterns: typed interface file, style hook file, component file, barrel export, root package export, tests, and docs route. Layout is a flex container; nested Sider presence is represented by `ads-layout-has-sider`, and Sider supports width, collapsedWidth, collapsed, and theme classes via inline CSS custom properties.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, @ant-design-solid/cssinjs, existing ConfigProvider/theme tokens.

---

## File Structure

- Create `packages/components/src/layout/interface.ts` for public prop types.
- Create `packages/components/src/layout/layout.style.ts` for tokenized CSS classes.
- Create `packages/components/src/layout/layout.tsx` for Layout/Header/Footer/Content/Sider implementation.
- Create `packages/components/src/layout/index.ts` for module exports.
- Create `packages/components/src/layout/__tests__/layout.test.tsx` for behavior and API tests.
- Modify `packages/components/src/index.ts` to export `./layout`.
- Create `apps/docs/src/routes/components/layout.tsx` for examples.
- Modify `apps/docs/src/site/nav.ts` to add Layout navigation.

## Tasks

### Task 1: Test public Layout behavior

**Files:**
- Create: `packages/components/src/layout/__tests__/layout.test.tsx`

- [ ] Write tests that assert:
  - `Layout` renders children with `ads-layout` and default vertical class behavior.
  - `Layout.Header`, `Layout.Content`, and `Layout.Footer` render semantic elements/classes in order.
  - `Layout.Sider` renders `aside`, applies light/dark theme classes, collapsed class, and CSS variable widths.
  - `hasSider` adds `ads-layout-has-sider`.
  - custom prefix from `ConfigProvider` is respected.

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/layout/__tests__/layout.test.tsx` and verify it fails because `../index` does not exist yet.

### Task 2: Implement Layout module

**Files:**
- Create: `packages/components/src/layout/interface.ts`
- Create: `packages/components/src/layout/layout.style.ts`
- Create: `packages/components/src/layout/layout.tsx`
- Create: `packages/components/src/layout/index.ts`
- Modify: `packages/components/src/index.ts`

- [ ] Define prop types extending Solid JSX HTML attributes where appropriate.
- [ ] Implement `Layout`, `Header`, `Footer`, `Content`, `Sider` using `splitProps`, `useConfig`, `classNames`, and `useLayoutStyle`.
- [ ] Attach subcomponents as static properties on `Layout`.
- [ ] Implement styles for flex layout, header/content/footer/sider, dark/light sider, collapsed sider, and CSS variable widths.
- [ ] Export `Layout` and types from module and root index.
- [ ] Run focused test and verify it passes.

### Task 3: Add docs route

**Files:**
- Create: `apps/docs/src/routes/components/layout.tsx`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] Add docs with basic, sider, and collapsed examples.
- [ ] Add Layout to nav near Menu/Breadcrumb or Grid.
- [ ] Run typecheck for docs and core.

### Task 4: Full verification

**Commands:**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

**Expected:** All commands pass with no new TypeScript file naming violations.
