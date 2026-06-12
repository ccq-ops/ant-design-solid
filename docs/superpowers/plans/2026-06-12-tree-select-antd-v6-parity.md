# TreeSelect Antd v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild TreeSelect on top of the existing Tree component and expose an antd v6-compatible API with Solid conventions.

**Architecture:** Split TreeSelect into focused data, search, and value utility modules plus a select-like wrapper that renders `Tree` in the popup. Utility tests drive normalization behavior first, then component tests cover selection, search, checkbox, popup, appearance, docs, and verification.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing Tree/Select/Cascader patterns, existing cssinjs style registration, existing icon package.

---

## File Structure

- Modify `packages/components/src/tree-select/interface.ts`: replace the lightweight API with an antd v6-style public API, Solid typings, constants, semantic slots, and ref types.
- Create `packages/components/src/tree-select/tree-data-utils.ts`: normalize `treeData`, `fieldNames`, `treeDataSimpleMode`, flatten entities, and support `TreeSelect.TreeNode`.
- Create `packages/components/src/tree-select/value-utils.ts`: normalize values, convert labels, apply checked display strategy, compare output values, and build callback payloads.
- Create `packages/components/src/tree-select/search-utils.ts`: normalize `showSearch`, deprecated search props, and filtered tree data.
- Modify `packages/components/src/tree-select/tree-select.tsx`: implement the select-like shell that renders `Tree`, handles controlled state, search, popup, selection, checkable behavior, tags, form integration, and ref methods.
- Modify `packages/components/src/tree-select/tree-select.style.ts`: add selector, popup, tag, search, semantic slot, size, status, variant, and Tree integration styles.
- Modify `packages/components/src/tree-select/index.ts`: export the component, public types, constants, and `TreeNode` parity entry.
- Modify `packages/components/src/tree-select/__tests__/tree-select.test.tsx`: add TDD coverage for every API group.
- Modify `apps/docs/src/pages/components/tree-select.mdx`: add demos and API documentation using Solid names such as `class`.

## Commands

Use these commands during implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tree-select
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

If the filtered test command does not match the package script behavior, use:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/tree-select/__tests__/tree-select.test.tsx
```

## Tasks

### Task 1: Public Types And Tree Data Utilities

**Files:**

- Modify: `packages/components/src/tree-select/interface.ts`
- Create: `packages/components/src/tree-select/tree-data-utils.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing tests for `fieldNames`, `treeDataSimpleMode`, `TreeSelect.TreeNode`, node lookup by value, and `treeNodeLabelProp`.
- [ ] Run the focused TreeSelect tests and verify they fail because the new utility exports and API do not exist yet.
- [ ] Implement public types, constants `SHOW_ALL`, `SHOW_PARENT`, `SHOW_CHILD`, field name normalization, simple mode conversion, tree node collection, flattening, and lookup helpers.
- [ ] Run the focused TreeSelect tests and verify the new utility tests pass.

### Task 2: Value Normalization And Checked Strategy

**Files:**

- Create: `packages/components/src/tree-select/value-utils.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing tests for raw single value, raw multiple values, `labelInValue`, `treeCheckStrictly`, `SHOW_ALL`, `SHOW_PARENT`, `SHOW_CHILD`, and max tag text truncation helpers.
- [ ] Run the focused TreeSelect tests and verify they fail because value utilities are missing.
- [ ] Implement value normalization, labeled value conversion, checked display strategy filtering, callback label extraction, and public value equality helpers.
- [ ] Run the focused TreeSelect tests and verify the value utility tests pass.

### Task 3: Search Utilities

**Files:**

- Create: `packages/components/src/tree-select/search-utils.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing tests for `showSearch` boolean and object forms, deprecated top-level `searchValue`, `onSearch`, `filterTreeNode`, `treeNodeFilterProp`, `autoClearSearchValue`, ancestor-preserving filtering, and `notFoundContent`.
- [ ] Run the focused TreeSelect tests and verify they fail because search utilities are missing.
- [ ] Implement search config normalization and filtered tree construction that keeps matched nodes and ancestors.
- [ ] Run the focused TreeSelect tests and verify the search utility tests pass.

### Task 4: Single Selection Shell On Tree

**Files:**

