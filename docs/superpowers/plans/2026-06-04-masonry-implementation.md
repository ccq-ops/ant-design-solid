# Masonry Component Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Ant Design compatible `Masonry` component to `@ant-design-solid/core` with docs examples.

**Architecture:** The component normalizes items/children, resolves responsive column and gutter values, then assigns items into balanced columns using measured DOM heights when available and deterministic round-robin fallback before measurement. Styling follows existing `useStyleRegister` component patterns with `ads-masonry` class names and CSS variables for gutter.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, @ant-design-solid/cssinjs, local docs app routes.

---

## File Structure

- Create `packages/components/src/masonry/interface.ts`: public types and props.
- Create `packages/components/src/masonry/responsive.ts`: breakpoint constants and responsive value resolver.
- Create `packages/components/src/masonry/masonry.style.ts`: css-in-js styles.
- Create `packages/components/src/masonry/masonry.tsx`: Solid component implementation.
- Create `packages/components/src/masonry/index.ts`: public exports.
- Create `packages/components/src/masonry/__tests__/masonry.test.tsx`: behavior tests.
- Modify `packages/components/src/index.ts`: export Masonry.
- Create `apps/docs/src/routes/components/masonry.tsx`: docs examples.
- Modify `apps/docs/src/site/nav.ts`: add Masonry nav item.

## Task 1: Public Types and Responsive Resolver

**Files:**
- Create: `packages/components/src/masonry/interface.ts`
- Create: `packages/components/src/masonry/responsive.ts`
- Create: `packages/components/src/masonry/__tests__/masonry.test.tsx`

- [ ] **Step 1: Write failing tests for responsive behavior via the component API**

Add `packages/components/src/masonry/__tests__/masonry.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { Masonry } from '../index'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

afterEach(() => {
  setViewportWidth(1024)
})

describe('Masonry', () => {
  it('resolves responsive columns and gutter from the active breakpoint', () => {
    setViewportWidth(800)

    const result = render(() => (
      <Masonry
        columns={{ xs: 1, md: 3, xl: 5 }}
        gutter={{ xs: 4, md: 12, xl: 24 }}
        items={[{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }, { key: 'c', title: 'C' }]}
        itemRender={(item) => <div>{item.title}</div>}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(result.container.querySelectorAll('.ads-masonry-column')).toHaveLength(3)
    expect(root.style.getPropertyValue('--ads-masonry-gutter')).toBe('12px')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- masonry
```

Expected: FAIL because `../index` and `Masonry` do not exist.

- [ ] **Step 3: Add public types and responsive resolver**

Create `packages/components/src/masonry/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type MasonryBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type MasonryResponsiveValue<T> = T | Partial<Record<MasonryBreakpoint, T>>
export type MasonryItemKey = string | number

export interface MasonryItem {
  key?: MasonryItemKey
  [key: string]: unknown
}

export interface MasonryLayoutItem<T = MasonryItem> {
  key: MasonryItemKey
  item: T
  index: number
  column: number
  height: number
}

export interface MasonryLayoutInfo<T = MasonryItem> {
  columns: number
  columnHeights: number[]
  items: MasonryLayoutItem<T>[]
}

export interface MasonryProps<T extends MasonryItem = MasonryItem> {
  prefixCls?: string
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties | string
  columns?: MasonryResponsiveValue<number>
  gutter?: MasonryResponsiveValue<number | string>
  items?: T[]
  itemRender?: (item: T, index: number) => JSX.Element
  children?: JSX.Element
  fresh?: boolean
  classNames?: {
    item?: string
  }
  styles?: {
    item?: JSX.CSSProperties | string
  }
  onLayoutChange?: (info: MasonryLayoutInfo<T>) => void
}
```

Create `packages/components/src/masonry/responsive.ts`:

```ts
import type { MasonryBreakpoint, MasonryResponsiveValue } from './interface'

export const MASONRY_BREAKPOINTS: Record<MasonryBreakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
}

const orderedBreakpoints = Object.entries(MASONRY_BREAKPOINTS) as [MasonryBreakpoint, number][]

function isResponsiveObject<T>(value: MasonryResponsiveValue<T> | undefined): value is Partial<Record<MasonryBreakpoint, T>> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function resolveResponsiveValue<T>(
  value: MasonryResponsiveValue<T> | undefined,
  fallback: T,
  width: number,
): T {
  if (!isResponsiveObject(value)) return value ?? fallback

  let resolved = fallback
  for (const [breakpoint, minWidth] of orderedBreakpoints) {
    if (width >= minWidth && value[breakpoint] !== undefined) {
      resolved = value[breakpoint] as T
    }
  }
  return resolved
}

export function formatMasonryGap(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value
}
```

