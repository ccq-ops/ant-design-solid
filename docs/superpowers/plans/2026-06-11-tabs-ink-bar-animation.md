# Tabs Ink Bar Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smooth default Tabs ink bar movement while allowing `animated={false}` and `animated={{ inkBar: false }}` to disable it.

**Architecture:** `TabNavList` will own one stable nav-list-level indicator, measure the active tab relative to the nav list, and update inline movement styles. `tabs.style.ts` will animate the indicator by default and disable transition with a no-motion class.

**Tech Stack:** SolidJS, TypeScript, cssinjs style registration, Vitest with `@solidjs/testing-library`.

---

### Task 1: Add Failing Indicator Tests

**Files:**

- Modify: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing tests**

Add tests that verify the indicator is stable, moves through inline transform styles, and can disable motion through both supported `animated` forms.

- [ ] **Step 2: Run tests to verify they fail**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/components test -- tabs`

Expected: FAIL because the current indicator is recreated inside each active tab and no no-motion class exists.

### Task 2: Implement Stable Ink Bar

**Files:**

- Modify: `packages/components/src/tabs/interface.ts`
- Modify: `packages/components/src/tabs/tabs.tsx`
- Modify: `packages/components/src/tabs/tab-nav-list.tsx`
- Modify: `packages/components/src/tabs/tabs.style.ts`

- [ ] **Step 1: Pass animated into default tab bar props**

Add `animated?: boolean | TabsAnimatedConfig` to `TabsDefaultTabBarProps`, then expose `local.animated` from `Tabs` into `TabNavList`.

- [ ] **Step 2: Move indicator to nav-list level**

Replace per-active-tab indicator rendering with one `.ads-tabs-indicator` child in `.ads-tabs-nav-list`. Calculate style from the active tab rect and nav-list rect. For horizontal placement, set `transform` and `width`; for vertical placement, set `transform` and `height`.

- [ ] **Step 3: Preserve custom indicator behavior**

Apply `indicator.size`, `indicator.align`, `classNames.indicator`, and `styles.indicator` to the stable indicator. Hide the indicator when there is no active tab element.

- [ ] **Step 4: Add motion styles**

Add transition styles to `.ads-tabs-indicator`, plus `.ads-tabs-indicator-no-motion` with `transition: none`.

- [ ] **Step 5: Run tabs tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/components test -- tabs`

Expected: PASS.

### Task 3: Focused Verification

**Files:**

- Verify modified files only.

- [ ] **Step 1: Run lint/typecheck for affected package**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/components typecheck`

Expected: PASS.

- [ ] **Step 2: Run formatting check**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`

Expected: PASS.
