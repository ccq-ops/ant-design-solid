# Table Selection Expand Summary Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the second antd-compatible Table feature slice: row selection, expandable rows, summary rows, and basic scroll.

**Architecture:** Extend the existing Solid Table native renderer with typed state helpers and injected internal columns. Keep pagination outside the scroll container and preserve current filter/sort/page behavior.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library.

---

### Task 1: Row Selection

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Modify: `packages/components/src/table/table.style.ts`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for checkbox row selection, select all, disabled row checkbox, radio selection, and selection callbacks.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- table`.
- [x] Add `TableRowSelection<T>` types and render an internal selection column.
- [x] Implement controlled/uncontrolled selected keys and callback payloads.
- [x] Re-run the targeted Table test.

### Task 2: Expandable Rows

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Modify: `packages/components/src/table/table.style.ts`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for default expanded rows, expand by button, expand by row click, controlled expanded keys, and expand callbacks.
- [x] Run the targeted Table test and verify failure.
- [x] Add `TableExpandableConfig<T>` types and render an internal expand column plus expanded rows.
- [x] Implement controlled/uncontrolled expanded keys and callback payloads.
- [x] Re-run the targeted Table test.

### Task 3: Summary And Scroll

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Modify: `packages/components/src/table/table.style.ts`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for `summary(currentPageData)` and `scroll.x/y` styles.
- [x] Run the targeted Table test and verify failure.
- [x] Render `<tfoot>` summary content and wrap the table with scroll styles.
- [x] Re-run the targeted Table test.

### Task 4: Docs And Full Verification

**Files:**

- Modify: `apps/docs/src/pages/components/table.mdx`

- [x] Add row selection, expandable, summary, and scroll demos.
- [x] Update Table API docs for `rowSelection`, `expandable`, `summary`, and `scroll`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
