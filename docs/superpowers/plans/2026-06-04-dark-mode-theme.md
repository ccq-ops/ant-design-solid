# Dark Mode Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-style dark mode support through `theme.algorithm`, including `darkAlgorithm`, ConfigProvider inheritance, and cleanup of obvious hardcoded light component surfaces.

**Architecture:** `@solid-ant-design/theme` remains the source of truth for seed, alias, and component tokens. `ConfigProvider` merges `algorithm`, `token`, and `components`, and components continue consuming tokens via existing style hooks. Component cleanup moves light-only status/selection colors behind theme/component tokens instead of adding global dark CSS.

**Tech Stack:** TypeScript, SolidJS, Vitest, pnpm workspaces, @solid-ant-design/theme, @solid-ant-design/core, @solid-ant-design/cssinjs.

---

## Reference

Ant Design's official theme documentation says themes are customized through `ConfigProvider`'s `theme` prop, design tokens can be customized globally, and preset algorithms can be used for theme styles. The implementation in this repo should mirror that mental model with a simplified local token system.

## File Structure

Modify:

- `packages/theme/src/types.ts`
  - Add `ThemeAlgorithm` type.
  - Add `algorithm?: ThemeAlgorithm | ThemeAlgorithm[]` to `ThemeConfig`.
  - Add component token fields for status/selection colors where needed.

- `packages/theme/src/algorithm.ts`
  - Add `darkAlgorithm`.
  - Update `mergeTheme` to apply `config.algorithm` or `defaultAlgorithm`.
  - Keep existing `defaultAlgorithm` output stable.

- `packages/theme/src/index.ts`
  - Export `darkAlgorithm` and `ThemeAlgorithm` type via existing type export.

- `packages/theme/src/components.ts`
  - Derive Select/Tree/Alert/Tag defaults from active alias tokens.
  - Preserve component override behavior.

- `packages/theme/src/__tests__/theme.test.ts`
  - Add failing tests for dark algorithm and dark-compatible component tokens before implementation.
  - Adjust existing expectations only if new token fields are added.

- `packages/components/src/config-provider/context.tsx`
  - Merge/inherit `algorithm` in `mergeThemeConfig`.

- `packages/components/src/config-provider/__tests__/config-provider.test.tsx`
  - Add failing tests proving nested provider algorithm inheritance and override.

- `apps/docs/src/components/theme-context.tsx`
  - Use `darkAlgorithm` for dark mode.

- Component style files:
  - `packages/components/src/alert/alert.style.ts`
  - `packages/components/src/tag/tag.style.ts`
  - `packages/components/src/select/select.style.ts`
  - `packages/components/src/tree/tree.style.ts`
  - Popup style files with local hardcoded shadows where safe:
    - `packages/components/src/auto-complete/auto-complete.style.ts`
    - `packages/components/src/cascader/cascader.style.ts`
    - `packages/components/src/date-picker/date-picker.style.ts`
    - `packages/components/src/mentions/mentions.style.ts`
    - `packages/components/src/time-picker/time-picker.style.ts`
    - `packages/components/src/tree-select/tree-select.style.ts`

Potentially modify, only if required by TypeScript:

- Tests for affected components if they assert exact CSS strings.

Do not rename TypeScript files.

---

### Task 1: Add dark algorithm tests in theme package

**Files:**

- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Write failing test imports**

Update the import block in `packages/theme/src/__tests__/theme.test.ts` to include `darkAlgorithm`:

```ts
import {
  darkAlgorithm,
  defaultAlgorithm,
  defaultSeedToken,
  getComponentToken,
  mergeTheme,
  type ThemeConfig,
} from '../index'
```

- [ ] **Step 2: Add failing test for dark alias tokens**

Add this test after `derives alias tokens from seed tokens`:

```ts
it('derives dark alias tokens from seed tokens', () => {
  const token = darkAlgorithm({ ...defaultSeedToken, colorPrimary: '#1677ff' })

  expect(token.colorPrimary).toBe('#1677ff')
  expect(token.colorPrimaryHover).toBe('#4096ff')
  expect(token.colorPrimaryActive).toBe('#0958d9')
  expect(token.colorBgBase).toBe('#141414')
  expect(token.colorTextBase).toBe('#ffffff')
  expect(token.colorBgContainer).toBe('#141414')
  expect(token.colorBgElevated).toBe('#1f1f1f')
  expect(token.colorText).toBe('rgba(255, 255, 255, 0.88)')
  expect(token.colorTextSecondary).toBe('rgba(255, 255, 255, 0.65)')
  expect(token.colorTextDisabled).toBe('rgba(255, 255, 255, 0.25)')
  expect(token.colorBorder).toBe('#424242')
  expect(token.colorBorderSecondary).toBe('#303030')
  expect(token.colorFillAlter).toBe('rgba(255, 255, 255, 0.04)')
})
```

- [ ] **Step 3: Add failing test for mergeTheme algorithm**

Add this test after `merges global and component token overrides`:

```ts
it('applies theme algorithms and keeps token overrides', () => {
  const merged = mergeTheme({
    algorithm: darkAlgorithm,
    token: { colorPrimary: '#722ed1', borderRadius: 8 },
  })

  expect(merged.colorPrimary).toBe('#722ed1')
  expect(merged.colorPrimaryHover).toBe('#9254de')
  expect(merged.colorPrimaryActive).toBe('#531dab')
  expect(merged.borderRadius).toBe(8)
  expect(merged.colorBgContainer).toBe('#141414')
  expect(merged.colorBgElevated).toBe('#1f1f1f')
  expect(merged.colorText).toBe('rgba(255, 255, 255, 0.88)')
})
```

- [ ] **Step 4: Add failing test for dark component token defaults**

Add this test before the final closing `})`:

```ts
it('derives dark-compatible component token defaults', () => {
  const token = mergeTheme({ algorithm: darkAlgorithm })

  expect(getComponentToken('Select', token).optionSelectedBg).toBe('rgba(22, 119, 255, 0.2)')
  expect(getComponentToken('Alert', token).successBg).toBe('rgba(82, 196, 26, 0.12)')
  expect(getComponentToken('Alert', token).successBorderColor).toBe('rgba(82, 196, 26, 0.35)')
  expect(getComponentToken('Tag', token).successBg).toBe('rgba(82, 196, 26, 0.12)')
  expect(getComponentToken('Tag', token).successBorderColor).toBe('rgba(82, 196, 26, 0.35)')
  expect(getComponentToken('Tree', token).nodeSelectedBg).toBe('rgba(22, 119, 255, 0.2)')
})
```

- [ ] **Step 5: Run theme tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
```

Expected: FAIL because `darkAlgorithm`, `algorithm` config, and new component token fields do not exist yet.

- [ ] **Step 6: Commit RED tests**

```bash
git add packages/theme/src/__tests__/theme.test.ts
git commit -m "test: cover dark theme algorithm"
```

---

### Task 2: Implement theme algorithm API and dark tokens

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/algorithm.ts`
- Modify: `packages/theme/src/index.ts`

- [ ] **Step 1: Add algorithm type to `types.ts`**

Add this type after `GlobalToken`:

```ts
export type ThemeAlgorithm = (seed: SeedToken) => AliasToken
```

Update `ThemeConfig`:

```ts
export interface ThemeConfig {
  algorithm?: ThemeAlgorithm | ThemeAlgorithm[]
  token?: Partial<SeedToken>
  components?: { [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]> }
}
```

- [ ] **Step 2: Implement algorithm helpers in `algorithm.ts`**

Replace the imports and bottom half of `packages/theme/src/algorithm.ts` with this implementation while preserving the existing `defaultAlgorithm` function body:

```ts
import { getPrimaryActive, getPrimaryHover } from './color'
import { defaultSeedToken } from './default-seed-token'
import type { AliasToken, SeedToken, ThemeAlgorithm, ThemeConfig } from './types'
```

Add after `defaultAlgorithm`:

```ts
export function darkAlgorithm(seed: SeedToken): AliasToken {
  const darkSeed: SeedToken = {
    ...seed,
    colorBgBase: seed.colorBgBase === defaultSeedToken.colorBgBase ? '#141414' : seed.colorBgBase,
    colorTextBase:
      seed.colorTextBase === defaultSeedToken.colorTextBase ? '#ffffff' : seed.colorTextBase,
    boxShadow:
      '0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 9px 28px 8px rgba(0, 0, 0, 0.2)',
  }

  return {
    ...darkSeed,
    colorPrimaryHover: getPrimaryHover(darkSeed.colorPrimary),
    colorPrimaryActive: getPrimaryActive(darkSeed.colorPrimary),
    colorText: 'rgba(255, 255, 255, 0.88)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextDisabled: 'rgba(255, 255, 255, 0.25)',
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    colorBgContainer: darkSeed.colorBgBase,
    colorBgElevated: '#1f1f1f',
    colorFillAlter: 'rgba(255, 255, 255, 0.04)',
    lineWidth: 1,
    controlHeightSM: 24,
    controlHeightLG: 40,
    paddingXS: darkSeed.sizeUnit * 2,
    paddingSM: darkSeed.sizeUnit * 3,
    padding: darkSeed.sizeUnit * 4,
    paddingLG: darkSeed.sizeUnit * 6,
    marginXS: darkSeed.sizeUnit * 2,
    marginSM: darkSeed.sizeUnit * 3,
    margin: darkSeed.sizeUnit * 4,
    marginLG: darkSeed.sizeUnit * 6,
  }
}

function normalizeAlgorithms(algorithm: ThemeConfig['algorithm']): ThemeAlgorithm[] {
  if (!algorithm) return [defaultAlgorithm]
  return Array.isArray(algorithm) ? algorithm : [algorithm]
}

export function mergeTheme(config: ThemeConfig = {}): AliasToken {
  const seed: SeedToken = { ...defaultSeedToken, ...config.token }
  return normalizeAlgorithms(config.algorithm).reduce<AliasToken>(
    (current, algorithm) => algorithm(current),
    seed as AliasToken,
  )
}
```

- [ ] **Step 3: Export darkAlgorithm from `index.ts`**

Update exports:

```ts
export { darkAlgorithm, defaultAlgorithm, mergeTheme as baseMergeTheme } from './algorithm'
```

Update local import:

```ts
import { mergeTheme as baseMergeTheme } from './algorithm'
```

No other local import change is needed.

- [ ] **Step 4: Run theme tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
```

Expected: still FAIL because component token fields from Task 1 do not exist yet.

- [ ] **Step 5: Commit algorithm API implementation**

```bash
git add packages/theme/src/types.ts packages/theme/src/algorithm.ts packages/theme/src/index.ts
git commit -m "feat: add dark theme algorithm"
```

---

### Task 3: Add dark-compatible component tokens

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts` only if TypeScript requires expectation placement fixes.

- [ ] **Step 1: Add Alert status token fields**

Update `AlertComponentToken` in `packages/theme/src/types.ts`:

```ts
export interface AlertComponentToken {
  padding: number
  borderRadius: number
  withDescriptionPadding: number
  iconSize: number
  successBg: string
  successBorderColor: string
  infoBg: string
  infoBorderColor: string
  warningBg: string
  warningBorderColor: string
  errorBg: string
  errorBorderColor: string
}
```

- [ ] **Step 2: Add Tag status token fields**

Update `TagComponentToken`:

```ts
export interface TagComponentToken {
  defaultBg: string
  defaultColor: string
  borderColor: string
  borderRadius: number
  paddingInline: number
  fontSize: number
  lineHeight: number
  closeIconColor: string
  successBg: string
  successBorderColor: string
  warningBg: string
  warningBorderColor: string
  errorBg: string
  errorBorderColor: string
  processingBg: string
  processingBorderColor: string
}
```

- [ ] **Step 3: Add Tree token type and map entry**

Add this interface near the other component token interfaces:

```ts
export interface TreeComponentToken {
  nodeSelectedBg: string
}
```

Add to `ComponentTokenMap`:

```ts
Tree: TreeComponentToken
```

- [ ] **Step 4: Add token helper functions to `components.ts`**

Add near the top of `packages/theme/src/components.ts` after the WeakMap:

```ts
function isDarkToken(token: AliasToken) {
  return token.colorBgContainer !== '#ffffff'
}

function selectedBg(token: AliasToken) {
  return isDarkToken(token) ? 'rgba(22, 119, 255, 0.2)' : '#e6f4ff'
}

function statusBg(token: AliasToken, color: string) {
  return isDarkToken(token) ? `${color.replace(')', ', 0.12)').replace('rgb', 'rgba')}` : color
}

function statusBorder(token: AliasToken, color: string) {
  return isDarkToken(token) ? `${color.replace(')', ', 0.35)').replace('rgb', 'rgba')}` : color
}
```

If using hex colors directly is simpler, replace the helper implementation with explicit maps in Step 5. Do not leave helpers unused.

- [ ] **Step 5: Update defaults in `components.ts`**

In `Select` defaults, replace:

```ts
optionSelectedBg: '#e6f4ff',
```

with:

```ts
optionSelectedBg: selectedBg(token),
```

In `Alert` defaults, append:

```ts
successBg: isDarkToken(token) ? 'rgba(82, 196, 26, 0.12)' : '#f6ffed',
successBorderColor: isDarkToken(token) ? 'rgba(82, 196, 26, 0.35)' : '#b7eb8f',
infoBg: isDarkToken(token) ? 'rgba(22, 119, 255, 0.12)' : '#e6f4ff',
infoBorderColor: isDarkToken(token) ? 'rgba(22, 119, 255, 0.35)' : '#91caff',
warningBg: isDarkToken(token) ? 'rgba(250, 173, 20, 0.12)' : '#fffbe6',
warningBorderColor: isDarkToken(token) ? 'rgba(250, 173, 20, 0.35)' : '#ffe58f',
errorBg: isDarkToken(token) ? 'rgba(255, 77, 79, 0.12)' : '#fff2f0',
errorBorderColor: isDarkToken(token) ? 'rgba(255, 77, 79, 0.35)' : '#ffccc7',
```

In `Tag` defaults, append:

```ts
successBg: isDarkToken(token) ? 'rgba(82, 196, 26, 0.12)' : '#f6ffed',
successBorderColor: isDarkToken(token) ? 'rgba(82, 196, 26, 0.35)' : '#b7eb8f',
warningBg: isDarkToken(token) ? 'rgba(250, 173, 20, 0.12)' : '#fffbe6',
warningBorderColor: isDarkToken(token) ? 'rgba(250, 173, 20, 0.35)' : '#ffe58f',
errorBg: isDarkToken(token) ? 'rgba(255, 77, 79, 0.12)' : '#fff2f0',
errorBorderColor: isDarkToken(token) ? 'rgba(255, 77, 79, 0.35)' : '#ffccc7',
processingBg: isDarkToken(token) ? 'rgba(22, 119, 255, 0.12)' : '#e6f4ff',
processingBorderColor: isDarkToken(token) ? 'rgba(22, 119, 255, 0.35)' : '#91caff',
```

Add a `Tree` default in the `defaults` object:

```ts
Tree: {
  nodeSelectedBg: selectedBg(token),
},
```

- [ ] **Step 6: Run theme tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
```

Expected: PASS.

- [ ] **Step 7: Commit component token implementation**

```bash
git add packages/theme/src/types.ts packages/theme/src/components.ts packages/theme/src/__tests__/theme.test.ts
git commit -m "feat: derive dark component tokens"
```

---

### Task 4: Add ConfigProvider algorithm inheritance tests

**Files:**

- Modify: `packages/components/src/config-provider/__tests__/config-provider.test.tsx`

- [ ] **Step 1: Inspect current test helpers**

Open the file and keep its existing render/import pattern. Add new tests using the existing testing-library setup.

- [ ] **Step 2: Add imports for dark/default algorithms if absent**

Use:

```ts
import { darkAlgorithm, defaultAlgorithm } from '@solid-ant-design/theme'
```

If `@solid-ant-design/theme` is already imported, merge these names into the existing import.

- [ ] **Step 3: Add failing test for inheritance**

Add this test inside the existing `describe` block:

```tsx
it('inherits parent theme algorithm when child only overrides tokens', () => {
  let inheritedBg = ''
  let inheritedPrimary = ''

  function Probe() {
    const { token } = useConfig()
    inheritedBg = token().colorBgContainer
    inheritedPrimary = token().colorPrimary
    return <div />
  }

  render(() => (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
        <Probe />
      </ConfigProvider>
    </ConfigProvider>
  ))

  expect(inheritedBg).toBe('#141414')
  expect(inheritedPrimary).toBe('#722ed1')
})
```

- [ ] **Step 4: Add failing test for override**

Add:

```tsx
it('allows child theme algorithm to override parent algorithm', () => {
  let childBg = ''

  function Probe() {
    const { token } = useConfig()
    childBg = token().colorBgContainer
    return <div />
  }

  render(() => (
    <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
      <ConfigProvider theme={{ algorithm: defaultAlgorithm }}>
        <Probe />
      </ConfigProvider>
    </ConfigProvider>
  ))

  expect(childBg).toBe('#ffffff')
})
```

- [ ] **Step 5: Run component tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- config-provider
```

