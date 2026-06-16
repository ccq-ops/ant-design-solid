# ant-design-solid Data Display Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MVP `Table`, `Tag`, and `Badge` components with token-driven styles, tests, exports, and docs.

**Architecture:** Extend `@solid-ant-design/theme` component tokens first, then implement each component in its own `packages/components/src/<component>/` folder following existing `interface.ts`, implementation, style, `index.ts`, and colocated test conventions. Update root exports and docs routes after component tests pass.

**Tech Stack:** TypeScript, SolidJS JSX, `@solid-ant-design/cssinjs`, `@solid-ant-design/theme`, Vitest, `@solidjs/testing-library`, pnpm 11, Vite 8, oxlint, oxfmt.

---

## File Structure Map

### Theme package

- Modify `packages/theme/src/types.ts`: add `TableComponentToken`, `TagComponentToken`, `BadgeComponentToken`, and extend `ComponentTokenMap`.
- Modify `packages/theme/src/components.ts`: derive default tokens for the three components and merge overrides.
- Modify `packages/theme/src/__tests__/theme.test.ts`: add assertions for defaults and overrides.

### Table component

- Create `packages/components/src/table/interface.ts`: public Table prop and column types.
- Create `packages/components/src/table/table.style.ts`: token-driven table styles.
- Create `packages/components/src/table/table.tsx`: Solid table renderer.
- Create `packages/components/src/table/index.ts`: public exports.
- Create `packages/components/src/table/__tests__/table.test.tsx`: behavior tests.

### Tag component

- Create `packages/components/src/tag/interface.ts`: public Tag props.
- Create `packages/components/src/tag/tag.style.ts`: token-driven tag styles.
- Create `packages/components/src/tag/tag.tsx`: Solid tag renderer.
- Create `packages/components/src/tag/index.ts`: public exports.
- Create `packages/components/src/tag/__tests__/tag.test.tsx`: behavior tests.

### Badge component

- Create `packages/components/src/badge/interface.ts`: public Badge props and status type.
- Create `packages/components/src/badge/badge.style.ts`: token-driven badge styles.
- Create `packages/components/src/badge/badge.tsx`: Solid badge renderer.
- Create `packages/components/src/badge/index.ts`: public exports.
- Create `packages/components/src/badge/__tests__/badge.test.tsx`: behavior tests.

### Exports and docs

- Modify `packages/components/src/index.ts`: export `table`, `tag`, and `badge`.
- Modify `apps/docs/src/site/nav.ts`: add docs nav entries for Table, Tag, Badge near display components.
- Create `apps/docs/src/routes/components/table.tsx`: docs demos for table.
- Create `apps/docs/src/routes/components/tag.tsx`: docs demos for tag.
- Create `apps/docs/src/routes/components/badge.tsx`: docs demos for badge.

---

## Task 1: Add Theme Tokens

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Write the failing theme test**

Add this test case to `packages/theme/src/__tests__/theme.test.ts`:

```ts
it('derives data display component token defaults and applies overrides', () => {
  const token = mergeTheme({
    components: {
      Table: { headerBg: '#fafafa', cellPadding: 20 },
      Tag: { borderRadius: 12, closeIconColor: '#111111' },
      Badge: { overflowIndicatorHeight: 24, dotSize: 8 },
    },
  })

  expect(getComponentToken('Table', token).headerBg).toBe('#fafafa')
  expect(getComponentToken('Table', token).headerColor).toBe(token.colorText)
  expect(getComponentToken('Table', token).cellPadding).toBe(20)
  expect(getComponentToken('Table', token).borderColor).toBe(token.colorBorderSecondary)

  expect(getComponentToken('Tag', token).borderRadius).toBe(12)
  expect(getComponentToken('Tag', token).defaultBg).toBe(token.colorFillAlter)
  expect(getComponentToken('Tag', token).defaultColor).toBe(token.colorText)
  expect(getComponentToken('Tag', token).closeIconColor).toBe('#111111')

  expect(getComponentToken('Badge', token).overflowIndicatorHeight).toBe(24)
  expect(getComponentToken('Badge', token).dotSize).toBe(8)
  expect(getComponentToken('Badge', token).colorBg).toBe(token.colorError)
  expect(getComponentToken('Badge', token).colorText).toBe('#ffffff')
})
```

