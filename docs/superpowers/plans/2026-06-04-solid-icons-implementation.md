# Solid Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a SolidJS icon package in `packages/icons` backed by `@ant-design/icons-svg`, exporting the full Ant Design icon set as Solid components.

**Architecture:** A shared `Icon` renderer converts `@ant-design/icons-svg` abstract SVG definitions into Solid SVG elements. A generator creates one kebab-case Solid component file per icon plus a deterministic barrel export file. The root package exports the renderer, prop types, and all generated AntD-style icon components.

**Tech Stack:** SolidJS, TypeScript, Vite library mode, Vitest, `@solidjs/testing-library`, `@ant-design/icons-svg`, pnpm workspace.

---

## File Structure

- Modify: `packages/icons/package.json`
  - Add `@ant-design/icons-svg` as a runtime dependency.
- Replace: `packages/icons/src/index.tsx`
  - Convert from hand-written icon implementations to package barrel exports.
- Create: `packages/icons/src/components/icon.tsx`
  - Shared Solid renderer and public `IconProps` / internal renderer types.
- Create: `packages/icons/src/components/icon.test.tsx`
  - Tests for low-level rendering behavior, prop forwarding, spin, rotate, and two-tone colors.
- Create: `packages/icons/src/icons/search-outlined.test.tsx`
  - Tests package-level generated icon behavior with representative exports.
- Create: `packages/icons/src/icons/*.tsx`
  - Generated Solid wrapper for each icon definition from `@ant-design/icons-svg`.
- Create: `packages/icons/scripts/generate-icons.mjs`
  - Deterministic generation script for all icon wrapper files and root barrel.
- Modify: `packages/icons/vite.config.ts`
  - Externalize `@ant-design/icons-svg` in package builds.

All new TypeScript filenames must be kebab-case per `AGENTS.md`.

---

### Task 1: Add dependency and failing low-level renderer tests

**Files:**

- Modify: `packages/icons/package.json`
- Create: `packages/icons/src/components/icon.test.tsx`

- [ ] **Step 1: Add `@ant-design/icons-svg` dependency**

Edit `packages/icons/package.json` so it contains this dependency block before `peerDependencies`:

```json
  "dependencies": {
    "@ant-design/icons-svg": "^4.4.2"
  },
```

Keep existing scripts and `peerDependencies` unchanged.

- [ ] **Step 2: Install workspace dependencies**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install
```

Expected: command exits with code 0 and lockfile includes `@ant-design/icons-svg`.

- [ ] **Step 3: Write the failing low-level renderer tests**

Create `packages/icons/src/components/icon.test.tsx` with this content:

```tsx
import AccountBookTwoTone from '@ant-design/icons-svg/es/asn/AccountBookTwoTone'
import SearchOutlinedSvg from '@ant-design/icons-svg/es/asn/SearchOutlined'
import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Icon } from './icon'

