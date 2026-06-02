# ant-design-solid Interaction Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MVP `Tabs`, `Tooltip`, and `Dropdown` components with shared placement, token-driven styles, tests, exports, and docs.

**Architecture:** Extend theme tokens first, then add a small shared placement helper used by portal-based overlays. Implement `Tabs` as a non-overlay controlled/uncontrolled component and `Tooltip`/`Dropdown` as lightweight wrappers that render fixed-position overlays through `InternalPortal` using existing document event helpers.

**Tech Stack:** TypeScript, SolidJS JSX/signals, `@ant-design-solid/cssinjs`, `@ant-design-solid/theme`, Vitest, `@solidjs/testing-library`, pnpm 11, Vite 8, oxlint, oxfmt.

---

## File Structure Map

### Theme package

- Modify `packages/theme/src/types.ts`: add `TabsComponentToken`, `TooltipComponentToken`, `DropdownComponentToken`, and extend `ComponentTokenMap`.
- Modify `packages/theme/src/components.ts`: derive default tokens for interaction components.
- Modify `packages/theme/src/__tests__/theme.test.ts`: add defaults/override assertions.

### Shared placement helper

- Create `packages/components/src/shared/placement.ts`: pure functions for tooltip/dropdown fixed positioning.
- Create `packages/components/src/shared/__tests__/placement.test.ts`: pure unit tests for placement math.

### Tabs component

- Create `packages/components/src/tabs/interface.ts`: public tabs types.
- Create `packages/components/src/tabs/tabs.style.ts`: token-driven styles.
- Create `packages/components/src/tabs/tabs.tsx`: controlled/uncontrolled tabs renderer.
- Create `packages/components/src/tabs/index.ts`: exports.
- Create `packages/components/src/tabs/__tests__/tabs.test.tsx`: behavior tests.

### Tooltip component

- Create `packages/components/src/tooltip/interface.ts`: public tooltip types.
- Create `packages/components/src/tooltip/tooltip.style.ts`: token-driven styles.
- Create `packages/components/src/tooltip/tooltip.tsx`: wrapper and overlay renderer.
- Create `packages/components/src/tooltip/index.ts`: exports.
- Create `packages/components/src/tooltip/__tests__/tooltip.test.tsx`: behavior tests.

### Dropdown component

- Create `packages/components/src/dropdown/interface.ts`: public dropdown/menu types.
- Create `packages/components/src/dropdown/dropdown.style.ts`: token-driven styles.
- Create `packages/components/src/dropdown/dropdown.tsx`: wrapper and menu overlay renderer.
- Create `packages/components/src/dropdown/index.ts`: exports.
- Create `packages/components/src/dropdown/__tests__/dropdown.test.tsx`: behavior tests.

### Exports and docs

- Modify `packages/components/src/index.ts`: export `tabs`, `tooltip`, `dropdown`.
- Modify `apps/docs/src/site/nav.ts`: add nav entries.
- Create `apps/docs/src/routes/components/tabs.tsx`: demos.
- Create `apps/docs/src/routes/components/tooltip.tsx`: demos.
- Create `apps/docs/src/routes/components/dropdown.tsx`: demos.

---

## Task 1: Add Theme Tokens

**Files:**
- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Write the failing theme test**

Add this test case to `packages/theme/src/__tests__/theme.test.ts` inside the existing `describe` block:

```ts
it('derives interaction component token defaults and applies overrides', () => {
  const token = mergeTheme({
    components: {
      Tabs: { inkBarColor: '#722ed1', horizontalItemPadding: 18 },
      Tooltip: { maxWidth: 320, bg: '#111111' },
      Dropdown: { minWidth: 180, itemHoverBg: '#f0f5ff' },
    },
  })

  expect(getComponentToken('Tabs', token).inkBarColor).toBe('#722ed1')
  expect(getComponentToken('Tabs', token).itemSelectedColor).toBe(token.colorPrimary)
  expect(getComponentToken('Tabs', token).horizontalItemPadding).toBe(18)
  expect(getComponentToken('Tabs', token).cardBorderColor).toBe(token.colorBorderSecondary)

  expect(getComponentToken('Tooltip', token).maxWidth).toBe(320)
  expect(getComponentToken('Tooltip', token).bg).toBe('#111111')
  expect(getComponentToken('Tooltip', token).color).toBe('#ffffff')
  expect(getComponentToken('Tooltip', token).borderRadius).toBe(token.borderRadius)

  expect(getComponentToken('Dropdown', token).minWidth).toBe(180)
  expect(getComponentToken('Dropdown', token).itemHoverBg).toBe('#f0f5ff')
  expect(getComponentToken('Dropdown', token).bg).toBe(token.colorBgElevated)
  expect(getComponentToken('Dropdown', token).itemDisabledColor).toBe(token.colorTextDisabled)
})
```

- [ ] **Step 2: Run the theme test and verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/theme test -- --run src/__tests__/theme.test.ts
```

Expected: FAIL because `Tabs`, `Tooltip`, and `Dropdown` are not valid component token keys yet.

- [ ] **Step 3: Add token interfaces and map entries**

In `packages/theme/src/types.ts`, add before `ComponentTokenMap`:

```ts
export interface TabsComponentToken {
  itemColor: string
  itemSelectedColor: string
  itemHoverColor: string
  itemDisabledColor: string
  inkBarColor: string
  cardBg: string
  cardBorderColor: string
  horizontalItemPadding: number
  horizontalItemPaddingSm: number
  horizontalItemPaddingLg: number
}

export interface TooltipComponentToken {
  bg: string
  color: string
  borderRadius: number
  paddingBlock: number
  paddingInline: number
  boxShadow: string
  maxWidth: number
}

