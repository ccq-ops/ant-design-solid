# ant-design-solid MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working `ant-design-solid` monorepo with SolidJS components, a Solid-native CSS-in-JS runtime, theme tokens, tests, and a Vite docs site.

**Architecture:** The repository is a pnpm workspace with separate packages for theme tokens, CSS-in-JS, components, icons, and docs. Components consume token data from `@solid-ant-design/theme` and register styles through `@solid-ant-design/cssinjs`, while the docs app dogfoods `@solid-ant-design/core`.

**Tech Stack:** TypeScript, SolidJS, Vite 8, pnpm 11, Vitest, jsdom, @solidjs/testing-library, oxlint, oxfmt.

---

## File Structure Map

### Root workspace

- Create `package.json`: private workspace root, Node/pnpm engines, scripts, dev dependencies.
- Create `pnpm-workspace.yaml`: workspace package globs.
- Create `.npmrc`: strict peer dependency and workspace settings.
- Create `.nvmrc`: Node 22 marker.
- Create `tsconfig.base.json`: shared strict TS settings and path aliases.
- Create `.oxlintrc.json`: minimal oxlint config.
- Create `.oxfmtrc.json`: shared oxfmt formatting rules.
- Create `vitest.config.ts`: shared test environment and coverage defaults.
- Modify `.gitignore`: keep generated and local files ignored.

### Theme package: `packages/theme`

- Create `package.json`: package metadata and scripts.
- Create `tsconfig.json`: declaration-enabled package TS config.
- Create `vite.config.ts`: library build config.
- Create `src/index.ts`: package exports.
- Create `src/types.ts`: token and theme types.
- Create `src/defaultSeedToken.ts`: default seed values.
- Create `src/color.ts`: deterministic color helpers.
- Create `src/algorithm.ts`: alias token derivation.
- Create `src/components.ts`: component token derivation and merge helpers.
- Create `src/__tests__/theme.test.ts`: token tests.

### CSS-in-JS package: `packages/cssinjs`

- Create `package.json`, `tsconfig.json`, `vite.config.ts`.
- Create `src/index.ts`: package exports.
- Create `src/types.ts`: style object, cache, provider, register types.
- Create `src/hash.ts`: stable hash function.
- Create `src/serializer.ts`: deterministic CSS serializer.
- Create `src/cache.ts`: style cache creation and extraction.
- Create `src/StyleProvider.tsx`: Solid context provider.
- Create `src/useStyleRegister.tsx`: style registration hook.
- Create `src/__tests__/hash.test.ts`, `serializer.test.ts`, `cache.test.ts`, `style-register.test.tsx`.

### Components package: `packages/components`

- Create `package.json`, `tsconfig.json`, `vite.config.ts`.
- Create `src/index.ts`: public exports.
- Create `src/shared/classNames.ts`: class string helper.
- Create `src/shared/children.ts`: children normalization helper if needed.
- Create `src/config-provider/*`: config context and provider.
- Create `src/button/*`: Button component, style, types, tests.
- Create `src/input/*`: Input component, style, types, tests.
- Create `src/space/*`: Space component, style, types, tests.
- Create `src/typography/*`: Typography component group, styles, types, tests.
- Create `src/grid/*`: Row/Col components, styles, types, tests.

### Icons package: `packages/icons`

- Create `package.json`, `tsconfig.json`, `vite.config.ts`.
- Create `src/index.ts`: export minimal `LoadingIcon` and `CloseCircleIcon` Solid components used by Button/Input.

### Docs app: `apps/docs`

- Create `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.
- Create `src/main.tsx`, `src/App.tsx`, `src/app.css`.
- Create `src/site/nav.ts`: docs navigation model.
- Create `src/site/Layout.tsx`: top nav, side nav, content layout.
- Create `src/site/DemoBlock.tsx`: reusable demo/code block.
- Create pages under `src/pages/`: Home, GettingStarted, Theming, Button, Input, Space, Typography, Grid, ConfigProvider.

---

## Implementation Tasks

### Task 1: Workspace foundation

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.npmrc`
- Create: `.nvmrc`
- Create: `tsconfig.base.json`
- Create: `.oxlintrc.json`
- Create: `.oxfmtrc.json`
- Create: `vitest.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Write root workspace files**

Create `package.json`:

```json
{
  "name": "solid-ant-design",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.0.0",
  "engines": {
    "node": ">=22",
    "pnpm": ">=11"
  },
  "scripts": {
    "dev": "pnpm --filter @solid-ant-design/docs dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check ."
  },
  "devDependencies": {
    "@solidjs/testing-library": "latest",
    "@testing-library/jest-dom": "latest",
    "@types/node": "latest",
    "jsdom": "latest",
    "oxfmt": "latest",
    "oxlint": "latest",
    "solid-js": "latest",
    "typescript": "latest",
    "vite": "^8.0.0",
    "vite-plugin-solid": "latest",
    "vitest": "latest"
  }
}
```

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Create `.npmrc`:

```ini
auto-install-peers=true
strict-peer-dependencies=false
link-workspace-packages=true
prefer-workspace-packages=true
```

Create `.nvmrc`:

```txt
22
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "types": ["vitest/globals", "@testing-library/jest-dom"],
    "baseUrl": ".",
    "paths": {
      "@solid-ant-design/theme": ["packages/theme/src"],
      "@solid-ant-design/cssinjs": ["packages/cssinjs/src"],
      "@solid-ant-design/icons": ["packages/icons/src"],
      "@solid-ant-design/core": ["packages/components/src"]
    }
  }
}
```

Create `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "ignorePatterns": ["dist", "coverage", "node_modules", ".superpowers"]
}
```

Create `.oxfmtrc.json`:

```json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    css: false,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
```

Ensure `.gitignore` contains:

```gitignore
.DS_Store
node_modules/
dist/
coverage/
.turbo/
.vite/
.superpowers/
*.log
```

- [ ] **Step 2: Verify workspace file syntax**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('tsconfig.base.json','utf8')); console.log('root json ok')"
```

Expected: prints `root json ok`.

- [ ] **Step 3: Commit workspace foundation**

```bash
git add package.json pnpm-workspace.yaml .npmrc .nvmrc tsconfig.base.json .oxlintrc.json .oxfmtrc.json vitest.config.ts .gitignore
git commit -m "chore: scaffold workspace foundation"
```

### Task 2: Theme package

**Files:**

- Create: `packages/theme/package.json`
- Create: `packages/theme/tsconfig.json`
- Create: `packages/theme/vite.config.ts`
- Create: `packages/theme/src/index.ts`
- Create: `packages/theme/src/types.ts`
- Create: `packages/theme/src/defaultSeedToken.ts`
- Create: `packages/theme/src/color.ts`
- Create: `packages/theme/src/algorithm.ts`
- Create: `packages/theme/src/components.ts`
- Create: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Create package metadata and config**

Create `packages/theme/package.json`:

```json
{
  "name": "@solid-ant-design/theme",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src",
    "lint:fix": "oxlint --fix src"
  },
  "devDependencies": {}
}
```

Create `packages/theme/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `packages/theme/vite.config.ts`:

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [],
    },
  },
})
```

- [ ] **Step 2: Write failing theme tests**

Create `packages/theme/src/__tests__/theme.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  defaultAlgorithm,
  defaultSeedToken,
  getComponentToken,
  mergeTheme,
  type ThemeConfig,
} from '../index'

describe('@solid-ant-design/theme', () => {
  it('derives alias tokens from seed tokens', () => {
    const token = defaultAlgorithm({ ...defaultSeedToken, colorPrimary: '#1677ff' })

    expect(token.colorPrimary).toBe('#1677ff')
    expect(token.colorPrimaryHover).toBe('#4096ff')
    expect(token.colorPrimaryActive).toBe('#0958d9')
    expect(token.colorText).toBe('#1f1f1f')
    expect(token.controlHeight).toBe(32)
  })

  it('merges global and component token overrides', () => {
    const config: ThemeConfig = {
      token: { colorPrimary: '#722ed1', borderRadius: 8 },
      components: {
        Button: { borderRadius: 10 },
      },
    }

    const merged = mergeTheme(config)
    const button = getComponentToken('Button', merged)

    expect(merged.colorPrimary).toBe('#722ed1')
    expect(merged.borderRadius).toBe(8)
    expect(button.borderRadius).toBe(10)
  })
})
```

- [ ] **Step 3: Run theme tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/theme test
```

Expected: FAIL because `../index` exports do not exist yet.

- [ ] **Step 4: Implement theme types and tokens**

Create `packages/theme/src/types.ts`:

```ts
export type ComponentSize = 'small' | 'middle' | 'large'

export interface SeedToken {
  colorPrimary: string
  colorSuccess: string
  colorWarning: string
  colorError: string
  colorInfo: string
  colorTextBase: string
  colorBgBase: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  borderRadius: number
  sizeUnit: number
  sizeStep: number
  controlHeight: number
  motionDurationFast: string
  motionDurationMid: string
  motionEaseInOut: string
  boxShadow: string
}

export interface AliasToken extends SeedToken {
  colorPrimaryHover: string
  colorPrimaryActive: string
  colorText: string
  colorTextSecondary: string
  colorTextDisabled: string
  colorBorder: string
  colorBorderSecondary: string
  colorBgContainer: string
  colorBgElevated: string
  colorFillAlter: string
  lineWidth: number
  controlHeightSM: number
  controlHeightLG: number
  paddingXS: number
  paddingSM: number
  padding: number
  paddingLG: number
  marginXS: number
  marginSM: number
  margin: number
  marginLG: number
}