- [ ] **Step 2: Run the theme test and verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test -- --run src/__tests__/theme.test.ts
```

Expected: TypeScript/test failure because `Table`, `Tag`, and `Badge` are not keys in `ComponentTokenMap`.

- [ ] **Step 3: Add token types**

Add these interfaces to `packages/theme/src/types.ts` before `ComponentTokenMap`:

```ts
export interface TableComponentToken {
  headerBg: string
  headerColor: string
  rowHoverBg: string
  borderColor: string
  cellPadding: number
  cellPaddingSm: number
  cellPaddingLg: number
  borderRadius: number
  emptyColor: string
}

export interface TagComponentToken {
  defaultBg: string
  defaultColor: string
  borderColor: string
  borderRadius: number
  paddingInline: number
  fontSize: number
  lineHeight: number
  closeIconColor: string
}

export interface BadgeComponentToken {
  overflowIndicatorHeight: number
  overflowIndicatorHeightSm: number
  dotSize: number
  textFontSize: number
  textFontSizeSm: number
  colorBg: string
  colorText: string
  statusSize: number
}
```

Extend `ComponentTokenMap` with:

```ts
Table: TableComponentToken
Tag: TagComponentToken
Badge: BadgeComponentToken
```

- [ ] **Step 4: Add default token derivation**

In `packages/theme/src/components.ts`, add these entries to the `defaults` object:

```ts
    Table: {
      headerBg: token.colorFillAlter,
      headerColor: token.colorText,
      rowHoverBg: token.colorFillAlter,
      borderColor: token.colorBorderSecondary,
      cellPadding: token.padding,
      cellPaddingSm: token.paddingSM,
      cellPaddingLg: token.paddingLG,
      borderRadius: token.borderRadius,
      emptyColor: token.colorTextSecondary,
    },
    Tag: {
      defaultBg: token.colorFillAlter,
      defaultColor: token.colorText,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius / 2,
      paddingInline: token.paddingXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      closeIconColor: token.colorTextSecondary,
    },
    Badge: {
      overflowIndicatorHeight: 20,
      overflowIndicatorHeightSm: 14,
      dotSize: 6,
      textFontSize: 12,
      textFontSizeSm: 10,
      colorBg: token.colorError,
      colorText: '#ffffff',
      statusSize: 6,
    },
```

- [ ] **Step 5: Run theme tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test -- --run src/__tests__/theme.test.ts
```

Expected: PASS.

Commit:

```bash
git add packages/theme/src/types.ts packages/theme/src/components.ts packages/theme/src/__tests__/theme.test.ts
git commit -m "feat(theme): add data display component tokens"
```

---

## Task 2: Implement Tag

**Files:**

- Create: `packages/components/src/tag/interface.ts`
- Create: `packages/components/src/tag/tag.style.ts`
- Create: `packages/components/src/tag/tag.tsx`
- Create: `packages/components/src/tag/index.ts`
- Create: `packages/components/src/tag/__tests__/tag.test.tsx`

- [ ] **Step 1: Write failing Tag tests**

Create `packages/components/src/tag/__tests__/tag.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tag } from '../index'

describe('Tag', () => {
  it('renders children and default classes', () => {
    const result = render(() => <Tag>Open</Tag>)
    const tag = result.getByText('Open')
    expect(tag.className).toContain('ads-tag')
  })

  it('supports color and borderless state', () => {
    const result = render(() => (
      <Tag color="success" bordered={false}>
        Success
      </Tag>
    ))
    const tag = result.getByText('Success')
    expect(tag.className).toContain('ads-tag-success')
    expect(tag.className).toContain('ads-tag-borderless')
  })

  it('supports arbitrary color as inline custom property', () => {
    const result = render(() => <Tag color="#722ed1">Purple</Tag>)
    const tag = result.getByText('Purple') as HTMLElement
    expect(tag.getAttribute('style')).toContain('--ads-tag-custom-color: #722ed1')
    expect(tag.className).toContain('ads-tag-has-color')
  })

  it('calls onClose when closable close button is clicked', () => {
    const onClose = vi.fn()
    const result = render(() => (
      <Tag closable onClose={onClose}>
        Closable
      </Tag>
    ))
    fireEvent.click(result.getByLabelText('Close tag'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tag>Custom</Tag>
      </ConfigProvider>
    ))
    expect(result.getByText('Custom').className).toContain('custom-tag')
  })
})
```

