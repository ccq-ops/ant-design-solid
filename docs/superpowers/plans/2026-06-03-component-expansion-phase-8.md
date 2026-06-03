# Component Expansion Phase 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-style `Flex`, `Segmented`, and `QRCode` components to `@ant-design-solid/core` with tests, docs, exports, and navigation entries.

**Architecture:** Each component follows the established colocated component folder pattern under `packages/components/src`, uses `ConfigProvider` prefix classes, and registers token-driven styles with `useStyleRegister`. `Flex` is a CSS utility wrapper, `Segmented` is a controlled/uncontrolled single-select control, and `QRCode` is a deterministic SVG display component with status overlays.

**Tech Stack:** TypeScript, SolidJS, Vite 8, pnpm 11, Vitest, jsdom, @solidjs/testing-library, oxlint, oxfmt.

---

## File Structure Map

### Flex

- Create `packages/components/src/flex/interface.ts`: gap and prop types.
- Create `packages/components/src/flex/flex.style.ts`: base flex wrapper styles.
- Create `packages/components/src/flex/flex.tsx`: Dynamic wrapper, style merging, gap resolution, prefix behavior.
- Create `packages/components/src/flex/index.ts`: public exports.
- Create `packages/components/src/flex/__tests__/flex.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/flex.tsx`: demos.

### Segmented

- Create `packages/components/src/segmented/interface.ts`: option and prop types.
- Create `packages/components/src/segmented/segmented.style.ts`: control, item, selected, disabled, size styles.
- Create `packages/components/src/segmented/segmented.tsx`: option normalization, controlled/uncontrolled state, click and keyboard behavior.
- Create `packages/components/src/segmented/index.ts`: public exports.
- Create `packages/components/src/segmented/__tests__/segmented.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/segmented.tsx`: demos.

### QRCode

- Create `packages/components/src/qrcode/interface.ts`: status and prop types.
- Create `packages/components/src/qrcode/qrcode.style.ts`: square wrapper, SVG, icon, status overlay styles.
- Create `packages/components/src/qrcode/qrcode.tsx`: deterministic matrix generation, SVG rendering, status overlays, prefix behavior.
- Create `packages/components/src/qrcode/index.ts`: public exports.
- Create `packages/components/src/qrcode/__tests__/qrcode.test.tsx`: behavior tests.
- Create `apps/docs/src/routes/components/qrcode.tsx`: demos.

### Shared registry updates

- Modify `packages/components/src/index.ts`: export new component folders.
- Modify `apps/docs/src/site/nav.ts`: add component docs links.

## Implementation Tasks

### Task 1: Flex

**Files:**

- Create: `packages/components/src/flex/interface.ts`
- Create: `packages/components/src/flex/flex.style.ts`
- Create: `packages/components/src/flex/flex.tsx`
- Create: `packages/components/src/flex/index.ts`
- Create: `packages/components/src/flex/__tests__/flex.test.tsx`
- Create: `apps/docs/src/routes/components/flex.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Flex tests**

Create `packages/components/src/flex/__tests__/flex.test.tsx` with tests covering children/default class, vertical/wrap/justify/align/gaps, semantic `component`, style merge precedence, custom `prefixCls`, and `ConfigProvider` prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm --filter @ant-design-solid/core test -- src/flex/__tests__/flex.test.tsx
```

Expected: FAIL because the `flex` module does not exist.

- [ ] **Step 3: Implement Flex files**

Create the Flex component with `Dynamic`, `useConfig`, `useToken`, `useStyleRegister`, `classNames`, token-based gap resolution, computed/user style merging, and public exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry near layout components, and a docs route with horizontal, vertical, wrap, alignment, and semantic element examples.

- [ ] **Step 5: Verify GREEN**

Run the Flex test command again. Expected: PASS.

### Task 2: Segmented

**Files:**

- Create: `packages/components/src/segmented/interface.ts`
- Create: `packages/components/src/segmented/segmented.style.ts`
- Create: `packages/components/src/segmented/segmented.tsx`
- Create: `packages/components/src/segmented/index.ts`
- Create: `packages/components/src/segmented/__tests__/segmented.test.tsx`
- Create: `apps/docs/src/routes/components/segmented.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Segmented tests**

Create `packages/components/src/segmented/__tests__/segmented.test.tsx` with tests covering primitive/object options, default first enabled selection, uncontrolled click selection and `onChange`, controlled `value`, disabled root/options, keyboard Arrow/Home/End selection, block/size classes, custom `prefixCls`, and `ConfigProvider` prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm --filter @ant-design-solid/core test -- src/segmented/__tests__/segmented.test.tsx
```

Expected: FAIL because the `segmented` module does not exist.

- [ ] **Step 3: Implement Segmented files**

Create Segmented with option normalization, selected value memoization, controlled/uncontrolled state, disabled guards, `role="radiogroup"`, `role="radio"` buttons, click selection, Arrow/Home/End keyboard selection among enabled options, token-driven styles, prefix support, and public exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry near data entry components, and a docs route with basic, object options with icons, block, sizes, and disabled examples.

- [ ] **Step 5: Verify GREEN**

Run the Segmented test command again. Expected: PASS.

### Task 3: QRCode

**Files:**

- Create: `packages/components/src/qrcode/interface.ts`
- Create: `packages/components/src/qrcode/qrcode.style.ts`
- Create: `packages/components/src/qrcode/qrcode.tsx`
- Create: `packages/components/src/qrcode/index.ts`
- Create: `packages/components/src/qrcode/__tests__/qrcode.test.tsx`
- Create: `apps/docs/src/routes/components/qrcode.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing QRCode tests**

Create `packages/components/src/qrcode/__tests__/qrcode.test.tsx` with tests covering deterministic SVG matrix rendering for a value, size/color/background/bordered classes, `bordered=false`, centered icon rendering, loading and expired overlays, custom `statusRender`, custom `prefixCls`, and `ConfigProvider` prefixing.

- [ ] **Step 2: Verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm --filter @ant-design-solid/core test -- src/qrcode/__tests__/qrcode.test.tsx
```

Expected: FAIL because the `qrcode` module does not exist.

- [ ] **Step 3: Implement QRCode files**

Create QRCode with deterministic hash-based matrix generation, fixed finder patterns, SVG rect rendering, icon overlay, loading/expired/custom status overlays, bordered class behavior, token-driven styles, prefix support, and public exports.

- [ ] **Step 4: Add docs and registries**

Add root export, docs nav entry near display components, and a docs route with basic, custom colors, icon, statuses, and borderless examples.

- [ ] **Step 5: Verify GREEN**

Run the QRCode test command again. Expected: PASS.

### Task 4: Full verification

**Files:** all files changed in Tasks 1-3.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm -r build
```

Expected: PASS.