export type GlobalToken = AliasToken

export interface ButtonComponentToken {
  borderRadius: number
  fontWeight: number
  primaryColor: string
  defaultBorderColor: string
  paddingInline: number
}

export interface InputComponentToken {
  activeBorderColor: string
  hoverBorderColor: string
  clearIconColor: string
  paddingInline: number
}

export interface SpaceComponentToken {
  gapSmall: number
  gapMiddle: number
  gapLarge: number
}

export interface TypographyComponentToken {
  titleMarginBottom: number
  titleFontWeight: number
  paragraphMarginBottom: number
}

export interface GridComponentToken {
  columns: number
}

export interface ComponentTokenMap {
  Button: ButtonComponentToken
  Input: InputComponentToken
  Space: SpaceComponentToken
  Typography: TypographyComponentToken
  Grid: GridComponentToken
}

export interface ThemeConfig {
  token?: Partial<SeedToken>
  components?: {
    [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]>
  }
}
```

Create `packages/theme/src/defaultSeedToken.ts`:

```ts
import type { SeedToken } from './types'

export const defaultSeedToken: SeedToken = {
  colorPrimary: '#1677ff',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  colorInfo: '#1677ff',
  colorTextBase: '#000000',
  colorBgBase: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: 14,
  lineHeight: 1.5714285714285714,
  borderRadius: 6,
  sizeUnit: 4,
  sizeStep: 4,
  controlHeight: 32,
  motionDurationFast: '0.1s',
  motionDurationMid: '0.2s',
  motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  boxShadow:
    '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
}
```

Create `packages/theme/src/color.ts`:

```ts
const primaryMap: Record<string, { hover: string; active: string }> = {
  '#1677ff': { hover: '#4096ff', active: '#0958d9' },
  '#722ed1': { hover: '#9254de', active: '#531dab' },
}

export function getPrimaryHover(colorPrimary: string): string {
  return primaryMap[colorPrimary]?.hover ?? colorPrimary
}

export function getPrimaryActive(colorPrimary: string): string {
  return primaryMap[colorPrimary]?.active ?? colorPrimary
}
```

Create `packages/theme/src/algorithm.ts`:

```ts
import { getPrimaryActive, getPrimaryHover } from './color'
import { defaultSeedToken } from './defaultSeedToken'
import type { AliasToken, SeedToken, ThemeConfig } from './types'

export function defaultAlgorithm(seed: SeedToken): AliasToken {
  return {
    ...seed,
    colorPrimaryHover: getPrimaryHover(seed.colorPrimary),
    colorPrimaryActive: getPrimaryActive(seed.colorPrimary),
    colorText: '#1f1f1f',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    colorBgContainer: seed.colorBgBase,
    colorBgElevated: seed.colorBgBase,
    colorFillAlter: 'rgba(0, 0, 0, 0.02)',
    lineWidth: 1,
    controlHeightSM: 24,
    controlHeightLG: 40,
    paddingXS: seed.sizeUnit * 2,
    paddingSM: seed.sizeUnit * 3,
    padding: seed.sizeUnit * 4,
    paddingLG: seed.sizeUnit * 6,
    marginXS: seed.sizeUnit * 2,
    marginSM: seed.sizeUnit * 3,
    margin: seed.sizeUnit * 4,
    marginLG: seed.sizeUnit * 6,
  }
}

export function mergeTheme(config: ThemeConfig = {}): AliasToken {
  return defaultAlgorithm({ ...defaultSeedToken, ...config.token })
}
```

Create `packages/theme/src/components.ts`:

```ts
import type { AliasToken, ComponentTokenMap, ThemeConfig } from './types'

const overrideStore = new WeakMap<AliasToken, ThemeConfig['components']>()

export function attachComponentOverrides(
  token: AliasToken,
  components: ThemeConfig['components'] = {},
): AliasToken {
  overrideStore.set(token, components)
  return token
}

export function getComponentToken<K extends keyof ComponentTokenMap>(
  componentName: K,
  token: AliasToken,
): ComponentTokenMap[K] {
  const defaults: ComponentTokenMap = {
    Button: {
      borderRadius: token.borderRadius,
      fontWeight: 400,
      primaryColor: '#fff',
      defaultBorderColor: token.colorBorder,
      paddingInline: token.padding,
    },
    Input: {
      activeBorderColor: token.colorPrimary,
      hoverBorderColor: token.colorPrimaryHover,
      clearIconColor: token.colorTextDisabled,
      paddingInline: token.paddingSM,
    },
    Space: {
      gapSmall: token.marginXS,
      gapMiddle: token.marginSM,
      gapLarge: token.margin,
    },
    Typography: {
      titleMarginBottom: token.marginSM,
      titleFontWeight: 600,
      paragraphMarginBottom: token.margin,
    },
    Grid: {
      columns: 24,
    },
  }

  const overrides = overrideStore.get(token)?.[componentName] ?? {}
  return { ...defaults[componentName], ...overrides } as ComponentTokenMap[K]
}
```

Create `packages/theme/src/index.ts`:

```ts
export { defaultSeedToken } from './defaultSeedToken'
export { defaultAlgorithm, mergeTheme as baseMergeTheme } from './algorithm'
export { attachComponentOverrides, getComponentToken } from './components'
export type * from './types'

import { mergeTheme as baseMergeTheme } from './algorithm'
import { attachComponentOverrides } from './components'
import type { ThemeConfig } from './types'

export function mergeTheme(config: ThemeConfig = {}) {
  return attachComponentOverrides(baseMergeTheme(config), config.components)
}
```

- [ ] **Step 5: Run theme tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/theme test
```

Expected: PASS.

- [ ] **Step 6: Commit theme package**

```bash
git add packages/theme
git commit -m "feat: add theme token package"
```

### Task 3: CSS-in-JS runtime

**Files:**

- Create: `packages/cssinjs/package.json`
- Create: `packages/cssinjs/tsconfig.json`
- Create: `packages/cssinjs/vite.config.ts`
- Create: `packages/cssinjs/src/index.ts`
- Create: `packages/cssinjs/src/types.ts`
- Create: `packages/cssinjs/src/hash.ts`
- Create: `packages/cssinjs/src/serializer.ts`
- Create: `packages/cssinjs/src/cache.ts`
- Create: `packages/cssinjs/src/StyleProvider.tsx`
- Create: `packages/cssinjs/src/useStyleRegister.tsx`
- Create: `packages/cssinjs/src/__tests__/hash.test.ts`
- Create: `packages/cssinjs/src/__tests__/serializer.test.ts`
- Create: `packages/cssinjs/src/__tests__/cache.test.ts`
- Create: `packages/cssinjs/src/__tests__/style-register.test.tsx`

- [ ] **Step 1: Create package metadata and config**

Create `packages/cssinjs/package.json`:

```json
{
  "name": "@solid-ant-design/cssinjs",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "solid-js": ">=1.9.0"
  },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src",
    "lint:fix": "oxlint --fix src"
  }
}
```

Create `packages/cssinjs/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `packages/cssinjs/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
    },
  },
})
```

- [ ] **Step 2: Write failing CSS-in-JS tests**

Create `packages/cssinjs/src/__tests__/hash.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { hashString, stableStringify } from '../index'

describe('hash utilities', () => {
  it('creates stable strings independent of object key insertion order', () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }))
  })

  it('creates deterministic short hashes', () => {
    expect(hashString('Button.ads')).toBe(hashString('Button.ads'))
    expect(hashString('Button.ads')).toMatch(/^css-[a-z0-9]+$/)
  })
})
```

Create `packages/cssinjs/src/__tests__/serializer.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { serializeCSS } from '../index'

describe('serializeCSS', () => {
  it('serializes nested selectors deterministically', () => {
    const css = serializeCSS({
      '.ads-btn': {
        color: 'red',
        '&:hover': { color: 'blue' },
      },
    })

    expect(css).toContain('.ads-btn{color:red;}')
    expect(css).toContain('.ads-btn:hover{color:blue;}')
  })
})
```

Create `packages/cssinjs/src/__tests__/cache.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createCache, extractStyle } from '../index'

describe('style cache', () => {
  it('deduplicates registered styles by key', () => {
    const cache = createCache()

    cache.register('a', '.a{color:red;}')
    cache.register('a', '.a{color:red;}')
    cache.register('b', '.b{color:blue;}')

    expect(cache.size()).toBe(2)
    expect(extractStyle(cache)).toBe('.a{color:red;}\n.b{color:blue;}')
  })
})
```

Create `packages/cssinjs/src/__tests__/style-register.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { StyleProvider, createCache, useStyleRegister } from '../index'

function Demo() {
  const [, hashId] = useStyleRegister(
    { path: ['Demo'], token: { color: 'red' }, theme: 'default' },
    () => ({
      '.demo': { color: 'red' },
    }),
  )

  return <div class={`demo ${hashId()}`}>Demo</div>
}