export interface DropdownComponentToken {
  bg: string
  boxShadow: string
  borderRadius: number
  itemColor: string
  itemHoverBg: string
  itemDisabledColor: string
  itemPaddingBlock: number
  itemPaddingInline: number
  minWidth: number
}
```

Extend `ComponentTokenMap` with:

```ts
  Tabs: TabsComponentToken
  Tooltip: TooltipComponentToken
  Dropdown: DropdownComponentToken
```

- [ ] **Step 4: Add default token derivation**

In `packages/theme/src/components.ts`, add these entries to the `defaults` object:

```ts
    Tabs: {
      itemColor: token.colorText,
      itemSelectedColor: token.colorPrimary,
      itemHoverColor: token.colorPrimaryHover,
      itemDisabledColor: token.colorTextDisabled,
      inkBarColor: token.colorPrimary,
      cardBg: token.colorFillAlter,
      cardBorderColor: token.colorBorderSecondary,
      horizontalItemPadding: token.padding,
      horizontalItemPaddingSm: token.paddingSM,
      horizontalItemPaddingLg: token.paddingLG,
    },
    Tooltip: {
      bg: 'rgba(0, 0, 0, 0.85)',
      color: '#ffffff',
      borderRadius: token.borderRadius,
      paddingBlock: token.paddingXS,
      paddingInline: token.paddingSM,
      boxShadow: token.boxShadow,
      maxWidth: 250,
    },
    Dropdown: {
      bg: token.colorBgElevated,
      boxShadow: token.boxShadow,
      borderRadius: token.borderRadius,
      itemColor: token.colorText,
      itemHoverBg: token.colorFillAlter,
      itemDisabledColor: token.colorTextDisabled,
      itemPaddingBlock: token.paddingXS,
      itemPaddingInline: token.paddingSM,
      minWidth: 120,
    },
```

- [ ] **Step 5: Run theme tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/theme test -- --run src/__tests__/theme.test.ts
```

Expected: PASS.

Commit:

```bash
git add packages/theme/src/types.ts packages/theme/src/components.ts packages/theme/src/__tests__/theme.test.ts
git commit -m "feat(theme): add interaction component tokens"
```

---

## Task 2: Add Shared Placement Helper

**Files:**
- Create: `packages/components/src/shared/placement.ts`
- Create: `packages/components/src/shared/__tests__/placement.test.ts`

- [ ] **Step 1: Write failing placement tests**

Create `packages/components/src/shared/__tests__/placement.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { getDropdownPosition, getTooltipPosition } from '../placement'

const rect: DOMRect = {
  x: 10,
  y: 20,
  top: 20,
  left: 10,
  right: 110,
  bottom: 60,
  width: 100,
  height: 40,
  toJSON: () => ({}),
}

describe('placement helpers', () => {
  it('positions tooltip for each side', () => {
    expect(getTooltipPosition(rect, 'top', 8)).toEqual({
      top: '12px',
      left: '60px',
      transform: 'translate(-50%, -100%)',
    })
    expect(getTooltipPosition(rect, 'bottom', 8)).toEqual({
      top: '68px',
      left: '60px',
      transform: 'translateX(-50%)',
    })
    expect(getTooltipPosition(rect, 'left', 8)).toEqual({
      top: '40px',
      left: '2px',
      transform: 'translate(-100%, -50%)',
    })
    expect(getTooltipPosition(rect, 'right', 8)).toEqual({
      top: '40px',
      left: '118px',
      transform: 'translateY(-50%)',
    })
  })

  it('positions dropdown for corner placements', () => {
    expect(getDropdownPosition(rect, 'bottomLeft', 4)).toEqual({ top: '64px', left: '10px' })
    expect(getDropdownPosition(rect, 'bottomRight', 4)).toEqual({
      top: '64px',
      left: '110px',
      transform: 'translateX(-100%)',
    })
    expect(getDropdownPosition(rect, 'topLeft', 4)).toEqual({
      top: '16px',
      left: '10px',
      transform: 'translateY(-100%)',
    })
    expect(getDropdownPosition(rect, 'topRight', 4)).toEqual({
      top: '16px',
      left: '110px',
      transform: 'translate(-100%, -100%)',
    })
  })
})
```

- [ ] **Step 2: Run placement tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/shared/__tests__/placement.test.ts
```

Expected: FAIL because `../placement` does not exist.

- [ ] **Step 3: Implement placement helper**

Create `packages/components/src/shared/placement.ts`:

```ts
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type DropdownPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'

export interface OverlayPosition {
  top: string
  left: string
  transform?: string
}

export function getTooltipPosition(rect: DOMRect, placement: TooltipPlacement, offset = 8): OverlayPosition {
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  if (placement === 'bottom') {
    return { top: `${rect.bottom + offset}px`, left: `${centerX}px`, transform: 'translateX(-50%)' }
  }
  if (placement === 'left') {
    return { top: `${centerY}px`, left: `${rect.left - offset}px`, transform: 'translate(-100%, -50%)' }
  }
  if (placement === 'right') {
    return { top: `${centerY}px`, left: `${rect.right + offset}px`, transform: 'translateY(-50%)' }
  }
  return { top: `${rect.top - offset}px`, left: `${centerX}px`, transform: 'translate(-50%, -100%)' }
}

