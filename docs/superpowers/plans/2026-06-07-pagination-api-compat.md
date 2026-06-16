# Pagination API Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `Pagination` closer to Ant Design's public Pagination API by adding missing props, object prop forms, semantic customization hooks, tests, and docs.

**Architecture:** Extend the existing single-file Pagination implementation without introducing a new Select dependency. Keep behavior in small local helpers for prop normalization, semantic slot lookup, and page item generation. Add focused tests before each behavior change and update docs after implementation is green.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, project cssinjs style registration.

---

## Files

- Modify: `packages/components/src/pagination/interface.ts` — add public prop types, semantic slot types, and callback signatures.
- Modify: `packages/components/src/pagination/pagination.tsx` — implement prop normalization, rendering hooks, object prop forms, titles, size/align classes, and semantic styles/classes.
- Modify: `packages/components/src/pagination/pagination.style.ts` — add align and size class styles.
- Modify: `packages/components/src/pagination/__tests__/pagination.test.tsx` — add failing tests for the new API behavior before implementation.
- Modify: `apps/docs/src/pages/components/pagination.tsx` — document the new API rows and add a compact demo for customization.

### Task 1: Add API surface tests

- [ ] **Step 1: Write failing tests** in `packages/components/src/pagination/__tests__/pagination.test.tsx` for these behaviors:
  - default `total > 50` shows page size select;
  - `totalBoundaryShowSizeChanger` raises the auto-show threshold;
  - `itemRender` customizes page/prev/next content;
  - `simple={{ readOnly: true }}` prevents manual input commits;
  - `showQuickJumper={{ goButton }}` jumps on button click;
  - `showLessItems` renders fewer page buttons near the middle;
  - `showTitle={false}` removes title attributes;
  - `align`, `size`, `classNames`, and `styles` affect rendered DOM.

- [ ] **Step 2: Verify red** with:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- pagination
```

Expected: tests fail because props and behaviors do not exist yet.

### Task 2: Implement Pagination compatibility props

- [ ] **Step 1: Update types** in `packages/components/src/pagination/interface.ts` with the new public prop types.
- [ ] **Step 2: Implement minimal behavior** in `packages/components/src/pagination/pagination.tsx` so the tests pass.
- [ ] **Step 3: Add styles** in `packages/components/src/pagination/pagination.style.ts` for size and align classes.
- [ ] **Step 4: Verify green** with:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- pagination
```

Expected: all pagination tests pass.

### Task 3: Update docs

- [ ] **Step 1: Update API table** in `apps/docs/src/pages/components/pagination.tsx` with all newly supported props and object forms.
- [ ] **Step 2: Add a customization demo** covering `align`, `size`, `itemRender`, and quick jumper button.
- [ ] **Step 3: Run format check for edited files** with:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: formatting passes, or run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format` then re-check.

### Task 4: Final verification

- [ ] **Step 1: Run required verification** from AGENTS.md:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands pass.
