# Anchor P0/P1 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align Anchor with the selected Ant Design P0/P1 API surface: history behavior, offset defaulting, direction, link target, and custom active anchor selection.

**Architecture:** Extend `AnchorItem`/`AnchorProps` types, add focused tests in the existing Anchor test file, and update `anchor.tsx` plus styles without introducing new files. Keep the `items`-based API as the primary supported shape.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing css-in-js style registration.

---

## File Structure

- Modify `packages/components/src/anchor/interface.ts`: add `AnchorDirection`, P0/P1 props, and item fields.
- Modify `packages/components/src/anchor/anchor.tsx`: implement effective offsets, history update behavior, direction classes, item targets, and `getCurrentAnchor`.
- Modify `packages/components/src/anchor/anchor.style.ts`: add vertical/horizontal classes and keep nested vertical styling.
- Modify `packages/components/src/anchor/__tests__/anchor.test.tsx`: add tests before implementation for each behavior.

## Task 1: P0/P1 Tests

**Files:**

- Modify: `packages/components/src/anchor/__tests__/anchor.test.tsx`

- [ ] Add tests asserting: `targetOffset` defaults to `offsetTop`; click uses `history.pushState`; component/item `replace` uses `history.replaceState`; item `targetOffset` overrides component offset; `target` attribute is rendered; `direction="horizontal"` applies class; `getCurrentAnchor` controls active link.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- anchor` and verify the new tests fail because behavior/types are missing.

## Task 2: Implement Types and Behavior

**Files:**

- Modify: `packages/components/src/anchor/interface.ts`
- Modify: `packages/components/src/anchor/anchor.tsx`

- [ ] Update types for `direction`, `replace`, `getCurrentAnchor`, item `target`, item `replace`, item `targetOffset`, and `key?: string | number`.
- [ ] Use effective target offset: item `targetOffset` > component `targetOffset` > component `offsetTop` > `0`.
- [ ] On click, update URL via `history.pushState` or `history.replaceState`, using item `replace` before component `replace`.
- [ ] Render anchor `target` attribute when present.
- [ ] Apply `getCurrentAnchor` to calculated active link before storing and calling `onChange`.
- [ ] Add direction class to root.

## Task 3: Implement Direction Styling

**Files:**

- Modify: `packages/components/src/anchor/anchor.style.ts`

- [ ] Add `-vertical` and `-horizontal` classes.
- [ ] Horizontal mode should render top-level links inline and hide nested lists because antd does not support nested horizontal links.
- [ ] Preserve existing vertical appearance.

## Task 4: Verification

**Commands:**

- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- anchor`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`