describe('useStyleRegister', () => {
  it('injects one style tag and returns a hash id', () => {
    document.head.innerHTML = ''
    const cache = createCache()

    const result = render(() => (
      <StyleProvider cache={cache}>
        <Demo />
        <Demo />
      </StyleProvider>
    ))

    expect(result.container.querySelector('.demo')?.className).toMatch(/css-[a-z0-9]+/)
    expect(document.head.querySelectorAll('style[data-ant-design-solid]').length).toBe(1)
    expect(cache.size()).toBe(1)
  })
})
```

- [ ] **Step 3: Run CSS-in-JS tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/cssinjs test
```

Expected: FAIL because exports do not exist yet.

- [ ] **Step 4: Implement CSS-in-JS runtime**

Create `packages/cssinjs/src/types.ts`:

```ts
import type { Accessor, JSX } from 'solid-js'

export type CSSValue = string | number | undefined | null
export interface CSSObject {
  [propertyOrSelector: string]: CSSValue | CSSObject
}
export type StyleObject = Record<string, CSSObject>

export interface StyleCache {
  register: (key: string, css: string) => boolean
  has: (key: string) => boolean
  get: (key: string) => string | undefined
  entries: () => Array<[string, string]>
  size: () => number
}

export interface StyleProviderProps {
  cache?: StyleCache
  hashPriority?: 'low' | 'high'
  children?: JSX.Element
}

export interface StyleContextValue {
  cache: StyleCache
  hashPriority: Accessor<'low' | 'high'>
}

export interface StyleRegisterInfo {
  theme: unknown
  token: unknown
  path: Array<string | number>
}

export type WrapSSR = (node: JSX.Element) => JSX.Element
```

Create `packages/cssinjs/src/hash.ts`:

```ts
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`
}

export function hashString(input: string): string {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index)
  }

  return `css-${(hash >>> 0).toString(36)}`
}
```

Create `packages/cssinjs/src/serializer.ts`:

```ts
import type { CSSObject, CSSValue, StyleObject } from './types'

function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

function formatValue(value: CSSValue): string {
  if (typeof value === 'number') {
    return value === 0 ? '0' : `${value}px`
  }
  return String(value)
}

function serializeRule(selector: string, object: CSSObject): string {
  const declarations: string[] = []
  const nested: string[] = []

  for (const key of Object.keys(object).sort()) {
    const value = object[key]
    if (value === undefined || value === null) continue

    if (typeof value === 'object') {
      const nestedSelector = key.includes('&') ? key.replace(/&/g, selector) : `${selector} ${key}`
      nested.push(serializeRule(nestedSelector, value as CSSObject))
    } else {
      declarations.push(`${toKebabCase(key)}:${formatValue(value)};`)
    }
  }

  const current = declarations.length > 0 ? `${selector}{${declarations.join('')}}` : ''
  return [current, ...nested].filter(Boolean).join('\n')
}

export function serializeCSS(style: StyleObject): string {
  return Object.keys(style)
    .sort()
    .map((selector) => serializeRule(selector, style[selector]))
    .join('\n')
}
```

Create `packages/cssinjs/src/cache.ts`:

```ts
import type { StyleCache } from './types'

export function createCache(): StyleCache {
  const styles = new Map<string, string>()

  return {
    register(key, css) {
      if (styles.has(key)) return false
      styles.set(key, css)
      return true
    },
    has(key) {
      return styles.has(key)
    },
    get(key) {
      return styles.get(key)
    },
    entries() {
      return Array.from(styles.entries())
    },
    size() {
      return styles.size
    },
  }
}

export function extractStyle(cache?: StyleCache): string {
  if (!cache) return ''
  return cache
    .entries()
    .map(([, css]) => css)
    .join('\n')
}
```

Create `packages/cssinjs/src/StyleProvider.tsx`:

```tsx
import { createContext, createMemo, useContext } from 'solid-js'
import { createCache } from './cache'
import type { StyleContextValue, StyleProviderProps } from './types'

const defaultCache = createCache()
const StyleContext = createContext<StyleContextValue>({
  cache: defaultCache,
  hashPriority: () => 'low',
})

export function StyleProvider(props: StyleProviderProps) {
  const value: StyleContextValue = {
    cache: props.cache ?? createCache(),
    hashPriority: createMemo(() => props.hashPriority ?? 'low'),
  }

  return <StyleContext.Provider value={value}>{props.children}</StyleContext.Provider>
}

export function useStyleContext(): StyleContextValue {
  return useContext(StyleContext)
}
```

Create `packages/cssinjs/src/useStyleRegister.tsx`:

```tsx
import { createMemo, createRenderEffect, type Accessor } from 'solid-js'
import { hashString, stableStringify } from './hash'
import { serializeCSS } from './serializer'
import { useStyleContext } from './StyleProvider'
import type { StyleObject, StyleRegisterInfo, WrapSSR } from './types'

function injectStyle(key: string, css: string): void {
  if (typeof document === 'undefined') return
  if (document.head.querySelector(`style[data-ant-design-solid="${key}"]`)) return

  const style = document.createElement('style')
  style.setAttribute('data-ant-design-solid', key)
  style.textContent = css
  document.head.appendChild(style)
}

export function useStyleRegister(
  info: StyleRegisterInfo,
  styleFn: () => StyleObject,
): [WrapSSR, Accessor<string>] {
  const context = useStyleContext()
  const cacheKey = createMemo(() => stableStringify(info))
  const hashId = createMemo(() => hashString(cacheKey()))
  const css = createMemo(() => serializeCSS(styleFn()))

  createRenderEffect(() => {
    const key = cacheKey()
    const styleText = css()
    const didRegister = context.cache.register(key, styleText)
    if (didRegister) {
      injectStyle(key, styleText)
    }
  })

  const wrapSSR: WrapSSR = (node) => node
  return [wrapSSR, hashId]
}
```

Create `packages/cssinjs/src/index.ts`:

```ts
export { createCache, extractStyle } from './cache'
export { hashString, stableStringify } from './hash'
export { serializeCSS } from './serializer'
export { StyleProvider, useStyleContext } from './StyleProvider'
export { useStyleRegister } from './useStyleRegister'
export type * from './types'
```

- [ ] **Step 5: Run CSS-in-JS tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/cssinjs test
```

Expected: PASS.

- [ ] **Step 6: Commit CSS-in-JS runtime**

```bash
git add packages/cssinjs
git commit -m "feat: add solid css-in-js runtime"
```

### Task 4: Icons package

**Files:**

- Create: `packages/icons/package.json`
- Create: `packages/icons/tsconfig.json`
- Create: `packages/icons/vite.config.ts`
- Create: `packages/icons/src/index.tsx`

- [ ] **Step 1: Create icons package**

Create `packages/icons/package.json`:

```json
{
  "name": "@solid-ant-design/icons",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "solid-js": ">=1.9.0"
  },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src",
    "lint:fix": "oxlint --fix src"
  }
}
```

Create `packages/icons/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `packages/icons/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['solid-js', 'solid-js/web'],
    },
  },
})
```

Create `packages/icons/src/index.tsx`:

```tsx
import type { JSX } from 'solid-js'

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  spin?: boolean
}

export function LoadingIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" {...props}>
      <path
        d="M512 64a32 32 0 0 1 32 32v160a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32Z"
        opacity="0.85"
      />
      <path
        d="M512 736a32 32 0 0 1 32 32v160a32 32 0 1 1-64 0V768a32 32 0 0 1 32-32Z"
        opacity="0.25"
      />
      <path
        d="M195.2 195.2a32 32 0 0 1 45.3 0l113.1 113.1a32 32 0 0 1-45.3 45.3L195.2 240.5a32 32 0 0 1 0-45.3Z"
        opacity="0.65"
      />
      <path
        d="M670.4 670.4a32 32 0 0 1 45.3 0l113.1 113.1a32 32 0 1 1-45.3 45.3L670.4 715.7a32 32 0 0 1 0-45.3Z"
        opacity="0.2"
      />
      <path
        d="M64 512a32 32 0 0 1 32-32h160a32 32 0 0 1 0 64H96a32 32 0 0 1-32-32Z"
        opacity="0.45"
      />
      <path d="M736 512a32 32 0 0 1 32-32h160a32 32 0 1 1 0 64H768a32 32 0 0 1-32-32Z" />
    </svg>
  )
}

export function CloseCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M512 64a448 448 0 1 0 0 896 448 448 0 0 0 0-896Zm169.7 572.5a32 32 0 1 1-45.2 45.2L512 557.3 387.5 681.7a32 32 0 0 1-45.2-45.2L466.7 512 342.3 387.5a32 32 0 0 1 45.2-45.2L512 466.7l124.5-124.4a32 32 0 0 1 45.2 45.2L557.3 512l124.4 124.5Z" />
    </svg>
  )
}
```

- [ ] **Step 2: Typecheck icons package**

Run:

```bash
pnpm --filter @solid-ant-design/icons typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit icons package**

```bash
git add packages/icons
git commit -m "feat: add minimal icon package"
```

### Task 5: Components package foundation and ConfigProvider

**Files:**

- Create: `packages/components/package.json`
- Create: `packages/components/tsconfig.json`
- Create: `packages/components/vite.config.ts`
- Create: `packages/components/src/index.ts`
- Create: `packages/components/src/shared/classNames.ts`
- Create: `packages/components/src/config-provider/interface.ts`
- Create: `packages/components/src/config-provider/context.tsx`
- Create: `packages/components/src/config-provider/ConfigProvider.tsx`
- Create: `packages/components/src/config-provider/index.ts`
- Create: `packages/components/src/config-provider/__tests__/ConfigProvider.test.tsx`

