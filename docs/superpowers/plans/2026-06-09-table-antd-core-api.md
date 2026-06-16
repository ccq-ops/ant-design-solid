# Table Antd Core API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first antd-compatible Table API slice for basic props plus pagination, sorting, filtering, and `onChange`.

**Architecture:** Extend the existing Solid Table implementation in place with small typed helpers. Keep rendering native table markup and reuse the local Pagination component for paging controls.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library.

---

### Task 1: Compatibility Types And Helpers

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [ ] Write failing tests for `dataIndex` path arrays, `className`, `locale.emptyText`, object-form `loading`, row/header/cell prop hooks.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- table`.
- [ ] Add table, column, loading, locale, sorter, filter, and pagination compatibility types.
- [ ] Implement value path lookup and prop hook application.
- [ ] Re-run the targeted Table test.

### Task 2: Pagination

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [ ] Write failing tests for default pagination, `pagination={false}`, controlled pagination config, and paginate `onChange`.
- [ ] Run the targeted Table test and verify failure.
- [ ] Render local Pagination and slice processed data.
- [ ] Re-run the targeted Table test.

### Task 3: Sorting And Filtering

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [ ] Write failing tests for clickable sorting, controlled/default sort order, default filters, filter dropdown UI, and `onChange` payloads.
- [ ] Run the targeted Table test and verify failure.
- [ ] Implement single-column local sorting and default filter controls.
- [ ] Re-run the targeted Table test.

### Task 4: Docs And Verification

**Files:**

- Modify: `apps/docs/src/pages/components/table.mdx`

- [ ] Update the Table API docs for the implemented compatibility slice.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- table`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
