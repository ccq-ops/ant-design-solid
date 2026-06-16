# Typography Antd v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Solid-style Ant Design v6 Typography API parity for components, interactions, ellipsis, styles, tests, and docs.

**Architecture:** Keep Typography in its existing folder, but expand the interface and implementation around a shared block renderer used by `Text`, `Link`, `Title`, and `Paragraph`. Use native Solid state and existing project helpers (`classNames`, `Tooltip`, token styles) without new dependencies.

**Tech Stack:** SolidJS, Vitest, Testing Library, existing css-in-js style registration, existing docs MDX.

---

### Task 1: Tests

**Files:**

- Modify: `packages/components/src/typography/__tests__/typography.test.tsx`

- [ ] Add failing tests for `Typography` root, `Link`, decoration props, copyable, editable, semantic slots, action placement, and ellipsis object behavior.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- typography` and confirm failures are due to missing API.

### Task 2: Interfaces

**Files:**

- Modify: `packages/components/src/typography/interface.ts`
- Modify: `packages/components/src/typography/index.ts`

- [ ] Add Solid-style config types: `TypographyProps`, `TypographySemanticClassNames`, `TypographySemanticStyles`, `CopyConfig`, `EditConfig`, `EllipsisConfig`, `ActionsConfig`, `TextProps`, `LinkProps`, `ParagraphProps`.
- [ ] Export the new types from the component index.

### Task 3: Implementation

**Files:**

- Modify: `packages/components/src/typography/typography.tsx`

- [ ] Replace the simple three-component implementation with a shared block renderer.
- [ ] Add root `Typography`, `Text`, `Link`, `Title`, and `Paragraph`.
- [ ] Implement text decorations, disabled semantics, copy action, edit action, action placement, semantic slots, and ellipsis config behavior.
- [ ] Keep Solid-first naming in public usage.

### Task 4: Styles

**Files:**

- Modify: `packages/components/src/typography/typography.style.ts`

- [ ] Add styles for root, link, disabled, action buttons, textarea, editing wrapper, ellipsis rows, expand/collapse symbol, and text decorations.

### Task 5: Docs

**Files:**

- Modify: `apps/docs/src/pages/components/typography.mdx`

- [ ] Add examples for root, link, decorations, copyable, editable, multiline ellipsis, controlled ellipsis, and semantic slots.
- [ ] Update all API tables to reflect Solid-style props and antd v6 parity behavior.

### Task 6: Verification

**Files:**

- No source edits unless verification exposes a defect.

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- typography`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
