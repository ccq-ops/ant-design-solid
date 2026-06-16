# InputNumber AntD API Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the Solid InputNumber component with Ant Design InputNumber API priority groups 1-4 while preserving existing tests.

**Architecture:** Extend the existing `InputNumberProps`, `input-number.tsx`, and `input-number.style.ts` files. Keep helper logic local to the component; avoid introducing deprecated antd props or unrelated refactors.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing cssinjs styling.

---

## Files

- Modify: `packages/components/src/input-number/interface.ts` — add prop types and semantic slot types.
- Modify: `packages/components/src/input-number/input-number.tsx` — implement behavior, display, numeric, and styling API support.
- Modify: `packages/components/src/input-number/input-number.style.ts` — add prefix/suffix, variant, readOnly/without-controls/spinner styling.
- Modify: `packages/components/src/input-number/__tests__/input-number.test.tsx` — add tests before implementation.
- Modify: `apps/docs/src/pages/components/input-number.tsx` — document the new API rows and small demos if time allows.

## Task 1: Base behavior props

- [ ] Add failing tests for `keyboard={false}`, `onPressEnter`, `changeOnBlur={false}`, `readOnly`, `changeOnWheel`, and `onStep`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- input-number` and verify the new tests fail for missing behavior.
- [ ] Extend `InputNumberProps` with base behavior props.
- [ ] Implement base behavior in `input-number.tsx`.
- [ ] Re-run the InputNumber tests and verify they pass.

## Task 2: Display props

- [ ] Add failing tests for `prefix`, `suffix`, custom controls icons, and `variant` classes.
- [ ] Run the InputNumber tests and verify failures.
- [ ] Extend props with display types.
- [ ] Render prefix/suffix/custom controls and variant class.
- [ ] Add minimal styles.
- [ ] Re-run tests and verify pass.

## Task 3: Numeric props

- [ ] Add failing tests for string `step`, `stringMode`, `decimalSeparator`, and formatter info.
- [ ] Run the InputNumber tests and verify failures.
- [ ] Extend numeric prop types.
- [ ] Implement string mode, decimal separator parsing/formatting, formatter info, and string step arithmetic.
- [ ] Re-run tests and verify pass.

## Task 4: Semantic styling props

- [ ] Add failing tests for `classNames`, `styles`, `rootClassName`, and `prefixCls`.
- [ ] Run the InputNumber tests and verify failures.
- [ ] Extend semantic prop types.
- [ ] Apply semantic classes/styles to root/prefix/suffix/input/actions slots and `prefixCls` override.
- [ ] Re-run tests and verify pass.

## Task 5: Docs and full verification

- [ ] Update `apps/docs/src/pages/components/input-number.tsx` API rows and demos.
- [ ] Run repository verification commands from AGENTS.md:
  - `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`
  - `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`
  - `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`
  - `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`
  - `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`
