# Data Display Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `Statistic`, `Descriptions`, and `List` components with tests, styles, exports, and docs pages.

**Architecture:** Each component follows the existing `packages/components/src/<component>/` convention with `interface.ts`, component `.tsx`, `.style.ts`, `index.ts`, and colocated tests. Components use `useConfig()` for the `ads-*` prefix, `useStyleRegister()` for scoped css-in-js, and `classNames()` for class merging. Docs routes are standalone pages under `apps/docs/src/routes/components/` and public exports are added to `packages/components/src/index.ts`.

**Tech Stack:** SolidJS, TypeScript, @solid-ant-design/cssinjs, @solidjs/testing-library, Vitest, Vite, pnpm.

---

## File Structure

Create:

- `packages/components/src/statistic/interface.ts` — public types for `Statistic`.
- `packages/components/src/statistic/statistic.tsx` — `Statistic` implementation and value formatting.
- `packages/components/src/statistic/statistic.style.ts` — scoped styles for base, title, value, prefix/suffix, and loading.
- `packages/components/src/statistic/index.ts` — component exports.
- `packages/components/src/statistic/__tests__/statistic.test.tsx` — unit tests.
- `apps/docs/src/routes/components/statistic.tsx` — docs/demo page.
- `packages/components/src/descriptions/interface.ts` — public types for `Descriptions` and `Descriptions.Item`.
- `packages/components/src/descriptions/descriptions.tsx` — normalization and layout rendering.
- `packages/components/src/descriptions/descriptions.style.ts` — scoped styles for bordered/unbordered, sizes, horizontal/vertical layouts.
- `packages/components/src/descriptions/index.ts` — component exports.
- `packages/components/src/descriptions/__tests__/descriptions.test.tsx` — unit tests.
- `apps/docs/src/routes/components/descriptions.tsx` — docs/demo page.
- `packages/components/src/list/interface.ts` — public types for `List`, `List.Item`, and `List.Item.Meta`.
- `packages/components/src/list/list.tsx` — list rendering and static subcomponents.
- `packages/components/src/list/list.style.ts` — scoped styles for header/footer/body/items/meta/actions/loading/empty.
- `packages/components/src/list/index.ts` — component exports.
- `packages/components/src/list/__tests__/list.test.tsx` — unit tests.
- `apps/docs/src/routes/components/list.tsx` — docs/demo page.

Modify:

- `packages/components/src/index.ts` — export new components.
- `apps/docs/src/site/nav.ts` — add nav entries for Statistic, Descriptions, and List.

Do not modify `apps/docs/src/site/routes.ts`; it uses `import.meta.glob` and will pick up new docs route files automatically.

---

### Task 1: Add Statistic

**Files:**

- Create: `packages/components/src/statistic/interface.ts`
- Create: `packages/components/src/statistic/statistic.tsx`
- Create: `packages/components/src/statistic/statistic.style.ts`
- Create: `packages/components/src/statistic/index.ts`
- Create: `packages/components/src/statistic/__tests__/statistic.test.tsx`
- Create: `apps/docs/src/routes/components/statistic.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write the failing Statistic tests**

Create `packages/components/src/statistic/__tests__/statistic.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Statistic } from '../index'