Expected: FAIL because `mergeThemeConfig` does not merge algorithm yet.

- [ ] **Step 6: Commit RED tests**

```bash
git add packages/components/src/config-provider/__tests__/config-provider.test.tsx
git commit -m "test: cover config provider theme algorithms"
```

---

### Task 5: Implement ConfigProvider algorithm merging

**Files:**

- Modify: `packages/components/src/config-provider/context.tsx`

- [ ] **Step 1: Update `mergeThemeConfig`**

Replace the function with:

```ts
export function mergeThemeConfig(parent: ThemeConfig, child: ThemeConfig): ThemeConfig {
  return {
    algorithm: child.algorithm ?? parent.algorithm,
    token: { ...parent.token, ...child.token },
    components: { ...parent.components, ...child.components },
  }
}
```

- [ ] **Step 2: Run ConfigProvider tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- config-provider
```

Expected: PASS.

- [ ] **Step 3: Commit implementation**

```bash
git add packages/components/src/config-provider/context.tsx packages/components/src/config-provider/__tests__/config-provider.test.tsx
git commit -m "feat: inherit theme algorithms in config provider"
```

---

### Task 6: Update component styles to consume new tokens

**Files:**

- Modify: `packages/components/src/alert/alert.style.ts`
- Modify: `packages/components/src/tag/tag.style.ts`
- Modify: `packages/components/src/tree/tree.style.ts`
- Modify popup style files listed in File Structure when they have local `t`/`token` access.

- [ ] **Step 1: Update Alert style**

In `packages/components/src/alert/alert.style.ts`, replace status hardcoding:

```ts
[`.${prefixCls}-success`]: { background: '#f6ffed', borderColor: '#b7eb8f' },
[`.${prefixCls}-info`]: { background: '#e6f4ff', borderColor: '#91caff' },
[`.${prefixCls}-warning`]: { background: '#fffbe6', borderColor: '#ffe58f' },
[`.${prefixCls}-error`]: { background: '#fff2f0', borderColor: '#ffccc7' },
```

with:

```ts
[`.${prefixCls}-success`]: { background: alert.successBg, borderColor: alert.successBorderColor },
[`.${prefixCls}-info`]: { background: alert.infoBg, borderColor: alert.infoBorderColor },
[`.${prefixCls}-warning`]: { background: alert.warningBg, borderColor: alert.warningBorderColor },
[`.${prefixCls}-error`]: { background: alert.errorBg, borderColor: alert.errorBorderColor },
```

Use the existing local variable name for `getComponentToken('Alert', t)`; if the file currently names it differently, use that existing name.

- [ ] **Step 2: Update Tag style**

In `packages/components/src/tag/tag.style.ts`, replace status hardcoding:

```ts
[`.${prefixCls}-success`]: {
  background: '#f6ffed',
  borderColor: '#b7eb8f',
},
[`.${prefixCls}-warning`]: {
  background: '#fffbe6',
  borderColor: '#ffe58f',
},
[`.${prefixCls}-error`]: {
  background: '#fff2f0',
  borderColor: '#ffccc7',
},
[`.${prefixCls}-processing`]: {
  background: '#e6f4ff',
  borderColor: '#91caff',
},
```

with:

```ts
[`.${prefixCls}-success`]: {
  background: tag.successBg,
  borderColor: tag.successBorderColor,
},
[`.${prefixCls}-warning`]: {
  background: tag.warningBg,
  borderColor: tag.warningBorderColor,
},
[`.${prefixCls}-error`]: {
  background: tag.errorBg,
  borderColor: tag.errorBorderColor,
},
[`.${prefixCls}-processing`]: {
  background: tag.processingBg,
  borderColor: tag.processingBorderColor,
},
```

- [ ] **Step 3: Update Tree style**

In `packages/components/src/tree/tree.style.ts`, import `getComponentToken` if not already imported:

```ts
import { getComponentToken } from '@solid-ant-design/theme'
```

Inside the style callback, create:

```ts
const tree = getComponentToken('Tree', t)
```

Replace:

```ts
[`.${prefixCls}-node-selected`]: { background: '#e6f4ff', color: t.colorPrimary },
```

with:

```ts
[`.${prefixCls}-node-selected`]: { background: tree.nodeSelectedBg, color: t.colorPrimary },
```

- [ ] **Step 4: Replace safe hardcoded popup shadows**

For each listed file that has a local token variable `t`, replace:

```ts
'box-shadow': '0 6px 16px rgba(0, 0, 0, 0.08)',
```

with:

```ts
'box-shadow': t.boxShadow,
```

If a file does not expose `t` in that scope, skip it and document the skip in the final summary.

- [ ] **Step 5: Run focused component tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- alert tag tree select
```

