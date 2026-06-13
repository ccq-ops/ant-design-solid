# Descriptions Antd v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Ant Design v6 Descriptions API behavior in Solid style and refresh docs.

**Architecture:** Extend the existing Descriptions component in place. Reuse shared responsive utilities for breakpoint maps, add focused row/span helpers inside `descriptions.tsx`, and add dedicated component tokens in `@ant-design-solid/theme`.

**Tech Stack:** SolidJS, Vitest, @solidjs/testing-library, local cssinjs style registration, theme component tokens.

---

### Task 1: Add Failing API Tests

**Files:**

- Modify: `packages/components/src/descriptions/__tests__/descriptions.test.tsx`

- [ ] **Step 1: Add tests for v6 parity behavior**

Add cases for `colon={false}`, semantic `classNames/styles`, responsive `column` and `span`, `span="filled"`, final-row fill, `size="medium"`, and Solid `class`.

- [ ] **Step 2: Run tests to verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- descriptions`

Expected: FAIL because the props and behavior are not implemented yet.

### Task 2: Implement Types And Theme Tokens

**Files:**

- Modify: `packages/components/src/descriptions/interface.ts`
- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`

- [ ] **Step 1: Update Descriptions public types**

Add `DescriptionsSize = 'large' | 'medium' | 'small'`, responsive column/span types, semantic slot types, `colon`, and remove React compatibility aliases.

- [ ] **Step 2: Add dedicated component token type**

Add `DescriptionsComponentToken` with label background, title margin, item padding, colon margins, and bordered cell padding values.

- [ ] **Step 3: Run type-focused test command**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- descriptions`

Expected: still FAIL until implementation is complete.

### Task 3: Implement Responsive Rows And Semantic Rendering

**Files:**

- Modify: `packages/components/src/descriptions/descriptions.tsx`

- [ ] **Step 1: Use breakpoint utilities**

Resolve `column` and item `span` with `useBreakpoint` and `resolveResponsiveValue`.

- [ ] **Step 2: Implement row calculation**

Support `filled`, final-row fill, overflow clipping, and development warning.

- [ ] **Step 3: Implement semantic class/style slots**

Merge root `classNames/styles` and item-level `classNames/styles` for root/header/title/extra/label/content.

- [ ] **Step 4: Implement colon**

Default `colon` to true and suppress it for `colon={false}`, bordered, and vertical layouts.

- [ ] **Step 5: Run targeted tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- descriptions`

Expected: PASS.

### Task 4: Align Styling With Tokens

**Files:**

- Modify: `packages/components/src/descriptions/descriptions.style.ts`

- [ ] **Step 1: Replace hard-coded spacing with component tokens**

Use `getComponentToken('Descriptions', token())` defaults.

- [ ] **Step 2: Add size classes for large, medium, and small**

Default large has no special root class; medium and small get size-specific padding.

- [ ] **Step 3: Run targeted tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- descriptions`

Expected: PASS.

### Task 5: Refresh Docs

**Files:**

- Modify: `apps/docs/src/pages/components/descriptions.mdx`

- [ ] **Step 1: Replace demos with Ant Design-style examples**

Include basic, bordered, sizes, responsive, vertical, children syntax, and semantic styles/classes examples.

- [ ] **Step 2: Update API table**

Document Solid v6 parity props and omit deprecated React compatibility props.

- [ ] **Step 3: Run format check for touched docs**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`

Expected: PASS or report formatting deltas to fix.

### Task 6: Verification

**Files:**

- All touched Descriptions/theme/docs files.

- [ ] **Step 1: Run targeted test**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- descriptions`

Expected: PASS.

- [ ] **Step 2: Run required repository checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS, unless unrelated existing Form changes fail.
