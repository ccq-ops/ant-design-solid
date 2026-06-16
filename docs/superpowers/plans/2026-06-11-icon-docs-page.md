# Icon Docs Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/components/icon` docs page that shows usage examples and a full categorized grid of every generated `@solid-ant-design/icons` component.

**Architecture:** Keep the generated icon package unchanged. Add docs-local metadata/rendering helpers beside the MDX page, and test that metadata stays complete against the package root exports. Let the existing MDX route glob discover the new page automatically.

**Tech Stack:** SolidJS, MDX docs pages, Vitest, `@solidjs/testing-library`, `@solid-ant-design/icons`.

---

## File Structure

- Create: `apps/docs/src/pages/components/icon-list.tsx`
  - Imports all generated icon exports from `@solid-ant-design/icons`.
  - Builds `allIcons`, `outlinedIcons`, `filledIcons`, and `twoToneIcons`.
  - Exports `IconGrid` and `IconSample` rendering helpers for the MDX page.
- Create: `apps/docs/src/pages/components/icon-list.test.tsx`
  - Verifies metadata completeness against package exports.
  - Verifies categorization and a small render smoke test.
- Create: `apps/docs/src/pages/components/icon.mdx`
  - Adds the visible Icon docs page and demos.
- Modify: `apps/docs/src/routes/index.test.ts`
  - Adds `/components/icon` to the route discovery assertion.

### Task 1: Add Failing Route Discovery Test

**Files:**

- Modify: `apps/docs/src/routes/index.test.ts`

- [ ] **Step 1: Update the route discovery test**

In `apps/docs/src/routes/index.test.ts`, update the `discovers the migrated docs site from MDX page files without legacy TSX pages` test to include `/components/icon`:

```ts
it('discovers the migrated docs site from MDX page files without legacy TSX pages', () => {
  expect(routes.map((route) => route.path)).toContain('/')
  expect(routes.map((route) => route.path)).toContain('/components/button')
  expect(routes.map((route) => route.path)).toContain('/components/icon')
  expect(routes.map((route) => route.path)).toContain('/docs/getting-started')
})
```

- [ ] **Step 2: Run the route test and verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/index.test.ts
```

Expected: FAIL because `/components/icon` is not discovered yet.

- [ ] **Step 3: Commit the failing route test**

```bash
git add apps/docs/src/routes/index.test.ts
git commit -m "test(docs): expect icon docs route"
```

### Task 2: Add Failing Icon Metadata Tests

**Files:**

- Create: `apps/docs/src/pages/components/icon-list.test.tsx`

- [ ] **Step 1: Create the failing test file**

Create `apps/docs/src/pages/components/icon-list.test.tsx` with this content:

```tsx
import * as Icons from '@solid-ant-design/icons'
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { IconGrid, allIcons, filledIcons, outlinedIcons, twoToneIcons } from './icon-list'

const iconExportNames = Object.keys(Icons)
  .filter(
    (name) => name.endsWith('Outlined') || name.endsWith('Filled') || name.endsWith('TwoTone'),
  )
  .sort()

