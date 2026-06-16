# Antd Token Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `@solid-ant-design/theme` global tokens into parity with Ant Design `6.4.4`.

**Architecture:** Expand seed/map/alias token derivation in the theme package while keeping the public API stable. Use `@ant-design/colors` and `@ant-design/fast-color` for Ant Design-compatible color math, and keep component token defaults in the existing `components.ts` boundary.

**Tech Stack:** TypeScript, Vitest, pnpm, Vite, Ant Design color utility packages.

---

### Task 1: Global Token Parity Tests

**Files:**

- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] Add tests asserting representative Ant Design `6.4.4` seed, map, alias, dark, and override tokens.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test` and confirm the new tests fail on missing/mismatched token fields.

### Task 2: Global Token Implementation

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `packages/theme/src/default-seed-token.ts`
- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/algorithm.ts`

- [ ] Add `@ant-design/colors` and `@ant-design/fast-color` dependencies needed for Ant Design-compatible color derivation.
- [ ] Expand `defaultSeedToken` to Ant Design `6.4.4` seed defaults.
- [ ] Expand token types for seed, map, alias, overrides, and algorithm composition.
- [ ] Implement default and dark derivative helpers and alias formatting.
- [ ] Run focused theme tests until they pass.

### Task 3: Component Token Compatibility

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] Keep existing component token defaults passing.
- [ ] Add antd-compatible field aliases where local styles already need them.
- [ ] Keep component overrides permissive for incremental adoption.
- [ ] Run focused theme tests.

### Task 4: Verification

**Files:**

- All touched files.

- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme typecheck`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test`.
- [ ] Run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`.
- [ ] Run broader checks if time permits or if scoped checks expose cross-package impact.
