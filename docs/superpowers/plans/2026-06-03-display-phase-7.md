# Display Phase 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-style `Timeline`, `Result`, and `Image` components to `@ant-design-solid/core` with tests, docs, exports, and navigation entries.

**Architecture:** Each component follows the established colocated component folder pattern under `packages/components/src`, uses `ConfigProvider` prefix classes, and registers token-driven styles with `useStyleRegister`. `Image` uses the existing portal helper for preview overlays; `Timeline` and `Result` are static display components with controlled rendering through props.

**Tech Stack:** TypeScript, SolidJS, Vite 8, pnpm 11, Vitest, jsdom, @solidjs/testing-library, oxlint, oxfmt.

---

## File Structure Map

### Timeline

- Create `packages/components/src/timeline/interface.ts`: item and prop types.
- Create `packages/components/src/timeline/timeline.style.ts`: timeline list/item/dot/content styles.
- Create `packages/components/src/timeline/timeline.tsx`: item ordering, pending, mode, color, prefix behavior.
- Create `packages/components/src/timeline/index.ts`: public exports.
- Create `packages/components/src/timeline/__tests__/timeline.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/timeline.tsx`: demos.

### Result

- Create `packages/components/src/result/interface.ts`: status and prop types.
- Create `packages/components/src/result/result.style.ts`: result layout and status styles.
- Create `packages/components/src/result/result.tsx`: status icon and content slots.
- Create `packages/components/src/result/index.ts`: public exports.
- Create `packages/components/src/result/__tests__/result.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/result.tsx`: demos.

### Image

- Create `packages/components/src/image/interface.ts`: image prop types.
- Create `packages/components/src/image/image.style.ts`: wrapper, placeholder, preview styles.
- Create `packages/components/src/image/image.tsx`: image rendering, load/error state, preview overlay.
- Create `packages/components/src/image/index.ts`: public exports.
- Create `packages/components/src/image/__tests__/image.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/image.tsx`: demos.

### Shared registry updates

- Modify `packages/components/src/index.ts`: export new component folders.
- Modify `apps/docs/src/site/nav.ts`: add component docs links.

## Implementation Tasks

### Task 1: Timeline

**Files:**

- Create: `packages/components/src/timeline/interface.ts`
- Create: `packages/components/src/timeline/timeline.style.ts`
- Create: `packages/components/src/timeline/timeline.tsx`
- Create: `packages/components/src/timeline/index.ts`
- Create: `packages/components/src/timeline/__tests__/timeline.test.tsx`
- Create: `apps/docs/src/routes/components/timeline.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Timeline tests**

Create `packages/components/src/timeline/__tests__/timeline.test.tsx` with tests covering basic items and labels, reverse order, pending and pendingDot, alternate/item position classes, semantic/custom colors and custom dots, custom `prefixCls`, and `ConfigProvider` prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/timeline/__tests__/timeline.test.tsx
```

Expected: FAIL because the `timeline` module does not exist.

- [ ] **Step 3: Implement Timeline files**

Create the Timeline component with controlled display-only behavior: derive prefix from `useConfig`, register styles, render `ol > li` entries, compute effective item position from `mode`/index/item position, append pending item, support reverse order, semantic color classes, inline custom dot color, and custom dot nodes.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry near data display components, and a docs route with basic, alternate, pending, custom dot/color, and reverse examples.

- [ ] **Step 5: Verify GREEN**

Run the Timeline test command again. Expected: PASS.

### Task 2: Result

**Files:**

- Create: `packages/components/src/result/interface.ts`
- Create: `packages/components/src/result/result.style.ts`
- Create: `packages/components/src/result/result.tsx`
- Create: `packages/components/src/result/index.ts`
- Create: `packages/components/src/result/__tests__/result.test.tsx`
- Create: `apps/docs/src/routes/components/result.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Result tests**

Create `packages/components/src/result/__tests__/result.test.tsx` with tests covering default/info rendering, success/error/warning/http status classes, custom icon, title/subtitle/extra/children rendering, custom `prefixCls`, and `ConfigProvider` prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/result/__tests__/result.test.tsx
```

Expected: FAIL because the `result` module does not exist.

- [ ] **Step 3: Implement Result files**

Create the Result component with default status icon mapping, status class names, optional content regions, token-driven styles, prefix support, and public exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry near feedback components, and a docs route with success, error, 404, custom icon, and extra actions examples.

- [ ] **Step 5: Verify GREEN**

Run the Result test command again. Expected: PASS.

### Task 3: Image

**Files:**

- Create: `packages/components/src/image/interface.ts`
- Create: `packages/components/src/image/image.style.ts`
- Create: `packages/components/src/image/image.tsx`
- Create: `packages/components/src/image/index.ts`
- Create: `packages/components/src/image/__tests__/image.test.tsx`
- Create: `apps/docs/src/routes/components/image.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Image tests**

Create `packages/components/src/image/__tests__/image.test.tsx` with tests covering image attributes, placeholder before/after load, fallback after error, preview open/close, disabled preview, custom `prefixCls`, and `ConfigProvider` prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/image/__tests__/image.test.tsx
```

Expected: FAIL because the `image` module does not exist.

- [ ] **Step 3: Implement Image files**

Create the Image component with image state, fallback-on-error handling, placeholder visibility, preview overlay through `InternalPortal`, Escape/backdrop/close-button close behavior, token-driven styles, prefix support, and public exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry near display components, and a docs route with basic, placeholder, fallback, preview, and preview-disabled examples.

- [ ] **Step 5: Verify GREEN**

Run the Image test command again. Expected: PASS.

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