describe('icon docs metadata', () => {
  it('lists every generated icon export exactly once', () => {
    const metadataNames = allIcons.map((icon) => icon.name).sort()

    expect(metadataNames).toEqual(iconExportNames)
    expect(new Set(metadataNames).size).toBe(metadataNames.length)
    expect(metadataNames).toHaveLength(831)
  })

  it('groups icons by generated component suffix', () => {
    expect(outlinedIcons).toHaveLength(447)
    expect(filledIcons).toHaveLength(234)
    expect(twoToneIcons).toHaveLength(150)

    expect(outlinedIcons.every((icon) => icon.category === 'Outlined')).toBe(true)
    expect(filledIcons.every((icon) => icon.category === 'Filled')).toBe(true)
    expect(twoToneIcons.every((icon) => icon.category === 'TwoTone')).toBe(true)
  })

  it('renders icon grid tiles with svg icons and component names', () => {
    const result = render(() => <IconGrid title="Outlined" icons={outlinedIcons.slice(0, 3)} />)

    expect(result.getByRole('heading', { name: 'Outlined' })).toBeInTheDocument()
    expect(result.getByText(outlinedIcons[0].name)).toBeInTheDocument()
    expect(result.container.querySelectorAll('svg')).toHaveLength(3)
  })
})
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/pages/components/icon-list.test.tsx
```

Expected: FAIL because `./icon-list` does not exist.

- [ ] **Step 3: Commit the failing metadata test**

```bash
git add apps/docs/src/pages/components/icon-list.test.tsx
git commit -m "test(docs): cover icon docs metadata"
```

### Task 3: Implement Icon Metadata and Grid Helpers

**Files:**

- Create: `apps/docs/src/pages/components/icon-list.tsx`

- [ ] **Step 1: Create `icon-list.tsx`**

Create `apps/docs/src/pages/components/icon-list.tsx` with this content:

```tsx
import * as Icons from '@solid-ant-design/icons'
import { For, type Component, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import type { IconProps } from '@solid-ant-design/icons'

export type IconCategory = 'Outlined' | 'Filled' | 'TwoTone'

export type IconMeta = {
  name: string
  category: IconCategory
  component: Component<IconProps>
}

const categorySuffixes: IconCategory[] = ['Outlined', 'Filled', 'TwoTone']

function categoryFromName(name: string): IconCategory | undefined {
  return categorySuffixes.find((category) => name.endsWith(category))
}

export const allIcons: IconMeta[] = Object.entries(Icons)
  .map(([name, component]) => {
    const category = categoryFromName(name)

    if (!category) {
      return undefined
    }

    return {
      name,
      category,
      component: component as Component<IconProps>,
    }
  })
  .filter((icon): icon is IconMeta => icon !== undefined)
  .sort((first, second) => first.name.localeCompare(second.name))

export const outlinedIcons = allIcons.filter((icon) => icon.category === 'Outlined')
export const filledIcons = allIcons.filter((icon) => icon.category === 'Filled')
export const twoToneIcons = allIcons.filter((icon) => icon.category === 'TwoTone')

export function IconSample(props: { name: string; children: JSX.Element }) {
  return (
    <div class="docs-border flex min-h-24 flex-col items-center justify-center gap-2 rounded border px-2 py-3 text-center">
      <div class="text-2xl leading-none text-blue-600">{props.children}</div>
      <span class="docs-text-secondary max-w-full break-all text-xs leading-4">{props.name}</span>
    </div>
  )
}

export function IconGrid(props: { title: string; icons: IconMeta[] }) {
  return (
    <section class="my-8">
      <h3>{props.title}</h3>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <For each={props.icons}>
          {(icon) => (
            <IconSample name={icon.name}>
              <Dynamic component={icon.component} aria-label={icon.name} />
            </IconSample>
          )}
        </For>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Run the metadata test and verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/pages/components/icon-list.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run typecheck for the docs package**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit metadata implementation**

```bash
git add apps/docs/src/pages/components/icon-list.tsx
git commit -m "feat(docs): add icon docs metadata"
```

### Task 4: Add Icon MDX Page

**Files:**

- Create: `apps/docs/src/pages/components/icon.mdx`

- [ ] **Step 1: Create `icon.mdx`**

Create `apps/docs/src/pages/components/icon.mdx` with this content:

````mdx
import { IconGrid, filledIcons, outlinedIcons, twoToneIcons } from './icon-list'

# Icon

Semantic vector graphics from `@solid-ant-design/icons`.

```tsx pure
import { SearchOutlined } from '@solid-ant-design/icons'
```

### Basic usage

```tsx
import { Space } from '@solid-ant-design/core'
import {
  AccountBookTwoTone,
  CheckCircleFilled,
  HomeOutlined,
  SettingFilled,
  SmileOutlined,
} from '@solid-ant-design/icons'
import { IconSample } from './icon-list'

const Demo1 = function () {
  return (
    <Space wrap>
      <IconSample name="HomeOutlined">
        <HomeOutlined aria-label="HomeOutlined" />
      </IconSample>
      <IconSample name="SmileOutlined">
        <SmileOutlined aria-label="SmileOutlined" />
      </IconSample>
      <IconSample name="CheckCircleFilled">
        <CheckCircleFilled aria-label="CheckCircleFilled" />
      </IconSample>
      <IconSample name="SettingFilled">
        <SettingFilled aria-label="SettingFilled" />
      </IconSample>
      <IconSample name="AccountBookTwoTone">
        <AccountBookTwoTone aria-label="AccountBookTwoTone" />
      </IconSample>
    </Space>
  )
}

export default Demo1
```

### Spin and rotate

```tsx
import { Space } from '@solid-ant-design/core'
import { LoadingOutlined, SmileOutlined, SyncOutlined } from '@solid-ant-design/icons'
import { IconSample } from './icon-list'

const Demo2 = function () {
  return (
    <Space wrap>
      <IconSample name="LoadingOutlined spin">
        <LoadingOutlined aria-label="LoadingOutlined" spin />
      </IconSample>
      <IconSample name="SyncOutlined spin">
        <SyncOutlined aria-label="SyncOutlined" spin />
      </IconSample>
      <IconSample name="SmileOutlined rotate">
        <SmileOutlined aria-label="SmileOutlined" rotate={180} />
      </IconSample>
    </Space>
  )
}

export default Demo2
```

### Two tone color

```tsx
import { Space } from '@solid-ant-design/core'
import { AccountBookTwoTone, HeartTwoTone } from '@solid-ant-design/icons'
import { IconSample } from './icon-list'

const Demo3 = function () {
  return (
    <Space wrap>
      <IconSample name="HeartTwoTone">
        <HeartTwoTone aria-label="HeartTwoTone" />
      </IconSample>
      <IconSample name="HeartTwoTone string">
        <HeartTwoTone aria-label="HeartTwoTone" twoToneColor="#eb2f96" />
      </IconSample>
      <IconSample name="AccountBookTwoTone tuple">
        <AccountBookTwoTone aria-label="AccountBookTwoTone" twoToneColor={['#52c41a', '#f6ffed']} />
      </IconSample>
    </Space>
  )
}

export default Demo3
```

## All icons

<IconGrid title="Outlined" icons={outlinedIcons} />
<IconGrid title="Filled" icons={filledIcons} />
<IconGrid title="TwoTone" icons={twoToneIcons} />

## API

Icon components accept standard Solid SVG props and the common icon props below.

| Property       | Description                                      | Type                                             | Default |
| -------------- | ------------------------------------------------ | ------------------------------------------------ | ------- |
| `spin`         | Rotates the icon continuously.                   | `boolean`                                        | `false` |
| `rotate`       | Rotates the icon by degrees.                     | `number`                                         | `-`     |
| `twoToneColor` | Sets two-tone primary or primary/secondary fill. | `string \| [primary: string, secondary: string]` | `-`     |

Decorative icons are rendered with `aria-hidden="true"` by default. Provide `aria-label` or
`aria-labelledby` when an icon carries semantic meaning.
````

- [ ] **Step 2: Run route test and verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/index.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run docs tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
```

Expected: PASS.

- [ ] **Step 4: Run docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit the Icon MDX page**

```bash
git add apps/docs/src/pages/components/icon.mdx apps/docs/src/routes/index.test.ts
git commit -m "feat(docs): add icon page"
```

### Task 5: Polish, Format, and Full Verification

**Files:**

- Review: `apps/docs/src/pages/components/icon-list.tsx`
- Review: `apps/docs/src/pages/components/icon.mdx`
- Review: `apps/docs/src/pages/components/icon-list.test.tsx`

- [ ] **Step 1: Run formatter**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Expected: Files are formatted. Review the diff to ensure only intentional formatting changes are present. Do not revert user-owned unrelated changes.

- [ ] **Step 2: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 3: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If the existing `docs/superpowers/plans/2026-06-11-tabs-antd-6-api.md` formatting issue still appears and is unrelated, report it separately instead of editing it unless the user approves.

- [ ] **Step 4: Run workspace typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 5: Run workspace tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 6: Run workspace build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 7: Final commit**

If formatting or verification fixes changed files after Task 4, commit them:

```bash
git add apps/docs/src/pages/components/icon-list.tsx apps/docs/src/pages/components/icon-list.test.tsx apps/docs/src/pages/components/icon.mdx apps/docs/src/routes/index.test.ts
git commit -m "chore(docs): verify icon page"
```