export function getDropdownPosition(rect: DOMRect, placement: DropdownPlacement, offset = 4): OverlayPosition {
  if (placement === 'bottomRight') {
    return { top: `${rect.bottom + offset}px`, left: `${rect.right}px`, transform: 'translateX(-100%)' }
  }
  if (placement === 'topLeft') {
    return { top: `${rect.top - offset}px`, left: `${rect.left}px`, transform: 'translateY(-100%)' }
  }
  if (placement === 'topRight') {
    return { top: `${rect.top - offset}px`, left: `${rect.right}px`, transform: 'translate(-100%, -100%)' }
  }
  return { top: `${rect.bottom + offset}px`, left: `${rect.left}px` }
}
```

- [ ] **Step 4: Run placement tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/shared/__tests__/placement.test.ts
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/shared/placement.ts packages/components/src/shared/__tests__/placement.test.ts
git commit -m "feat(components): add overlay placement helper"
```

---

## Task 3: Implement Tabs

**Files:**
- Create: `packages/components/src/tabs/interface.ts`
- Create: `packages/components/src/tabs/tabs.style.ts`
- Create: `packages/components/src/tabs/tabs.tsx`
- Create: `packages/components/src/tabs/index.ts`
- Create: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing Tabs tests**

Create `packages/components/src/tabs/__tests__/tabs.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tabs } from '../index'

const items = [
  { key: 'one', label: 'One', children: <div>Pane one</div> },
  { key: 'two', label: 'Two', children: <div>Pane two</div> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: <div>Disabled pane</div> },
]

describe('Tabs', () => {
  it('renders labels and active pane', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="one" />)
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByText('Pane one')).toBeInTheDocument()
  })

  it('switches uncontrolled active pane and calls onChange', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} defaultActiveKey="one" onChange={onChange} />)
    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(onChange).toHaveBeenCalledWith('two')
    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByText('Pane two')).toBeInTheDocument()
  })

  it('controlled mode calls onChange without changing active pane by itself', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} activeKey="one" onChange={onChange} />)
    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(onChange).toHaveBeenCalledWith('two')
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByText('Pane one')).toBeInTheDocument()
  })

  it('controlled mode updates when activeKey changes', () => {
    const [activeKey, setActiveKey] = createSignal('one')
    const result = render(() => <Tabs items={items} activeKey={activeKey()} onChange={setActiveKey} />)
    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(result.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByText('Pane two')).toBeInTheDocument()
  })

  it('does not activate disabled tabs', () => {
    const onChange = vi.fn()
    const result = render(() => <Tabs items={items} defaultActiveKey="one" onChange={onChange} />)
    fireEvent.click(result.getByRole('tab', { name: 'Disabled' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  })

  it('destroys inactive panes when requested', () => {
    const result = render(() => <Tabs items={items} defaultActiveKey="one" destroyInactiveTabPane />)
    expect(result.queryByText('Pane two')).toBeNull()
    fireEvent.click(result.getByRole('tab', { name: 'Two' }))
    expect(result.queryByText('Pane one')).toBeNull()
    expect(result.getByText('Pane two')).toBeInTheDocument()
  })

  it('applies bottom, card, size, and custom prefix classes', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tabs items={items} tabPosition="bottom" type="card" size="large" />
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement
    expect(root.className).toContain('custom-tabs')
    expect(root.className).toContain('custom-tabs-bottom')
    expect(root.className).toContain('custom-tabs-card')
    expect(root.className).toContain('custom-tabs-large')
  })
})
```

- [ ] **Step 2: Run Tabs tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/tabs/__tests__/tabs.test.tsx
```

Expected: FAIL because `packages/components/src/tabs` does not exist.

- [ ] **Step 3: Add Tabs interface**

Create `packages/components/src/tabs/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'

export type TabsType = 'line' | 'card'
export type TabsPosition = 'top' | 'bottom'

export interface TabsItem {
  key: string
  label: JSX.Element
  children?: JSX.Element
  disabled?: boolean
}

