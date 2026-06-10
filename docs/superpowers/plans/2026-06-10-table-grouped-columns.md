# Table Grouped Columns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add antd-compatible grouped column support to Table through nested `columns[].children`.

**Architecture:** Keep the native table renderer and add derived helpers for visible leaf columns and header row metadata. Body rendering, data operations, and colspan calculations consume leaf columns, while `<thead>` consumes generated header rows.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library.

---

### Task 1: Header Model And Types

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for group headers, `colSpan`, `rowSpan`, and leaf body rendering.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- table`.
- [x] Add `children?: TableColumn<T>[]` to `TableColumn<T>`.
- [x] Add helper functions for visible column filtering, max depth, leaf columns, and header rows.
- [x] Render generated header rows.
- [x] Re-run targeted Table tests.

### Task 2: Integration With Existing Features

**Files:**

- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for hidden children, selection/expand internal header rowSpan, and sorting inside a group.
- [x] Run targeted Table tests and verify failure.
- [x] Update sorting/filtering/body rendering to use visible leaf columns.
- [x] Render internal expand/selection headers only in the first header row with full rowSpan.
- [x] Re-run targeted Table tests.

### Task 3: Docs And Verification

**Files:**

- Modify: `apps/docs/src/pages/components/table.mdx`

- [x] Add grouped columns demo.
- [x] Update TableColumn API docs for `children`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
