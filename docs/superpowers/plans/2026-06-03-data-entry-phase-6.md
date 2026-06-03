# Data Entry Phase 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-style `AutoComplete`, `TreeSelect`, and `Transfer` components to `@ant-design-solid/core` with tests and docs.

**Architecture:** Each component follows the existing colocated folder pattern in `packages/components/src`, uses `ConfigProvider` prefix classes, registers token-driven styles with `useStyleRegister`, and exposes public exports from the package root. `AutoComplete` and `TreeSelect` integrate with `Form.Item` using the existing form control context; `Transfer` remains a standalone list-transfer control.

**Tech Stack:** TypeScript, SolidJS, Vite 8, pnpm 11, Vitest, jsdom, @solidjs/testing-library, oxlint, oxfmt.

---

## File Structure Map

### AutoComplete

- Create `packages/components/src/auto-complete/interface.ts`: option and prop types.
- Create `packages/components/src/auto-complete/auto-complete.style.ts`: selector/dropdown styles.
- Create `packages/components/src/auto-complete/auto-complete.tsx`: controlled/uncontrolled input + suggestions implementation.
- Create `packages/components/src/auto-complete/index.ts`: public exports.
- Create `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/auto-complete.tsx`: demos.

### TreeSelect

- Create `packages/components/src/tree-select/interface.ts`: tree node and prop types.
- Create `packages/components/src/tree-select/tree-select.style.ts`: selector/tree dropdown styles.
- Create `packages/components/src/tree-select/tree-select.tsx`: controlled/uncontrolled tree selection implementation.
- Create `packages/components/src/tree-select/index.ts`: public exports.
- Create `packages/components/src/tree-select/__tests__/tree-select.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/tree-select.tsx`: demos.

### Transfer

- Create `packages/components/src/transfer/interface.ts`: item, direction, and prop types.
- Create `packages/components/src/transfer/transfer.style.ts`: panel/list/operation styles.
- Create `packages/components/src/transfer/transfer.tsx`: controlled/uncontrolled transfer implementation.
- Create `packages/components/src/transfer/index.ts`: public exports.
- Create `packages/components/src/transfer/__tests__/transfer.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/transfer.tsx`: demos.

### Shared registry updates

- Modify `packages/components/src/index.ts`: export new component folders.
- Modify `apps/docs/src/site/nav.ts`: add component docs links.

## Implementation Tasks

### Task 1: AutoComplete

**Files:**

- Create: `packages/components/src/auto-complete/interface.ts`
- Create: `packages/components/src/auto-complete/auto-complete.style.ts`
- Create: `packages/components/src/auto-complete/auto-complete.tsx`
- Create: `packages/components/src/auto-complete/index.ts`
- Create: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`
- Create: `apps/docs/src/routes/components/auto-complete.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx` with tests covering placeholder/filtering, selection callbacks, controlled value/open, disabled option, clear, keyboard handling, prefixing, and `Form.Item` integration.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/auto-complete/__tests__/auto-complete.test.tsx
```

Expected: FAIL because the `auto-complete` module does not exist.

- [ ] **Step 3: Implement AutoComplete files**

Create component files using `Select`/`Input` conventions: `splitProps`, `useConfig`, `useFormItemControl`, `classNames`, `useStyleRegister`, controlled/uncontrolled helpers, visible option filtering, click and keyboard selection, clear button, and form updates.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry after `Cascader`, and a docs route with basic/filter/custom/disabled demos.

- [ ] **Step 5: Verify GREEN**

Run the AutoComplete test command again. Expected: PASS.

### Task 2: TreeSelect

**Files:**

- Create: `packages/components/src/tree-select/interface.ts`
- Create: `packages/components/src/tree-select/tree-select.style.ts`
- Create: `packages/components/src/tree-select/tree-select.tsx`
- Create: `packages/components/src/tree-select/index.ts`
- Create: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`
- Create: `apps/docs/src/routes/components/tree-select.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/components/src/tree-select/__tests__/tree-select.test.tsx` with tests covering opening, expanding nested nodes, selecting nodes, default expanded keys, controlled value/open, disabled nodes, clear, keyboard handling, prefixing, and `Form.Item` integration.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/tree-select/__tests__/tree-select.test.tsx
```

Expected: FAIL because the `tree-select` module does not exist.

- [ ] **Step 3: Implement TreeSelect files**

Create tree flattening helpers, selected-node lookup, expanded-key state, controlled/uncontrolled value/open handling, option selection, expand/collapse buttons, clear button, keyboard handling, styles, and exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry after `AutoComplete`, and a docs route with basic, default-expanded, disabled, allow-clear, and controlled examples.

- [ ] **Step 5: Verify GREEN**

Run the TreeSelect test command again. Expected: PASS.

### Task 3: Transfer

**Files:**

- Create: `packages/components/src/transfer/interface.ts`
- Create: `packages/components/src/transfer/transfer.style.ts`
- Create: `packages/components/src/transfer/transfer.tsx`
- Create: `packages/components/src/transfer/index.ts`
- Create: `packages/components/src/transfer/__tests__/transfer.test.tsx`
- Create: `apps/docs/src/routes/components/transfer.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing tests**

Create `packages/components/src/transfer/__tests__/transfer.test.tsx` with tests covering rendering panels, moving selected items right/left, controlled target and selected keys, search, custom titles/operations, disabled component/items, and prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/transfer/__tests__/transfer.test.tsx
```

Expected: FAIL because the `transfer` module does not exist.

- [ ] **Step 3: Implement Transfer files**

Create panel splitting helpers, controlled/uncontrolled target key state, selected key state, per-panel selected key callbacks, move-right/move-left logic, search filtering, disabled handling, styles, and exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry after `Upload`, and a docs route with basic, search, custom titles/operations, controlled, and disabled examples.

- [ ] **Step 5: Verify GREEN**

Run the Transfer test command again. Expected: PASS.

### Task 4: Full verification

**Files:** all files changed in Tasks 1-3.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.