export interface TabsProps extends JSX.HTMLAttributes<HTMLDivElement> {
  items: TabsItem[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  type?: TabsType
  size?: ComponentSize
  tabPosition?: TabsPosition
  destroyInactiveTabPane?: boolean
}
```

- [ ] **Step 4: Add Tabs styles**

Create `packages/components/src/tabs/tabs.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTabsStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tabs', prefixCls] }, () => {
    const t = token()
    const tabs = getComponentToken('Tabs', t)
    return {
      [`.${prefixCls}`]: { color: t.colorText, 'font-family': t.fontFamily, 'font-size': t.fontSize },
      [`.${prefixCls}-nav`]: { display: 'flex', borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}` },
      [`.${prefixCls}-bottom .${prefixCls}-nav`]: { borderBottom: 0, borderTop: `${t.lineWidth}px solid ${tabs.cardBorderColor}` },
      [`.${prefixCls}-tab`]: {
        position: 'relative',
        padding: `0 ${tabs.horizontalItemPadding}px`,
        height: t.controlHeight,
        color: tabs.itemColor,
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        transition: `color ${t.motionDurationMid} ${t.motionEaseInOut}`,
      },
      [`.${prefixCls}-tab:hover`]: { color: tabs.itemHoverColor },
      [`.${prefixCls}-tab-active`]: { color: tabs.itemSelectedColor },
      [`.${prefixCls}-tab-active::after`]: {
        content: '""',
        position: 'absolute',
        left: tabs.horizontalItemPadding,
        right: tabs.horizontalItemPadding,
        bottom: -1,
        height: 2,
        background: tabs.inkBarColor,
      },
      [`.${prefixCls}-bottom .${prefixCls}-tab-active::after`]: { top: -1, bottom: 'auto' },
      [`.${prefixCls}-tab-disabled`]: { color: tabs.itemDisabledColor, cursor: 'not-allowed' },
      [`.${prefixCls}-small .${prefixCls}-tab`]: { height: t.controlHeightSM, padding: `0 ${tabs.horizontalItemPaddingSm}px` },
      [`.${prefixCls}-large .${prefixCls}-tab`]: { height: t.controlHeightLG, padding: `0 ${tabs.horizontalItemPaddingLg}px` },
      [`.${prefixCls}-card .${prefixCls}-tab`]: {
        marginInlineEnd: 2,
        background: tabs.cardBg,
        border: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        borderBottom: 0,
        'border-radius': `${t.borderRadius}px ${t.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-bottom.${prefixCls}-card .${prefixCls}-tab`]: {
        borderTop: 0,
        borderBottom: `${t.lineWidth}px solid ${tabs.cardBorderColor}`,
        'border-radius': `0 0 ${t.borderRadius}px ${t.borderRadius}px`,
      },
      [`.${prefixCls}-content`]: { paddingTop: t.padding },
      [`.${prefixCls}-bottom .${prefixCls}-content`]: { paddingTop: 0, paddingBottom: t.padding },
      [`.${prefixCls}-pane-hidden`]: { display: 'none' },
    }
  })
}
```

- [ ] **Step 5: Add Tabs implementation and exports**

Create `packages/components/src/tabs/tabs.tsx`:

```tsx
import { For, Show, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTabsStyle } from './tabs.style'
import type { TabsItem, TabsProps } from './interface'

function getInitialActiveKey(items: TabsItem[], defaultActiveKey?: string) {
  if (defaultActiveKey && items.some((item) => item.key === defaultActiveKey && !item.disabled)) return defaultActiveKey
  return items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? ''
}

export function Tabs(props: TabsProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'activeKey',
    'defaultActiveKey',
    'onChange',
    'type',
    'size',
    'tabPosition',
    'destroyInactiveTabPane',
    'class',
  ])
  const [innerActiveKey, setInnerActiveKey] = createSignal(getInitialActiveKey(local.items, local.defaultActiveKey))
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tabs`
  const [, hashId] = useTabsStyle(prefixCls())
  const mergedActiveKey = () => local.activeKey ?? innerActiveKey()
  const position = () => local.tabPosition ?? 'top'
  const type = () => local.type ?? 'line'
  const size = () => local.size ?? config.componentSize()
  const activate = (item: TabsItem) => {
    if (item.disabled || item.key === mergedActiveKey()) return
    if (local.activeKey === undefined) setInnerActiveKey(item.key)
    local.onChange?.(item.key)
  }
  const nav = () => (
    <div class={`${prefixCls()}-nav`} role="tablist">
      <For each={local.items}>
        {(item) => {
          const active = () => item.key === mergedActiveKey()
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active() ? 'true' : 'false'}
              aria-disabled={item.disabled ? 'true' : 'false'}
              class={classNames(
                `${prefixCls()}-tab`,
                active() && `${prefixCls()}-tab-active`,
                item.disabled && `${prefixCls()}-tab-disabled`,
              )}
              onClick={() => activate(item)}
            >
              {item.label}
            </button>
          )
        }}
      </For>
    </div>
  )
  const content = () => (
    <div class={`${prefixCls()}-content`}>
      <For each={local.items}>
        {(item) => {
          const active = () => item.key === mergedActiveKey()
          return (
            <Show when={!local.destroyInactiveTabPane || active()}>
              <div class={classNames(`${prefixCls()}-pane`, !active() && `${prefixCls()}-pane-hidden`)} role="tabpanel">
                {item.children}
              </div>
            </Show>
          )
        }}
      </For>
    </div>
  )

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${position()}`,
        `${prefixCls()}-${type()}`,
        `${prefixCls()}-${size()}`,
        hashId(),
        local.class,
      )}
    >
      <Show when={position() === 'bottom'} fallback={<>{nav()}{content()}</>}>
        {content()}
        {nav()}
      </Show>
    </div>
  )
}
```

Create `packages/components/src/tabs/index.ts`:

```ts
export * from './interface'
export * from './tabs'
```

- [ ] **Step 6: Run Tabs tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/tabs/__tests__/tabs.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/tabs
git commit -m "feat(components): add tabs"
```

---

## Task 4: Implement Tooltip

**Files:**
- Create: `packages/components/src/tooltip/interface.ts`
- Create: `packages/components/src/tooltip/tooltip.style.ts`
- Create: `packages/components/src/tooltip/tooltip.tsx`
- Create: `packages/components/src/tooltip/index.ts`
- Create: `packages/components/src/tooltip/__tests__/tooltip.test.tsx`

- [ ] **Step 1: Write failing Tooltip tests**

Create `packages/components/src/tooltip/__tests__/tooltip.test.tsx`:

```tsx
import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tooltip } from '../index'