- [ ] **Step 1: Create components package metadata and config**

Create `packages/components/package.json`:

```json
{
  "name": "@solid-ant-design/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "peerDependencies": {
    "solid-js": ">=1.9.0"
  },
  "dependencies": {
    "@solid-ant-design/cssinjs": "workspace:*",
    "@solid-ant-design/icons": "workspace:*",
    "@solid-ant-design/theme": "workspace:*"
  },
  "scripts": {
    "build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src",
    "lint:fix": "oxlint --fix src"
  }
}
```

Create `packages/components/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

Create `packages/components/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        '@solid-ant-design/theme',
        '@solid-ant-design/cssinjs',
        '@solid-ant-design/icons',
      ],
    },
  },
})
```

- [ ] **Step 2: Write failing ConfigProvider tests**

Create `packages/components/src/config-provider/__tests__/ConfigProvider.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider, useConfig, useToken } from '../index'

function Probe() {
  const config = useConfig()
  const token = useToken()
  return (
    <div
      data-prefix={config.prefixCls()}
      data-size={config.componentSize()}
      data-primary={token().colorPrimary}
      data-radius={token().borderRadius}
    />
  )
}

describe('ConfigProvider', () => {
  it('provides default config values', () => {
    const result = render(() => <Probe />)
    const probe = result.container.querySelector('div')!

    expect(probe.dataset.prefix).toBe('ads')
    expect(probe.dataset.size).toBe('middle')
    expect(probe.dataset.primary).toBe('#1677ff')
  })

  it('merges nested providers', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="outer" theme={{ token: { colorPrimary: '#722ed1' } }}>
        <ConfigProvider componentSize="large" theme={{ token: { borderRadius: 8 } }}>
          <Probe />
        </ConfigProvider>
      </ConfigProvider>
    ))
    const probe = result.container.querySelector('div')!

    expect(probe.dataset.prefix).toBe('outer')
    expect(probe.dataset.size).toBe('large')
    expect(probe.dataset.primary).toBe('#722ed1')
    expect(probe.dataset.radius).toBe('8')
  })
})
```

- [ ] **Step 3: Run ConfigProvider tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/config-provider/__tests__/ConfigProvider.test.tsx
```

Expected: FAIL because ConfigProvider files do not exist.

- [ ] **Step 4: Implement ConfigProvider foundation**

Create `packages/components/src/shared/classNames.ts`:

```ts
export type ClassValue = string | false | null | undefined

export function classNames(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}
```

Create `packages/components/src/config-provider/interface.ts`:

```ts
import type { Accessor, JSX } from 'solid-js'
import type { AliasToken, ComponentSize, ThemeConfig } from '@solid-ant-design/theme'

export interface ConfigProviderProps {
  prefixCls?: string
  componentSize?: ComponentSize
  direction?: 'ltr' | 'rtl'
  theme?: ThemeConfig
  children?: JSX.Element
}

export interface ConfigContextValue {
  prefixCls: Accessor<string>
  componentSize: Accessor<ComponentSize>
  direction: Accessor<'ltr' | 'rtl'>
  theme: Accessor<ThemeConfig>
  token: Accessor<AliasToken>
}
```

Create `packages/components/src/config-provider/context.tsx`:

```tsx
import { createContext, createMemo, useContext } from 'solid-js'
import { mergeTheme, type ComponentSize, type ThemeConfig } from '@solid-ant-design/theme'
import type { ConfigContextValue } from './interface'

const emptyTheme: ThemeConfig = {}

export const defaultConfigContext: ConfigContextValue = {
  prefixCls: () => 'ads',
  componentSize: () => 'middle' as ComponentSize,
  direction: () => 'ltr',
  theme: () => emptyTheme,
  token: () => mergeTheme(emptyTheme),
}

export const ConfigContext = createContext<ConfigContextValue>(defaultConfigContext)

export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext)
}

export function useToken() {
  return useConfig().token
}

export function mergeThemeConfig(parent: ThemeConfig, child: ThemeConfig): ThemeConfig {
  return {
    token: { ...parent.token, ...child.token },
    components: { ...parent.components, ...child.components },
  }
}

export function createConfigValue(
  parent: ConfigContextValue,
  props: {
    prefixCls?: string
    componentSize?: ComponentSize
    direction?: 'ltr' | 'rtl'
    theme?: ThemeConfig
  },
): ConfigContextValue {
  const theme = createMemo(() => mergeThemeConfig(parent.theme(), props.theme ?? {}))

  return {
    prefixCls: createMemo(() => props.prefixCls ?? parent.prefixCls()),
    componentSize: createMemo(() => props.componentSize ?? parent.componentSize()),
    direction: createMemo(() => props.direction ?? parent.direction()),
    theme,
    token: createMemo(() => mergeTheme(theme())),
  }
}
```

Create `packages/components/src/config-provider/ConfigProvider.tsx`:

```tsx
import { useConfig, ConfigContext, createConfigValue } from './context'
import type { ConfigProviderProps } from './interface'

export function ConfigProvider(props: ConfigProviderProps) {
  const parent = useConfig()
  const value = createConfigValue(parent, props)

  return <ConfigContext.Provider value={value}>{props.children}</ConfigContext.Provider>
}
```

Create `packages/components/src/config-provider/index.ts`:

```ts
export { ConfigProvider } from './ConfigProvider'
export { useConfig, useToken } from './context'
export type * from './interface'
```

Create `packages/components/src/index.ts`:

```ts
export * from './config-provider'
```

- [ ] **Step 5: Run ConfigProvider tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/config-provider/__tests__/ConfigProvider.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit components foundation**

```bash
git add packages/components
git commit -m "feat: add config provider foundation"
```

### Task 6: Button component

**Files:**

- Create: `packages/components/src/button/interface.ts`
- Create: `packages/components/src/button/button.style.ts`
- Create: `packages/components/src/button/Button.tsx`
- Create: `packages/components/src/button/index.ts`
- Create: `packages/components/src/button/__tests__/Button.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Button tests**

Create `packages/components/src/button/__tests__/Button.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Button } from '../index'

describe('Button', () => {
  it('renders children and Ant Design-like classes', () => {
    const result = render(() => <Button type="primary">Primary</Button>)
    const button = result.getByRole('button')

    expect(button).toHaveTextContent('Primary')
    expect(button.className).toContain('ads-btn')
    expect(button.className).toContain('ads-btn-primary')
  })

  it('supports size, danger, block, htmlType, disabled and loading states', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Button
        type="default"
        size="large"
        danger
        block
        loading
        disabled
        htmlType="submit"
        onClick={onClick}
      >
        Save
      </Button>
    ))
    const button = result.getByRole('button') as HTMLButtonElement

    expect(button.type).toBe('submit')
    expect(button.disabled).toBe(true)
    expect(button.className).toContain('ads-btn-lg')
    expect(button.className).toContain('ads-btn-dangerous')
    expect(button.className).toContain('ads-btn-block')
    expect(button.className).toContain('ads-btn-loading')

    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Button>Button</Button>
      </ConfigProvider>
    ))

    expect(result.getByRole('button').className).toContain('custom-btn')
  })
})
```

- [ ] **Step 2: Run Button tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/button/__tests__/Button.test.tsx
```

Expected: FAIL because Button exports do not exist.

- [ ] **Step 3: Implement Button**

Create `packages/components/src/button/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { ComponentSize } from '@solid-ant-design/theme'

export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link'
export type ButtonHTMLType = 'button' | 'submit' | 'reset'

export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType
  size?: ComponentSize
  htmlType?: ButtonHTMLType
  loading?: boolean
  danger?: boolean
  block?: boolean
}
```

Create `packages/components/src/button/button.style.ts`:

```ts
import { getComponentToken } from '@solid-ant-design/theme'
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useButtonStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Button', prefixCls] }, () => {
    const buttonToken = getComponentToken('Button', token())
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: `4px ${buttonToken.paddingInline}px`,
        color: token().colorText,
        'font-size': `${token().fontSize}px`,
        'font-family': token().fontFamily,
        'line-height': token().lineHeight,
        height: token().controlHeight,
        border: `${token().lineWidth}px solid ${buttonToken.defaultBorderColor}`,
        'border-radius': buttonToken.borderRadius,
        background: token().colorBgContainer,
        cursor: 'pointer',
        transition: `all ${token().motionDurationMid} ${token().motionEaseInOut}`,
        '&:hover': {
          color: token().colorPrimaryHover,
          borderColor: token().colorPrimaryHover,
        },
        '&[disabled]': {
          color: token().colorTextDisabled,
          cursor: 'not-allowed',
          background: token().colorFillAlter,
          borderColor: token().colorBorder,
        },
      },
      [`.${prefixCls}-primary`]: {
        color: buttonToken.primaryColor,
        background: token().colorPrimary,
        borderColor: token().colorPrimary,
        '&:hover': {
          color: buttonToken.primaryColor,
          background: token().colorPrimaryHover,
          borderColor: token().colorPrimaryHover,
        },
      },
      [`.${prefixCls}-dashed`]: { borderStyle: 'dashed' },
      [`.${prefixCls}-text`]: { borderColor: 'transparent', background: 'transparent' },
      [`.${prefixCls}-link`]: {
        borderColor: 'transparent',
        background: 'transparent',
        color: token().colorPrimary,
      },
      [`.${prefixCls}-sm`]: {
        height: token().controlHeightSM,
        padding: `0 ${token().paddingSM}px`,
      },
      [`.${prefixCls}-lg`]: {
        height: token().controlHeightLG,
        padding: `6px ${token().paddingLG}px`,
      },
      [`.${prefixCls}-dangerous`]: { color: token().colorError, borderColor: token().colorError },
      [`.${prefixCls}-block`]: { width: '100%' },
      [`.${prefixCls}-loading`]: { cursor: 'default' },
      [`.${prefixCls}-icon`]: { display: 'inline-flex', 'margin-inline-end': 8 },
    }
  })
}
```

