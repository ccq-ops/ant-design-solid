# Progress API Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the high- and medium-priority antd Progress APIs to the Solid Progress component.

**Architecture:** Keep the current Progress component files and extend them in place. Add small internal helpers for percent clamping, colors, sizing, step rendering, line rendering, and circle/dashboard geometry while preserving existing class naming and docs patterns.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing cssinjs styling.

---

## File Structure

- Modify `packages/components/src/progress/interface.ts`: expand public Progress types for dashboard, success, size, steps, percent position, linecap, gradients, railColor, and format second argument.
- Modify `packages/components/src/progress/progress.tsx`: implement new props and rendering behavior.
- Modify `packages/components/src/progress/progress.style.ts`: add classes for steps, success segments, dashboard, and inner percent text.
- Modify `packages/components/src/progress/__tests__/progress.test.tsx`: add regression tests before implementation.
- Modify `apps/docs/src/pages/components/progress.tsx`: document newly supported APIs after tests pass.

## Task 1: Common high-priority props

**Files:**

- Test: `packages/components/src/progress/__tests__/progress.test.tsx`
- Modify: `packages/components/src/progress/interface.ts`
- Modify: `packages/components/src/progress/progress.tsx`
- Modify: `packages/components/src/progress/progress.style.ts`

- [ ] **Step 1: Write failing tests**

Add tests for `railColor`, `success`, `format(percent, successPercent)`, `strokeLinecap`, and `size`.

- [ ] **Step 2: Run tests to verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress`
Expected: new tests fail because props/DOM behavior are missing.

- [ ] **Step 3: Implement minimal common props**

Update interface and component so line/circle support `railColor`, `success`, `strokeLinecap`, `size`, and two-argument `format`.

- [ ] **Step 4: Run tests to verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress`
Expected: Progress tests pass.

## Task 2: Dashboard and medium-priority props

**Files:**

- Test: `packages/components/src/progress/__tests__/progress.test.tsx`
- Modify: `packages/components/src/progress/interface.ts`
- Modify: `packages/components/src/progress/progress.tsx`
- Modify: `packages/components/src/progress/progress.style.ts`

- [ ] **Step 1: Write failing tests**

Add tests for `type="dashboard"`, `gapDegree`, `gapPlacement`, line `steps`, circle/dashboard `steps`, `percentPosition`, line gradient, circle gradient, and strokeColor arrays.

- [ ] **Step 2: Run tests to verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress`
Expected: new tests fail because behavior is missing.

- [ ] **Step 3: Implement dashboard and medium props**

Extend rendering for dashboard geometry, step segments, percent info placement, and gradient/array stroke colors.

- [ ] **Step 4: Run tests to verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress`
Expected: Progress tests pass.

## Task 3: Docs and repository verification

**Files:**

- Modify: `apps/docs/src/pages/components/progress.tsx`

- [ ] **Step 1: Update docs API rows and examples**

Document the newly implemented API in the docs page with concise demo coverage.

- [ ] **Step 2: Run focused tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress`
Expected: Progress tests pass.

- [ ] **Step 3: Run required verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands exit 0.
