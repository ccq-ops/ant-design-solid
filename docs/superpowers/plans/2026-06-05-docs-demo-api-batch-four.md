# Docs Demo and API Batch Four Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing examples and API tables for the fourth batch of feedback and display component docs.

**Architecture:** Reuse the shared `ApiTable` component. Each page defines local `ApiTableRow[]` arrays derived from its component interface and renders API sections after demos.

**Tech Stack:** SolidJS, TypeScript, existing docs `DemoBlock`, existing `ApiTable`, pnpm workspace verification.

---

## Task 1: Alert, Notification, Drawer

**Files:**
- Modify `apps/docs/src/pages/components/alert.tsx`
- Modify `apps/docs/src/pages/components/notification.tsx`
- Modify `apps/docs/src/pages/components/drawer.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables; add Notification examples for common implemented methods/options.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: expand alert notification drawer documentation`.

## Task 2: Progress, Spin, Skeleton

**Files:**
- Modify `apps/docs/src/pages/components/progress.tsx`
- Modify `apps/docs/src/pages/components/spin.tsx`
- Modify `apps/docs/src/pages/components/skeleton.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables, including nested Skeleton subcomponent prop tables where useful.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add progress spin skeleton api`.

## Task 3: Result, Empty, Tag, Badge

**Files:**
- Modify `apps/docs/src/pages/components/result.tsx`
- Modify `apps/docs/src/pages/components/empty.tsx`
- Modify `apps/docs/src/pages/components/tag.tsx`
- Modify `apps/docs/src/pages/components/badge.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables; add Tag and Badge examples if supported behavior is not represented.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add result empty tag badge api`.

## Task 4: Full verification

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
- [ ] Commit verification fixes if needed.
