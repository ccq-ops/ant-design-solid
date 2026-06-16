# Navigation Overlay Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tested and documented `Affix`, `Anchor`, and `FloatButton` components to `@solid-ant-design/core`.

**Architecture:** Implement each component as an independent Solid module following existing component folder patterns. `Anchor` reuses `Affix` when `affix=true`; `FloatButton` owns `Group` and `BackTop` static subcomponents. Scroll utilities stay local to components to avoid premature shared abstraction.

**Tech Stack:** SolidJS, TypeScript, Vitest, `@solidjs/testing-library`, `@solid-ant-design/cssinjs`, existing config-provider/class-name utilities, pnpm/corepack.

---

## File Structure

Create component files:

```text
packages/components/src/affix/index.ts
packages/components/src/affix/interface.ts
packages/components/src/affix/affix.tsx
packages/components/src/affix/affix.style.ts
packages/components/src/affix/__tests__/affix.test.tsx
packages/components/src/anchor/index.ts
packages/components/src/anchor/interface.ts
packages/components/src/anchor/anchor.tsx
packages/components/src/anchor/anchor.style.ts
packages/components/src/anchor/__tests__/anchor.test.tsx
packages/components/src/float-button/index.ts
packages/components/src/float-button/interface.ts
packages/components/src/float-button/float-button.tsx
packages/components/src/float-button/float-button.style.ts
packages/components/src/float-button/__tests__/float-button.test.tsx
```

Create docs pages:

```text
apps/docs/src/routes/components/affix.tsx
apps/docs/src/routes/components/anchor.tsx
apps/docs/src/routes/components/float-button.tsx
```

Modify shared registries:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

## Task 1: Add Affix

**Files:**

- Create: `packages/components/src/affix/interface.ts`
- Create: `packages/components/src/affix/affix.style.ts`
- Create: `packages/components/src/affix/affix.tsx`
- Create: `packages/components/src/affix/index.ts`
- Create: `packages/components/src/affix/__tests__/affix.test.tsx`
- Create: `apps/docs/src/routes/components/affix.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] Write failing Affix tests for render, top affix threshold, bottom threshold, transition-only `onChange`, and custom prefix.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- affix` and verify failure because Affix is not implemented.
- [ ] Implement Affix types, style registration, component behavior, and exports.
- [ ] Add Affix docs route and nav/root export.
- [ ] Run focused Affix tests and typecheck.

## Task 2: Add Anchor

**Files:**

- Create: `packages/components/src/anchor/interface.ts`
- Create: `packages/components/src/anchor/anchor.style.ts`
- Create: `packages/components/src/anchor/anchor.tsx`
- Create: `packages/components/src/anchor/index.ts`
- Create: `packages/components/src/anchor/__tests__/anchor.test.tsx`
- Create: `apps/docs/src/routes/components/anchor.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] Write failing Anchor tests for nested items, click/scroll behavior, active updates, `affix={false}`, and custom prefix.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- anchor` and verify failure because Anchor is not implemented.
- [ ] Implement Anchor types, style registration, item rendering, scroll active tracking, Affix integration, and exports.
- [ ] Add Anchor docs route and nav/root export.
- [ ] Run focused Anchor tests and typecheck.

## Task 3: Add FloatButton

**Files:**

- Create: `packages/components/src/float-button/interface.ts`
- Create: `packages/components/src/float-button/float-button.style.ts`
- Create: `packages/components/src/float-button/float-button.tsx`
- Create: `packages/components/src/float-button/index.ts`
- Create: `packages/components/src/float-button/__tests__/float-button.test.tsx`
- Create: `apps/docs/src/routes/components/float-button.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] Write failing FloatButton tests for button mode, link mode, group rendering, click callback, BackTop visibility/scroll behavior, and custom prefix.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- float-button` and verify failure because FloatButton is not implemented.
- [ ] Implement FloatButton types, style registration, base component, Group, BackTop, and exports.
- [ ] Add FloatButton docs route and nav/root export.
- [ ] Run focused FloatButton tests and typecheck.

## Task 4: Full verification

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`.
- [ ] Inspect `git status --short` for expected changes only.
