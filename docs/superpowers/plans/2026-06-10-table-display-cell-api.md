# Table Display Cell API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the next antd-compatible Table API slice for title/footer sections, table layout, column display controls, ellipsis, row scope, and merged cells.

**Architecture:** Extend existing Table types and renderer in place with small helpers for visible columns, render-result normalization, and cell props. Keep responsive support static for this slice and avoid adding global breakpoint infrastructure.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library.

---

### Task 1: Types And Table Sections

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for `title`, `footer`, explicit `tableLayout`, and ellipsis-derived fixed layout.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- table`.
- [x] Add `title`, `footer`, `tableLayout`, and column `ellipsis` types.
- [x] Render title/footer around the scroll container and compute table layout style.
- [x] Re-run targeted Table tests.

### Task 2: Column Visibility And Cell Metadata

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Modify: `packages/components/src/table/table.style.ts`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for `hidden`, static `responsive`, `rowScope`, and ellipsis cell classes/title.
- [x] Run targeted Table tests and verify failure.
- [x] Add column visibility filtering and body/header ellipsis classes.
- [x] Add `scope` handling for `rowScope`.
- [x] Re-run targeted Table tests.

### Task 3: Render Return Props And Merged Cells

**Files:**

- Modify: `packages/components/src/table/interface.ts`
- Modify: `packages/components/src/table/table.tsx`
- Test: `packages/components/src/table/__tests__/table.test.tsx`

- [x] Write failing tests for render returning `{ children, props }`, body `colSpan`, body `rowSpan`, and `0` span suppression.
- [x] Run targeted Table tests and verify failure.
- [x] Normalize render output and merge returned props after `onCell`.
- [x] Skip cells with `colSpan={0}` or `rowSpan={0}`.
- [x] Re-run targeted Table tests.

### Task 4: Docs And Full Verification

**Files:**

- Modify: `apps/docs/src/pages/components/table.mdx`

- [x] Add docs demos for title/footer, column display controls, and merged cells.
- [x] Update Table and TableColumn API tables.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [x] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
