# Docs Dark Hardcoded Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace docs UI hardcoded light colors that break dark mode while preserving intentional component color API examples.

**Architecture:** Centralize docs-only surfaces, text, borders, shadows, and demo backgrounds behind CSS variables in `apps/docs/src/app.css`. Update docs layout/home/demo/example containers to consume those variables, and add regression tests for the most visible dark-mode failure points plus a static guard for hardcoded light container styles.

**Tech Stack:** SolidJS docs app, Tailwind utility classes, Vitest, Testing Library, CSS custom properties.

---

### Task 1: Add regression tests for dark-safe docs containers

**Files:**

- Modify: `apps/docs/src/pages/index.test.tsx`
- Modify: `apps/docs/src/components/demo-block.test.tsx`
- Create: `apps/docs/src/__tests__/dark-hardcoded-colors.test.ts`

- [ ] **Step 1: Update homepage test to expect semantic docs classes instead of hardcoded hero gradient**

In `apps/docs/src/pages/index.test.tsx`, replace the assertion expecting the exact `bg-[radial-gradient(...255,255,255...)]` class with assertions for `docs-hero`, `docs-surface`, and `docs-text` semantic classes.

- [ ] **Step 2: Update DemoBlock test to expect docs semantic background class**

In `apps/docs/src/components/demo-block.test.tsx`, change the preview assertion from `bg-white` to `docs-demo-preview`.

- [ ] **Step 3: Add static guard test**

Create `apps/docs/src/__tests__/dark-hardcoded-colors.test.ts` that scans `apps/docs/src` for high-risk hardcoded container patterns: `background: '#fff'`, `background: '#ffffff'`, `border: '1px solid #f0f0f0'`, and homepage-only hardcoded slate text classes. Exclude API example strings where the literal is intentionally shown to users.

- [ ] **Step 4: Run targeted tests and verify RED**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- --run apps/docs/src/pages/index.test.tsx apps/docs/src/components/demo-block.test.tsx apps/docs/src/__tests__/dark-hardcoded-colors.test.ts`

Expected: FAIL because semantic classes and static guard are not satisfied yet.

### Task 2: Centralize docs dark-mode variables and structural classes

**Files:**

- Modify: `apps/docs/src/app.css`
- Modify: `apps/docs/src/components/layout.tsx`
- Modify: `apps/docs/src/components/demo-block.tsx`
- Modify: `apps/docs/src/pages/index.tsx`

- [ ] **Step 1: Add docs semantic CSS variables/classes**

Extend `:root` and `:root[data-theme='dark']` with variables for hero background, hero overlay, surface alpha, card shadow, primary soft background, and muted borders. Add `.docs-*` classes for surface, surface-subtle, text, text-secondary, border, hero, demo preview, and panel shadows.

- [ ] **Step 2: Update Layout**

Replace header/nav/sidebar hardcoded Tailwind color classes with docs semantic classes while preserving blue brand hover classes.

- [ ] **Step 3: Update DemoBlock**

Use `docs-border`, `docs-demo-preview`, `docs-surface-subtle`, and docs text classes for the block, preview, code header, and controls.

- [ ] **Step 4: Update homepage**

Replace light-only hero/card/section classes with semantic docs classes. Keep intentional brand color swatches and primary buttons.

- [ ] **Step 5: Run targeted tests and verify GREEN**

Run the same targeted test command from Task 1.

Expected: PASS.

### Task 3: Fix high-risk component demo inline light containers

**Files:**

- Modify: `apps/docs/src/pages/components/masonry.tsx`
- Modify: `apps/docs/src/pages/components/spin.tsx`
- Modify: `apps/docs/src/pages/components/watermark.tsx`
- Modify: `apps/docs/src/pages/components/layout.tsx`
- Modify: `apps/docs/src/pages/components/border-beam.tsx`
- Modify: `apps/docs/src/pages/components/splitter.tsx`

- [ ] **Step 1: Replace docs container colors**

Change demo container styles from fixed `#fff`, `#f0f0f0`, `#d9d9d9`, `#f5f5f5`, and `#666` to `var(--docs-surface-solid)`, `var(--docs-border)`, `var(--docs-surface-subtle)`, and `var(--docs-text-secondary)`.

- [ ] **Step 2: Preserve intentional API color examples**

Do not change literals that demonstrate component props such as `Tag color`, `ColorPicker defaultValue`, `QRCode color`, `Progress strokeColor`, `BorderBeam color`, and custom token examples.

- [ ] **Step 3: Run targeted tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- --run apps/docs/src/__tests__/dark-hardcoded-colors.test.ts`

Expected: PASS.

### Task 4: Verification

**Files:**

- No code changes expected.

- [ ] **Step 1: Run AGENTS verification commands**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands exit 0.