describe('Tooltip', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  it('opens and closes on hover', async () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Tooltip title="Helpful" mouseEnterDelay={0} mouseLeaveDelay={0} onOpenChange={onOpenChange}>
        <button>Hover me</button>
      </Tooltip>
    ))
    fireEvent.mouseEnter(result.getByText('Hover me'))
    await vi.runAllTimersAsync()
    expect(document.body).toHaveTextContent('Helpful')
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.mouseLeave(result.getByText('Hover me'))
    await vi.runAllTimersAsync()
    expect(document.body).not.toHaveTextContent('Helpful')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggles on click', () => {
    const result = render(() => (
      <Tooltip title="Clicked" trigger="click">
        <button>Click me</button>
      </Tooltip>
    ))
    fireEvent.click(result.getByText('Click me'))
    expect(document.body).toHaveTextContent('Clicked')
    fireEvent.click(result.getByText('Click me'))
    expect(document.body).not.toHaveTextContent('Clicked')
  })

  it('opens on focus and closes on blur', () => {
    const result = render(() => (
      <Tooltip title="Focused" trigger="focus">
        <button>Focus me</button>
      </Tooltip>
    ))
    fireEvent.focus(result.getByText('Focus me'))
    expect(document.body).toHaveTextContent('Focused')
    fireEvent.blur(result.getByText('Focus me'))
    expect(document.body).not.toHaveTextContent('Focused')
  })

  it('supports controlled open and placement classes', () => {
    render(() => (
      <Tooltip title="Controlled" open placement="bottom">
        <button>Trigger</button>
      </Tooltip>
    ))
    const popup = document.body.querySelector<HTMLElement>('.ads-tooltip')!
    expect(popup).toHaveTextContent('Controlled')
    expect(popup).toHaveClass('ads-tooltip-bottom')
  })

  it('suppresses empty title', () => {
    const result = render(() => (
      <Tooltip title="" open>
        <button>Trigger</button>
      </Tooltip>
    ))
    expect(result.getByText('Trigger')).toBeInTheDocument()
    expect(document.body.querySelector('.ads-tooltip')).toBeNull()
  })

  it('uses custom prefix from ConfigProvider', () => {
    render(() => (
      <ConfigProvider prefixCls="custom">
        <Tooltip title="Custom" open>
          <button>Trigger</button>
        </Tooltip>
      </ConfigProvider>
    ))
    expect(document.body.querySelector('.custom-tooltip')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run Tooltip tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/tooltip/__tests__/tooltip.test.tsx
```

Expected: FAIL because `packages/components/src/tooltip` does not exist.

- [ ] **Step 3: Add Tooltip interface**

Create `packages/components/src/tooltip/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { TooltipPlacement } from '../shared/placement'

export type { TooltipPlacement }
export type TooltipTrigger = 'hover' | 'click' | 'focus'

export interface TooltipProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title'> {
  title?: JSX.Element
  placement?: TooltipPlacement
  trigger?: TooltipTrigger
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties | string
}
```

- [ ] **Step 4: Add Tooltip styles**

Create `packages/components/src/tooltip/tooltip.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useTooltipStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Tooltip', prefixCls] }, () => {
    const t = token()
    const tooltip = getComponentToken('Tooltip', t)
    return {
      [`.${prefixCls}-trigger`]: { display: 'inline-block' },
      [`.${prefixCls}`]: {
        position: 'fixed',
        'z-index': 1070,
        'box-sizing': 'border-box',
        'max-width': tooltip.maxWidth,
        padding: `${tooltip.paddingBlock}px ${tooltip.paddingInline}px`,
        color: tooltip.color,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
        background: tooltip.bg,
        'border-radius': tooltip.borderRadius,
        'box-shadow': tooltip.boxShadow,
        'pointer-events': 'none',
      },
    }
  })
}
```

- [ ] **Step 5: Add Tooltip implementation and exports**

Create `packages/components/src/tooltip/tooltip.tsx`:

```tsx
import { Show, createEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getTooltipPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { classNames } from '../shared/class-names'
import { useTooltipStyle } from './tooltip.style'
import type { TooltipProps } from './interface'

export function Tooltip(props: TooltipProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'placement',
    'trigger',
    'open',
    'defaultOpen',
    'onOpenChange',
    'mouseEnterDelay',
    'mouseLeaveDelay',
    'children',
    'class',
    'overlayClass',
    'overlayStyle',
  ])
  const [innerOpen, setInnerOpen] = createSignal(local.defaultOpen ?? false)
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement>()
  const [position, setPosition] = createSignal({ top: '0px', left: '0px' })
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tooltip`
  const [, hashId] = useTooltipStyle(prefixCls())
  const trigger = () => local.trigger ?? 'hover'
  const placement = () => local.placement ?? 'top'
  const mergedOpen = () => Boolean(local.open ?? innerOpen())
  const hasTitle = () => local.title !== undefined && local.title !== null && local.title !== ''
  let enterTimer: ReturnType<typeof setTimeout> | undefined
  let leaveTimer: ReturnType<typeof setTimeout> | undefined

  const updatePosition = () => {
    const rect = triggerRef()?.getBoundingClientRect()
    if (rect) setPosition(getTooltipPosition(rect, placement(), 8))
  }
  const setOpen = (next: boolean) => {
    if (local.open === undefined) setInnerOpen(next)
    local.onOpenChange?.(next)
    if (next) updatePosition()
  }
  const clearTimers = () => {
    if (enterTimer) clearTimeout(enterTimer)
    if (leaveTimer) clearTimeout(leaveTimer)
  }
  onCleanup(clearTimers)

  createEffect(() => {
    if (!mergedOpen() || trigger() !== 'click') return
    const removePointer = addDocumentPointerDown((event) => {
      const target = event.target as Node | null
      if (target && triggerRef()?.contains(target)) return
      setOpen(false)
    })
    const removeKey = addDocumentKeydown((event) => {
      if (event.key === 'Escape') setOpen(false)
    })
    onCleanup(() => {
      removePointer()
      removeKey()
    })
  })

  return (
    <>
      <span
        {...rest}
        ref={setTriggerRef}
        class={classNames(`${prefixCls()}-trigger`, local.class)}
        onMouseEnter={() => {
          if (trigger() !== 'hover') return
          clearTimers()
          enterTimer = setTimeout(() => setOpen(true), (local.mouseEnterDelay ?? 0.1) * 1000)
        }}
        onMouseLeave={() => {
          if (trigger() !== 'hover') return
          clearTimers()
          leaveTimer = setTimeout(() => setOpen(false), (local.mouseLeaveDelay ?? 0.1) * 1000)
        }}
        onClick={(event) => {
          if (trigger() !== 'click') return
          event.stopPropagation()
          setOpen(!mergedOpen())
        }}
        onFocus={() => {
          if (trigger() === 'focus') setOpen(true)
        }}
        onBlur={() => {
          if (trigger() === 'focus') setOpen(false)
        }}
      >
        {local.children}
      </span>
      <Show when={canUseDom() && mergedOpen() && hasTitle()}>
        <InternalPortal>
          <div
            class={classNames(prefixCls(), `${prefixCls()}-${placement()}`, hashId(), local.overlayClass)}
            style={{ ...position(), ...(typeof local.overlayStyle === 'object' ? local.overlayStyle : {}) }}
            role="tooltip"
          >
            {local.title}
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
```

