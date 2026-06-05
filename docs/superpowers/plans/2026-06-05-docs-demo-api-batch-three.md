# Docs Demo and API Batch Three Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing examples and API tables for the third batch of navigation and overlay component docs.

**Architecture:** Reuse the shared `ApiTable` component. Each page defines local `ApiTableRow[]` arrays derived from its component interface and renders API sections after demos.

**Tech Stack:** SolidJS, TypeScript, existing docs `DemoBlock`, existing `ApiTable`, pnpm workspace verification.

---

## Task 1: Affix, Anchor, Breadcrumb

**Files:**
- Modify `apps/docs/src/pages/components/affix.tsx`
- Modify `apps/docs/src/pages/components/anchor.tsx`
- Modify `apps/docs/src/pages/components/breadcrumb.tsx`

- [ ] Inspect `packages/components/src/{affix,anchor,breadcrumb}/interface.ts` and implementations.
- [ ] Add API tables; add examples only if an implemented core behavior is missing.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add affix anchor breadcrumb api`.

## Task 2: Dropdown, Tooltip, Popover

**Files:**
- Modify `apps/docs/src/pages/components/dropdown.tsx`
- Modify `apps/docs/src/pages/components/tooltip.tsx`
- Modify `apps/docs/src/pages/components/popover.tsx`

- [ ] Inspect corresponding interface and implementation files.
- [ ] Add API tables; ensure at least four meaningful demos per page when implemented behavior allows.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: expand overlay component documentation`.

## Task 3: Menu, Pagination, Steps, Tabs

**Files:**
- Modify `apps/docs/src/pages/components/menu.tsx`
- Modify `apps/docs/src/pages/components/pagination.tsx`
- Modify `apps/docs/src/pages/components/steps.tsx`
- Modify `apps/docs/src/pages/components/tabs.tsx`

- [ ] Inspect corresponding interface and implementation files.
- [ ] Add API tables, with extra option/item tables where useful.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add navigation component api`.

## Task 4: Full verification

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
- [ ] Commit verification fixes if needed.