- [ ] **Step 2: Run Tag tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- --run src/tag/__tests__/tag.test.tsx
```

Expected: FAIL because `packages/components/src/tag` does not exist.

- [ ] **Step 3: Add Tag interface**

Create `packages/components/src/tag/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export interface TagProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  color?: string
  closable?: boolean
  onClose?: (event: MouseEvent) => void
  bordered?: boolean
}
```

- [ ] **Step 4: Add Tag styles**

Create `packages/components/src/tag/tag.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useTagStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tag', prefixCls] }, () => {
    const t = token()
    const tag = getComponentToken('Tag', t)
    return {
      [`.${prefixCls}`]: {
        display: 'inline-flex',
        'align-items': 'center',
        gap: 4,
        'box-sizing': 'border-box',
        margin: 0,
        'padding-inline': tag.paddingInline,
        color: tag.defaultColor,
        'font-size': tag.fontSize,
        'line-height': tag.lineHeight,
        'white-space': 'nowrap',
        background: tag.defaultBg,
        border: `${t.lineWidth}px solid ${tag.borderColor}`,
        'border-radius': tag.borderRadius,
      },
      [`.${prefixCls}-borderless`]: { borderColor: 'transparent' },
      [`.${prefixCls}-has-color`]: {
        color: 'var(--ads-tag-custom-color)',
        background: 'color-mix(in srgb, var(--ads-tag-custom-color) 10%, transparent)',
        borderColor: 'color-mix(in srgb, var(--ads-tag-custom-color) 35%, transparent)',
      },
      [`.${prefixCls}-success`]: {
        color: t.colorSuccess,
        background: '#f6ffed',
        borderColor: '#b7eb8f',
      },
      [`.${prefixCls}-warning`]: {
        color: t.colorWarning,
        background: '#fffbe6',
        borderColor: '#ffe58f',
      },
      [`.${prefixCls}-error`]: {
        color: t.colorError,
        background: '#fff2f0',
        borderColor: '#ffccc7',
      },
      [`.${prefixCls}-processing`]: {
        color: t.colorInfo,
        background: '#e6f4ff',
        borderColor: '#91caff',
      },
      [`.${prefixCls}-close`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        padding: 0,
        color: tag.closeIconColor,
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        'font-size': 12,
        'line-height': 1,
      },
    }
  })
}
```

- [ ] **Step 5: Add Tag implementation and exports**

Create `packages/components/src/tag/tag.tsx`:

```tsx
import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTagStyle } from './tag.style'
import type { JSX } from 'solid-js'
import type { TagProps } from './interface'

const presetColors = new Set(['success', 'warning', 'error', 'processing'])

