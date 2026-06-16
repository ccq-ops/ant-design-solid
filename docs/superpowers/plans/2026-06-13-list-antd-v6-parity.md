# List Ant Design v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Solid `List` component's Ant Design v6 List API coverage.

**Architecture:** Extend the existing `list` files in place, reusing local `Spin` and `Pagination`. Add small helpers for loading normalization, pagination state, responsive grid columns, semantic class/style resolution, and row key extraction.

**Tech Stack:** SolidJS, Vitest, @solidjs/testing-library, local `@solid-ant-design/core` components.

---

### Task 1: Tests

**Files:**

- Modify: `packages/components/src/list/__tests__/list.test.tsx`

- [ ] Add failing tests for `loading` object config, `locale.emptyText`, `loadMore`, `pagination`, `rowKey`, `grid`, `itemLayout`, semantic `classNames/styles`, `prefixCls`, and `rootClass`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/list/__tests__/list.test.tsx` and verify the new tests fail on missing behavior.

### Task 2: Types

**Files:**

- Modify: `packages/components/src/list/interface.ts`

- [ ] Add `ListItemLayout`, `ListPaginationPosition`, `ListGridType`, `ListLocale`, `ListPaginationConfig`, `ListItemSemanticClassNames`, and `ListItemSemanticStyles`.
- [ ] Extend `ListProps` and `ListItemProps` using Solid prop names.

### Task 3: Implementation

**Files:**

- Modify: `packages/components/src/list/list.tsx`

- [ ] Import local `Pagination`, `Spin`, and required Solid primitives.
- [ ] Add pagination state and data slicing.
- [ ] Render top/bottom/both pagination slots and `loadMore`.
- [ ] Normalize loading to `SpinProps`.
- [ ] Add grid wrapper rendering and responsive column calculation.
- [ ] Add item layout context so `List.Item` can switch horizontal and vertical layout.
- [ ] Apply `rowKey`, `prefixCls`, `rootClass`, semantic `classNames`, and semantic `styles`.
- [ ] Keep existing direct children behavior working.

### Task 4: Documentation

**Files:**

- Modify: `apps/docs/src/pages/components/list.mdx`

- [ ] Add examples for pagination, grid, vertical layout, load more, loading config, locale empty text, and semantic customization.
- [ ] Update API tables to include the new Solid-style props.

### Task 5: Verification

**Commands:**

- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/list/__tests__/list.test.tsx`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`