Create `packages/components/src/button/Button.tsx`:

```tsx
import { Show, splitProps } from 'solid-js'
import { LoadingIcon } from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useButtonStyle } from './button.style'
import type { ButtonProps } from './interface'

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'size',
    'htmlType',
    'loading',
    'danger',
    'block',
    'class',
    'children',
    'disabled',
    'onClick',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-btn`
  const [, hashId] = useButtonStyle(prefixCls())
  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled || local.loading)

  return (
    <button
      {...rest}
      type={local.htmlType ?? 'button'}
      disabled={disabled()}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${local.type ?? 'default'}`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.danger && `${prefixCls()}-dangerous`,
        local.block && `${prefixCls()}-block`,
        local.loading && `${prefixCls()}-loading`,
        hashId(),
        local.class,
      )}
      onClick={(event) => {
        if (disabled()) return
        local.onClick?.(event)
      }}
    >
      <Show when={local.loading}>
        <span class={`${prefixCls()}-icon`}>
          <LoadingIcon />
        </span>
      </Show>
      {local.children}
    </button>
  )
}
```

Create `packages/components/src/button/index.ts`:

```ts
export { Button } from './Button'
export type { ButtonHTMLType, ButtonProps, ButtonType } from './interface'
```

Modify `packages/components/src/index.ts`:

```ts
export * from './config-provider'
export * from './button'
```

- [ ] **Step 4: Run Button tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/button/__tests__/Button.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Button**

```bash
git add packages/components/src/button packages/components/src/index.ts
git commit -m "feat: add button component"
```

### Task 7: Input component

**Files:**

- Create: `packages/components/src/input/interface.ts`
- Create: `packages/components/src/input/input.style.ts`
- Create: `packages/components/src/input/Input.tsx`
- Create: `packages/components/src/input/index.ts`
- Create: `packages/components/src/input/__tests__/Input.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Input tests**

Create `packages/components/src/input/__tests__/Input.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../index'

describe('Input', () => {
  it('renders placeholder and supports uncontrolled input', () => {
    const onInput = vi.fn()
    const result = render(() => <Input placeholder="请输入" defaultValue="a" onInput={onInput} />)
    const input = result.getByPlaceholderText('请输入') as HTMLInputElement

    expect(input.value).toBe('a')
    fireEvent.input(input, { target: { value: 'abc' } })
    expect(onInput).toHaveBeenCalledOnce()
  })

  it('renders prefix, suffix, status and allowClear', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Input
        status="error"
        prefix={<span data-testid="prefix">P</span>}
        suffix="RMB"
        defaultValue="100"
        allowClear
        onChange={onChange}
      />
    ))

    expect(result.getByTestId('prefix')).toHaveTextContent('P')
    expect(result.getByText('RMB')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-input-status-error')).toBeTruthy()

    fireEvent.click(result.getByRole('button', { name: 'clear input' }))
    expect((result.container.querySelector('input') as HTMLInputElement).value).toBe('')
    expect(onChange).toHaveBeenCalledOnce()
  })
})
```

- [ ] **Step 2: Run Input tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/input/__tests__/Input.test.tsx
```

Expected: FAIL because Input exports do not exist.

- [ ] **Step 3: Implement Input**

Create `packages/components/src/input/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { ComponentSize } from '@solid-ant-design/theme'

export interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix'
> {
  size?: ComponentSize
  status?: 'error' | 'warning'
  prefix?: JSX.Element
  suffix?: JSX.Element
  allowClear?: boolean
}
```

Create `packages/components/src/input/input.style.ts`:

```ts
import { getComponentToken } from '@solid-ant-design/theme'
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useInputStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Input', prefixCls] }, () => {
    const inputToken = getComponentToken('Input', token())
    return {
      [`.${prefixCls}-affix-wrapper`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'box-sizing': 'border-box',
        width: '100%',
        padding: `0 ${inputToken.paddingInline}px`,
        color: token().colorText,
        'font-size': token().fontSize,
        'font-family': token().fontFamily,
        background: token().colorBgContainer,
        border: `${token().lineWidth}px solid ${token().colorBorder}`,
        'border-radius': token().borderRadius,
        transition: `all ${token().motionDurationMid} ${token().motionEaseInOut}`,
        '&:hover': { borderColor: inputToken.hoverBorderColor },
      },
      [`.${prefixCls}`]: {
        flex: 1,
        width: '100%',
        minWidth: 0,
        height: token().controlHeight,
        padding: 0,
        color: 'inherit',
        'font-size': 'inherit',
        border: 0,
        outline: 0,
        background: 'transparent',
      },
      [`.${prefixCls}-sm`]: { height: token().controlHeightSM },
      [`.${prefixCls}-lg`]: { height: token().controlHeightLG },
      [`.${prefixCls}-status-error`]: { borderColor: token().colorError },
      [`.${prefixCls}-status-warning`]: { borderColor: token().colorWarning },
      [`.${prefixCls}-disabled`]: {
        color: token().colorTextDisabled,
        background: token().colorFillAlter,
      },
      [`.${prefixCls}-prefix`]: { 'margin-inline-end': 8 },
      [`.${prefixCls}-suffix`]: { 'margin-inline-start': 8 },
      [`.${prefixCls}-clear`]: {
        border: 0,
        padding: 0,
        color: inputToken.clearIconColor,
        background: 'transparent',
        cursor: 'pointer',
        'margin-inline-start': 8,
      },
    }
  })
}
```

Create `packages/components/src/input/Input.tsx`:

```tsx
import { createSignal, Show, splitProps } from 'solid-js'
import { CloseCircleIcon } from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useInputStyle } from './input.style'
import type { InputProps } from './interface'

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, [
    'size',
    'status',
    'prefix',
    'suffix',
    'allowClear',
    'class',
    'disabled',
    'value',
    'defaultValue',
    'onInput',
    'onChange',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? ''))
  const value = () => String(local.value ?? innerValue())
  const size = () => local.size ?? config.componentSize()

  return (
    <span
      class={classNames(
        `${prefixCls()}-affix-wrapper`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.disabled && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
    >
      <Show when={local.prefix}>
        <span class={`${prefixCls()}-prefix`}>{local.prefix}</span>
      </Show>
      <input
        {...rest}
        class={prefixCls()}
        disabled={local.disabled}
        value={value()}
        onInput={(event) => {
          setInnerValue(event.currentTarget.value)
          local.onInput?.(event)
        }}
        onChange={(event) => local.onChange?.(event)}
      />
      <Show when={local.allowClear && value()}>
        <button
          type="button"
          aria-label="clear input"
          class={`${prefixCls()}-clear`}
          onClick={() => {
            setInnerValue('')
            const input =
              document.activeElement instanceof HTMLInputElement
                ? document.activeElement
                : undefined
            local.onChange?.({
              currentTarget: input ?? ({} as HTMLInputElement),
              target: input ?? ({} as HTMLInputElement),
            } as Event & { currentTarget: HTMLInputElement; target: HTMLInputElement })
          }}
        >
          <CloseCircleIcon />
        </button>
      </Show>
      <Show when={local.suffix}>
        <span class={`${prefixCls()}-suffix`}>{local.suffix}</span>
      </Show>
    </span>
  )
}
```

Create `packages/components/src/input/index.ts`:

```ts
export { Input } from './Input'
export type { InputProps } from './interface'
```

Modify `packages/components/src/index.ts`:

```ts
export * from './config-provider'
export * from './button'
export * from './input'
```

- [ ] **Step 4: Run Input tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/input/__tests__/Input.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Input**

```bash
git add packages/components/src/input packages/components/src/index.ts
git commit -m "feat: add input component"
```

### Task 8: Space component

**Files:**

- Create: `packages/components/src/space/interface.ts`
- Create: `packages/components/src/space/space.style.ts`
- Create: `packages/components/src/space/Space.tsx`
- Create: `packages/components/src/space/index.ts`
- Create: `packages/components/src/space/__tests__/Space.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Space tests**

Create `packages/components/src/space/__tests__/Space.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Space } from '../index'

