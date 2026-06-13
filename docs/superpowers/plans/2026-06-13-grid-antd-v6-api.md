# Grid Antd V6 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Grid API parity with antd v6 while preserving Solid API conventions.

**Architecture:** Add shared responsive observer utilities, Row context, full Row/Col prop parsing, and Grid namespace export. Tests define behavior before implementation.

**Tech Stack:** SolidJS, Vitest, cssinjs, existing ConfigProvider/theme tokens.

---

### Task 1: Tests

**Files:**

- Modify: `packages/components/src/grid/__tests__/grid.test.tsx`

- [ ] Add tests for responsive Row/Col APIs, Grid.useBreakpoint, flex, prefixCls, RTL, and gutter propagation.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- grid` and confirm new tests fail before implementation.

### Task 2: Responsive Utilities

**Files:**

- Create: `packages/components/src/shared/responsive-observer.ts`

- [ ] Implement breakpoint constants, screen map types, responsive value resolver, and Solid `useBreakpoint`.
- [ ] Use min-width media queries aligned with antd token defaults.

### Task 3: Grid Internals

**Files:**

- Modify: `packages/components/src/grid/interface.ts`
- Create: `packages/components/src/grid/context.tsx`
- Modify: `packages/components/src/grid/row.tsx`
- Modify: `packages/components/src/grid/col.tsx`
- Modify: `packages/components/src/grid/grid.style.ts`
- Modify: `packages/components/src/grid/index.ts`

- [ ] Expand types for antd v6 Row/Col APIs using Solid HTML attributes.
- [ ] Provide Row context for gutter and wrap.
- [ ] Implement responsive Row class/style behavior.
- [ ] Implement responsive Col class/style behavior and flex parsing.
- [ ] Export `Grid.useBreakpoint` plus existing named exports.

### Task 4: Docs

**Files:**

- Modify: `apps/docs/src/pages/components/grid.mdx`

- [ ] Replace examples with antd-aligned Grid demos in Solid syntax.
- [ ] Update API tables for Row, Col, ColSize, and Grid.useBreakpoint.

### Task 5: Verification

- [ ] Run focused Grid tests.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck`.
- [ ] Run repository verification commands if time permits.