export function Tag(props: TagProps) {
  const [local, rest] = splitProps(props, [
    'color',
    'closable',
    'onClose',
    'bordered',
    'class',
    'children',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tag`
  const [, hashId] = useTagStyle(prefixCls())
  const isPreset = () => Boolean(local.color && presetColors.has(local.color))
  const isCustomColor = () => Boolean(local.color && !isPreset())
  const mergedStyle = (): JSX.CSSProperties | string | undefined => {
    if (!isCustomColor()) return local.style
    const customStyle = { '--ads-tag-custom-color': local.color } as JSX.CSSProperties
    if (typeof local.style === 'string')
      return `${local.style}; --ads-tag-custom-color: ${local.color}`
    return { ...customStyle, ...(local.style ?? {}) }
  }

  return (
    <span
      {...rest}
      style={mergedStyle()}
      class={classNames(
        prefixCls(),
        isPreset() && `${prefixCls()}-${local.color}`,
        isCustomColor() && `${prefixCls()}-has-color`,
        local.bordered === false && `${prefixCls()}-borderless`,
        hashId(),
        local.class,
      )}
    >
      {local.children}
      <Show when={local.closable}>
        <button
          type="button"
          aria-label="Close tag"
          class={`${prefixCls()}-close`}
          onClick={(event) => local.onClose?.(event)}
        >
          ×
        </button>
      </Show>
    </span>
  )
}
```

Create `packages/components/src/tag/index.ts`:

```ts
export * from './interface'
export * from './tag'
```

- [ ] **Step 6: Run Tag tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- --run src/tag/__tests__/tag.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/tag
git commit -m "feat(components): add tag"
```

---

## Task 3: Implement Badge

**Files:**

- Create: `packages/components/src/badge/interface.ts`
- Create: `packages/components/src/badge/badge.style.ts`
- Create: `packages/components/src/badge/badge.tsx`
- Create: `packages/components/src/badge/index.ts`
- Create: `packages/components/src/badge/__tests__/badge.test.tsx`

- [ ] **Step 1: Write failing Badge tests**

Create `packages/components/src/badge/__tests__/badge.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Badge } from '../index'

describe('Badge', () => {
  it('renders count', () => {
    const result = render(() => <Badge count={5} />)
    expect(result.getByText('5').className).toContain('ads-badge-count')
  })

  it('handles overflow count', () => {
    const result = render(() => <Badge count={120} overflowCount={99} />)
    expect(result.getByText('99+')).toBeInTheDocument()
  })

  it('hides zero by default and shows zero with showZero', () => {
    const hidden = render(() => <Badge count={0} />)
    expect(hidden.queryByText('0')).toBeNull()
    hidden.unmount()

    const visible = render(() => <Badge count={0} showZero />)
    expect(visible.getByText('0')).toBeInTheDocument()
  })

  it('renders dot mode', () => {
    const result = render(() => <Badge dot count={9} />)
    expect(result.container.querySelector('.ads-badge-dot')).not.toBeNull()
    expect(result.queryByText('9')).toBeNull()
  })

  it('renders status with text', () => {
    const result = render(() => <Badge status="success" text="Active" />)
    expect(result.getByText('Active')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-badge-status-success')).not.toBeNull()
  })

  it('renders wrapped children mode', () => {
    const result = render(() => (
      <Badge count={3}>
        <button>Inbox</button>
      </Badge>
    ))
    expect(result.getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
    expect(result.getByText('3')).toBeInTheDocument()
    expect(result.container.firstElementChild?.className).toContain('ads-badge')
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Badge count={1} />
      </ConfigProvider>
    ))
    expect(result.getByText('1').className).toContain('custom-badge-count')
  })
})
```

- [ ] **Step 2: Run Badge tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- --run src/badge/__tests__/badge.test.tsx
```

Expected: FAIL because `packages/components/src/badge` does not exist.

- [ ] **Step 3: Add Badge interface**

Create `packages/components/src/badge/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  count?: number | string
  dot?: boolean
  status?: BadgeStatus
  text?: JSX.Element
  overflowCount?: number
  showZero?: boolean
}
```

- [ ] **Step 4: Add Badge styles**

Create `packages/components/src/badge/badge.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useBadgeStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Badge', prefixCls] }, () => {
    const t = token()
    const badge = getComponentToken('Badge', t)
    return {
      [`.${prefixCls}`]: { position: 'relative', display: 'inline-block', 'line-height': 1 },
      [`.${prefixCls}-count`]: {
        display: 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'min-width': badge.overflowIndicatorHeight,
        height: badge.overflowIndicatorHeight,
        padding: '0 6px',
        color: badge.colorText,
        'font-size': badge.textFontSize,
        'line-height': 1,
        'white-space': 'nowrap',
        background: badge.colorBg,
        'border-radius': badge.overflowIndicatorHeight / 2,
        'box-shadow': `0 0 0 1px ${t.colorBgContainer}`,
      },
      [`.${prefixCls}-with-children .${prefixCls}-count, .${prefixCls}-with-children .${prefixCls}-dot`]:
        {
          position: 'absolute',
          top: 0,
          right: 0,
          transform: 'translate(50%, -50%)',
          'transform-origin': '100% 0%',
        },
      [`.${prefixCls}-dot`]: {
        display: 'inline-block',
        width: badge.dotSize,
        height: badge.dotSize,
        background: badge.colorBg,
        'border-radius': '50%',
        'box-shadow': `0 0 0 1px ${t.colorBgContainer}`,
      },
      [`.${prefixCls}-status`]: { display: 'inline-flex', 'align-items': 'center', gap: 6 },
      [`.${prefixCls}-status-dot`]: {
        display: 'inline-block',
        width: badge.statusSize,
        height: badge.statusSize,
        'border-radius': '50%',
      },
      [`.${prefixCls}-status-success`]: { background: t.colorSuccess },
      [`.${prefixCls}-status-processing`]: {
        background: t.colorInfo,
        animation: 'ads-badge-pulse 1.2s infinite ease-in-out',
      },
      [`.${prefixCls}-status-default`]: { background: t.colorTextDisabled },
      [`.${prefixCls}-status-error`]: { background: t.colorError },
      [`.${prefixCls}-status-warning`]: { background: t.colorWarning },
      [`.${prefixCls}-status-text`]: {
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
      },
      '@keyframes ads-badge-pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.45 },
        '100%': { opacity: 1 },
      },
    }
  })
}
```

- [ ] **Step 5: Add Badge implementation and exports**

Create `packages/components/src/badge/badge.tsx`:

```tsx
import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useBadgeStyle } from './badge.style'
import type { BadgeProps } from './interface'

export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, [
    'count',
    'dot',
    'status',
    'text',
    'overflowCount',
    'showZero',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-badge`
  const [, hashId] = useBadgeStyle(prefixCls())
  const overflowCount = () => local.overflowCount ?? 99
  const countText = () => {
    if (typeof local.count === 'number' && local.count > overflowCount())
      return `${overflowCount()}+`
    return local.count
  }
  const shouldShowCount = () => {
    if (local.dot) return true
    if (local.count === undefined || local.count === null || local.count === '') return false
    if (local.count === 0 && !local.showZero) return false
    return true
  }
  const hasChildren = () => Boolean(local.children)

  const indicator = () => (
    <Show when={shouldShowCount()}>
      <Show when={local.dot} fallback={<sup class={`${prefixCls()}-count`}>{countText()}</sup>}>
        <sup class={`${prefixCls()}-dot`} />
      </Show>
    </Show>
  )

  return (
    <Show
      when={local.status && !hasChildren()}
      fallback={
        <span
          {...rest}
          class={classNames(
            prefixCls(),
            hasChildren() && `${prefixCls()}-with-children`,
            hashId(),
            local.class,
          )}
        >
          {local.children}
          {indicator()}
        </span>
      }
    >
      <span {...rest} class={classNames(`${prefixCls()}-status`, hashId(), local.class)}>
        <span
          class={classNames(`${prefixCls()}-status-dot`, `${prefixCls()}-status-${local.status}`)}
        />
        <Show when={local.text}>
          <span class={`${prefixCls()}-status-text`}>{local.text}</span>
        </Show>
      </span>
    </Show>
  )
}
```

Create `packages/components/src/badge/index.ts`:

```ts
export * from './interface'
export * from './badge'
```

- [ ] **Step 6: Run Badge tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- --run src/badge/__tests__/badge.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/badge
git commit -m "feat(components): add badge"
```

---

## Task 4: Implement Table

**Files:**

- Create: `packages/components/src/table/interface.ts`
- Create: `packages/components/src/table/table.style.ts`
- Create: `packages/components/src/table/table.tsx`
- Create: `packages/components/src/table/index.ts`
- Create: `packages/components/src/table/__tests__/table.test.tsx`

- [ ] **Step 1: Write failing Table tests**

Create `packages/components/src/table/__tests__/table.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Table } from '../index'

interface UserRecord {
  key: string
  name: string
  age: number
  status: string
}

const data: UserRecord[] = [
  { key: 'a', name: 'Ada', age: 32, status: 'active' },
  { key: 'b', name: 'Grace', age: 36, status: 'idle' },
]

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', align: 'right' as const },
]

describe('Table', () => {
  it('renders headers and rows from dataIndex', () => {
    const result = render(() => <Table columns={columns} dataSource={data} />)
    expect(result.getByText('Name')).toBeInTheDocument()
    expect(result.getByText('Ada')).toBeInTheDocument()
    expect(result.getByText('Grace')).toBeInTheDocument()
  })

  it('uses render for custom cells', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'Status',
            dataIndex: 'status',
            render: (value) => <strong>{String(value)}</strong>,
          },
        ]}
        dataSource={data}
      />
    ))
    expect(result.getByText('active').tagName).toBe('STRONG')
  })

  it('supports rowKey string and function', () => {
    const byString = render(() => <Table columns={columns} dataSource={data} rowKey="name" />)
    expect(byString.container.querySelector('tbody tr')?.getAttribute('data-row-key')).toBe('Ada')
    byString.unmount()

    const byFunction = render(() => (
      <Table columns={columns} dataSource={data} rowKey={(record) => record.status} />
    ))
    expect(byFunction.container.querySelector('tbody tr')?.getAttribute('data-row-key')).toBe(
      'active',
    )
  })

  it('supports showHeader false', () => {
    const result = render(() => <Table columns={columns} dataSource={data} showHeader={false} />)
    expect(result.container.querySelector('thead')).toBeNull()
  })

  it('renders empty text when no data', () => {
    const result = render(() => <Table columns={columns} dataSource={[]} emptyText="No rows" />)
    expect(result.getByText('No rows')).toBeInTheDocument()
  })

  it('applies prefix, bordered, size, and loading classes', () => {
    const result = render(() => (
      <Table columns={columns} dataSource={data} bordered size="small" loading />
    ))
    const root = result.container.firstElementChild as HTMLElement
    expect(root.className).toContain('ads-table-wrapper')
    expect(root.className).toContain('ads-table-bordered')
    expect(root.className).toContain('ads-table-small')
    expect(root.className).toContain('ads-table-loading')
  })

  it('invokes row event handlers from onRow', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Table columns={columns} dataSource={data} onRow={() => ({ onClick })} />
    ))
    fireEvent.click(result.getByText('Ada').closest('tr')!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Table columns={columns} dataSource={data} />
      </ConfigProvider>
    ))
    expect(result.container.firstElementChild?.className).toContain('custom-table-wrapper')
  })
})
```

- [ ] **Step 2: Run Table tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- --run src/table/__tests__/table.test.tsx
```

Expected: FAIL because `packages/components/src/table` does not exist.

- [ ] **Step 3: Add Table interface**

Create `packages/components/src/table/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { ComponentSize } from '@solid-ant-design/theme'

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  title?: JSX.Element
  dataIndex?: keyof T | string
  key?: string
  render?: (value: unknown, record: T, index: number) => JSX.Element
  width?: number | string
  align?: 'left' | 'center' | 'right'
  class?: string
  classList?: Record<string, boolean | undefined>
}