describe('Space', () => {
  it('renders children with horizontal gap', () => {
    const result = render(() => (
      <Space size="large">
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement

    expect(space.className).toContain('ads-space')
    expect(space.style.columnGap).toBe('16px')
  })

  it('supports vertical direction, wrap and split', () => {
    const result = render(() => (
      <Space direction="vertical" wrap split={<span data-testid="split">|</span>}>
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement

    expect(space.className).toContain('ads-space-vertical')
    expect(space.className).toContain('ads-space-wrap')
    expect(result.getByTestId('split')).toHaveTextContent('|')
  })
})
```

- [ ] **Step 2: Run Space tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/space/__tests__/Space.test.tsx
```

Expected: FAIL because Space exports do not exist.

- [ ] **Step 3: Implement Space**

Create `packages/components/src/space/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type SpaceSize = 'small' | 'middle' | 'large' | number | [number, number]

export interface SpaceProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: SpaceSize
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  split?: JSX.Element
}
```

Create `packages/components/src/space/space.style.ts`:

```ts
import { getComponentToken } from '@solid-ant-design/theme'
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useSpaceStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Space', prefixCls] }, () => {
    const spaceToken = getComponentToken('Space', token())
    return {
      [`.${prefixCls}`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: `${spaceToken.gapMiddle}px`,
      },
      [`.${prefixCls}-vertical`]: {
        'flex-direction': 'column',
        'align-items': 'stretch',
      },
      [`.${prefixCls}-wrap`]: { 'flex-wrap': 'wrap' },
      [`.${prefixCls}-item`]: { display: 'inline-flex' },
      [`.${prefixCls}-split`]: { color: token().colorTextSecondary },
    }
  })
}
```

Create `packages/components/src/space/Space.tsx`:

```tsx
import { children, For, splitProps } from 'solid-js'
import { getComponentToken } from '@solid-ant-design/theme'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useSpaceStyle } from './space.style'
import type { SpaceProps, SpaceSize } from './interface'

function resolveGap(
  size: SpaceSize | undefined,
  token: ReturnType<typeof useToken> extends () => infer T ? T : never,
): [number, number] {
  const componentToken = getComponentToken('Space', token)
  if (Array.isArray(size)) return size
  if (typeof size === 'number') return [size, size]
  if (size === 'small') return [componentToken.gapSmall, componentToken.gapSmall]
  if (size === 'large') return [componentToken.gapLarge, componentToken.gapLarge]
  return [componentToken.gapMiddle, componentToken.gapMiddle]
}

export function Space(props: SpaceProps) {
  const [local, rest] = splitProps(props, [
    'size',
    'direction',
    'align',
    'wrap',
    'split',
    'class',
    'children',
  ])
  const config = useConfig()
  const token = useToken()
  const prefixCls = () => `${config.prefixCls()}-space`
  const [, hashId] = useSpaceStyle(prefixCls())
  const resolved = children(() => local.children)
  const items = () =>
    resolved.toArray().filter((item) => item !== null && item !== undefined && item !== false)
  const gap = () => resolveGap(local.size, token())

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        (local.direction ?? 'horizontal') === 'vertical' && `${prefixCls()}-vertical`,
        local.wrap && `${prefixCls()}-wrap`,
        hashId(),
        local.class,
      )}
      style={{
        'row-gap': `${gap()[1]}px`,
        'column-gap': `${gap()[0]}px`,
        'align-items': local.align,
      }}
    >
      <For each={items()}>
        {(item, index) => (
          <>
            <span class={`${prefixCls()}-item`}>{item}</span>
            {local.split && index() < items().length - 1 ? (
              <span class={`${prefixCls()}-split`}>{local.split}</span>
            ) : null}
          </>
        )}
      </For>
    </div>
  )
}
```

Create `packages/components/src/space/index.ts`:

```ts
export { Space } from './Space'
export type { SpaceProps, SpaceSize } from './interface'
```

Modify `packages/components/src/index.ts`:

```ts
export * from './config-provider'
export * from './button'
export * from './input'
export * from './space'
```

- [ ] **Step 4: Run Space tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/space/__tests__/Space.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Space**

```bash
git add packages/components/src/space packages/components/src/index.ts
git commit -m "feat: add space component"
```

### Task 9: Typography component

**Files:**

- Create: `packages/components/src/typography/interface.ts`
- Create: `packages/components/src/typography/typography.style.ts`
- Create: `packages/components/src/typography/Typography.tsx`
- Create: `packages/components/src/typography/index.ts`
- Create: `packages/components/src/typography/__tests__/Typography.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Typography tests**

Create `packages/components/src/typography/__tests__/Typography.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Typography } from '../index'

describe('Typography', () => {
  it('renders semantic title levels', () => {
    const result = render(() => <Typography.Title level={2}>Heading</Typography.Title>)
    const heading = result.getByRole('heading', { level: 2 })

    expect(heading).toHaveTextContent('Heading')
    expect(heading.className).toContain('ads-typography-title')
  })

  it('renders text type and paragraph ellipsis', () => {
    const result = render(() => (
      <>
        <Typography.Text type="secondary">Secondary</Typography.Text>
        <Typography.Paragraph ellipsis>Long text</Typography.Paragraph>
      </>
    ))

    expect(result.getByText('Secondary').className).toContain('ads-typography-secondary')
    expect(result.getByText('Long text').className).toContain('ads-typography-ellipsis')
  })
})
```

- [ ] **Step 2: Run Typography tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/typography/__tests__/Typography.test.tsx
```

Expected: FAIL because Typography exports do not exist.

- [ ] **Step 3: Implement Typography**

Create `packages/components/src/typography/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type TextType = 'secondary' | 'success' | 'warning' | 'danger'
export type TitleLevel = 1 | 2 | 3 | 4 | 5

export interface TypographyBaseProps extends JSX.HTMLAttributes<HTMLElement> {
  type?: TextType
  ellipsis?: boolean
}

export interface TitleProps extends TypographyBaseProps {
  level?: TitleLevel
}
```

Create `packages/components/src/typography/typography.style.ts`:

```ts
import { getComponentToken } from '@solid-ant-design/theme'
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useTypographyStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Typography', prefixCls] },
    () => {
      const typographyToken = getComponentToken('Typography', token())
      return {
        [`.${prefixCls}`]: {
          color: token().colorText,
          'font-family': token().fontFamily,
          'font-size': token().fontSize,
          'line-height': token().lineHeight,
        },
        [`.${prefixCls}-title`]: {
          margin: `0 0 ${typographyToken.titleMarginBottom}px`,
          color: token().colorText,
          'font-weight': typographyToken.titleFontWeight,
        },
        [`.${prefixCls}-secondary`]: { color: token().colorTextSecondary },
        [`.${prefixCls}-success`]: { color: token().colorSuccess },
        [`.${prefixCls}-warning`]: { color: token().colorWarning },
        [`.${prefixCls}-danger`]: { color: token().colorError },
        [`.${prefixCls}-paragraph`]: { margin: `0 0 ${typographyToken.paragraphMarginBottom}px` },
        [`.${prefixCls}-ellipsis`]: {
          overflow: 'hidden',
          'white-space': 'nowrap',
          'text-overflow': 'ellipsis',
        },
      }
    },
  )
}
```

Create `packages/components/src/typography/Typography.tsx`:

```tsx
import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useTypographyStyle } from './typography.style'
import type { TitleProps, TypographyBaseProps } from './interface'

function useTypographyClasses() {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-typography`
  const [, hashId] = useTypographyStyle(prefixCls())
  return { prefixCls, hashId }
}

function Title(props: TitleProps) {
  const [local, rest] = splitProps(props, ['level', 'type', 'ellipsis', 'class', 'children'])
  const { prefixCls, hashId } = useTypographyClasses()
  const level = () => local.level ?? 1

  return (
    <Dynamic
      component={`h${level()}`}
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-title`,
        local.type && `${prefixCls()}-${local.type}`,
        local.ellipsis && `${prefixCls()}-ellipsis`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </Dynamic>
  )
}

function Text(props: TypographyBaseProps) {
  const [local, rest] = splitProps(props, ['type', 'ellipsis', 'class', 'children'])
  const { prefixCls, hashId } = useTypographyClasses()

  return (
    <span
      {...rest}
      class={classNames(
        prefixCls(),
        local.type && `${prefixCls()}-${local.type}`,
        local.ellipsis && `${prefixCls()}-ellipsis`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </span>
  )
}

function Paragraph(props: TypographyBaseProps) {
  const [local, rest] = splitProps(props, ['type', 'ellipsis', 'class', 'children'])
  const { prefixCls, hashId } = useTypographyClasses()

  return (
    <p
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-paragraph`,
        local.type && `${prefixCls()}-${local.type}`,
        local.ellipsis && `${prefixCls()}-ellipsis`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
    </p>
  )
}

export const Typography = Object.assign(Text, { Title, Text, Paragraph })
```

Create `packages/components/src/typography/index.ts`:

```ts
export { Typography } from './Typography'
export type { TextType, TitleLevel, TitleProps, TypographyBaseProps } from './interface'
```

Modify `packages/components/src/index.ts`:

```ts
export * from './config-provider'
export * from './button'
export * from './input'
export * from './space'
export * from './typography'
```

- [ ] **Step 4: Run Typography tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/typography/__tests__/Typography.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Typography**

```bash
git add packages/components/src/typography packages/components/src/index.ts
git commit -m "feat: add typography component"
```

### Task 10: Grid component

**Files:**

- Create: `packages/components/src/grid/interface.ts`
- Create: `packages/components/src/grid/grid.style.ts`
- Create: `packages/components/src/grid/Row.tsx`
- Create: `packages/components/src/grid/Col.tsx`
- Create: `packages/components/src/grid/index.ts`
- Create: `packages/components/src/grid/__tests__/Grid.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Grid tests**

Create `packages/components/src/grid/__tests__/Grid.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Col, Row } from '../index'

describe('Grid', () => {
  it('renders Row and Col with 24-grid styles', () => {
    const result = render(() => (
      <Row gutter={[16, 24]} justify="center" align="middle">
        <Col span={12} offset={2}>
          A
        </Col>
        <Col span={10}>B</Col>
      </Row>
    ))
    const row = result.container.firstElementChild as HTMLElement
    const cols = result.container.querySelectorAll('.ads-col')

    expect(row.className).toContain('ads-row')
    expect(row.style.marginLeft).toBe('-8px')
    expect(row.style.rowGap).toBe('24px')
    expect(cols[0].className).toContain('ads-col-12')
    expect((cols[0] as HTMLElement).style.paddingLeft).toBe('8px')
  })
})
```

- [ ] **Step 2: Run Grid tests to verify they fail before implementation**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/grid/__tests__/Grid.test.tsx
```

Expected: FAIL because Grid exports do not exist.

- [ ] **Step 3: Implement Grid**

Create `packages/components/src/grid/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type Gutter = number | [number, number]

export interface RowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  gutter?: Gutter
  align?: 'top' | 'middle' | 'bottom' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
  wrap?: boolean
}

export interface ColProps extends JSX.HTMLAttributes<HTMLDivElement> {
  span?: number
  offset?: number
  order?: number
  push?: number
  pull?: number
}
```

Create `packages/components/src/grid/grid.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useGridStyle(rowPrefixCls: string, colPrefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Grid', rowPrefixCls, colPrefixCls] },
    () => {
      const styles: Record<string, Record<string, string | number>> = {
        [`.${rowPrefixCls}`]: {
          display: 'flex',
          'flex-flow': 'row wrap',
          'min-width': 0,
        },
        [`.${rowPrefixCls}-nowrap`]: { 'flex-wrap': 'nowrap' },
        [`.${colPrefixCls}`]: {
          position: 'relative',
          'max-width': '100%',
          'min-height': 1,
        },
      }

      for (let index = 1; index <= 24; index += 1) {
        const percent = `${(index / 24) * 100}%`
        styles[`.${colPrefixCls}-${index}`] = {
          display: 'block',
          flex: `0 0 ${percent}`,
          'max-width': percent,
        }
        styles[`.${colPrefixCls}-offset-${index}`] = { 'margin-left': percent }
        styles[`.${colPrefixCls}-push-${index}`] = { left: percent }
        styles[`.${colPrefixCls}-pull-${index}`] = { right: percent }
      }

      return styles
    },
  )
}
```

Create `packages/components/src/grid/Row.tsx`:

```tsx
import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useGridStyle } from './grid.style'
import type { Gutter, RowProps } from './interface'