describe('Icon', () => {
  it('renders an icons-svg definition as a Solid svg element', () => {
    const result = render(() => <Icon icon={SearchOutlinedSvg} data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '64 64 896 896')
    expect(svg).toHaveAttribute('width', '1em')
    expect(svg).toHaveAttribute('height', '1em')
    expect(svg).toHaveAttribute('fill', 'currentColor')
    expect(svg.querySelector('path')).not.toBeNull()
  })

  it('forwards svg props to the root svg element', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Icon
        icon={SearchOutlinedSvg}
        aria-label="Search"
        class="custom-icon"
        data-testid="icon"
        fill="red"
        onClick={onClick}
        style={{ color: 'rgb(255, 0, 0)' }}
      />
    ))
    const svg = result.getByTestId('icon')

    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(svg).toHaveAttribute('aria-label', 'Search')
    expect(svg).not.toHaveAttribute('aria-hidden')
    expect(svg).toHaveAttribute('class', 'custom-icon')
    expect(svg).toHaveAttribute('fill', 'red')
    expect(svg).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('marks decorative icons as hidden by default', () => {
    const result = render(() => <Icon icon={SearchOutlinedSvg} data-testid="icon" />)

    expect(result.getByTestId('icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies spin and rotate styles', () => {
    const result = render(() => (
      <Icon icon={SearchOutlinedSvg} data-testid="icon" rotate={90} spin />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.classList.contains('ant-design-solid-icon-spin')).toBe(true)
    expect(svg.getAttribute('style')).toContain('animation: ant-design-solid-icon-spin')
    expect(svg.getAttribute('style')).toContain('transform: rotate(90deg)')
  })

  it('renders two-tone icons with tuple colors', () => {
    const result = render(() => (
      <Icon icon={AccountBookTwoTone} data-testid="icon" twoToneColor={['#111111', '#eeeeee']} />
    ))
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#111111')
    expect(svg.innerHTML).toContain('#eeeeee')
  })

  it('renders two-tone icons with default colors', () => {
    const result = render(() => <Icon icon={AccountBookTwoTone} data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.innerHTML).toContain('#1677ff')
    expect(svg.innerHTML).toContain('#e6f4ff')
  })
})
```

- [ ] **Step 4: Run tests to verify they fail because `Icon` does not exist**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons test -- src/components/icon.test.tsx
```

Expected: FAIL with an import/module error for `./icon`.

- [ ] **Step 5: Commit dependency and failing tests**

```bash
git add packages/icons/package.json pnpm-lock.yaml packages/icons/src/components/icon.test.tsx
git commit -m "test: add icon renderer expectations"
```

---

### Task 2: Implement the shared Icon renderer

**Files:**

- Create: `packages/icons/src/components/icon.tsx`
- Test: `packages/icons/src/components/icon.test.tsx`

- [ ] **Step 1: Create the minimal renderer implementation**

Create `packages/icons/src/components/icon.tsx` with this content:

```tsx
import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types'
import { Dynamic } from 'solid-js/web'
import type { JSX } from 'solid-js'

export type TwoToneColor = string | [primaryColor: string, secondaryColor: string]

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  spin?: boolean
  rotate?: number
  twoToneColor?: TwoToneColor
}

interface InternalIconProps extends IconProps {
  icon: IconDefinition
}

const defaultPrimaryColor = '#1677ff'
const defaultSecondaryColor = '#e6f4ff'
const spinClassName = 'ant-design-solid-icon-spin'

function resolveTwoToneColor(twoToneColor: TwoToneColor | undefined): [string, string] {
  if (Array.isArray(twoToneColor)) return twoToneColor
  if (typeof twoToneColor === 'string') return [twoToneColor, defaultSecondaryColor]
  return [defaultPrimaryColor, defaultSecondaryColor]
}

function renderNode(node: AbstractNode): JSX.Element {
  return (
    <Dynamic component={node.tag} {...node.attrs}>
      {node.children?.map((child) => renderNode(child))}
    </Dynamic>
  )
}

function mergeClass(baseClass: string | undefined, spin: boolean | undefined): string | undefined {
  if (!spin) return baseClass
  return [baseClass, spinClassName].filter(Boolean).join(' ')
}

function mergeStyle(
  baseStyle: JSX.CSSProperties | string | undefined,
  options: { rotate?: number; spin?: boolean },
): JSX.CSSProperties | string | undefined {
  const generatedStyle: JSX.CSSProperties = {}

  if (options.spin) {
    generatedStyle.animation = 'ant-design-solid-icon-spin 1s infinite linear'
  }

  if (typeof options.rotate === 'number') {
    generatedStyle.transform = `rotate(${options.rotate}deg)`
  }

  if (Object.keys(generatedStyle).length === 0) return baseStyle

  if (typeof baseStyle === 'string') {
    const suffix = Object.entries(generatedStyle)
      .map(
        ([key, value]) => `${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}: ${value}`,
      )
      .join('; ')
    return `${baseStyle}; ${suffix}`
  }

  return { ...baseStyle, ...generatedStyle }
}

export function Icon(props: InternalIconProps) {
  const [primaryColor, secondaryColor] = resolveTwoToneColor(props.twoToneColor)
  const iconNode =
    typeof props.icon.icon === 'function'
      ? props.icon.icon(primaryColor, secondaryColor)
      : props.icon.icon
  const rootAttrs = iconNode.attrs
  const ariaHidden = props['aria-label'] || props['aria-labelledby'] ? undefined : 'true'

  return (
    <svg
      {...rootAttrs}
      {...props}
      aria-hidden={props['aria-hidden'] ?? ariaHidden}
      class={mergeClass(props.class, props.spin)}
      fill={props.fill ?? 'currentColor'}
      focusable={props.focusable ?? rootAttrs.focusable ?? 'false'}
      height={props.height ?? '1em'}
      style={mergeStyle(props.style, { rotate: props.rotate, spin: props.spin })}
      viewBox={props.viewBox ?? rootAttrs.viewBox}
      width={props.width ?? '1em'}
    >
      {iconNode.children?.map((child) => renderNode(child))}
    </svg>
  )
}
```

- [ ] **Step 2: Run renderer tests to verify they pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons test -- src/components/icon.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run typecheck for icons package**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons typecheck
```

Expected: PASS. If TypeScript rejects `Dynamic` SVG props, replace `renderNode` with `document.createElementNS` is not acceptable; instead keep JSX rendering and narrow props with `as Record<string, unknown>` in the `Dynamic` spread.

- [ ] **Step 4: Commit renderer**

```bash
git add packages/icons/src/components/icon.tsx
git commit -m "feat: add solid icon renderer"
```

---

### Task 3: Add generated icon export tests

**Files:**

- Create: `packages/icons/src/icons/search-outlined.test.tsx`

- [ ] **Step 1: Write failing generated icon tests**

Create `packages/icons/src/icons/search-outlined.test.tsx` with this content:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { AccountBookTwoTone, CloseCircleFilled, LoadingOutlined, SearchOutlined } from '../index'

describe('generated icon exports', () => {
  it('exports outlined icons as Solid components', () => {
    const result = render(() => <SearchOutlined data-testid="icon" />)
    const svg = result.getByTestId('icon')

    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '64 64 896 896')
    expect(svg.querySelector('path')).not.toBeNull()
  })

  it('exports filled icons as Solid components', () => {
    const result = render(() => <CloseCircleFilled data-testid="icon" />)

    expect(result.getByTestId('icon').querySelector('path')).not.toBeNull()
  })

  it('exports loading icon with spin support', () => {
    const result = render(() => <LoadingOutlined data-testid="icon" spin />)

    expect(result.getByTestId('icon').classList.contains('ant-design-solid-icon-spin')).toBe(true)
  })

  it('exports two-tone icons as Solid components', () => {
    const result = render(() => (
      <AccountBookTwoTone data-testid="icon" twoToneColor={['#123456', '#abcdef']} />
    ))

    expect(result.getByTestId('icon').innerHTML).toContain('#123456')
    expect(result.getByTestId('icon').innerHTML).toContain('#abcdef')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail because generated exports do not exist**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons test -- src/icons/search-outlined.test.tsx
```

Expected: FAIL with missing exports such as `SearchOutlined` or missing generated files.

- [ ] **Step 3: Commit failing generated export tests**

```bash
git add packages/icons/src/icons/search-outlined.test.tsx
git commit -m "test: add generated icon export expectations"
```

---

### Task 4: Add icon generator and generate full icon set

**Files:**

- Create: `packages/icons/scripts/generate-icons.mjs`
- Replace: `packages/icons/src/index.tsx`
- Create: `packages/icons/src/icons/*.tsx`

- [ ] **Step 1: Create generator script**

Create `packages/icons/scripts/generate-icons.mjs` with this content:

```js
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const iconsSvgAsnDir = join(packageRoot, 'node_modules/@ant-design/icons-svg/es/asn')
const iconsDir = join(packageRoot, 'src/icons')
const indexFile = join(packageRoot, 'src/index.tsx')

function toKebabCase(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

async function main() {
  const files = await readdir(iconsSvgAsnDir)
  const iconNames = files
    .filter((file) => file.endsWith('.js'))
    .map((file) => file.slice(0, -'.js'.length))
    .sort((a, b) => a.localeCompare(b))

  await rm(iconsDir, { recursive: true, force: true })
  await mkdir(iconsDir, { recursive: true })

  await Promise.all(
    iconNames.map(async (iconName) => {
      const fileName = `${toKebabCase(iconName)}.tsx`
      const filePath = join(iconsDir, fileName)
      const source = `// This file is generated by scripts/generate-icons.mjs. Do not edit manually.\nimport ${iconName}Svg from '@ant-design/icons-svg/es/asn/${iconName}'\nimport { Icon, type IconProps } from '../components/icon'\n\nexport function ${iconName}(props: IconProps) {\n  return <Icon icon={${iconName}Svg} {...props} />\n}\n`
      await writeFile(filePath, source)
    }),
  )

  const indexSource = `export { Icon, type IconProps, type TwoToneColor } from './components/icon'\n${iconNames
    .map((iconName) => `export { ${iconName} } from './icons/${toKebabCase(iconName)}'`)
    .join('\n')}\n`

  await writeFile(indexFile, indexSource)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