export interface TableProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  columns?: TableColumn<T>[]
  dataSource?: T[]
  rowKey?: keyof T | ((record: T, index: number) => string | number)
  loading?: boolean
  emptyText?: JSX.Element
  size?: ComponentSize
  bordered?: boolean
  showHeader?: boolean
  onRow?: (record: T, index: number) => JSX.HTMLAttributes<HTMLTableRowElement>
}
```

- [ ] **Step 4: Add Table styles**

Create `packages/components/src/table/table.style.ts` with root wrapper, table, header, body, cell, size, bordered, empty, and loading styles using `getComponentToken('Table', token())`.

Use this complete implementation:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useTableStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Table', prefixCls] }, () => {
    const t = token()
    const table = getComponentToken('Table', t)
    return {
      [`.${prefixCls}-wrapper`]: {
        position: 'relative',
        width: '100%',
        color: t.colorText,
        'font-size': t.fontSize,
        'font-family': t.fontFamily,
      },
      [`.${prefixCls}`]: {
        width: '100%',
        'border-collapse': 'separate',
        'border-spacing': 0,
        background: t.colorBgContainer,
      },
      [`.${prefixCls} th`]: {
        padding: table.cellPadding,
        color: table.headerColor,
        'font-weight': 600,
        'text-align': 'start',
        background: table.headerBg,
        borderBottom: `${t.lineWidth}px solid ${table.borderColor}`,
      },
      [`.${prefixCls} td`]: {
        padding: table.cellPadding,
        borderBottom: `${t.lineWidth}px solid ${table.borderColor}`,
        transition: `background ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls} tbody tr:hover td`]: { background: table.rowHoverBg },
      [`.${prefixCls}-small th, .${prefixCls}-small td`]: { padding: table.cellPaddingSm },
      [`.${prefixCls}-large th, .${prefixCls}-large td`]: { padding: table.cellPaddingLg },
      [`.${prefixCls}-bordered .${prefixCls}`]: {
        border: `${t.lineWidth}px solid ${table.borderColor}`,
        'border-radius': table.borderRadius,
        overflow: 'hidden',
      },
      [`.${prefixCls}-bordered th, .${prefixCls}-bordered td`]: {
        borderInlineEnd: `${t.lineWidth}px solid ${table.borderColor}`,
      },
      [`.${prefixCls}-bordered th:last-child, .${prefixCls}-bordered td:last-child`]: {
        borderInlineEnd: 0,
      },
      [`.${prefixCls}-cell-center`]: { 'text-align': 'center !important' },
      [`.${prefixCls}-cell-right`]: { 'text-align': 'right !important' },
      [`.${prefixCls}-empty`]: { color: table.emptyColor, 'text-align': 'center' },
      [`.${prefixCls}-loading-indicator`]: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        color: t.colorTextSecondary,
        background: 'rgba(255, 255, 255, 0.65)',
      },
    }
  })
}
```