- [ ] **Step 4: Add minimal component shell to satisfy imports**

Create `packages/components/src/masonry/index.ts`:

```ts
export { Masonry } from './masonry'
export type {
  MasonryBreakpoint,
  MasonryItem,
  MasonryItemKey,
  MasonryLayoutInfo,
  MasonryLayoutItem,
  MasonryProps,
  MasonryResponsiveValue,
} from './interface'
```

Create `packages/components/src/masonry/masonry.tsx` with the minimal implementation needed for this test:

```tsx
import { createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { MasonryItem, MasonryProps } from './interface'
import { formatMasonryGap, resolveResponsiveValue } from './responsive'

const DEFAULT_COLUMNS = 4
const DEFAULT_GUTTER = 16

function getWindowWidth() {
  return typeof window === 'undefined' ? 1024 : window.innerWidth
}

export function Masonry<T extends MasonryItem = MasonryItem>(props: MasonryProps<T>) {
  const [local] = splitProps(props, [
    'prefixCls',
    'class',
    'classList',
    'style',
    'columns',
    'gutter',
    'items',
    'itemRender',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-masonry`
  const [viewportWidth, setViewportWidth] = createSignal(getWindowWidth())

  const handleResize = () => setViewportWidth(getWindowWidth())
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    onCleanup(() => window.removeEventListener('resize', handleResize))
  }

  const columnCount = () => Math.max(1, Math.floor(resolveResponsiveValue(local.columns, DEFAULT_COLUMNS, viewportWidth())))
  const gutter = () => formatMasonryGap(resolveResponsiveValue(local.gutter, DEFAULT_GUTTER, viewportWidth()))

  return (
    <div
      class={classNames(prefixCls(), local.class)}
      classList={local.classList}
      style={{ '--ads-masonry-gutter': gutter(), ...(typeof local.style === 'object' ? local.style : {}) }}
    >
      {Array.from({ length: columnCount() }, (_, columnIndex) => (
        <div class={`${prefixCls()}-column`}>
          {(local.items ?? [])
            .filter((_, itemIndex) => itemIndex % columnCount() === columnIndex)
            .map((item, itemIndex) => local.itemRender?.(item, itemIndex))}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- masonry
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/masonry
git commit -m "feat: add masonry responsive foundation"
```

## Task 2: Full Rendering, Slots, and Layout Callback

**Files:**
- Modify: `packages/components/src/masonry/masonry.tsx`
- Modify: `packages/components/src/masonry/__tests__/masonry.test.tsx`

- [ ] **Step 1: Add failing tests for default distribution, custom slots, children, and layout callback**

Append these tests inside the existing `describe('Masonry', () => { ... })` block:

```tsx
  it('renders four columns by default and distributes item mode content round-robin before measurement', () => {
    const result = render(() => (
      <Masonry
        items={[
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
          { key: 'd', title: 'D' },
          { key: 'e', title: 'E' },
        ]}
        itemRender={(item) => <span>{item.title}</span>}
      />
    ))

    const columns = result.container.querySelectorAll('.ads-masonry-column')
    expect(columns).toHaveLength(4)
    expect(columns[0]).toHaveTextContent('A')
    expect(columns[0]).toHaveTextContent('E')
    expect(columns[1]).toHaveTextContent('B')
    expect(columns[2]).toHaveTextContent('C')
    expect(columns[3]).toHaveTextContent('D')
  })

  it('applies item classNames and styles', () => {
    const result = render(() => (
      <Masonry
        columns={2}
        items={[{ key: 'a', title: 'A' }]}
        itemRender={(item) => <span>{item.title}</span>}
        classNames={{ item: 'custom-item' }}
        styles={{ item: { color: 'red' } }}
      />
    ))

    const item = result.container.querySelector<HTMLElement>('.ads-masonry-item')!
    expect(item).toHaveClass('custom-item')
    expect(item).toHaveStyle({ color: 'red' })
  })

  it('renders children when items are omitted', () => {
    const result = render(() => (
      <Masonry columns={2}>
        <div>First child</div>
        <div>Second child</div>
      </Masonry>
    ))

    expect(result.container.querySelectorAll('.ads-masonry-item')).toHaveLength(2)
    expect(result.container).toHaveTextContent('First child')
    expect(result.container).toHaveTextContent('Second child')
  })

  it('calls onLayoutChange with column and item layout information', () => {
    let layoutColumns = 0
    let layoutItemCount = 0

    render(() => (
      <Masonry
        columns={2}
        items={[{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }]}
        itemRender={(item) => <span>{item.title}</span>}
        onLayoutChange={(info) => {
          layoutColumns = info.columns
          layoutItemCount = info.items.length
        }}
      />
    ))

    expect(layoutColumns).toBe(2)
    expect(layoutItemCount).toBe(2)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- masonry
```

Expected: FAIL because item wrappers, children mode, and callback behavior are incomplete.

- [ ] **Step 3: Replace component with complete layout implementation**

Replace `packages/components/src/masonry/masonry.tsx` with:

```tsx
import { children, createEffect, createMemo, createSignal, on, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { MasonryItem, MasonryItemKey, MasonryLayoutItem, MasonryProps } from './interface'
import { formatMasonryGap, resolveResponsiveValue } from './responsive'
import { useMasonryStyle } from './masonry.style'
import type { JSX } from 'solid-js'

const DEFAULT_COLUMNS = 4
const DEFAULT_GUTTER = 16

interface NormalizedItem<T> {
  key: MasonryItemKey
  item: T
  index: number
  node: JSX.Element
}

function getWindowWidth() {
  return typeof window === 'undefined' ? 1024 : window.innerWidth
}

function mergeStyle(base: JSX.CSSProperties, style: MasonryProps['style']): JSX.CSSProperties | string {
  if (typeof style === 'string') {
    const declarations = Object.entries(base)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
    return `${declarations}; ${style}`
  }
  return { ...base, ...style }
}

function distributeRoundRobin<T>(items: NormalizedItem<T>[], columnCount: number): NormalizedItem<T>[][] {
  const columns = Array.from({ length: columnCount }, () => [] as NormalizedItem<T>[])
  items.forEach((item, index) => columns[index % columnCount].push(item))
  return columns
}

function distributeByHeight<T>(
  items: NormalizedItem<T>[],
  columnCount: number,
  heights: Map<MasonryItemKey, number>,
): NormalizedItem<T>[][] {
  const columns = Array.from({ length: columnCount }, () => [] as NormalizedItem<T>[])
  const columnHeights = Array.from({ length: columnCount }, () => 0)

  items.forEach((item) => {
    let targetColumn = 0
    for (let index = 1; index < columnHeights.length; index += 1) {
      if (columnHeights[index] < columnHeights[targetColumn]) targetColumn = index
    }
    columns[targetColumn].push(item)
    columnHeights[targetColumn] += heights.get(item.key) ?? 0
  })

  return columns
}

export function Masonry<T extends MasonryItem = MasonryItem>(props: MasonryProps<T>) {
  const [local] = splitProps(props, [
    'prefixCls',
    'class',
    'classList',
    'style',
    'columns',
    'gutter',
    'items',
    'itemRender',
    'children',
    'fresh',
    'classNames',
    'styles',
    'onLayoutChange',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-masonry`
  const [, hashId] = useMasonryStyle(prefixCls())
  const resolvedChildren = children(() => local.children)
  const [viewportWidth, setViewportWidth] = createSignal(getWindowWidth())
  const [measuredHeights, setMeasuredHeights] = createSignal(new Map<MasonryItemKey, number>())
  const itemElements = new Map<MasonryItemKey, HTMLElement>()
  const observers: ResizeObserver[] = []

  const handleResize = () => setViewportWidth(getWindowWidth())
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    onCleanup(() => window.removeEventListener('resize', handleResize))
  }

  onCleanup(() => {
    observers.forEach((observer) => observer.disconnect())
    observers.length = 0
    itemElements.clear()
  })

  const columnCount = () =>
    Math.max(1, Math.floor(resolveResponsiveValue(local.columns, DEFAULT_COLUMNS, viewportWidth())))
  const gutter = () =>
    formatMasonryGap(resolveResponsiveValue(local.gutter, DEFAULT_GUTTER, viewportWidth()))

  const normalizedItems = createMemo<NormalizedItem<T>[]>(() => {
    if (local.items) {
      return local.items.map((item, index) => ({
        key: item.key ?? index,
        item,
        index,
        node: local.itemRender ? local.itemRender(item, index) : String(item.key ?? index),
      }))
    }

    const nodes = resolvedChildren.toArray()
    return nodes.map((node, index) => ({
      key: index,
      item: { key: index } as T,
      index,
      node,
    }))
  })

  const columns = createMemo(() => {
    const items = normalizedItems()
    const count = columnCount()
    const heights = measuredHeights()
    if (heights.size === 0) return distributeRoundRobin(items, count)
    return distributeByHeight(items, count, heights)
  })

  const updateHeight = (key: MasonryItemKey, element: HTMLElement) => {
    const height = element.offsetHeight
    setMeasuredHeights((previous) => {
      if (!local.fresh && previous.get(key) === height) return previous
      const next = new Map(previous)
      next.set(key, height)
      return next
    })
  }

  const registerItem = (key: MasonryItemKey, element: HTMLElement) => {
    itemElements.set(key, element)
    updateHeight(key, element)

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateHeight(key, element))
      observer.observe(element)
      observers.push(observer)
    }
  }

  createEffect(
    on(
      [columns, measuredHeights],
      () => {
        const heights = measuredHeights()
        const layoutItems: MasonryLayoutItem<T>[] = []
        const columnHeights = columns().map((column, columnIndex) => {
          let total = 0
          column.forEach((item) => {
            const height = heights.get(item.key) ?? 0
            total += height
            layoutItems.push({
              key: item.key,
              item: item.item,
              index: item.index,
              column: columnIndex,
              height,
            })
          })
          return total
        })

        local.onLayoutChange?.({ columns: columnCount(), columnHeights, items: layoutItems })
      },
      { defer: false },
    ),
  )

  return (
    <div
      class={classNames(prefixCls(), hashId(), local.class)}
      classList={local.classList}
      style={mergeStyle({ '--ads-masonry-gutter': gutter() }, local.style)}
    >
      {columns().map((column) => (
        <div class={`${prefixCls()}-column`}>
          {column.map((item) => (
            <div
              ref={(element) => registerItem(item.key, element)}
              class={classNames(`${prefixCls()}-item`, local.classNames?.item)}
              style={local.styles?.item}
            >
              {item.node}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Add style module used by the implementation**

Create `packages/components/src/masonry/masonry.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useMasonryStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Masonry', prefixCls] },
    () => ({
      [`.${prefixCls}`]: {
        display: 'grid',
        'grid-template-columns': 'repeat(var(--ads-masonry-columns, auto-fit), minmax(0, 1fr))',
        gap: 'var(--ads-masonry-gutter, 16px)',
        width: '100%',
        'box-sizing': 'border-box',
      },
      [`.${prefixCls}-column`]: {
        display: 'flex',
        'flex-direction': 'column',
        gap: 'var(--ads-masonry-gutter, 16px)',
        'min-width': 0,
      },
      [`.${prefixCls}-item`]: {
        width: '100%',
        'box-sizing': 'border-box',
      },
    }),
  )
}
```

Also update the root style in `masonry.tsx` so columns are represented:

```tsx
style={mergeStyle(
  {
    '--ads-masonry-gutter': gutter(),
    '--ads-masonry-columns': columnCount(),
  },
  local.style,
)}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- masonry
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/masonry
git commit -m "feat: implement masonry layout"
```

## Task 3: Public Export and Docs Page

**Files:**
- Modify: `packages/components/src/index.ts`
- Create: `apps/docs/src/routes/components/masonry.tsx`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Add failing docs/import check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
```

Expected after creating docs import first: FAIL if `Masonry` is not exported from core.

- [ ] **Step 2: Export component from core package**

Append to `packages/components/src/index.ts` near layout/data-display exports:

```ts
export * from './masonry'
```

- [ ] **Step 3: Create docs page**

Create `apps/docs/src/routes/components/masonry.tsx`:

```tsx
import { createSignal } from 'solid-js'
import { Button, Card, Masonry, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const baseItems = [
  { key: 1, title: 'Mountain', height: 120, color: '#e6f4ff' },
  { key: 2, title: 'Forest', height: 180, color: '#f6ffed' },
  { key: 3, title: 'River', height: 96, color: '#fff7e6' },
  { key: 4, title: 'City', height: 150, color: '#f9f0ff' },
  { key: 5, title: 'Desert', height: 110, color: '#fff1f0' },
  { key: 6, title: 'Ocean', height: 210, color: '#e6fffb' },
]

function DemoCard(props: { title: string; height: number; color: string }) {
  return (
    <Card title={props.title} style={{ background: props.color }}>
      <div style={{ height: `${props.height}px`, color: '#666' }}>
        Variable-height content creates the waterfall layout.
      </div>
    </Card>
  )
}

export default function MasonryPage() {
  const [items, setItems] = createSignal(baseItems)

  return (
    <>
      <h1>Masonry</h1>
      <p>Display variable-height content in balanced columns.</p>

      <DemoBlock
        title="Basic"
        code={`<Masonry
  items={items}
  itemRender={(item) => <Card title={item.title}>Content</Card>}
/>`}
      >
        <Masonry
          items={baseItems}
          itemRender={(item) => (
            <DemoCard title={item.title} height={item.height} color={item.color} />
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Responsive"
        code={`<Masonry columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }} gutter={{ xs: 8, md: 16 }} />`}
      >
        <Masonry
          columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
          gutter={{ xs: 8, md: 16, xl: 24 }}
          items={baseItems}
          itemRender={(item) => (
            <DemoCard title={item.title} height={item.height} color={item.color} />
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Gallery"
        code={`<Masonry columns={3} gutter={12} items={photos} itemRender={(photo) => <img src={photo.src} />} />`}
      >
        <Masonry
          columns={3}
          gutter={12}
          items={baseItems}
          itemRender={(item) => (
            <div
              style={{
                height: `${item.height + 80}px`,
                background: `linear-gradient(135deg, ${item.color}, #ffffff)`,
                border: '1px solid #f0f0f0',
                'border-radius': '8px',
                display: 'flex',
                'align-items': 'end',
                padding: '12px',
                'box-sizing': 'border-box',
              }}
            >
              {item.title}
            </div>
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Dynamic items"
        code={`<Masonry fresh items={items()} itemRender={(item) => <Card title={item.title}>...</Card>} />`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            onClick={() =>
              setItems((previous) => [
                ...previous,
                {
                  key: Date.now(),
                  title: `New ${previous.length + 1}`,
                  height: 80 + ((previous.length * 37) % 140),
                  color: '#f0f5ff',
                },
              ])
            }
          >
            Add item
          </Button>
          <Masonry
            fresh
            columns={{ xs: 1, md: 3 }}
            items={items()}
            itemRender={(item) => (
              <DemoCard title={item.title} height={item.height} color={item.color} />
            )}
          />
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          <code>columns</code> sets the number of columns, or a responsive breakpoint map.
        </li>
        <li>
          <code>gutter</code> sets spacing between columns and items.
        </li>
        <li>
          <code>items</code> and <code>itemRender</code> render data-driven content.
        </li>
        <li>
          <code>fresh</code> recomputes layout when measured item heights are refreshed.
        </li>
        <li>
          <code>onLayoutChange</code> receives column count, column heights, and item placement.
        </li>
      </ul>
    </>
  )
}
```

- [ ] **Step 4: Add nav entry**

Insert this item in `apps/docs/src/site/nav.ts` near `List`/`Card` data-display routes:

```ts
{ path: '/components/masonry', label: 'Masonry' },
```

- [ ] **Step 5: Run docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/index.ts apps/docs/src/routes/components/masonry.tsx apps/docs/src/site/nav.ts
git commit -m "docs: add masonry examples"
```

## Task 4: Final Verification and Formatting

**Files:**
- Modify only files reported by format/lint/typecheck if needed.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS. Fix exact reported issues before continuing.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If it fails, run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format`, then re-run the check.

- [ ] **Step 3: Run typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS. Fix exact reported issues before continuing.

- [ ] **Step 4: Run tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS. Fix exact reported issues before continuing.

- [ ] **Step 5: Run build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS. Fix exact reported issues before continuing.

- [ ] **Step 6: Commit final fixes if any**

```bash
git status --short
git add packages/components/src/masonry packages/components/src/index.ts apps/docs/src/routes/components/masonry.tsx apps/docs/src/site/nav.ts
git commit -m "chore: verify masonry implementation"
```

Only commit if there are staged changes.

## Self-Review

- Spec coverage: public API, responsive values, layout callback, docs examples, exports, tests, and verification are all covered by Tasks 1-4.
- Placeholder scan: no TBD/TODO/later placeholders remain.
- Type consistency: public names match the design spec: `Masonry`, `MasonryProps`, `MasonryResponsiveValue`, `MasonryLayoutInfo`, `columns`, `gutter`, `items`, `itemRender`, `fresh`, `classNames`, `styles`, `onLayoutChange`.
