# Alert API Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Alert API compatibility for `title`, object `closable`, custom `icon`, and `banner` mode.

**Architecture:** Keep Alert changes localized to `packages/components/src/alert`. Extend `AlertProps`, normalize compatibility values inside `alert.tsx`, and add focused behavior tests in the existing Alert test file.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library.

---

### Task 1: Add red tests for new Alert API compatibility

**Files:**

- Modify: `packages/components/src/alert/__tests__/alert.test.tsx`

- [ ] Add tests covering `title`, `closable` object callbacks/icon/aria, custom `icon`, and `banner` defaults.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/alert/__tests__/alert.test.tsx` and verify the new tests fail because the API is missing.

### Task 2: Extend Alert props and implementation

**Files:**

- Modify: `packages/components/src/alert/interface.ts`
- Modify: `packages/components/src/alert/alert.tsx`
- Modify: `packages/components/src/alert/alert.style.ts`

- [ ] Extend `AlertProps` with `title`, `icon`, `banner`, and `closable?: boolean | AlertClosableConfig`.
- [ ] Render `title ?? message` for the message/title slot.
- [ ] Normalize `closable` to support top-level legacy callbacks and object callbacks.
- [ ] Render custom close icon from `closable.closeIcon` when present.
- [ ] Spread object `closable` HTML/ARIA attributes onto the close button, excluding config-only keys.
- [ ] Render custom `icon` when `showIcon` is true.
- [ ] Implement `banner` defaults: `type` defaults to `warning`, `showIcon` defaults to true, and root gets `ads-alert-banner` class.
- [ ] Add banner style adjustments.

### Task 3: Verify and update docs demo minimally

**Files:**

- Modify: `apps/docs/src/pages/components/alert.tsx`

- [ ] Add a small banner/title/custom icon or closable-object example without renaming files.
- [ ] Run focused tests, typecheck for core, then broader required checks if feasible.
