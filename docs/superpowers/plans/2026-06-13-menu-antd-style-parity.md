# Menu Ant Design Style Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Menu styling much closer to Ant Design v6 across vertical, inline, horizontal, popup, dark, danger, group, divider, and collapsed states.

**Architecture:** Keep the existing DOM and API. Update CSS-in-JS rules in `menu.style.ts`, adding only minimal tests that inspect generated CSS for durable antd-like style selectors and values.

**Tech Stack:** SolidJS, TypeScript, Vitest, Testing Library, existing CSS-in-JS runtime.

---

## Task 1: Style Regression Tests

**Files:**

- Modify: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] Add a test that renders Menu variants and reads injected style text.
- [ ] Assert collapsed width is `80px`.
- [ ] Assert popup submenu has `min-width` and `box-shadow`.
- [ ] Assert inline selected item and horizontal selected item have active-bar pseudo selector styles.
- [ ] Assert dark selected/hover selectors exist.
- [ ] Run focused Menu tests and confirm the new test fails before style changes.

## Task 2: Antd-Like Menu Styling

**Files:**

- Modify: `packages/components/src/menu/menu.style.ts`

- [ ] Define local menu style constants derived from current tokens.
- [ ] Adjust root, item height, padding, radius, transitions, and collapsed width.
- [ ] Split vertical/inline selected styles from horizontal selected styles.
- [ ] Add active-bar pseudo styles for inline/vertical and horizontal.
- [ ] Add elevated popup styles.
- [ ] Tune group title and divider styles.
- [ ] Add dark theme selectors for root, popup, item, selected, disabled, divider, and group title.
- [ ] Run focused Menu tests and fix regressions.

## Task 3: Verification

**Files:**

- No source edits expected unless verification finds issues.

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core exec vitest run src/menu/__tests__/menu.test.tsx`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run broader checks if time allows: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test` and `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