Create `packages/components/src/tooltip/index.ts`:

```ts
export * from './interface'
export * from './tooltip'
```

- [ ] **Step 6: Run Tooltip tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/tooltip/__tests__/tooltip.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/tooltip
git commit -m "feat(components): add tooltip"
```

---

## Task 5: Implement Dropdown

**Files:**
- Create: `packages/components/src/dropdown/interface.ts`
- Create: `packages/components/src/dropdown/dropdown.style.ts`
- Create: `packages/components/src/dropdown/dropdown.tsx`
- Create: `packages/components/src/dropdown/index.ts`
- Create: `packages/components/src/dropdown/__tests__/dropdown.test.tsx`

- [ ] **Step 1: Write failing Dropdown tests**

Create `packages/components/src/dropdown/__tests__/dropdown.test.tsx`:

```tsx
import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Dropdown } from '../index'

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'disabled', label: 'Disabled', disabled: true },
  { key: 'divider', type: 'divider' as const },
  { key: 'delete', label: 'Delete' },
]

describe('Dropdown', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('opens on click trigger', () => {
    render(() => (
      <Dropdown menu={{ items }}>
        <button>Actions</button>
      </Dropdown>
    ))
    fireEvent.click(document.body.querySelector('button')!)
    expect(document.body).toHaveTextContent('Edit')
    expect(document.body.querySelector('.ads-dropdown')).toHaveClass('ads-dropdown-bottomLeft')
  })

  it('opens and closes on hover trigger', () => {
    render(() => (
      <Dropdown trigger="hover" menu={{ items }}>
        <button>Actions</button>
      </Dropdown>
    ))
    const trigger = document.body.querySelector('button')!.parentElement!
    fireEvent.mouseEnter(trigger)
    expect(document.body).toHaveTextContent('Edit')
    fireEvent.mouseLeave(trigger)
    expect(document.body).not.toHaveTextContent('Edit')
  })

  it('clicking enabled item calls menu onClick and closes', () => {
    const onClick = vi.fn()
    render(() => (
      <Dropdown menu={{ items, onClick }}>
        <button>Actions</button>
      </Dropdown>
    ))
    fireEvent.click(document.body.querySelector('button')!)
    fireEvent.click(document.body.querySelector('[data-menu-key="edit"]')!)
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'edit' }))
    expect(document.body).not.toHaveTextContent('Edit')
  })

  it('disabled item does not call menu onClick or close', () => {
    const onClick = vi.fn()
    render(() => (
      <Dropdown menu={{ items, onClick }}>
        <button>Actions</button>
      </Dropdown>
    ))
    fireEvent.click(document.body.querySelector('button')!)
    fireEvent.click(document.body.querySelector('[data-menu-key="disabled"]')!)
    expect(onClick).not.toHaveBeenCalled()
    expect(document.body).toHaveTextContent('Edit')
  })

  it('renders divider as separator', () => {
    render(() => (
      <Dropdown open menu={{ items }}>
        <button>Actions</button>
      </Dropdown>
    ))
    expect(document.body.querySelector('[role="separator"]')).not.toBeNull()
  })

  it('supports controlled open, placement, and custom prefix', () => {
    render(() => (
      <ConfigProvider prefixCls="custom">
        <Dropdown open placement="topRight" menu={{ items }}>
          <button>Actions</button>
        </Dropdown>
      </ConfigProvider>
    ))
    const popup = document.body.querySelector<HTMLElement>('.custom-dropdown')!
    expect(popup).toHaveTextContent('Edit')
    expect(popup).toHaveClass('custom-dropdown-topRight')
  })
})
```

- [ ] **Step 2: Run Dropdown tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/dropdown/__tests__/dropdown.test.tsx
```

Expected: FAIL because `packages/components/src/dropdown` does not exist.

- [ ] **Step 3: Add Dropdown interface**

Create `packages/components/src/dropdown/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { DropdownPlacement } from '../shared/placement'

export type { DropdownPlacement }
export type DropdownTrigger = 'hover' | 'click'

export interface DropdownMenuClickInfo {
  key: string
  domEvent: MouseEvent
}

export interface DropdownMenuItem {
  key: string
  label?: JSX.Element
  disabled?: boolean
  type?: 'item' | 'divider'
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  onClick?: (info: DropdownMenuClickInfo) => void
}

export interface DropdownProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  menu: DropdownMenuProps
  trigger?: DropdownTrigger
  placement?: DropdownPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties | string
}
```

- [ ] **Step 4: Add Dropdown styles**

