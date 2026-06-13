# Breadcrumb Antd V6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add antd v6 Breadcrumb capabilities with Solid-style prop names, aligned tokens, and updated docs.

**Architecture:** Extend the existing Breadcrumb component rather than replacing it. Normalize `items` and `routes` into a shared item model, add small helpers for path/label/menu rendering, and reuse the existing `Dropdown` component for menu breadcrumbs.

**Tech Stack:** SolidJS, Vitest, Testing Library, local css-in-js style registration, local Dropdown/Menu APIs.

---

## File Structure

- Modify `packages/components/src/breadcrumb/interface.ts` for expanded public types.
- Modify `packages/components/src/breadcrumb/breadcrumb.tsx` for normalization, path generation, rendering, menu dropdowns, semantic slots, and `Breadcrumb.Separator`.
- Modify `packages/components/src/breadcrumb/index.ts` to expose `Separator`.
- Modify `packages/components/src/breadcrumb/breadcrumb.style.ts` for antd-aligned component tokens and dropdown link styling.
- Modify `packages/components/src/breadcrumb/__tests__/breadcrumb.test.tsx` with failing tests before production code.
- Modify `apps/docs/src/pages/components/breadcrumb.mdx` for antd-aligned examples and API docs.
- Modify theme/config types only if current token typing blocks Breadcrumb component token usage.

### Task 1: Add Failing API Parity Tests

**Files:**

- Modify: `packages/components/src/breadcrumb/__tests__/breadcrumb.test.tsx`

- [ ] **Step 1: Add tests for paths, params, itemRender, separator items, semantic slots, menu dropdown, and legacy aliases.**

Use tests that render the real `Breadcrumb` component and assert DOM behavior. Keep existing tests.

- [ ] **Step 2: Run the Breadcrumb test file and verify failures are due to missing features.**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- breadcrumb`

Expected: FAIL with missing prop behavior, missing separator export, or missing dropdown/menu rendering.

### Task 2: Expand Types And Exports

**Files:**

- Modify: `packages/components/src/breadcrumb/interface.ts`
- Modify: `packages/components/src/breadcrumb/index.ts`

- [ ] **Step 1: Add Solid-style Breadcrumb types for v6 parity.**

Include `rootClass`, `params`, `routes`, `itemRender`, `dropdownIcon`, `classNames`, `styles`, item `key`, `path`, `breadcrumbName`, `menu`, `dropdownProps`, `class`, `style`, separator item type, and data attributes.

- [ ] **Step 2: Export `Breadcrumb.Separator`.**

Add the static member in `index.ts`.

- [ ] **Step 3: Run typecheck for the package or the focused test build.**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck`

Expected: PASS after implementation task, or type errors only from not-yet-implemented render code before Task 3.

### Task 3: Implement Breadcrumb Rendering Parity

**Files:**

- Modify: `packages/components/src/breadcrumb/breadcrumb.tsx`

- [ ] **Step 1: Normalize `items` and `routes`.**

Prefer `items` over `routes`, map `breadcrumbName` into default labels, and preserve separator items.

- [ ] **Step 2: Implement path and params.**

Replace `:name` path segments from `params`, accumulate paths, and generate `#/{paths.join('/')}` links when an item has `path`.

- [ ] **Step 3: Implement default item rendering and `itemRender`.**

Call `itemRender(route, params, routes, paths)` when provided. Otherwise render `title` or `breadcrumbName`, with string param replacement.

- [ ] **Step 4: Implement menu breadcrumbs through `Dropdown`.**

Wrap item content with `Dropdown` when `menu` exists, merge `dropdownProps`, render menu item labels from `label` or `title`, and turn menu item `path` into a relative link.

- [ ] **Step 5: Implement separator item and manual `Breadcrumb.Separator`.**

Render data separator items as separator nodes and expose manual separator component.

- [ ] **Step 6: Apply semantic `classNames` and `styles`.**

Merge root/item/separator semantic classes and styles without dropping existing `class` and `style`.

- [ ] **Step 7: Run the Breadcrumb tests and make them pass.**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- breadcrumb`

Expected: PASS.

### Task 4: Align Breadcrumb Tokens

**Files:**

- Modify: `packages/components/src/breadcrumb/breadcrumb.style.ts`
- Modify: theme token types if needed.

- [ ] **Step 1: Use antd Breadcrumb token names in the style hook.**

Derive defaults from global tokens and use `itemColor`, `lastItemColor`, `linkColor`, `linkHoverColor`, `separatorColor`, `separatorMargin`, and `iconFontSize`.

- [ ] **Step 2: Add styles for dropdown overlay links and icon sizing.**

Keep focus behavior and current-item behavior.

- [ ] **Step 3: Run focused tests.**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- breadcrumb`

Expected: PASS.

### Task 5: Update Docs And Examples

**Files:**

- Modify: `apps/docs/src/pages/components/breadcrumb.mdx`

- [ ] **Step 1: Replace examples with antd-aligned examples in Solid syntax.**

Cover basic, icon, separator, dropdown menu, independent separator, configured separator, string separator, and itemRender.

- [ ] **Step 2: Update API tables.**

Document Solid-style prop names and compatibility APIs.

- [ ] **Step 3: Run docs formatting check if available.**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`

Expected: PASS, or report unrelated existing formatting failures if present.

### Task 6: Final Verification

**Files:**

- All modified files.

- [ ] **Step 1: Run focused test and typecheck.**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- breadcrumb
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 2: Run broader verification where practical.**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS, or report concrete unrelated failures.
