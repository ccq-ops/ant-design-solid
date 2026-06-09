# Select Antd Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Solid Select component to cover the main Ant Design Select API surface in a single implementation pass.

**Architecture:** Keep Select as a native Solid component and split reusable logic into local option and value utilities. Preserve current behavior through existing tests, then add tests for the new API families before production code.

**Tech Stack:** SolidJS, Vitest, @solidjs/testing-library, existing cssinjs style registration, existing icon package.

---

### Task 1: Public Types And Utility Tests

**Files:**

- Modify: `packages/components/src/select/interface.ts`
- Create: `packages/components/src/select/option-utils.ts`
- Create: `packages/components/src/select/value-utils.ts`
- Modify: `packages/components/src/select/__tests__/select.test.tsx`

- [ ] Add failing tests for field name normalization, grouped options, label-in-value conversion, and multiple value conversion.
- [ ] Implement the new public interfaces and utility functions.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/select/__tests__/select.test.tsx`.

### Task 2: Single Select Search And Rendering

**Files:**

- Modify: `packages/components/src/select/select.tsx`
- Modify: `packages/components/src/select/select.style.ts`
- Modify: `packages/components/src/select/__tests__/select.test.tsx`

- [ ] Add failing tests for `showSearch`, `searchValue`, `onSearch`, `filterOption`, `filterSort`, `optionFilterProp`, `optionRender`, `notFoundContent`, and `popupRender`.
- [ ] Implement search input state, filtered options, sorted options, custom option rendering, empty content, and popup wrapping.
- [ ] Run the focused Select test file.

### Task 3: Multiple And Tags Modes

**Files:**

- Modify: `packages/components/src/select/select.tsx`
- Modify: `packages/components/src/select/select.style.ts`
- Modify: `packages/components/src/select/__tests__/select.test.tsx`

- [ ] Add failing tests for `mode="multiple"`, `mode="tags"`, `onSelect`, `onDeselect`, `maxCount`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `tagRender`, `removeIcon`, and `tokenSeparators`.
- [ ] Implement internal selected arrays, tag rendering/removal, tags option creation, token splitting, and multiple-mode events.
- [ ] Run the focused Select test file.

### Task 4: Appearance, Popup, Events, And Ref

**Files:**

- Modify: `packages/components/src/select/select.tsx`
- Modify: `packages/components/src/select/select.style.ts`
- Modify: `packages/components/src/select/__tests__/select.test.tsx`

- [ ] Add failing tests for `size`, `status`, `variant`, `bordered`, `prefix`, `suffixIcon`, `allowClear.clearIcon`, `loading`, `loadingIcon`, `menuItemSelectedIcon`, `placement`, popup width aliases, popup class/style aliases, semantic `classNames/styles`, `onClear`, `onPopupScroll`, `onInputKeyDown`, `onDropdownVisibleChange`, and `ref.focus()/blur()`.
- [ ] Implement the appearance classes, icon slots, popup style/class merging, event aliases, and ref methods.
- [ ] Run the focused Select test file.

### Task 5: Docs And Full Verification

**Files:**

- Modify: `apps/docs/src/pages/components/select.mdx`

- [ ] Update demos and API docs for the expanded API.
- [ ] Run lint, format check, recursive typecheck, recursive test, and recursive build.