```

- [ ] **Step 2: Run the generator**

Run:

```bash
cd packages/icons && node scripts/generate-icons.mjs
```

Expected: `packages/icons/src/icons` contains many kebab-case `.tsx` files, including:

```text
account-book-two-tone.tsx
close-circle-filled.tsx
loading-outlined.tsx
search-outlined.tsx
```

Expected: `packages/icons/src/index.tsx` exports `Icon`, `IconProps`, and all generated components.

- [ ] **Step 3: Verify generated filenames are kebab-case**

Run:

```bash
find packages/icons/src -name '*.ts' -o -name '*.tsx' | awk -F/ '{print $NF}' | grep -E '[A-Z_]' && exit 1 || exit 0
```

Expected: command exits with code 0 and prints nothing.

- [ ] **Step 4: Run generated export tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons test -- src/icons/search-outlined.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Run renderer tests again**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons test -- src/components/icon.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit generated icons**

```bash
git add packages/icons/scripts/generate-icons.mjs packages/icons/src/index.tsx packages/icons/src/icons
git commit -m "feat: generate solid ant design icons"
```

---

### Task 5: Build configuration and package type fixes

**Files:**

- Modify: `packages/icons/vite.config.ts`
- Modify if required: `packages/icons/tsconfig.json`
- Test: package typecheck/build commands

- [ ] **Step 1: Externalize `@ant-design/icons-svg` in Vite build**

Update `packages/icons/vite.config.ts` so `rollupOptions.external` includes `@ant-design/icons-svg` subpaths:

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
      external: [/^@ant-design\/icons-svg\//, 'solid-js', 'solid-js/web'],
    },
  },
})
```