- [ ] **Step 5: Add Table implementation and exports**

Create `packages/components/src/table/table.tsx`:

```tsx
import { For, Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTableStyle } from './table.style'
import type { JSX } from 'solid-js'
import type { TableColumn, TableProps } from './interface'

function getValue<T extends Record<string, unknown>>(
  record: T,
  dataIndex: keyof T | string | undefined,
) {
  if (!dataIndex) return undefined
  return record[dataIndex as keyof T]
}

function getColumnKey<T extends Record<string, unknown>>(column: TableColumn<T>, index: number) {
  return column.key ?? String(column.dataIndex ?? index)
}

function getRowKey<T extends Record<string, unknown>>(
  record: T,
  index: number,
  rowKey: TableProps<T>['rowKey'],
) {
  if (typeof rowKey === 'function') return rowKey(record, index)
  if (rowKey) return String(record[rowKey])
  if ('key' in record && record.key != null) return String(record.key)
  return String(index)
}

export function Table<T extends Record<string, unknown> = Record<string, unknown>>(
  props: TableProps<T>,
) {
  const [local, rest] = splitProps(props, [
    'columns',
    'dataSource',
    'rowKey',
    'loading',
    'emptyText',
    'size',
    'bordered',
    'showHeader',
    'onRow',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-table`
  const [, hashId] = useTableStyle(prefixCls())
  const columns = () => local.columns ?? []
  const data = () => local.dataSource ?? []
  const size = () => local.size ?? 'middle'

  return (
    <div
      {...rest}
      class={classNames(
        `${prefixCls()}-wrapper`,
        `${prefixCls()}-${size()}`,
        local.bordered && `${prefixCls()}-bordered`,
        local.loading && `${prefixCls()}-loading`,
        hashId(),
        local.class,
      )}
    >
      <table class={prefixCls()}>
        <Show when={local.showHeader !== false}>
          <thead>
            <tr>
              <For each={columns()}>
                {(column, index) => (
                  <th
                    class={classNames(
                      column.align === 'center' && `${prefixCls()}-cell-center`,
                      column.align === 'right' && `${prefixCls()}-cell-right`,
                      column.class,
                    )}
                    classList={column.classList}
                    style={{
                      width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                    }}
                    data-column-key={getColumnKey(column, index())}
                  >
                    {column.title}
                  </th>
                )}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody>
          <Show
            when={data().length > 0}
            fallback={
              <tr>
                <td class={`${prefixCls()}-empty`} colspan={Math.max(columns().length, 1)}>
                  {local.emptyText ?? 'No data'}
                </td>
              </tr>
            }
          >
            <For each={data()}>
              {(record, index) => {
                const rowProps = () => local.onRow?.(record, index()) ?? {}
                return (
                  <tr {...rowProps()} data-row-key={getRowKey(record, index(), local.rowKey)}>
                    <For each={columns()}>
                      {(column) => {
                        const value = () => getValue(record, column.dataIndex)
                        return (
                          <td
                            class={classNames(
                              column.align === 'center' && `${prefixCls()}-cell-center`,
                              column.align === 'right' && `${prefixCls()}-cell-right`,
                              column.class,
                            )}
                            classList={column.classList}
                          >
                            {column.render
                              ? column.render(value(), record, index())
                              : (value() as JSX.Element)}
                          </td>
                        )
                      }}
                    </For>
                  </tr>
                )
              }}
            </For>
          </Show>
        </tbody>
      </table>
      <Show when={local.loading}>
        <div class={`${prefixCls()}-loading-indicator`}>Loading...</div>
      </Show>
    </div>
  )
}
```

Create `packages/components/src/table/index.ts`:

```ts
export * from './interface'
export * from './table'
```

- [ ] **Step 6: Run Table tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- --run src/table/__tests__/table.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/table
git commit -m "feat(components): add table"
```

