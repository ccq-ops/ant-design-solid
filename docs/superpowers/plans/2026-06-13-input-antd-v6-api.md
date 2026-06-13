# Input Antd V6 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Input family API compatibility work described in the design spec.

**Architecture:** Extend the existing Input implementation in place, following `InputNumber` compatibility patterns for semantic props, ref APIs, add-ons, root classes, prefix overrides, and deprecated `bordered`. Keep Solid-native usage in examples while accepting antd migration props where the repo already has precedent.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, cssinjs component tokens.

---

### Task 1: Add Failing API Tests

**Files:**

- Modify: `packages/components/src/input/__tests__/input-api.test.tsx`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] Add tests for semantic `root` keys and function-valued semantic configs.
- [ ] Add tests for `rootClassName`, `prefixCls`, `addonBefore`, `addonAfter`, `bordered`, and `Input.Group`.
- [ ] Add tests for `InputRef`, `TextAreaRef`, and `OTPRef`.
- [ ] Add tests for `TextArea.size` and `onResize`.
- [ ] Add tests for `Search.inputPrefixCls`, `enterButton` string content, and `classNames.button/styles.button`.
- [ ] Add tests for `Password.action="hover"` and `suffix`.
- [ ] Add tests for `OTP.type` and `rootClassName`.
- [ ] Add theme tests for new Input component token defaults and overrides.

### Task 2: Implement Types and Utilities

**Files:**

- Modify: `packages/components/src/input/interface.ts`
- Modify: `packages/components/src/input/utils.ts`
- Modify: `packages/components/src/input/index.ts`

- [ ] Add semantic key types and function-valued semantic config types.
- [ ] Add ref interfaces and focus option type.
- [ ] Add compatibility props and component-specific missing props.
- [ ] Export `Group`, ref types, and semantic config types.
- [ ] Add helper utilities for resolving semantic config and focus cursor behavior.

### Task 3: Implement Components

**Files:**

- Modify: `packages/components/src/input/input.tsx`
- Modify: `packages/components/src/input/text-area.tsx`
- Modify: `packages/components/src/input/search.tsx`
- Modify: `packages/components/src/input/password.tsx`
- Modify: `packages/components/src/input/otp.tsx`
- Create: `packages/components/src/input/group.tsx`

- [ ] Implement root refs and API refs.
- [ ] Implement `prefixCls`, `rootClassName`, `bordered`, add-ons, and group wrappers.
- [ ] Implement semantic root/button resolution with `wrapper` aliases.
- [ ] Implement TextArea resize callback.
- [ ] Implement Search button semantics and prefix override.
- [ ] Implement Password hover action and suffix composition.
- [ ] Implement OTP type and ref API.

### Task 4: Align Input Tokens and Styles

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/components/src/input/input.style.ts`

- [ ] Expand `InputComponentToken`.
- [ ] Update defaults in `getComponentToken`.
- [ ] Update Input CSS to consume new token fields.
- [ ] Add styles for add-ons, group, focused state, hover/active backgrounds, sizes, and semantic button styling.

### Task 5: Update Docs

**Files:**

- Modify: `apps/docs/src/pages/components/input.mdx`

- [ ] Add examples for compatibility props and new subcomponent APIs.
- [ ] Update API tables for Input, TextArea, Search, Password, OTP, Group, semantic props, refs, and tokens.
- [ ] Keep examples Solid-friendly by using `class` for ordinary styling.

### Task 6: Verify

**Commands:**

- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- input`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/theme test`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`

Run broader build/test only if the focused checks are green or failures point outside the edited area.