function normalizeGutter(gutter: Gutter | undefined): [number, number] {
  if (Array.isArray(gutter)) return gutter
  return [gutter ?? 0, 0]
}

function justifyToCss(justify: RowProps['justify']) {
  if (justify === 'start') return 'flex-start'
  if (justify === 'end') return 'flex-end'
  return justify
}

function alignToCss(align: RowProps['align']) {
  if (align === 'top') return 'flex-start'
  if (align === 'middle') return 'center'
  if (align === 'bottom') return 'flex-end'
  return align
}

export function Row(props: RowProps) {
  const [local, rest] = splitProps(props, [
    'gutter',
    'align',
    'justify',
    'wrap',
    'class',
    'style',
    'children',
  ])
  const config = useConfig()
  const rowPrefixCls = () => `${config.prefixCls()}-row`
  const colPrefixCls = () => `${config.prefixCls()}-col`
  const [, hashId] = useGridStyle(rowPrefixCls(), colPrefixCls())
  const gutter = () => normalizeGutter(local.gutter)

  return (
    <div
      {...rest}
      class={classNames(
        rowPrefixCls(),
        local.wrap === false && `${rowPrefixCls()}-nowrap`,
        hashId(),
        local.class,
      )}
      style={{
        'margin-left': gutter()[0] ? `${gutter()[0] / -2}px` : undefined,
        'margin-right': gutter()[0] ? `${gutter()[0] / -2}px` : undefined,
        'row-gap': gutter()[1] ? `${gutter()[1]}px` : undefined,
        'justify-content': justifyToCss(local.justify),
        'align-items': alignToCss(local.align),
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
    >
      {local.children}
    </div>
  )
}
```

Create `packages/components/src/grid/Col.tsx`:

```tsx
import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import type { ColProps } from './interface'

export function Col(props: ColProps) {
  const [local, rest] = splitProps(props, [
    'span',
    'offset',
    'order',
    'push',
    'pull',
    'class',
    'style',
    'children',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-col`

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.span && `${prefixCls()}-${local.span}`,
        local.offset && `${prefixCls()}-offset-${local.offset}`,
        local.push && `${prefixCls()}-push-${local.push}`,
        local.pull && `${prefixCls()}-pull-${local.pull}`,
        local.class,
      )}
      style={{
        order: local.order,
        'padding-left': '8px',
        'padding-right': '8px',
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
    >
      {local.children}
    </div>
  )
}
```

Create `packages/components/src/grid/index.ts`:

```ts
export { Col } from './Col'
export { Row } from './Row'
export type { ColProps, Gutter, RowProps } from './interface'
```

Modify `packages/components/src/index.ts`:

```ts
export * from './config-provider'
export * from './button'
export * from './input'
export * from './space'
export * from './typography'
export * from './grid'
```

- [ ] **Step 4: Run Grid tests to verify they pass**

Run:

```bash
pnpm --filter @solid-ant-design/core test -- src/grid/__tests__/Grid.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Grid**

```bash
git add packages/components/src/grid packages/components/src/index.ts
git commit -m "feat: add grid component"
```

### Task 11: Docs app

**Files:**

- Create: `apps/docs/package.json`
- Create: `apps/docs/tsconfig.json`
- Create: `apps/docs/vite.config.ts`
- Create: `apps/docs/index.html`
- Create: `apps/docs/src/main.tsx`
- Create: `apps/docs/src/App.tsx`
- Create: `apps/docs/src/app.css`
- Create: `apps/docs/src/site/nav.ts`
- Create: `apps/docs/src/site/Layout.tsx`
- Create: `apps/docs/src/site/DemoBlock.tsx`
- Create: `apps/docs/src/pages/Home.tsx`
- Create: `apps/docs/src/pages/GettingStarted.tsx`
- Create: `apps/docs/src/pages/Theming.tsx`
- Create: `apps/docs/src/pages/ButtonPage.tsx`
- Create: `apps/docs/src/pages/InputPage.tsx`
- Create: `apps/docs/src/pages/SpacePage.tsx`
- Create: `apps/docs/src/pages/TypographyPage.tsx`
- Create: `apps/docs/src/pages/GridPage.tsx`
- Create: `apps/docs/src/pages/ConfigProviderPage.tsx`

- [ ] **Step 1: Create docs package and Vite entry**

Create `apps/docs/package.json`:

```json
{
  "name": "@solid-ant-design/docs",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src",
    "lint:fix": "oxlint --fix src"
  },
  "dependencies": {
    "@solid-ant-design/core": "workspace:*",
    "@solid-ant-design/cssinjs": "workspace:*",
    "solid-js": "latest"
  },
  "devDependencies": {}
}
```

Create `apps/docs/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src", "vite.config.ts"]
}
```

Create `apps/docs/vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 5173,
  },
})
```

Create `apps/docs/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ant Design Solid</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create docs app shell**

Create `apps/docs/src/main.tsx`:

```tsx
import { render } from 'solid-js/web'
import { ConfigProvider } from '@solid-ant-design/core'
import { StyleProvider } from '@solid-ant-design/cssinjs'
import { App } from './App'
import './app.css'

render(
  () => (
    <StyleProvider>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </StyleProvider>
  ),
  document.getElementById('root')!,
)
```

Create `apps/docs/src/site/nav.ts`:

```ts
export const navItems = [
  { path: '/', label: 'Home' },
  { path: '/docs/getting-started', label: 'Getting Started' },
  { path: '/docs/theming', label: 'Theming' },
  { path: '/components/config-provider', label: 'ConfigProvider' },
  { path: '/components/button', label: 'Button' },
  { path: '/components/input', label: 'Input' },
  { path: '/components/space', label: 'Space' },
  { path: '/components/typography', label: 'Typography' },
  { path: '/components/grid', label: 'Grid' },
]
```

Create `apps/docs/src/site/Layout.tsx`:

```tsx
import { For, type JSX } from 'solid-js'
import { navItems } from './nav'

export function Layout(props: { children: JSX.Element }) {
  return (
    <div class="site-shell">
      <header class="site-header">
        <a class="site-logo" href="/">
          Ant Design Solid
        </a>
        <nav class="site-topnav">
          <a href="/docs/getting-started">Docs</a>
          <a href="/components/button">Components</a>
          <a href="https://github.com/ant-design-solid/ant-design-solid">GitHub</a>
        </nav>
      </header>
      <div class="site-body">
        <aside class="site-sidebar">
          <For each={navItems}>{(item) => <a href={item.path}>{item.label}</a>}</For>
        </aside>
        <main class="site-main">{props.children}</main>
      </div>
    </div>
  )
}
```

Create `apps/docs/src/site/DemoBlock.tsx`:

```tsx
import type { JSX } from 'solid-js'

export function DemoBlock(props: { title: string; code: string; children: JSX.Element }) {
  return (
    <section class="demo-block">
      <h3>{props.title}</h3>
      <div class="demo-preview">{props.children}</div>
      <pre>
        <code>{props.code}</code>
      </pre>
    </section>
  )
}
```