---

## Task 5: Add Root Exports and Docs

**Files:**

- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Create: `apps/docs/src/routes/components/table.tsx`
- Create: `apps/docs/src/routes/components/tag.tsx`
- Create: `apps/docs/src/routes/components/badge.tsx`

- [ ] **Step 1: Add root exports**

Append to `packages/components/src/index.ts`:

```ts
export * from './table'
export * from './tag'
export * from './badge'
```

- [ ] **Step 2: Add docs nav entries**

In `apps/docs/src/site/nav.ts`, add these entries after Switch and before Alert:

```ts
  { path: '/components/table', label: 'Table' },
  { path: '/components/tag', label: 'Tag' },
  { path: '/components/badge', label: 'Badge' },
```

- [ ] **Step 3: Add Table docs page**

Create `apps/docs/src/routes/components/table.tsx` with imports from `@solid-ant-design/core`, demo records, columns, and demos for basic table, bordered/small table, custom render using `Tag` and `Badge`, and empty/loading states.

Use this implementation:

```tsx
import { Badge, Table, Tag } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

interface UserRecord {
  key: string
  name: string
  age: number
  status: 'active' | 'idle'
}

const data: UserRecord[] = [
  { key: '1', name: 'Ada Lovelace', age: 32, status: 'active' },
  { key: '2', name: 'Grace Hopper', age: 36, status: 'idle' },
]

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', align: 'right' as const },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (value: unknown) =>
      value === 'active' ? (
        <Tag color="success">Active</Tag>
      ) : (
        <Badge status="default" text="Idle" />
      ),
  },
]

export default function TablePage() {
  return (
    <>
      <h1>Table</h1>
      <DemoBlock title="Basic" code={`<Table columns={columns} dataSource={data} />`}>
        <Table columns={columns} dataSource={data} />
      </DemoBlock>
      <DemoBlock
        title="Bordered small"
        code={`<Table bordered size="small" columns={columns} dataSource={data} />`}
      >
        <Table bordered size="small" columns={columns} dataSource={data} />
      </DemoBlock>
      <DemoBlock
        title="Empty and loading"
        code={`<Table loading columns={columns} dataSource={[]} emptyText="No users" />`}
      >
        <Table loading columns={columns} dataSource={[]} emptyText="No users" />
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 4: Add Tag docs page**

Create `apps/docs/src/routes/components/tag.tsx`:

```tsx
import { Tag, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

export default function TagPage() {
  return (
    <>
      <h1>Tag</h1>
      <DemoBlock title="Basic" code={`<Tag>Default</Tag>`}>
        <Space wrap>
          <Tag>Default</Tag>
          <Tag color="success">Success</Tag>
          <Tag color="warning">Warning</Tag>
          <Tag color="error">Error</Tag>
          <Tag color="#722ed1">Custom</Tag>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Closable"
        code={`<Tag closable onClose={() => console.log('closed')}>Closable</Tag>`}
      >
        <Tag closable onClose={() => console.log('closed')}>
          Closable
        </Tag>
      </DemoBlock>
      <DemoBlock title="Borderless" code={`<Tag bordered={false}>Borderless</Tag>`}>
        <Tag bordered={false}>Borderless</Tag>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 5: Add Badge docs page**

Create `apps/docs/src/routes/components/badge.tsx`:

```tsx
import { Badge, Button, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

export default function BadgePage() {
  return (
    <>
      <h1>Badge</h1>
      <DemoBlock title="Count" code={`<Badge count={5}><Button>Inbox</Button></Badge>`}>
        <Space wrap>
          <Badge count={5}>
            <Button>Inbox</Button>
          </Badge>
          <Badge count={120} overflowCount={99}>
            <Button>Alerts</Button>
          </Badge>
          <Badge count={0} showZero>
            <Button>Zero</Button>
          </Badge>
        </Space>
      </DemoBlock>
      <DemoBlock title="Dot" code={`<Badge dot><Button>Updates</Button></Badge>`}>
        <Badge dot>
          <Button>Updates</Button>
        </Badge>
      </DemoBlock>
      <DemoBlock title="Status" code={`<Badge status="success" text="Active" />`}>
        <Space direction="vertical">
          <Badge status="success" text="Active" />
          <Badge status="processing" text="Processing" />
          <Badge status="warning" text="Warning" />
          <Badge status="error" text="Error" />
          <Badge status="default" text="Default" />
        </Space>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 6: Run typecheck/build for docs and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/index.ts apps/docs/src/site/nav.ts apps/docs/src/routes/components/table.tsx apps/docs/src/routes/components/tag.tsx apps/docs/src/routes/components/badge.tsx
git commit -m "docs: add data display component pages"
```

---

## Task 6: Full Verification and Cleanup

**Files:**

- Check all files created or modified by previous tasks.

- [ ] **Step 1: Check file naming rule**

Run:

```bash
find apps packages -type f \( -name '*.ts' -o -name '*.tsx' \) | awk -F/ '{name=$NF; if (name !~ /^[a-z0-9]+([.-][a-z0-9]+)*\.(d\.)?(ts|tsx)$/) print $0}'
```

Expected: no output.

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

Expected: PASS. If it fails only due formatting, run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format`, then repeat format check and commit formatting changes.

- [ ] **Step 4: Run recursive typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 5: Run recursive tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 6: Run recursive build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 7: Commit verification fixes if any**

If any verification step required fixes, commit them:

```bash
git add apps packages docs package.json pnpm-lock.yaml
git commit -m "chore: verify data display components"
```

If there are no changes, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: Theme tokens, Table, Tag, Badge, root exports, docs, tests, and full verification are all covered by tasks.
- Scope: The plan intentionally excludes Table pagination, sorting, filtering, selection, expandable rows, fixed columns, virtual scrolling, Tag icons, and Badge ribbon.
- Type consistency: Component names and token keys are consistent across theme, styles, tests, docs, and exports. The plan uses `overflowIndicatorHeight` in Badge tokens to avoid the ambiguous `indicatorHeight` name.
