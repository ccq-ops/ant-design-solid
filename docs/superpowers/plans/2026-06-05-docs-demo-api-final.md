# Docs Demo and API Final Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing examples and API tables for every remaining component docs page that does not use `ApiTable`.

**Architecture:** Reuse the shared `ApiTable` component. Each page defines local `ApiTableRow[]` arrays derived from its component interface and renders API sections after demos.

**Tech Stack:** SolidJS, TypeScript, existing docs `DemoBlock`, existing `ApiTable`, pnpm workspace verification.

---

## Task 1: Utility and visual components

**Files:**

- Modify `apps/docs/src/pages/components/border-beam.tsx`
- Modify `apps/docs/src/pages/components/image.tsx`
- Modify `apps/docs/src/pages/components/masonry.tsx`
- Modify `apps/docs/src/pages/components/qrcode.tsx`
- Modify `apps/docs/src/pages/components/watermark.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables and any missing examples for implemented behavior.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add visual component api final batch`.

## Task 2: Data display components

**Files:**

- Modify `apps/docs/src/pages/components/calendar.tsx`
- Modify `apps/docs/src/pages/components/collapse.tsx`
- Modify `apps/docs/src/pages/components/descriptions.tsx`
- Modify `apps/docs/src/pages/components/table.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables, including item/column/nested prop tables where useful.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add data display api final batch`.

## Task 3: Picker and tree components

**Files:**

- Modify `apps/docs/src/pages/components/color-picker.tsx`
- Modify `apps/docs/src/pages/components/date-picker.tsx`
- Modify `apps/docs/src/pages/components/time-picker.tsx`
- Modify `apps/docs/src/pages/components/tree-select.tsx`
- Modify `apps/docs/src/pages/components/tree.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables, including option/node prop tables where useful.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add picker tree api final batch`.

## Task 4: Navigation, config, and upload components

**Files:**

- Modify `apps/docs/src/pages/components/carousel.tsx`
- Modify `apps/docs/src/pages/components/config-provider.tsx`
- Modify `apps/docs/src/pages/components/splitter.tsx`
- Modify `apps/docs/src/pages/components/tour.tsx`
- Modify `apps/docs/src/pages/components/upload.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables, including nested prop tables where useful.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add remaining component api final batch`.

## Task 5: Full verification

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
- [ ] Commit verification fixes if needed.