Expected: PASS.

- [ ] **Step 6: Commit style cleanup**

```bash
git add packages/components/src/alert/alert.style.ts packages/components/src/tag/tag.style.ts packages/components/src/tree/tree.style.ts packages/components/src/*/*.style.ts
git commit -m "feat: use theme tokens for dark component surfaces"
```

Before committing, run `git diff --cached --name-only` and make sure no unintended style files are included.

---

### Task 7: Update docs dark mode to use darkAlgorithm

**Files:**

- Modify: `apps/docs/src/components/theme-context.tsx`
- Modify: `apps/docs/src/components/theme-context.test.tsx` if existing tests expect manual token overrides.

- [ ] **Step 1: Write or update failing docs test**

Open `apps/docs/src/components/theme-context.test.tsx`. If it already tests dark mode token output, change the expectation to `colorBgContainer === '#141414'` and `colorBgElevated === '#1f1f1f'`. If it does not, add a test using the existing pattern:

```tsx
it('uses the dark theme algorithm in dark mode', () => {
  localStorage.setItem('ant-design-solid-docs-theme', 'dark')
  let bg = ''
  let elevated = ''

  function Probe() {
    const { token } = useConfig()
    bg = token().colorBgContainer
    elevated = token().colorBgElevated
    return <div />
  }

  render(() => (
    <DocsThemeProvider>
      <Probe />
    </DocsThemeProvider>
  ))

  expect(bg).toBe('#141414')
  expect(elevated).toBe('#1f1f1f')
})
```

Make sure `useConfig` is imported from `@solid-ant-design/core` if needed.

- [ ] **Step 2: Run docs test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- theme-context
```

Expected: FAIL because docs still manually overrides only seed values.

- [ ] **Step 3: Update docs theme context**

In `apps/docs/src/components/theme-context.tsx`, update imports:

```ts
import { darkAlgorithm, type ThemeConfig } from '@solid-ant-design/theme'
```

Replace `themeConfigForMode` dark branch with:

```ts
return {
  algorithm: darkAlgorithm,
}
```

- [ ] **Step 4: Run docs test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- theme-context
```

Expected: PASS.

- [ ] **Step 5: Commit docs update**

```bash
git add apps/docs/src/components/theme-context.tsx apps/docs/src/components/theme-context.test.tsx
git commit -m "feat: use dark algorithm in docs theme"
```

---

### Task 8: Full repository verification

**Files:**

- No planned file modifications unless verification exposes required fixes.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If it fails only due to formatting from this work, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Then re-run format check and commit formatting changes.

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

- [ ] **Step 6: Commit verification fixes if any**

If any verification-only fixes were needed:

```bash
git add <changed-files>
git commit -m "chore: fix dark theme verification issues"
```

- [ ] **Step 7: Summarize final status**

Include:

- Public API added.
- Component/token cleanup completed.
- Any intentionally skipped hardcoded colors.
- Exact verification command results.
