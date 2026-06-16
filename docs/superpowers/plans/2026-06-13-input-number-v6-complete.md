# InputNumber v6 Complete Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Ant Design v6 InputNumber API alignment while preserving Solid naming and repository conventions.

**Architecture:** Extend the existing InputNumber interface, component, styles, tests, docs, and theme token map. Keep behavior local to `input-number.tsx`; use existing ConfigProvider token plumbing and existing Solid ref assignment patterns from Slider.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, cssinjs, @solid-ant-design/theme.

---

## Files

- Modify: `packages/components/src/input-number/interface.ts` — value/null types, ref type, semantic function types, deprecated props.
- Modify: `packages/components/src/input-number/input-number.tsx` — null empty value behavior, `onInput(text)`, ref API, addon wrapper, `bordered`, semantic function resolution.
- Modify: `packages/components/src/input-number/input-number.style.ts` — consume InputNumber component tokens and add addon/handle-visible styling.
- Modify: `packages/components/src/input-number/__tests__/input-number.test.tsx` — failing tests before each behavior change.
- Modify: `packages/theme/src/types.ts` — add `InputNumberComponentToken`.
- Modify: `packages/theme/src/components.ts` — add default InputNumber component tokens.
- Modify: `packages/theme/src/__tests__/theme.test.ts` — verify InputNumber token defaults/overrides.
- Modify: `apps/docs/src/pages/components/input-number.mdx` — add examples and update API/ref/token docs.

## Tasks

- [ ] Add failing component tests for empty `null`, text `onInput`, ref methods, deprecated addon/bordered props, and function semantic props.
- [ ] Run focused InputNumber tests and confirm the new tests fail for missing behavior.
- [ ] Implement interface and component changes until focused tests pass.
- [ ] Add failing theme token tests for `InputNumber`.
- [ ] Implement token types/defaults and style consumption until theme tests pass.
- [ ] Update docs with new examples, API rows, ref table, and token table.
- [ ] Run focused tests, then repository verification commands from AGENTS.md.