Create `packages/components/src/dropdown/dropdown.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useDropdownStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Dropdown', prefixCls] }, () => {
    const t = token()
    const dropdown = getComponentToken('Dropdown', t)
    return {
      [`.${prefixCls}-trigger`]: { display: 'inline-block' },
      [`.${prefixCls}`]: {
        position: 'fixed',
        'z-index': 1050,
        'min-width': dropdown.minWidth,
        padding: `${t.paddingXS}px 0`,
        background: dropdown.bg,
        'border-radius': dropdown.borderRadius,
        'box-shadow': dropdown.boxShadow,
      },
      [`.${prefixCls}-menu`]: { margin: 0, padding: 0, 'list-style': 'none' },
      [`.${prefixCls}-item`]: {
        padding: `${dropdown.itemPaddingBlock}px ${dropdown.itemPaddingInline}px`,
        color: dropdown.itemColor,
        cursor: 'pointer',
        'white-space': 'nowrap',
      },
      [`.${prefixCls}-item:hover`]: { background: dropdown.itemHoverBg },
      [`.${prefixCls}-item-disabled`]: { color: dropdown.itemDisabledColor, cursor: 'not-allowed' },
      [`.${prefixCls}-item-disabled:hover`]: { background: 'transparent' },
      [`.${prefixCls}-divider`]: { height: 1, margin: `${t.marginXS}px 0`, background: t.colorBorderSecondary },
    }
  })
}
```

- [ ] **Step 5: Add Dropdown implementation and exports**

Create `packages/components/src/dropdown/dropdown.tsx`:

```tsx
import { For, Show, createEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getDropdownPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { classNames } from '../shared/class-names'
import { useDropdownStyle } from './dropdown.style'
import type { DropdownMenuItem, DropdownProps } from './interface'

export function Dropdown(props: DropdownProps) {
  const [local, rest] = splitProps(props, [
    'menu',
    'trigger',
    'placement',
    'open',
    'defaultOpen',
    'onOpenChange',
    'children',
    'class',
    'overlayClass',
    'overlayStyle',
  ])
  const [innerOpen, setInnerOpen] = createSignal(local.defaultOpen ?? false)
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement>()
  const [position, setPosition] = createSignal({ top: '0px', left: '0px' })
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-dropdown`
  const [, hashId] = useDropdownStyle(prefixCls())
  const trigger = () => local.trigger ?? 'click'
  const placement = () => local.placement ?? 'bottomLeft'
  const mergedOpen = () => Boolean(local.open ?? innerOpen())

  const updatePosition = () => {
    const rect = triggerRef()?.getBoundingClientRect()
    if (rect) setPosition(getDropdownPosition(rect, placement(), 4))
  }
  const setOpen = (next: boolean) => {
    if (local.open === undefined) setInnerOpen(next)
    local.onOpenChange?.(next)
    if (next) updatePosition()
  }
  const clickItem = (item: DropdownMenuItem, event: MouseEvent) => {
    event.stopPropagation()
    if (item.disabled || item.type === 'divider') return
    local.menu.onClick?.({ key: item.key, domEvent: event })
    setOpen(false)
  }

  createEffect(() => {
    if (!mergedOpen() || trigger() !== 'click') return
    const removePointer = addDocumentPointerDown((event) => {
      const target = event.target as Node | null
      if (target && triggerRef()?.contains(target)) return
      setOpen(false)
    })
    const removeKey = addDocumentKeydown((event) => {
      if (event.key === 'Escape') setOpen(false)
    })
    onCleanup(() => {
      removePointer()
      removeKey()
    })
  })

  return (
    <>
      <span
        {...rest}
        ref={setTriggerRef}
        class={classNames(`${prefixCls()}-trigger`, local.class)}
        onClick={(event) => {
          if (trigger() !== 'click') return
          event.stopPropagation()
          setOpen(!mergedOpen())
        }}
        onMouseEnter={() => {
          if (trigger() === 'hover') setOpen(true)
        }}
        onMouseLeave={() => {
          if (trigger() === 'hover') setOpen(false)
        }}
      >
        {local.children}
      </span>
      <Show when={canUseDom() && mergedOpen()}>
        <InternalPortal>
          <div
            class={classNames(prefixCls(), `${prefixCls()}-${placement()}`, hashId(), local.overlayClass)}
            style={{ ...position(), ...(typeof local.overlayStyle === 'object' ? local.overlayStyle : {}) }}
          >
            <ul class={`${prefixCls()}-menu`} role="menu">
              <For each={local.menu.items}>
                {(item) => (
                  <Show
                    when={item.type === 'divider'}
                    fallback={
                      <li
                        role="menuitem"
                        data-menu-key={item.key}
                        class={classNames(`${prefixCls()}-item`, item.disabled && `${prefixCls()}-item-disabled`)}
                        aria-disabled={item.disabled ? 'true' : 'false'}
                        onClick={(event) => clickItem(item, event)}
                      >
                        {item.label}
                      </li>
                    }
                  >
                    <li role="separator" class={`${prefixCls()}-divider`} />
                  </Show>
                )}
              </For>
            </ul>
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
```

Create `packages/components/src/dropdown/index.ts`:

```ts
export * from './interface'
export * from './dropdown'
```

- [ ] **Step 6: Run Dropdown tests and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --run src/dropdown/__tests__/dropdown.test.tsx
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/dropdown
git commit -m "feat(components): add dropdown"
```

---

## Task 6: Add Root Exports and Docs

**Files:**
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Create: `apps/docs/src/routes/components/tabs.tsx`
- Create: `apps/docs/src/routes/components/tooltip.tsx`
- Create: `apps/docs/src/routes/components/dropdown.tsx`

- [ ] **Step 1: Add root exports**

Append to `packages/components/src/index.ts`:

```ts
export * from './tabs'
export * from './tooltip'
export * from './dropdown'
```

- [ ] **Step 2: Add docs nav entries**

In `apps/docs/src/site/nav.ts`, add after `Badge` and before `Alert`:

```ts
  { path: '/components/tabs', label: 'Tabs' },
  { path: '/components/tooltip', label: 'Tooltip' },
  { path: '/components/dropdown', label: 'Dropdown' },
```

- [ ] **Step 3: Add Tabs docs page**

Create `apps/docs/src/routes/components/tabs.tsx`:

```tsx
import { Tabs } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const items = [
  { key: 'overview', label: 'Overview', children: <p>Overview content</p> },
  { key: 'usage', label: 'Usage', children: <p>Usage content</p> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: <p>Disabled content</p> },
]

export default function TabsPage() {
  return (
    <>
      <h1>Tabs</h1>
      <DemoBlock title="Basic" code={`<Tabs items={items} />`}>
        <Tabs items={items} />
      </DemoBlock>
      <DemoBlock title="Card" code={`<Tabs type="card" items={items} />`}>
        <Tabs type="card" items={items} />
      </DemoBlock>
      <DemoBlock title="Bottom" code={`<Tabs tabPosition="bottom" items={items} />`}>
        <Tabs tabPosition="bottom" items={items} />
      </DemoBlock>
      <DemoBlock title="Destroy inactive pane" code={`<Tabs destroyInactiveTabPane items={items} />`}>
        <Tabs destroyInactiveTabPane items={items} />
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 4: Add Tooltip docs page**

Create `apps/docs/src/routes/components/tooltip.tsx`:

```tsx
import { Button, Space, Tooltip } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function TooltipPage() {
  return (
    <>
      <h1>Tooltip</h1>
      <DemoBlock title="Hover" code={`<Tooltip title="Helpful text"><Button>Hover</Button></Tooltip>`}>
        <Tooltip title="Helpful text">
          <Button>Hover</Button>
        </Tooltip>
      </DemoBlock>
      <DemoBlock title="Triggers" code={`<Tooltip trigger="click" title="Clicked"><Button>Click</Button></Tooltip>`}>
        <Space wrap>
          <Tooltip trigger="click" title="Clicked">
            <Button>Click</Button>
          </Tooltip>
          <Tooltip trigger="focus" title="Focused">
            <Button>Focus</Button>
          </Tooltip>
        </Space>
      </DemoBlock>
      <DemoBlock title="Placement" code={`<Tooltip placement="right" title="Right"><Button>Right</Button></Tooltip>`}>
        <Space wrap>
          <Tooltip placement="top" title="Top">
            <Button>Top</Button>
          </Tooltip>
          <Tooltip placement="bottom" title="Bottom">
            <Button>Bottom</Button>
          </Tooltip>
          <Tooltip placement="left" title="Left">
            <Button>Left</Button>
          </Tooltip>
          <Tooltip placement="right" title="Right">
            <Button>Right</Button>
          </Tooltip>
        </Space>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 5: Add Dropdown docs page**

Create `apps/docs/src/routes/components/dropdown.tsx`:

```tsx
import { Button, Dropdown, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'copy', label: 'Copy' },
  { key: 'disabled', label: 'Disabled', disabled: true },
  { key: 'divider', type: 'divider' as const },
  { key: 'delete', label: 'Delete' },
]

export default function DropdownPage() {
  return (
    <>
      <h1>Dropdown</h1>
      <DemoBlock title="Click" code={`<Dropdown menu={{ items }}><Button>Actions</Button></Dropdown>`}>
        <Dropdown menu={{ items, onClick: (info) => console.log(info.key) }}>
          <Button>Actions</Button>
        </Dropdown>
      </DemoBlock>
      <DemoBlock title="Hover" code={`<Dropdown trigger="hover" menu={{ items }}><Button>Hover</Button></Dropdown>`}>
        <Dropdown trigger="hover" menu={{ items }}>
          <Button>Hover</Button>
        </Dropdown>
      </DemoBlock>
      <DemoBlock title="Placement" code={`<Dropdown placement="topRight" menu={{ items }}><Button>Top right</Button></Dropdown>`}>
        <Space wrap>
          <Dropdown placement="bottomLeft" menu={{ items }}>
            <Button>Bottom left</Button>
          </Dropdown>
          <Dropdown placement="bottomRight" menu={{ items }}>
            <Button>Bottom right</Button>
          </Dropdown>
          <Dropdown placement="topLeft" menu={{ items }}>
            <Button>Top left</Button>
          </Dropdown>
          <Dropdown placement="topRight" menu={{ items }}>
            <Button>Top right</Button>
          </Dropdown>
        </Space>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 6: Run docs typecheck/build and commit**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Expected: PASS.

Commit:

```bash
git add packages/components/src/index.ts apps/docs/src/site/nav.ts apps/docs/src/routes/components/tabs.tsx apps/docs/src/routes/components/tooltip.tsx apps/docs/src/routes/components/dropdown.tsx
git commit -m "docs: add interaction component pages"
```

---

## Task 7: Full Verification and Cleanup

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
git commit -m "chore: verify interaction components"
```

If there are no changes, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: Theme tokens, shared placement, Tabs, Tooltip, Dropdown, root exports, docs, tests, and full verification are all covered.
- Scope: The plan intentionally excludes editable tabs, overflow tabs, vertical tabs, collision detection, nested dropdown menus, selectable menu state, context menu, and dropdown arrows.
- Type consistency: Placement types are exported from `shared/placement.ts` and re-exported by component interfaces. Token property names match style files and theme tests.