- [ ] **Step 2: Run icons package typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons typecheck
```

Expected: PASS.

If TypeScript cannot resolve `@ant-design/icons-svg/es/asn/*` declaration files, add `packages/icons/src/icons-svg.d.ts` with:

```ts
declare module '@ant-design/icons-svg/es/asn/*' {
  import type { IconDefinition } from '@ant-design/icons-svg/lib/types'
  const icon: IconDefinition
  export default icon
}
```

Then rerun typecheck and expect PASS.

- [ ] **Step 3: Run icons package build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/icons build
```

Expected: PASS and `packages/icons/dist/index.js`, `packages/icons/dist/index.cjs`, and `packages/icons/dist/index.d.ts` exist.

- [ ] **Step 4: Commit build configuration fixes**

```bash
git add packages/icons/vite.config.ts packages/icons/tsconfig.json packages/icons/src/icons-svg.d.ts packages/icons/dist packages/icons/package.json pnpm-lock.yaml
git commit -m "build: configure icons package for icons-svg"
```

If `packages/icons/src/icons-svg.d.ts`, `packages/icons/tsconfig.json`, or `packages/icons/dist` did not change, omit those paths from `git add`.

---

### Task 6: Full repository verification and final cleanup

**Files:**

- Any files changed by formatting.

- [ ] **Step 1: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

If it fails, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Then rerun `format:check` and expect PASS.

- [ ] **Step 3: Run recursive typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run recursive tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run recursive build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 6: Inspect git status**

Run:

```bash
git status --short
```

Expected: only intentional changes remain. Generated icon files should have kebab-case filenames.

- [ ] **Step 7: Commit final formatting or verification fixes**

If formatting or small verification fixes changed files, commit them:

```bash
git add packages/icons docs/superpowers/plans/2026-06-04-solid-icons-implementation.md
git commit -m "chore: finalize solid icons integration"
```

If no files changed, do not create an empty commit.