describe('Statistic', () => {
  it('renders title and value with default classes', () => {
    const result = render(() => (
      <Statistic title="Active users" value={112893} data-testid="stat" />
    ))
    const stat = result.getByTestId('stat')

    expect(stat.className).toContain('ads-statistic')
    expect(result.getByText('Active users')).toHaveClass('ads-statistic-title')
    expect(result.getByText('112893')).toHaveClass('ads-statistic-content-value')
  })

  it('formats numeric values with precision', () => {
    const result = render(() => <Statistic value={93.456} precision={2} />)

    expect(result.getByText('93.46')).toHaveClass('ads-statistic-content-value')
  })

  it('renders prefix, suffix, class, and value style', () => {
    const result = render(() => (
      <Statistic
        class="custom-stat"
        value={12}
        prefix={<span data-testid="prefix">$</span>}
        suffix={<span data-testid="suffix">USD</span>}
        valueStyle={{ color: 'red' }}
        data-testid="stat"
      />
    ))
    const stat = result.getByTestId('stat')
    const value = result.getByText('12')

    expect(stat.className).toContain('custom-stat')
    expect(result.getByTestId('prefix')).toHaveClass('ads-statistic-content-prefix')
    expect(result.getByTestId('suffix')).toHaveClass('ads-statistic-content-suffix')
    expect(value.parentElement).toHaveStyle({ color: 'red' })
  })

  it('renders loading placeholder instead of value content', () => {
    const result = render(() => <Statistic title="Revenue" value={100} loading />)

    expect(result.getByText('Revenue')).toHaveClass('ads-statistic-title')
    expect(result.container.querySelector('.ads-statistic-content-value')).toBeNull()
    expect(result.container.querySelector('.ads-statistic-loading')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run Statistic tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- statistic.test.tsx
```

Expected: FAIL because `packages/components/src/statistic/index.ts` and `Statistic` do not exist.

- [ ] **Step 3: Add Statistic types**

Create `packages/components/src/statistic/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export interface StatisticProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: JSX.Element
  value?: string | number
  precision?: number
  prefix?: JSX.Element
  suffix?: JSX.Element
  loading?: boolean
  valueStyle?: JSX.CSSProperties | string
}
```

- [ ] **Step 4: Add Statistic styles**

Create `packages/components/src/statistic/statistic.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useStatisticStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Statistic', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
        },
        [`.${prefixCls}-title`]: {
          'margin-bottom': `${t.marginXXS}px`,
          color: t.colorTextSecondary,
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-content`]: {
          display: 'inline-flex',
          'align-items': 'baseline',
          color: t.colorText,
          'font-size': `${t.fontSizeHeading3}px`,
          'line-height': 1.2,
        },
        [`.${prefixCls}-content-prefix`]: {
          'margin-inline-end': `${t.marginXXS}px`,
        },
        [`.${prefixCls}-content-suffix`]: {
          'margin-inline-start': `${t.marginXXS}px`,
          'font-size': `${t.fontSize}px`,
        },
        [`.${prefixCls}-content-value`]: {
          display: 'inline-block',
        },
        [`.${prefixCls}-loading`]: {
          width: 96,
          height: t.fontSizeHeading3,
          background: `linear-gradient(90deg, ${t.colorFillSecondary} 25%, ${t.colorFill} 37%, ${t.colorFillSecondary} 63%)`,
          'background-size': '400% 100%',
          'border-radius': `${t.borderRadiusSM}px`,
        },
      }
    },
  )
}
```

- [ ] **Step 5: Add Statistic implementation**

Create `packages/components/src/statistic/statistic.tsx`:

```tsx
import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { StatisticProps } from './interface'
import { useStatisticStyle } from './statistic.style'

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatValue(value: StatisticProps['value'], precision?: number) {
  if (value === undefined || value === null) {
    return ''
  }

  if (isNumber(value) && precision !== undefined) {
    return value.toFixed(precision)
  }

  return String(value)
}

export function Statistic(props: StatisticProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'value',
    'precision',
    'prefix',
    'suffix',
    'loading',
    'valueStyle',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-statistic`
  const [, hashId] = useStatisticStyle(prefixCls())

  return (
    <div {...rest} class={classNames(prefixCls(), hashId(), local.class)}>
      <Show when={local.title !== undefined && local.title !== null && local.title !== false}>
        <div class={`${prefixCls()}-title`}>{local.title}</div>
      </Show>
      <Show
        when={!local.loading}
        fallback={<div class={`${prefixCls()}-loading`} aria-hidden="true" />}
      >
        <div class={`${prefixCls()}-content`} style={local.valueStyle}>
          <Show
            when={local.prefix !== undefined && local.prefix !== null && local.prefix !== false}
          >
            <span class={`${prefixCls()}-content-prefix`}>{local.prefix}</span>
          </Show>
          <span class={`${prefixCls()}-content-value`}>
            {formatValue(local.value, local.precision)}
          </span>
          <Show
            when={local.suffix !== undefined && local.suffix !== null && local.suffix !== false}
          >
            <span class={`${prefixCls()}-content-suffix`}>{local.suffix}</span>
          </Show>
        </div>
      </Show>
    </div>
  )
}
```

- [ ] **Step 6: Add Statistic index export**

Create `packages/components/src/statistic/index.ts`:

```ts
export type { StatisticProps } from './interface'
export { Statistic } from './statistic'
```

- [ ] **Step 7: Export Statistic from package root**

Append this export near other data-display components in `packages/components/src/index.ts`:

```ts
export * from './statistic'
```

- [ ] **Step 8: Add Statistic docs page**

Create `apps/docs/src/routes/components/statistic.tsx`:

```tsx
import { Card, Space, Statistic } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

export default function StatisticPage() {
  return (
    <>
      <h1>Statistic</h1>
      <DemoBlock title="Basic" code={`<Statistic title="Active users" value={112893} />`}>
        <Statistic title="Active users" value={112893} />
      </DemoBlock>
      <DemoBlock
        title="Prefix and suffix"
        code={`<Statistic title="Revenue" value={93.456} precision={2} prefix="$" suffix="USD" />`}
      >
        <Statistic title="Revenue" value={93.456} precision={2} prefix="$" suffix="USD" />
      </DemoBlock>
      <DemoBlock title="Loading" code={`<Statistic title="Feedback" value={128} loading />`}>
        <Statistic title="Feedback" value={128} loading />
      </DemoBlock>
      <DemoBlock
        title="In card"
        code={`<Card><Space size="large"><Statistic title="Visits" value={8846} /><Statistic title="Conversion" value={12.8} precision={1} suffix="%" /></Space></Card>`}
      >
        <Card>
          <Space size="large">
            <Statistic title="Visits" value={8846} />
            <Statistic title="Conversion" value={12.8} precision={1} suffix="%" />
          </Space>
        </Card>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 9: Add Statistic to docs navigation**

Insert in `apps/docs/src/site/nav.ts` after the Table entry:

```ts
  { path: '/components/statistic', label: 'Statistic' },
```

- [ ] **Step 10: Run Statistic tests and typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- statistic.test.tsx
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS for both commands.

- [ ] **Step 11: Commit Statistic**

Run:

```bash
git add packages/components/src/statistic packages/components/src/index.ts apps/docs/src/routes/components/statistic.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add statistic"
```

---

### Task 2: Add Descriptions

**Files:**

- Create: `packages/components/src/descriptions/interface.ts`
- Create: `packages/components/src/descriptions/descriptions.tsx`
- Create: `packages/components/src/descriptions/descriptions.style.ts`
- Create: `packages/components/src/descriptions/index.ts`
- Create: `packages/components/src/descriptions/__tests__/descriptions.test.tsx`
- Create: `apps/docs/src/routes/components/descriptions.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write the failing Descriptions tests**

Create `packages/components/src/descriptions/__tests__/descriptions.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Descriptions } from '../index'

describe('Descriptions', () => {
  it('renders title, extra, and items', () => {
    const result = render(() => (
      <Descriptions
        title="User Info"
        extra={<button type="button">Edit</button>}
        items={[
          { label: 'Name', children: 'Ada' },
          { label: 'Role', children: 'Admin' },
        ]}
      />
    ))

    expect(result.getByText('User Info')).toHaveClass('ads-descriptions-title')
    expect(result.getByText('Edit').parentElement).toHaveClass('ads-descriptions-extra')
    expect(result.getByText('Name')).toHaveClass('ads-descriptions-item-label')
    expect(result.getByText('Ada')).toHaveClass('ads-descriptions-item-content')
    expect(result.getByText('Role')).toHaveClass('ads-descriptions-item-label')
    expect(result.getByText('Admin')).toHaveClass('ads-descriptions-item-content')
  })

  it('renders children items when items prop is not supplied', () => {
    const result = render(() => (
      <Descriptions>
        <Descriptions.Item label="Project">Solid</Descriptions.Item>
        <Descriptions.Item label="Status">Active</Descriptions.Item>
      </Descriptions>
    ))

    expect(result.getByText('Project')).toHaveClass('ads-descriptions-item-label')
    expect(result.getByText('Solid')).toHaveClass('ads-descriptions-item-content')
    expect(result.getByText('Status')).toHaveClass('ads-descriptions-item-label')
    expect(result.getByText('Active')).toHaveClass('ads-descriptions-item-content')
  })

  it('applies bordered, vertical, size, span, class, and style variants', () => {
    const result = render(() => (
      <Descriptions
        bordered
        layout="vertical"
        size="small"
        column={2}
        class="custom-descriptions"
        style={{ margin: '4px' }}
        data-testid="descriptions"
        items={[
          { label: 'Address', children: 'Hangzhou', span: 2 },
          { label: 'Owner', children: 'Team' },
        ]}
      />
    ))
    const root = result.getByTestId('descriptions')
    const addressCell = result.getByText('Address').parentElement as HTMLElement

    expect(root.className).toContain('ads-descriptions-bordered')
    expect(root.className).toContain('ads-descriptions-vertical')
    expect(root.className).toContain('ads-descriptions-small')
    expect(root.className).toContain('custom-descriptions')
    expect(root).toHaveStyle({ margin: '4px' })
    expect(addressCell).toHaveAttribute('colspan', '2')
  })

  it('prefers items over children when both are provided', () => {
    const result = render(() => (
      <Descriptions items={[{ label: 'From items', children: 'Visible' }]}>
        <Descriptions.Item label="From children">Hidden</Descriptions.Item>
      </Descriptions>
    ))

    expect(result.getByText('From items')).toHaveClass('ads-descriptions-item-label')
    expect(result.queryByText('From children')).toBeNull()
  })
})
```

- [ ] **Step 2: Run Descriptions tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- descriptions.test.tsx
```

Expected: FAIL because `packages/components/src/descriptions/index.ts` and `Descriptions` do not exist.

- [ ] **Step 3: Add Descriptions types**

Create `packages/components/src/descriptions/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type DescriptionsSize = 'default' | 'middle' | 'small'
export type DescriptionsLayout = 'horizontal' | 'vertical'

export interface DescriptionsItemType {
  label?: JSX.Element
  children?: JSX.Element
  span?: number
  class?: string
  className?: string
  style?: JSX.CSSProperties | string
}

export interface DescriptionsItemProps extends DescriptionsItemType {}

export interface DescriptionsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: JSX.Element
  extra?: JSX.Element
  bordered?: boolean
  column?: number
  size?: DescriptionsSize
  layout?: DescriptionsLayout
  items?: DescriptionsItemType[]
  children?: JSX.Element
}
```

- [ ] **Step 4: Add Descriptions styles**

Create `packages/components/src/descriptions/descriptions.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useDescriptionsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Descriptions', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          'box-sizing': 'border-box',
          margin: 0,
          padding: 0,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          'line-height': t.lineHeight,
        },
        [`.${prefixCls}-header`]: {
          display: 'flex',
          'align-items': 'center',
          'margin-bottom': `${t.margin}px`,
        },
        [`.${prefixCls}-title`]: {
          flex: 1,
          color: t.colorText,
          'font-weight': 600,
          'font-size': `${t.fontSizeLG}px`,
        },
        [`.${prefixCls}-extra`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-view`]: {
          width: '100%',
          'border-collapse': 'collapse',
          tableLayout: 'fixed',
        },
        [`.${prefixCls}-row > th, .${prefixCls}-row > td`]: {
          padding: `${t.paddingSM}px ${t.padding}px`,
          'vertical-align': 'top',
        },
        [`.${prefixCls}-item-label`]: {
          color: t.colorTextSecondary,
          'font-weight': 400,
          'text-align': 'start',
          '&::after': {
            content: '":"',
            'margin-inline-end': `${t.marginXS}px`,
          },
        },
        [`.${prefixCls}-item-content`]: {
          color: t.colorText,
        },
        [`.${prefixCls}-bordered .${prefixCls}-view`]: {
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-bordered .${prefixCls}-row > th, .${prefixCls}-bordered .${prefixCls}-row > td`]:
          {
            border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          },
        [`.${prefixCls}-bordered .${prefixCls}-item-label`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-vertical .${prefixCls}-item-label::after`]: {
          content: '""',
          margin: 0,
        },
        [`.${prefixCls}-middle .${prefixCls}-row > th, .${prefixCls}-middle .${prefixCls}-row > td`]:
          {
            padding: `${t.paddingXS}px ${t.paddingSM}px`,
          },
        [`.${prefixCls}-small .${prefixCls}-row > th, .${prefixCls}-small .${prefixCls}-row > td`]:
          {
            padding: `${t.paddingXXS}px ${t.paddingXS}px`,
          },
      }
    },
  )
}
```

- [ ] **Step 5: Add Descriptions implementation**

Create `packages/components/src/descriptions/descriptions.tsx`:

```tsx
import { For, Show, children, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useDescriptionsStyle } from './descriptions.style'
import type { DescriptionsItemProps, DescriptionsItemType, DescriptionsProps } from './interface'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function clampSpan(span: number | undefined, column: number) {
  const next = span ?? 1
  return Math.max(1, Math.min(next, column))
}

