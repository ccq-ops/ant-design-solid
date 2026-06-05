# Docs Demo and API Batch Five Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing examples and API tables for the fifth batch of general, layout, and display component docs.

**Architecture:** Reuse the shared `ApiTable` component. Each page defines local `ApiTableRow[]` arrays derived from its component interface and renders API sections after demos.

**Tech Stack:** SolidJS, TypeScript, existing docs `DemoBlock`, existing `ApiTable`, pnpm workspace verification.

---

## Task 1: Button, Avatar, Card

**Files:**

- Modify `apps/docs/src/pages/components/button.tsx`
- Modify `apps/docs/src/pages/components/avatar.tsx`
- Modify `apps/docs/src/pages/components/card.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables and any missing examples for implemented behavior.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add button avatar card api`.

## Task 2: Divider, Flex, Layout

**Files:**

- Modify `apps/docs/src/pages/components/divider.tsx`
- Modify `apps/docs/src/pages/components/flex.tsx`
- Modify `apps/docs/src/pages/components/layout.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables, including layout subcomponent tables where useful.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add divider flex layout api`.

## Task 3: FloatButton, List, Statistic, Timeline

**Files:**

- Modify `apps/docs/src/pages/components/float-button.tsx`
- Modify `apps/docs/src/pages/components/list.tsx`
- Modify `apps/docs/src/pages/components/statistic.tsx`
- Modify `apps/docs/src/pages/components/timeline.tsx`

- [ ] Inspect corresponding `interface.ts` and implementation files.
- [ ] Add API tables and examples for implemented behavior if underrepresented.
- [ ] Run docs typecheck and build.
- [ ] Commit with `docs: add display component api batch five`.

## Task 4: Full verification

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
- [ ] Commit verification fixes if needed.