- Modify: `packages/components/src/tree-select/tree-select.tsx`
- Modify: `packages/components/src/tree-select/tree-select.style.ts`
- Modify: `packages/components/src/tree-select/index.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing component tests for basic single select, controlled value, `defaultValue`, `labelInValue`, `onChange(value, label, extra)`, `onSelect`, disabled nodes, `selectable: false`, popup close after single select, clear, form integration, and `focus()/blur()`.
- [ ] Run the focused TreeSelect tests and verify they fail because the wrapper still has the old implementation.
- [ ] Replace the old recursive popup with the select-like Tree wrapper, controlled/uncontrolled value, form integration, single selection mapping, clear handling, and ref methods.
- [ ] Run the focused TreeSelect tests and verify single selection tests pass.

### Task 5: Multiple And Checkable Selection

**Files:**

- Modify: `packages/components/src/tree-select/tree-select.tsx`
- Modify: `packages/components/src/tree-select/tree-select.style.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing component tests for `multiple`, tag rendering, tag removal, `maxCount`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `tagRender`, `treeCheckable`, `treeCheckStrictly`, `disableCheckbox`, all show checked strategies, and popup staying open.
- [ ] Run the focused TreeSelect tests and verify they fail because multiple/checkable behavior is incomplete.
- [ ] Implement multiple value updates, tag UI, max tag handling, Tree check mapping, checked strategy display, strict checking, and max count enforcement.
- [ ] Run the focused TreeSelect tests and verify multiple and checkable tests pass.

### Task 6: Search, Async Loading, And Expansion

**Files:**

- Modify: `packages/components/src/tree-select/tree-select.tsx`
- Modify: `packages/components/src/tree-select/tree-select.style.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing component tests for `showSearch`, controlled search input, `onSearch`, filtering, `notFoundContent`, search auto-clear, `loadData`, `treeLoadedKeys`, `treeExpandedKeys`, `treeDefaultExpandedKeys`, `treeDefaultExpandAll`, `treeExpandAction`, and `onTreeExpand`.
- [ ] Run the focused TreeSelect tests and verify they fail because search and Tree expansion wiring is incomplete.
- [ ] Implement search input rendering, search state, filtered Tree data, empty content, async loading pass-through, loaded keys, controlled/uncontrolled expansion props, and expansion callbacks.
- [ ] Run the focused TreeSelect tests and verify search, async loading, and expansion tests pass.

### Task 7: Popup, Appearance, Semantic Slots, And Deprecated Aliases

**Files:**

- Modify: `packages/components/src/tree-select/tree-select.tsx`
- Modify: `packages/components/src/tree-select/tree-select.style.ts`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Write failing component tests for `popupRender`, `popupMatchSelectWidth`, `dropdownMatchSelectWidth`, `placement`, `popupClassName`, `dropdownClassName`, `styles.popup.root`, `dropdownStyle`, `classNames`, `styles`, `onPopupScroll`, `onDropdownVisibleChange`, `prefix`, `suffixIcon`, `showArrow`, `allowClear.clearIcon`, `switcherIcon`, `treeIcon`, `treeLine`, `treeTitleRender`, `size`, `status`, `variant`, and `bordered`.
- [ ] Run the focused TreeSelect tests and verify they fail because popup and appearance APIs are incomplete.
- [ ] Implement popup class/style merging, placement and width positioning, popup rendering wrapper, scroll callback, deprecated aliases, selector icons, Tree render props, semantic slots, size/status/variant/bordered classes, and clear icon object form.
- [ ] Run the focused TreeSelect tests and verify popup and appearance tests pass.

### Task 8: Documentation And Full Verification

**Files:**

- Modify: `apps/docs/src/pages/components/tree-select.mdx`
- Modify: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`

- [ ] Update docs with examples for basic, multiple, checkable, strategy, search, async loading, controlled state, field names, simple mode, custom rendering, size/status/variant, popup render, semantic slots, and `labelInValue`.
- [ ] Update docs API tables for TreeSelect, showSearch, methods, TreeNode props, semantic DOM, and deprecated aliases. Use `class`, not `className`, in examples.
- [ ] Run the focused TreeSelect tests.
- [ ] Run lint, format check, recursive typecheck, recursive test, and recursive build.
- [ ] Fix any verification failures without reverting unrelated changes.