function chunkItems(items: DescriptionsItemType[], column: number) {
  const rows: DescriptionsItemType[][] = []
  let current: DescriptionsItemType[] = []
  let used = 0

  for (const item of items) {
    const span = clampSpan(item.span, column)
    if (used > 0 && used + span > column) {
      rows.push(current)
      current = []
      used = 0
    }
    current.push({ ...item, span })
    used += span
    if (used >= column) {
      rows.push(current)
      current = []
      used = 0
    }
  }

  if (current.length > 0) {
    rows.push(current)
  }

  return rows
}

function getChildItems(value: JSX.Element): DescriptionsItemType[] {
  const resolved = children(() => value)
  return resolved.toArray().map((item) => {
    const props = (item as { props?: DescriptionsItemProps }).props ?? {}
    return {
      label: props.label,
      children: props.children,
      span: props.span,
      class: props.class,
      className: props.className,
      style: props.style,
    }
  })
}

function DescriptionsItem(_props: DescriptionsItemProps) {
  return null
}

export function DescriptionsRoot(props: DescriptionsProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'extra',
    'bordered',
    'column',
    'size',
    'layout',
    'items',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-descriptions`
  const [, hashId] = useDescriptionsStyle(prefixCls())
  const column = () => Math.max(1, local.column ?? 3)
  const size = () => local.size ?? 'default'
  const layout = () => local.layout ?? 'horizontal'
  const normalizedItems = () => local.items ?? getChildItems(local.children)
  const rows = () => chunkItems(normalizedItems(), column())
  const hasHeader = () => isPresent(local.title) || isPresent(local.extra)

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.bordered && `${prefixCls()}-bordered`,
        layout() === 'vertical' && `${prefixCls()}-vertical`,
        size() !== 'default' && `${prefixCls()}-${size()}`,
        hashId(),
        local.class,
      )}
    >
      <Show when={hasHeader()}>
        <div class={`${prefixCls()}-header`}>
          <Show when={isPresent(local.title)}>
            <div class={`${prefixCls()}-title`}>{local.title}</div>
          </Show>
          <Show when={isPresent(local.extra)}>
            <div class={`${prefixCls()}-extra`}>{local.extra}</div>
          </Show>
        </div>
      </Show>
      <table class={`${prefixCls()}-view`}>
        <tbody>
          <For each={rows()}>
            {(row) => (
              <>
                <Show
                  when={layout() === 'vertical'}
                  fallback={
                    <tr class={`${prefixCls()}-row`}>
                      <For each={row}>
                        {(item) => (
                          <>
                            <th class={`${prefixCls()}-item-label`} colSpan={1}>
                              {item.label}
                            </th>
                            <td
                              class={classNames(
                                `${prefixCls()}-item-content`,
                                item.class,
                                item.className,
                              )}
                              style={item.style}
                              colSpan={clampSpan(item.span, column()) * 2 - 1}
                            >
                              {item.children}
                            </td>
                          </>
                        )}
                      </For>
                    </tr>
                  }
                >
                  <tr class={`${prefixCls()}-row`}>
                    <For each={row}>
                      {(item) => (
                        <th
                          class={classNames(
                            `${prefixCls()}-item-label`,
                            item.class,
                            item.className,
                          )}
                          style={item.style}
                          colSpan={clampSpan(item.span, column())}
                        >
                          {item.label}
                        </th>
                      )}
                    </For>
                  </tr>
                  <tr class={`${prefixCls()}-row`}>
                    <For each={row}>
                      {(item) => (
                        <td
                          class={`${prefixCls()}-item-content`}
                          colSpan={clampSpan(item.span, column())}
                        >
                          {item.children}
                        </td>
                      )}
                    </For>
                  </tr>
                </Show>
              </>
            )}
          </For>
        </tbody>
      </table>
    </div>
  )
}

export const Descriptions = Object.assign(DescriptionsRoot, { Item: DescriptionsItem })
```

- [ ] **Step 6: Add Descriptions index export**

Create `packages/components/src/descriptions/index.ts`:

```ts
export type {
  DescriptionsItemProps,
  DescriptionsItemType,
  DescriptionsLayout,
  DescriptionsProps,
  DescriptionsSize,
} from './interface'
export { Descriptions } from './descriptions'
```

- [ ] **Step 7: Export Descriptions from package root**

Append this export near other data-display components in `packages/components/src/index.ts`:

```ts
export * from './descriptions'
```

- [ ] **Step 8: Add Descriptions docs page**

Create `apps/docs/src/routes/components/descriptions.tsx`:

```tsx
import { Descriptions } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

const basicItems = [
  { label: 'UserName', children: 'Ada Lovelace' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
]

export default function DescriptionsPage() {
  return (
    <>
      <h1>Descriptions</h1>
      <DemoBlock title="Basic" code={`<Descriptions title="User Info" items={items} />`}>
        <Descriptions title="User Info" items={basicItems} />
      </DemoBlock>
      <DemoBlock title="Bordered" code={`<Descriptions bordered title="Product" items={items} />`}>
        <Descriptions
          bordered
          title="Product"
          items={[
            { label: 'Product', children: 'Ant Design Solid' },
            { label: 'Version', children: '0.0.0' },
            { label: 'Status', children: 'Running' },
            { label: 'Address', children: 'No. 18, Wantang Road, Hangzhou', span: 3 },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Vertical"
        code={`<Descriptions layout="vertical" bordered items={items} />`}
      >
        <Descriptions
          layout="vertical"
          bordered
          items={[
            { label: 'Name', children: 'Design System' },
            { label: 'Owner', children: 'Frontend Team' },
            { label: 'Description', children: 'Reusable UI components for SolidJS.', span: 2 },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Children"
        code={`<Descriptions><Descriptions.Item label="Project">Solid</Descriptions.Item></Descriptions>`}
      >
        <Descriptions title="Project Info" column={2}>
          <Descriptions.Item label="Project">Solid Components</Descriptions.Item>
          <Descriptions.Item label="Status">Active</Descriptions.Item>
        </Descriptions>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 9: Add Descriptions to docs navigation**

Insert in `apps/docs/src/site/nav.ts` after the Statistic entry:

```ts
  { path: '/components/descriptions', label: 'Descriptions' },
```

- [ ] **Step 10: Run Descriptions tests and typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- descriptions.test.tsx
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS for both commands.

- [ ] **Step 11: Commit Descriptions**

Run:

```bash
git add packages/components/src/descriptions packages/components/src/index.ts apps/docs/src/routes/components/descriptions.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add descriptions"
```

---

### Task 3: Add List

**Files:**

- Create: `packages/components/src/list/interface.ts`
- Create: `packages/components/src/list/list.tsx`
- Create: `packages/components/src/list/list.style.ts`
- Create: `packages/components/src/list/index.ts`
- Create: `packages/components/src/list/__tests__/list.test.tsx`
- Create: `apps/docs/src/routes/components/list.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write the failing List tests**

Create `packages/components/src/list/__tests__/list.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { List } from '../index'

describe('List', () => {
  it('renders dataSource with renderItem, header, and footer', () => {
    const result = render(() => (
      <List
        header="Header"
        footer="Footer"
        dataSource={['Alpha', 'Beta']}
        renderItem={(item) => <List.Item>{item}</List.Item>}
      />
    ))

    expect(result.getByText('Header')).toHaveClass('ads-list-header')
    expect(result.getByText('Footer')).toHaveClass('ads-list-footer')
    expect(result.getByText('Alpha')).toHaveClass('ads-list-item')
    expect(result.getByText('Beta')).toHaveClass('ads-list-item')
  })

  it('renders children directly when no dataSource is supplied', () => {
    const result = render(() => (
      <List>
        <List.Item>Child item</List.Item>
      </List>
    ))

    expect(result.getByText('Child item')).toHaveClass('ads-list-item')
  })

  it('renders empty text when there are no items', () => {
    const result = render(() => <List emptyText="Nothing here" />)

    expect(result.getByText('Nothing here')).toHaveClass('ads-list-empty')
  })

  it('renders loading placeholder instead of items', () => {
    const result = render(() => (
      <List dataSource={['Hidden']} renderItem={(item) => <List.Item>{item}</List.Item>} loading />
    ))

    expect(result.queryByText('Hidden')).toBeNull()
    expect(result.container.querySelector('.ads-list-loading')).not.toBeNull()
  })

  it('applies bordered, split, size, class, and style variants', () => {
    const result = render(() => (
      <List
        bordered
        split={false}
        size="large"
        class="custom-list"
        style={{ margin: '8px' }}
        data-testid="list"
      >
        <List.Item>Item</List.Item>
      </List>
    ))
    const list = result.getByTestId('list')

    expect(list.className).toContain('ads-list-bordered')
    expect(list.className).toContain('ads-list-large')
    expect(list.className).not.toContain('ads-list-split')
    expect(list.className).toContain('custom-list')
    expect(list).toHaveStyle({ margin: '8px' })
  })

  it('renders item actions, extra, and meta', () => {
    const result = render(() => (
      <List>
        <List.Item actions={[<button type="button">Edit</button>]} extra={<span>Extra</span>}>
          <List.Item.Meta avatar={<span>A</span>} title="Title" description="Description" />
        </List.Item>
      </List>
    ))

    expect(result.getByText('Edit').parentElement).toHaveClass('ads-list-item-action')
    expect(result.getByText('Extra')).toHaveClass('ads-list-item-extra')
    expect(result.getByText('A')).toHaveClass('ads-list-item-meta-avatar')
    expect(result.getByText('Title')).toHaveClass('ads-list-item-meta-title')
    expect(result.getByText('Description')).toHaveClass('ads-list-item-meta-description')
  })
})
```

- [ ] **Step 2: Run List tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- list.test.tsx
```

Expected: FAIL because `packages/components/src/list/index.ts` and `List` do not exist.

- [ ] **Step 3: Add List types**

Create `packages/components/src/list/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type ListSize = 'default' | 'large' | 'small'

export interface ListProps<T = unknown> extends JSX.HTMLAttributes<HTMLDivElement> {
  dataSource?: T[]
  renderItem?: (item: T, index: number) => JSX.Element
  header?: JSX.Element
  footer?: JSX.Element
  bordered?: boolean
  split?: boolean
  size?: ListSize
  loading?: boolean
  emptyText?: JSX.Element
  children?: JSX.Element
}

export interface ListItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  actions?: JSX.Element[]
  extra?: JSX.Element
  children?: JSX.Element
}