Create `apps/docs/src/App.tsx`:

```tsx
import { createMemo } from 'solid-js'
import { Layout } from './site/Layout'
import { Home } from './pages/Home'
import { GettingStarted } from './pages/GettingStarted'
import { Theming } from './pages/Theming'
import { ButtonPage } from './pages/ButtonPage'
import { InputPage } from './pages/InputPage'
import { SpacePage } from './pages/SpacePage'
import { TypographyPage } from './pages/TypographyPage'
import { GridPage } from './pages/GridPage'
import { ConfigProviderPage } from './pages/ConfigProviderPage'

const routes: Record<string, () => JSX.Element> = {
  '/': Home,
  '/docs/getting-started': GettingStarted,
  '/docs/theming': Theming,
  '/components/button': ButtonPage,
  '/components/input': InputPage,
  '/components/space': SpacePage,
  '/components/typography': TypographyPage,
  '/components/grid': GridPage,
  '/components/config-provider': ConfigProviderPage,
}

import type { JSX } from 'solid-js'

export function App() {
  const Page = createMemo(() => routes[window.location.pathname] ?? Home)
  return (
    <Layout>
      <Page />
    </Layout>
  )
}
```

Create `apps/docs/src/app.css`:

```css
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f1f1f;
  background: #fff;
}
a {
  color: inherit;
  text-decoration: none;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid #f0f0f0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}
.site-logo {
  font-weight: 700;
  font-size: 18px;
  color: #1677ff;
}
.site-topnav {
  display: flex;
  gap: 24px;
  color: rgba(0, 0, 0, 0.65);
}
.site-body {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  min-height: calc(100vh - 64px);
}
.site-sidebar {
  padding: 24px;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.site-sidebar a {
  padding: 8px 12px;
  border-radius: 8px;
}
.site-sidebar a:hover {
  background: rgba(22, 119, 255, 0.08);
  color: #1677ff;
}
.site-main {
  padding: 40px 56px;
  max-width: 1100px;
}
.hero {
  padding: 56px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.12), rgba(114, 46, 209, 0.1));
}
.hero h1 {
  margin: 0 0 16px;
  font-size: 48px;
}
.hero p {
  max-width: 680px;
  color: rgba(0, 0, 0, 0.65);
  font-size: 18px;
  line-height: 1.7;
}
.demo-block {
  margin: 24px 0;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}
.demo-block h3 {
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}
.demo-preview {
  padding: 24px;
}
.demo-block pre {
  margin: 0;
  padding: 16px 20px;
  background: #fafafa;
  overflow: auto;
}
.api-table {
  width: 100%;
  border-collapse: collapse;
  margin: 24px 0;
}
.api-table th,
.api-table td {
  border: 1px solid #f0f0f0;
  padding: 10px 12px;
  text-align: left;
}
.api-table th {
  background: #fafafa;
}
```

- [ ] **Step 3: Create docs pages**

Create `apps/docs/src/pages/Home.tsx`:

```tsx
import { Button, Space } from '@solid-ant-design/core'

export function Home() {
  return (
    <>
      <section class="hero">
        <h1>Ant Design Solid</h1>
        <p>
          An Ant Design-inspired component system built with SolidJS, Vite 8, pnpm 11, token-driven
          theming, and a Solid-native CSS-in-JS runtime.
        </p>
        <Space>
          <Button type="primary">Get Started</Button>
          <Button>View Components</Button>
        </Space>
      </section>
    </>
  )
}
```

Create `apps/docs/src/pages/GettingStarted.tsx`:

```tsx
export function GettingStarted() {
  return (
    <>
      <h1>Getting Started</h1>
      <p>
        Install with pnpm and import components from <code>@solid-ant-design/core</code>.
      </p>
      <pre>
        <code>{`pnpm add @solid-ant-design/core @solid-ant-design/cssinjs solid-js`}</code>
      </pre>
    </>
  )
}
```

Create `apps/docs/src/pages/Theming.tsx`:

```tsx
import { Button, ConfigProvider, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function Theming() {
  return (
    <>
      <h1>Theming</h1>
      <p>Use ConfigProvider to override seed tokens and component tokens.</p>
      <DemoBlock
        title="Custom primary color"
        code={`<ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}><Button type="primary" /></ConfigProvider>`}
      >
        <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
          <Space>
            <Button type="primary">Purple Button</Button>
          </Space>
        </ConfigProvider>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/ButtonPage.tsx`:

```tsx
import { Button, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function ButtonPage() {
  return (
    <>
      <h1>Button</h1>
      <DemoBlock title="Types" code={`<Button type="primary">Primary</Button>`}>
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
          <Button danger>Danger</Button>
          <Button loading>Loading</Button>
        </Space>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/InputPage.tsx`:

```tsx
import { Input, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function InputPage() {
  return (
    <>
      <h1>Input</h1>
      <DemoBlock title="Basic" code={`<Input placeholder="请输入" allowClear />`}>
        <Space direction="vertical" style={{ width: '320px' }}>
          <Input placeholder="请输入" allowClear />
          <Input status="error" prefix="￥" suffix="RMB" defaultValue="100" allowClear />
        </Space>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/SpacePage.tsx`:

```tsx
import { Button, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function SpacePage() {
  return (
    <>
      <h1>Space</h1>
      <DemoBlock title="Basic" code={`<Space><Button /> <Button /></Space>`}>
        <Space size="large" wrap>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </Space>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/TypographyPage.tsx`:

```tsx
import { Typography } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function TypographyPage() {
  return (
    <>
      <h1>Typography</h1>
      <DemoBlock title="Basic" code={`<Typography.Title level={2}>Title</Typography.Title>`}>
        <Typography.Title level={2}>Title</Typography.Title>
        <Typography.Text type="secondary">Secondary text</Typography.Text>
        <Typography.Paragraph ellipsis>
          Long paragraph long paragraph long paragraph long paragraph.
        </Typography.Paragraph>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/GridPage.tsx`:

```tsx
import { Col, Row } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function GridPage() {
  return (
    <>
      <h1>Grid</h1>
      <DemoBlock
        title="24 columns"
        code={`<Row gutter={[16, 24]}><Col span={12}>A</Col><Col span={12}>B</Col></Row>`}
      >
        <Row gutter={[16, 24]}>
          <Col span={12}>
            <div style={{ background: '#e6f4ff', padding: '16px' }}>A</div>
          </Col>
          <Col span={12}>
            <div style={{ background: '#bae0ff', padding: '16px' }}>B</div>
          </Col>
        </Row>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/ConfigProviderPage.tsx`:

```tsx
import { Button, ConfigProvider } from '@solid-ant-design/core'
import { DemoBlock } from '../site/DemoBlock'

export function ConfigProviderPage() {
  return (
    <>
      <h1>ConfigProvider</h1>
      <DemoBlock
        title="Theme override"
        code={`<ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}><Button type="primary" /></ConfigProvider>`}
      >
        <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
          <Button type="primary">Custom Theme</Button>
        </ConfigProvider>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 4: Typecheck docs app**

Run:

```bash
pnpm --filter @solid-ant-design/docs typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit docs app**

```bash
git add apps/docs
git commit -m "feat: add solid docs app"
```

### Task 12: Full verification and polish

**Files:**

- Modify files only as required by verification failures.
- Create `README.md` if missing.

- [ ] **Step 1: Add README**

Create `README.md`:

````md
# Ant Design Solid

Ant Design-inspired components for SolidJS.

## Stack

- SolidJS
- Vite 8
- pnpm 11
- TypeScript
- Token-driven CSS-in-JS
- oxlint + oxfmt

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```
````

## Packages

- `@solid-ant-design/core`
- `@solid-ant-design/theme`
- `@solid-ant-design/cssinjs`
- `@solid-ant-design/icons`
- `@solid-ant-design/docs`

````

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
````

Expected: dependencies install successfully and `pnpm-lock.yaml` is created. If this fails because network access is blocked, request escalation and rerun exactly `pnpm install`.

- [ ] **Step 3: Run all tests**

Run:

```bash
pnpm test
```

Expected: all package tests pass.

- [ ] **Step 4: Run typecheck**

Run:

```bash
pnpm typecheck
```

Expected: all packages typecheck successfully.

- [ ] **Step 5: Run build**

Run:

```bash
pnpm build
```

Expected: all packages and docs build successfully.

- [ ] **Step 6: Run lint**

Run:

```bash
pnpm lint
```

Expected: no lint errors. If formatting check fails, run `pnpm format`, inspect changes, then rerun `pnpm format:check` and `pnpm lint`.

- [ ] **Step 7: Commit final verification changes**

```bash
git add README.md pnpm-lock.yaml .
git commit -m "chore: verify mvp workspace"
```

---

## Plan Self-Review

### Spec coverage

- Monorepo foundation: Task 1.
- Theme tokens and component token derivation: Task 2.
- Solid-native CSS-in-JS runtime: Task 3.
- Icons boundary: Task 4.
- ConfigProvider: Task 5.
- Button/Input/Space/Typography/Grid: Tasks 6 through 10.
- Docs site with required pages: Task 11.
- Verification commands and README: Task 12.

### Red-flag scan

The plan avoids open-ended deferred work. Where verification failures may require edits, Task 12 explicitly limits changes to concrete failures discovered by commands.

### Type consistency

The exported package names, component names, prop names, and helper names are consistent across package metadata, implementation snippets, tests, and docs examples.
