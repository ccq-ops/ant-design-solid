# AutoComplete V6 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Solid AutoComplete API, tokens, examples, and docs closer to Ant Design v6 while keeping Solid naming conventions.

**Architecture:** Keep the existing self-contained AutoComplete implementation and add a compatibility layer around props normalization, semantic class/style resolution, option normalization, custom input rendering, and ref methods. Add AutoComplete component tokens by composing Input-like control tokens and Select-like option tokens.

**Tech Stack:** SolidJS, Vitest, @solidjs/testing-library, local @ant-design-solid theme/cssinjs utilities, MDX docs.

---

### Task 1: Expand Public Types and Failing API Tests

**Files:**

- Modify: `packages/components/src/auto-complete/interface.ts`
- Modify: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`

- [ ] Add failing tests covering `ref`, semantic `classNames/styles`, Solid alias props, React alias props, `dataSource`, custom option classes/styles/titles, and custom input children.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx`.
- [ ] Expected: new tests fail because the props are not implemented yet.

### Task 2: Implement Prop Normalization and Ref/Custom Input Support

**Files:**

- Modify: `packages/components/src/auto-complete/interface.ts`
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`

- [ ] Normalize options from `options`, `dataSource`, and children option-like nodes where practical.
- [ ] Resolve `popupRender` from `popupRender ?? dropdownRender`, open callback from `onOpenChange ?? onDropdownVisibleChange`, and popup width from `popupMatchSelectWidth ?? dropdownMatchSelectWidth`.
- [ ] Add `ref` methods `focus`, `blur`, `input`, and `nativeElement`.
- [ ] Render a custom child input when supplied, merging `class`, `style`, `value`, `disabled`, keyboard/input/focus handlers, and ARIA props.
- [ ] Support Solid aliases `popupClass`, `dropdownClass`, `dropdownStyle`, and React aliases `popupClassName`, `dropdownClassName`.
- [ ] Run the AutoComplete test file and fix only AutoComplete behavior until it passes.

### Task 3: Add Semantic DOM Class/Style Support

**Files:**

- Modify: `packages/components/src/auto-complete/interface.ts`
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`

- [ ] Add semantic keys `root`, `selector`, `input`, `clear`, `popup`, `list`, `option`, and `empty`.
- [ ] Resolve object/function `classNames` and `styles` using the same shape as Input utilities.
- [ ] Apply semantic props to the corresponding DOM nodes.
- [ ] Run AutoComplete tests.

### Task 4: Align AutoComplete Tokens with Ant Design Control/Select Tokens

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/components/src/auto-complete/auto-complete.style.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] Add `AutoCompleteComponentToken` with Input-like active/hover/padding tokens and Select-like option tokens.
- [ ] Add default AutoComplete tokens in `getComponentToken`.
- [ ] Update AutoComplete CSS to read `getComponentToken('AutoComplete', token)` and use active/error/warning shadows, option heights, option backgrounds, and clear icon color.
- [ ] Add or update theme tests to prove AutoComplete token overrides exist.
- [ ] Run theme tests and AutoComplete tests.

### Task 5: Update Docs and Examples

**Files:**

- Modify: `apps/docs/src/pages/components/auto-complete.mdx`
- Modify if needed: docs runtime tests under `apps/docs/src/pages/components/*auto-complete*`

- [ ] Replace examples with antd-aligned examples adapted to Solid: basic, non-case-sensitive lookup, custom input, lookup patterns, status, variants, custom popup, and popup width.
- [ ] Update API table for new props, deprecated aliases, showSearch, methods, semantic DOM, and option fields.
- [ ] Use `class` naming in examples and docs; mention React `*ClassName` aliases only as deprecated compatibility.
- [ ] Run docs page/runtime tests relevant to AutoComplete.

### Task 6: Full Verification

**Files:**

- No source changes unless verification finds a root-caused issue.

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
- [ ] Report exact pass/fail evidence and any pre-existing unrelated dirty files.