export interface ListItemMetaProps extends JSX.HTMLAttributes<HTMLDivElement> {
  avatar?: JSX.Element
  title?: JSX.Element
  description?: JSX.Element
}
```

- [ ] **Step 4: Add List styles**

Create `packages/components/src/list/list.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useListStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['List', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
      },
      [`.${prefixCls}-bordered`]: {
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        'border-radius': `${t.borderRadius}px`,
      },
      [`.${prefixCls}-header, .${prefixCls}-footer`]: {
        padding: `${t.paddingSM}px ${t.padding}px`,
      },
      [`.${prefixCls}-header`]: {
        'border-block-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-footer`]: {
        'border-block-start': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-items`]: {
        margin: 0,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'space-between',
        padding: `${t.paddingSM}px ${t.padding}px`,
        color: t.colorText,
      },
      [`.${prefixCls}-split .${prefixCls}-item:not(:last-child)`]: {
        'border-block-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-small .${prefixCls}-item, .${prefixCls}-small .${prefixCls}-header, .${prefixCls}-small .${prefixCls}-footer`]:
        {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
        },
      [`.${prefixCls}-large .${prefixCls}-item, .${prefixCls}-large .${prefixCls}-header, .${prefixCls}-large .${prefixCls}-footer`]:
        {
          padding: `${t.padding}px ${t.paddingLG}px`,
        },
      [`.${prefixCls}-item-main`]: {
        flex: 1,
        'min-width': 0,
      },
      [`.${prefixCls}-item-actions`]: {
        display: 'flex',
        margin: 0,
        'margin-inline-start': `${t.margin}px`,
        padding: 0,
        'list-style': 'none',
      },
      [`.${prefixCls}-item-action`]: {
        color: t.colorTextSecondary,
        '&:not(:last-child)': {
          'margin-inline-end': `${t.marginSM}px`,
          'padding-inline-end': `${t.paddingSM}px`,
          'border-inline-end': `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
      },
      [`.${prefixCls}-item-extra`]: {
        'margin-inline-start': `${t.marginLG}px`,
      },
      [`.${prefixCls}-item-meta`]: {
        display: 'flex',
        'align-items': 'flex-start',
      },
      [`.${prefixCls}-item-meta-avatar`]: {
        'margin-inline-end': `${t.margin}px`,
      },
      [`.${prefixCls}-item-meta-content`]: {
        flex: 1,
        'min-width': 0,
      },
      [`.${prefixCls}-item-meta-title`]: {
        color: t.colorText,
        'font-weight': 500,
      },
      [`.${prefixCls}-item-meta-description`]: {
        color: t.colorTextSecondary,
      },
      [`.${prefixCls}-loading, .${prefixCls}-empty`]: {
        padding: `${t.paddingLG}px`,
        color: t.colorTextSecondary,
        'text-align': 'center',
      },
    }
  })
}
```

- [ ] **Step 5: Add List implementation**

Create `packages/components/src/list/list.tsx`:

```tsx
import { For, Show, children, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { ListItemMetaProps, ListItemProps, ListProps } from './interface'
import { useListStyle } from './list.style'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function ListItemMeta(props: ListItemMetaProps) {
  const [local, rest] = splitProps(props, ['avatar', 'title', 'description', 'class'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-list`

  return (
    <div {...rest} class={classNames(`${prefixCls()}-item-meta`, local.class)}>
      <Show when={isPresent(local.avatar)}>
        <div class={`${prefixCls()}-item-meta-avatar`}>{local.avatar}</div>
      </Show>
      <div class={`${prefixCls()}-item-meta-content`}>
        <Show when={isPresent(local.title)}>
          <div class={`${prefixCls()}-item-meta-title`}>{local.title}</div>
        </Show>
        <Show when={isPresent(local.description)}>
          <div class={`${prefixCls()}-item-meta-description`}>{local.description}</div>
        </Show>
      </div>
    </div>
  )
}

function ListItem(props: ListItemProps) {
  const [local, rest] = splitProps(props, ['actions', 'extra', 'children', 'class'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-list`
  const hasActions = () => (local.actions?.length ?? 0) > 0

  return (
    <li {...rest} class={classNames(`${prefixCls()}-item`, local.class)}>
      <div class={`${prefixCls()}-item-main`}>{local.children}</div>
      <Show when={hasActions()}>
        <ul class={`${prefixCls()}-item-actions`}>
          <For each={local.actions}>
            {(action) => <li class={`${prefixCls()}-item-action`}>{action}</li>}
          </For>
        </ul>
      </Show>
      <Show when={isPresent(local.extra)}>
        <div class={`${prefixCls()}-item-extra`}>{local.extra}</div>
      </Show>
    </li>
  )
}

export function ListRoot<T = unknown>(props: ListProps<T>) {
  const [local, rest] = splitProps(props, [
    'dataSource',
    'renderItem',
    'header',
    'footer',
    'bordered',
    'split',
    'size',
    'loading',
    'emptyText',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-list`
  const [, hashId] = useListStyle(prefixCls())
  const split = () => local.split ?? true
  const size = () => local.size ?? 'default'
  const renderedChildren = children(() => local.children)
  const dataItems = () => local.dataSource ?? []
  const hasData = () => dataItems().length > 0 && local.renderItem !== undefined
  const hasChildren = () => renderedChildren.toArray().length > 0
  const isEmpty = () => !local.loading && !hasData() && !hasChildren()

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.bordered && `${prefixCls()}-bordered`,
        split() && `${prefixCls()}-split`,
        size() !== 'default' && `${prefixCls()}-${size()}`,
        hashId(),
        local.class,
      )}
    >
      <Show when={isPresent(local.header)}>
        <div class={`${prefixCls()}-header`}>{local.header}</div>
      </Show>
      <Show when={!local.loading} fallback={<div class={`${prefixCls()}-loading`}>Loading...</div>}>
        <Show
          when={!isEmpty()}
          fallback={<div class={`${prefixCls()}-empty`}>{local.emptyText ?? 'No Data'}</div>}
        >
          <ul class={`${prefixCls()}-items`}>
            <Show when={hasData()} fallback={renderedChildren()}>
              <For each={dataItems()}>{(item, index) => local.renderItem?.(item, index())}</For>
            </Show>
          </ul>
        </Show>
      </Show>
      <Show when={isPresent(local.footer)}>
        <div class={`${prefixCls()}-footer`}>{local.footer}</div>
      </Show>
    </div>
  )
}

