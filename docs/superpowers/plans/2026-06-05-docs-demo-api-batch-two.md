# Docs Demo and API Batch Two Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add missing examples and API tables for the second batch of data-entry component docs.

**Architecture:** Reuse the shared docs `ApiTable` component added in batch one. Each updated component page defines `ApiTableRow[]` arrays based on its local `interface.ts`, imports `ApiTable`, renders existing or expanded demos, then appends one or more API sections.

**Tech Stack:** SolidJS, TypeScript, existing docs `DemoBlock`, existing `ApiTable`, pnpm workspace verification.

---

## File map

- Modify `apps/docs/src/pages/components/checkbox.tsx`: add examples and API tables for Checkbox and Checkbox.Group.
- Modify `apps/docs/src/pages/components/radio.tsx`: add examples and API tables for Radio and Radio.Group.
- Modify `apps/docs/src/pages/components/auto-complete.tsx`: add API table for AutoComplete.
- Modify `apps/docs/src/pages/components/cascader.tsx`: add API table for Cascader.
- Modify `apps/docs/src/pages/components/input-number.tsx`: add API table for InputNumber.
- Modify `apps/docs/src/pages/components/mentions.tsx`: add examples and API table for Mentions.
- Modify `apps/docs/src/pages/components/segmented.tsx`: add API table for Segmented.
- Modify `apps/docs/src/pages/components/slider.tsx`: add API table for Slider.
- Modify `apps/docs/src/pages/components/rate.tsx`: add API table for Rate.
- Modify `apps/docs/src/pages/components/transfer.tsx`: add API table for Transfer.

---

### Task 1: Checkbox and Radio

**Files:**
- Modify: `apps/docs/src/pages/components/checkbox.tsx`
- Modify: `apps/docs/src/pages/components/radio.tsx`

- [ ] **Step 1: Inspect public contracts**

Read:

```bash
sed -n '1,220p' packages/components/src/checkbox/interface.ts
sed -n '1,220p' packages/components/src/radio/interface.ts
sed -n '1,220p' packages/components/src/checkbox/checkbox-group.tsx
sed -n '1,220p' packages/components/src/radio/radio-group.tsx
```

Use only props declared and implemented there.

- [ ] **Step 2: Update Checkbox page**

Add `ApiTable` imports and row arrays. Ensure demos cover `Basic`, `Disabled`, `Controlled`, `Group`, and `In Form`. Add API sections for `Checkbox` and `Checkbox.Group`.

- [ ] **Step 3: Update Radio page**

Add `ApiTable` imports and row arrays. Ensure demos cover `Basic`, `Group`, `Disabled`, `Controlled`, and `In Form`. Add API sections for `Radio` and `Radio.Group`.

- [ ] **Step 4: Verify focused docs compile/build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/pages/components/checkbox.tsx apps/docs/src/pages/components/radio.tsx
git commit -m "docs: expand checkbox radio documentation"
```

---

### Task 2: AutoComplete, Cascader, InputNumber

**Files:**
- Modify: `apps/docs/src/pages/components/auto-complete.tsx`
- Modify: `apps/docs/src/pages/components/cascader.tsx`
- Modify: `apps/docs/src/pages/components/input-number.tsx`

- [ ] **Step 1: Inspect public contracts**

Read:

```bash
sed -n '1,220p' packages/components/src/auto-complete/interface.ts
sed -n '1,220p' packages/components/src/cascader/interface.ts
sed -n '1,220p' packages/components/src/input-number/interface.ts
```

Use implementation files if a declared prop's behavior is unclear.

- [ ] **Step 2: Add API tables**

Add `ApiTable` imports and API rows to each page. Preserve existing demos unless they need small wording or typing adjustments.

- [ ] **Step 3: Verify focused docs compile/build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/src/pages/components/auto-complete.tsx apps/docs/src/pages/components/cascader.tsx apps/docs/src/pages/components/input-number.tsx
git commit -m "docs: add autocomplete cascader input number api"
```

---

### Task 3: Mentions, Segmented, Slider

**Files:**
- Modify: `apps/docs/src/pages/components/mentions.tsx`
- Modify: `apps/docs/src/pages/components/segmented.tsx`
- Modify: `apps/docs/src/pages/components/slider.tsx`

- [ ] **Step 1: Inspect public contracts**

Read:

```bash
sed -n '1,220p' packages/components/src/mentions/interface.ts
sed -n '1,220p' packages/components/src/segmented/interface.ts
sed -n '1,240p' packages/components/src/slider/interface.ts
```

Use implementation files if a declared prop's behavior is unclear.

- [ ] **Step 2: Update Mentions page**

Add at least one additional demo if needed so the page covers basic suggestions, controlled value, disabled option/disabled component, and Form integration. Add API table for Mentions.

- [ ] **Step 3: Add Segmented and Slider API tables**

Add `ApiTable` imports and API rows to `segmented.tsx` and `slider.tsx`.

- [ ] **Step 4: Verify focused docs compile/build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/pages/components/mentions.tsx apps/docs/src/pages/components/segmented.tsx apps/docs/src/pages/components/slider.tsx
git commit -m "docs: expand mentions segmented slider documentation"
```

---

### Task 4: Rate and Transfer

**Files:**
- Modify: `apps/docs/src/pages/components/rate.tsx`
- Modify: `apps/docs/src/pages/components/transfer.tsx`

- [ ] **Step 1: Inspect public contracts**

Read:

```bash
sed -n '1,220p' packages/components/src/rate/interface.ts
sed -n '1,260p' packages/components/src/transfer/interface.ts
```

Use implementation files if a declared prop's behavior is unclear.

- [ ] **Step 2: Add API tables**

Add `ApiTable` imports and API rows to `rate.tsx` and `transfer.tsx`.

- [ ] **Step 3: Verify focused docs compile/build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Expected: both pass.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/src/pages/components/rate.tsx apps/docs/src/pages/components/transfer.tsx
git commit -m "docs: add rate transfer api"
```

---

### Task 5: Full verification

**Files:**
- No planned file changes unless verification exposes issues.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: pass.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: pass.

- [ ] **Step 3: Run recursive typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: pass.

- [ ] **Step 4: Run recursive tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: pass.

- [ ] **Step 5: Run recursive build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: pass.

- [ ] **Step 6: Commit verification fixes if needed**

If verification changes were needed:

```bash
git add <fixed-files>
git commit -m "docs: fix batch two verification issues"
```
