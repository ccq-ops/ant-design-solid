# TimePicker Default Clear Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make single `TimePicker` clearable by default and overlay the clear icon on top of the suffix icon on hover.

**Architecture:** `TimePickerBase` will compute clear enablement from `allowClear !== false`, render suffix and clear inside a stable icon stack, and use CSS opacity/pointer-events for hover reveal. `TimePicker.RangePicker` remains unchanged.

**Tech Stack:** SolidJS, Vitest, `@solidjs/testing-library`, cssinjs style registration.

---

### Task 1: Tests

**Files:**

- Modify: `packages/components/src/time-picker/__tests__/time-picker.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests that assert default clear, opt-out, and icon stack structure.

- [ ] **Step 2: Run focused test to verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- time-picker.test.tsx`

Expected: default clear and stack structure fail before implementation.

### Task 2: Implementation

**Files:**

- Modify: `packages/components/src/time-picker/time-picker.tsx`
- Modify: `packages/components/src/time-picker/time-picker.style.ts`
- Modify: `apps/docs/src/pages/components/time-picker.mdx`

- [ ] **Step 1: Add default clear calculation**

In `TimePickerBase`, use `allowClearEnabled()` returning `local.allowClear !== false`.

- [ ] **Step 2: Render icon stack**

Wrap suffix and clear in `${prefixCls()}-icon-stack`; keep clear conditional on enabled, not disabled, and non-empty display value.

- [ ] **Step 3: Style overlay behavior**

Give the stack stable dimensions, absolutely position suffix and clear in the stack, hide clear by default, and reveal it on selector hover/focus-within.

- [ ] **Step 4: Update docs default**

Change the `allowClear` default in the TimePicker docs table from `false` to `true`.

### Task 3: Verification

**Files:**

- Verify changed files and repository checks.

- [ ] **Step 1: Run focused tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- time-picker.test.tsx`

- [ ] **Step 2: Run AGENTS.md verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