export const List = Object.assign(ListRoot, {
  Item: Object.assign(ListItem, { Meta: ListItemMeta }),
})
```

- [ ] **Step 6: Add List index export**

Create `packages/components/src/list/index.ts`:

```ts
export type { ListItemMetaProps, ListItemProps, ListProps, ListSize } from './interface'
export { List } from './list'
```

- [ ] **Step 7: Export List from package root**

Append this export near other data-display components in `packages/components/src/index.ts`:

```ts
export * from './list'
```

- [ ] **Step 8: Add List docs page**

Create `apps/docs/src/routes/components/list.tsx`:

```tsx
import { Avatar, Button, List, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

const data = [
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
]

export default function ListPage() {
  return (
    <>
      <h1>List</h1>
      <DemoBlock
        title="Basic"
        code={`<List dataSource={data} renderItem={(item) => <List.Item>{item}</List.Item>} />`}
      >
        <List dataSource={data} renderItem={(item) => <List.Item>{item}</List.Item>} />
      </DemoBlock>
      <DemoBlock
        title="Bordered"
        code={`<List bordered header="Header" footer="Footer" dataSource={data} renderItem={(item) => <List.Item>{item}</List.Item>} />`}
      >
        <List
          bordered
          header="Header"
          footer="Footer"
          dataSource={data}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </DemoBlock>
      <DemoBlock
        title="Meta"
        code={`<List.Item><List.Item.Meta avatar={<Avatar>A</Avatar>} title="Title" description="Description" /></List.Item>`}
      >
        <List bordered>
          <List.Item actions={[<Button size="small">Edit</Button>]} extra={<Space>Extra</Space>}>
            <List.Item.Meta
              avatar={<Avatar>A</Avatar>}
              title="Ant Design Solid"
              description="Reusable UI components for SolidJS applications."
            />
          </List.Item>
        </List>
      </DemoBlock>
      <DemoBlock
        title="Loading and empty"
        code={`<List loading />\n<List emptyText="Nothing here" />`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <List bordered loading />
          <List bordered emptyText="Nothing here" />
        </Space>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 9: Add List to docs navigation**

Insert in `apps/docs/src/site/nav.ts` after the Descriptions entry:

```ts
  { path: '/components/list', label: 'List' },
```

- [ ] **Step 10: Run List tests and typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- list.test.tsx
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS for both commands.

- [ ] **Step 11: Commit List**

Run:

```bash
git add packages/components/src/list packages/components/src/index.ts apps/docs/src/routes/components/list.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add list"
```

---

### Task 4: Final verification and cleanup

**Files:**

- Modify if needed: files changed by Tasks 1-3 to satisfy formatting, lint, typecheck, tests, or build.

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

Expected: PASS. If it fails, run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format`, inspect changes, and rerun the check.

- [ ] **Step 3: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 6: Commit verification fixes if any**

If any changes were needed during verification, run:

```bash
git add packages/components/src apps/docs/src docs/superpowers/plans/2026-06-02-data-display-components.md
git commit -m "chore: verify data display components"
```

If no changes were needed, do not create an empty commit.
