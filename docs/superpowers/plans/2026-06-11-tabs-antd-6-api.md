# Tabs Antd 6 API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `Tabs` with non-deprecated Ant Design 6 APIs while preserving Solid's `class` convention.

**Architecture:** Keep a native Solid implementation and split Tabs into focused nav, panel, utility, and style modules. Add behavior through TDD batches that preserve current tests while expanding API parity for lifecycle, placement, editable cards, customization, semantic slots, overflow, docs, and verification.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing `@ant-design-solid/icons`, existing `Dropdown`, existing css-in-js style registration.

---

### Task 1: Public Types And Utility Boundary

**Files:**

- Modify: `packages/components/src/tabs/interface.ts`
- Create: `packages/components/src/tabs/tabs-utils.ts`
- Modify: `packages/components/src/tabs/index.ts`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing type and runtime smoke tests**

Add tests that exercise new props at runtime without relying on implementation detail:

```tsx
it('accepts antd 6 props and solid class naming', () => {
  const result = render(() => (
    <Tabs
      class="root-class"
      items={[{ key: 'one', label: 'One', class: 'pane-class', style: { color: 'red' } }]}
      tabPlacement="start"
      destroyOnHidden
      animated={{ inkBar: true, tabPane: false }}
      centered
      indicator={{ size: 12, align: 'center' }}
      tabBarGutter={8}
      tabBarStyle={{ color: 'blue' }}
      tabBarExtraContent={<span>Extra</span>}
    />
  ))

  expect(result.container.firstElementChild).toHaveClass('root-class')
  expect(result.getByRole('tab', { name: 'One' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Verify the test fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: FAIL because new props/types are not implemented.

- [ ] **Step 3: Expand public types**

In `interface.ts`, add:

```ts
export type TabsType = 'line' | 'card' | 'editable-card'
export type TabsPlacement = 'top' | 'bottom' | 'start' | 'end'
export type TabsPosition = 'top' | 'bottom'
export type TabsScrollDirection = 'left' | 'right' | 'top' | 'bottom'
export type TabsSemanticSlot = 'root' | 'item' | 'remove' | 'indicator' | 'content' | 'header' | 'popup'

export interface TabsAnimatedConfig {
  inkBar?: boolean
  tabPane?: boolean
}

export interface TabsIndicatorConfig {
  size?: number | ((origin: number) => number)
  align?: 'start' | 'center' | 'end'
}

export interface TabsMoreConfig {
  icon?: JSX.Element
  trigger?: 'hover' | 'click'
}

export type TabsSemanticClassNames =
  | Partial<Record<TabsSemanticSlot, string>>
  | ((info: { props: TabsProps }) => Partial<Record<TabsSemanticSlot, string>>)

export type TabsSemanticStyles =
  | Partial<Record<TabsSemanticSlot, JSX.CSSProperties>>
  | ((info: { props: TabsProps }) => Partial<Record<TabsSemanticSlot, JSX.CSSProperties>>)

export interface TabsItem {
  key: string
  label: JSX.Element
  children?: JSX.Element
  disabled?: boolean
  icon?: JSX.Element
  forceRender?: boolean
  destroyOnHidden?: boolean
  closable?: boolean
  closeIcon?: JSX.Element | false | null
  class?: string
  style?: JSX.CSSProperties
}
```

Add props for `tabPlacement`, `destroyOnHidden`, `animated`, `centered`, `indicator`, `more`, `renderTabBar`, `tabBarExtraContent`, `tabBarGutter`, `tabBarStyle`, `onEdit`, `onTabClick`, `onTabScroll`, `addIcon`, `removeIcon`, `hideAdd`, `classNames`, and `styles`. Keep existing `tabPosition` and `destroyInactiveTabPane` as local compatibility props.

- [ ] **Step 4: Add utility helpers**

Create `tabs-utils.ts` with helpers:

```ts
import type { JSX } from 'solid-js'
import type {
  TabsItem,
  TabsPlacement,
  TabsProps,
  TabsSemanticClassNames,
  TabsSemanticStyles,
} from './interface'

export function getDefaultActiveKey(items: TabsItem[], defaultActiveKey?: string) {
  if (defaultActiveKey && items.some((item) => item.key === defaultActiveKey && !item.disabled)) {
    return defaultActiveKey
  }
  return items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? ''
}

export function keyToId(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function resolvePlacement(props: Pick<TabsProps, 'tabPlacement' | 'tabPosition'>): TabsPlacement {
  return props.tabPlacement ?? props.tabPosition ?? 'top'
}

export function resolveDestroyOnHidden(
  props: Pick<TabsProps, 'destroyOnHidden' | 'destroyInactiveTabPane'>,
) {
  return Boolean(props.destroyOnHidden ?? props.destroyInactiveTabPane)
}

export function resolveSemanticClassNames(
  value: TabsSemanticClassNames | undefined,
  props: TabsProps,
) {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

export function resolveSemanticStyles(value: TabsSemanticStyles | undefined, props: TabsProps) {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

export function mergeStyle(...values: Array<JSX.CSSProperties | undefined>) {
  return Object.assign({}, ...values.filter(Boolean))
}
```

- [ ] **Step 5: Update exports**

Export new public types from `packages/components/src/tabs/index.ts`.

- [ ] **Step 6: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: existing tests pass except behavior still missing for later tasks if those tests have already been added.

### Task 2: Split Navigation And Panel Rendering

**Files:**

- Modify: `packages/components/src/tabs/tabs.tsx`
- Create: `packages/components/src/tabs/tab-nav-list.tsx`
- Create: `packages/components/src/tabs/tab-panel-list.tsx`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing tests for pane lifecycle**

Add tests:

```tsx
it('renders inactive panes lazily and supports forceRender', () => {
  const result = render(() => (
    <Tabs
      items={[
        { key: 'one', label: 'One', children: <div>Pane one</div> },
        { key: 'two', label: 'Two', forceRender: true, children: <div>Pane two</div> },
        { key: 'three', label: 'Three', children: <div>Pane three</div> },
      ]}
    />
  ))

  expect(result.getByText('Pane one')).toBeInTheDocument()
  expect(result.getByText('Pane two')).toBeInTheDocument()
  expect(result.queryByText('Pane three')).not.toBeInTheDocument()
})

it('supports destroyOnHidden globally and per item', () => {
  const result = render(() => (
    <Tabs
      items={[
        { key: 'one', label: 'One', children: <div>Pane one</div> },
        { key: 'two', label: 'Two', destroyOnHidden: true, children: <div>Pane two</div> },
      ]}
    />
  ))

  fireEvent.click(result.getByRole('tab', { name: 'Two' }))
  expect(result.queryByText('Pane one')).toBeInTheDocument()
  fireEvent.click(result.getByRole('tab', { name: 'One' }))
  expect(result.queryByText('Pane two')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: FAIL because current inactive panes render immediately and item-level lifecycle does not exist.

- [ ] **Step 3: Update existing eager-render expectations**

Existing tests that expect every inactive pane to be present immediately should be updated to the antd lifecycle model. Assert unvisited inactive panes are absent by default, visited inactive panes remain mounted when `destroyOnHidden` is false, and hidden panes keep the current hidden class once they have been visited.

- [ ] **Step 4: Move tab button rendering into `tab-nav-list.tsx`**

Implement `TabNavList` with props for `items`, `activeKey`, `prefixCls`, `tabId`, `panelId`, `onTabClick`, `classNames`, `styles`, and keyboard navigation. Preserve current roving focus behavior.

- [ ] **Step 5: Move pane rendering into `tab-panel-list.tsx`**

Implement visited-key tracking:

```ts
const [visitedKeys, setVisitedKeys] = createSignal(new Set([props.activeKey]))
createEffect(() => {
  setVisitedKeys((previous) => new Set([...previous, props.activeKey]))
})
```

Render an item when it is active, `item.forceRender` is true, or it has been visited and neither global nor item `destroyOnHidden` applies.

- [ ] **Step 6: Wire split modules from `tabs.tsx`**

Keep controlled/uncontrolled active key in `tabs.tsx`, pass callbacks to children, and preserve current DOM roles and aria attributes.

- [ ] **Step 7: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS for existing tests and new lifecycle tests.

### Task 3: Events, Placement, Semantic Slots, And Root Styling

**Files:**

- Modify: `packages/components/src/tabs/tabs.tsx`
- Modify: `packages/components/src/tabs/tab-nav-list.tsx`
- Modify: `packages/components/src/tabs/tab-panel-list.tsx`
- Modify: `packages/components/src/tabs/tabs.style.ts`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing tests for event and placement behavior**

Add tests:

```tsx
it('fires onTabClick for active tabs and onChange only when active changes', () => {
  const onTabClick = vi.fn()
  const onChange = vi.fn()
  const result = render(() => <Tabs items={items} onTabClick={onTabClick} onChange={onChange} />)

  fireEvent.click(result.getByRole('tab', { name: 'One' }))
  expect(onTabClick).toHaveBeenCalledWith('one', expect.any(MouseEvent))
  expect(onChange).not.toHaveBeenCalled()

  fireEvent.click(result.getByRole('tab', { name: 'Two' }))
  expect(onTabClick).toHaveBeenLastCalledWith('two', expect.any(MouseEvent))
  expect(onChange).toHaveBeenCalledWith('two')
})

it('supports tabPlacement start and end', () => {
  const start = render(() => <Tabs items={items} tabPlacement="start" />)
  expect(start.container.firstElementChild).toHaveClass('ads-tabs-start')

  const end = render(() => <Tabs items={items} tabPlacement="end" />)
  expect(end.container.firstElementChild).toHaveClass('ads-tabs-end')
})
```

Add semantic test:

```tsx
it('applies semantic classNames and styles', () => {
  const result = render(() => (
    <Tabs
      items={[{ key: 'one', label: 'One', children: <div>Pane one</div>, class: 'item-pane' }]}
      classNames={{ root: 'sem-root', header: 'sem-header', item: 'sem-item', content: 'sem-content' }}
      styles={{ content: { color: 'red' } }}
    />
  ))

  expect(result.container.firstElementChild).toHaveClass('sem-root')
  expect(result.container.querySelector('.sem-header')).toBeInTheDocument()
  expect(result.getByRole('tab', { name: 'One' })).toHaveClass('sem-item')
  expect(result.getByText('Pane one').closest('[role="tabpanel"]')).toHaveClass('item-pane')
  expect(result.container.querySelector('.sem-content')).toHaveStyle({ color: 'red' })
})
```

- [ ] **Step 2: Verify failure**

Run targeted Tabs tests and confirm event/placement/semantic assertions fail.

- [ ] **Step 3: Implement `onTabClick`**

Change click/key activation so enabled tabs call `onTabClick(key, event)` before active-key change checks. Disabled tabs do not call `onTabClick`.

- [ ] **Step 4: Implement `tabPlacement`**

Resolve placement with `resolvePlacement`, add placement root class, and render DOM order for top/bottom/start/end. For start/end, use flex row layout in CSS.

- [ ] **Step 5: Implement semantic slots**

Resolve `classNames` and `styles` once in `tabs.tsx`, pass to nav and panel modules, and apply:

- `root` on root.
- `header` on tab bar wrapper.
- `item` on tab button.
- `content` on content wrapper.
- `indicator` once added in Task 5.
- `remove` once added in Task 4.
- `popup` once added in Task 7.

- [ ] **Step 6: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS.

### Task 4: Editable Card

**Files:**

- Modify: `packages/components/src/tabs/interface.ts`
- Modify: `packages/components/src/tabs/tab-nav-list.tsx`
- Modify: `packages/components/src/tabs/tabs.style.ts`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing editable-card tests**

Add tests:

```tsx
it('supports editable-card add and remove actions', () => {
  const onEdit = vi.fn()
  const result = render(() => (
    <Tabs
      type="editable-card"
      onEdit={onEdit}
      addIcon={<span>Add tab</span>}
      removeIcon={<span>Remove tab</span>}
      items={[
        { key: 'one', label: 'One', children: <div>Pane one</div> },
        { key: 'two', label: 'Two', closable: false, children: <div>Pane two</div> },
      ]}
    />
  ))

  fireEvent.click(result.getByRole('button', { name: /add tab/i }))
  expect(onEdit).toHaveBeenCalledWith(expect.any(MouseEvent), 'add')

  fireEvent.click(result.getAllByRole('button', { name: /remove tab/i })[0])
  expect(onEdit).toHaveBeenCalledWith('one', 'remove')
  expect(result.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true')
  expect(result.queryAllByRole('button', { name: /remove tab/i })).toHaveLength(1)
})

it('supports hideAdd and item closeIcon false', () => {
  const result = render(() => (
    <Tabs
      type="editable-card"
      hideAdd
      items={[{ key: 'one', label: 'One', closeIcon: false, children: <div>Pane one</div> }]}
    />
  ))

  expect(result.queryByRole('button', { name: /add/i })).not.toBeInTheDocument()
  expect(result.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Verify failure**

Run targeted Tabs tests and confirm editable-card tests fail.

- [ ] **Step 3: Implement add button**

Import `PlusOutlined` from `@ant-design-solid/icons`. Render add button for `type="editable-card"` when `hideAdd` is not true. Call `onEdit(event, 'add')`.

- [ ] **Step 4: Implement remove buttons**

Import `CloseOutlined`. Render remove button for editable-card items when normalized closability is true. Stop propagation and call `onEdit(item.key, 'remove')`. Apply semantic `remove` slot.

- [ ] **Step 5: Style editable controls**

Add stable dimensions, hover/focus states, and card layout adjustments in `tabs.style.ts`.

- [ ] **Step 6: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS.

### Task 5: Tab Bar Customization And Indicator

**Files:**

- Modify: `packages/components/src/tabs/interface.ts`
- Modify: `packages/components/src/tabs/tab-nav-list.tsx`
- Modify: `packages/components/src/tabs/tabs.style.ts`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing customization tests**

Add tests:

```tsx
it('supports icons, extra content, gutter, style, centered, and indicator', () => {
  const result = render(() => (
    <Tabs
      centered
      tabBarGutter={16}
      tabBarStyle={{ color: 'blue' }}
      indicator={{ size: () => 20, align: 'end' }}
      tabBarExtraContent={{ left: <span>Left extra</span>, right: <span>Right extra</span> }}
      items={[{ key: 'one', icon: <span>Icon</span>, label: 'One', children: <div>Pane one</div> }]}
      classNames={{ indicator: 'custom-indicator' }}
      styles={{ indicator: { width: '20px' } }}
    />
  ))

  expect(result.getByText('Icon')).toBeInTheDocument()
  expect(result.getByText('Left extra')).toBeInTheDocument()
  expect(result.getByText('Right extra')).toBeInTheDocument()
  expect(result.container.querySelector('.ads-tabs-centered')).toBeInTheDocument()
  expect(result.container.querySelector('.custom-indicator')).toHaveStyle({ width: '20px' })
})
```

- [ ] **Step 2: Verify failure**

Run targeted Tabs tests and confirm assertions fail.

- [ ] **Step 3: Render item icons**

Render `item.icon` before `item.label` inside tab buttons with a wrapper class.

- [ ] **Step 4: Render extra content**

Normalize `tabBarExtraContent` so a single node maps to right content and object form maps left/right.

- [ ] **Step 5: Apply gutter/style/centered**

Apply `tabBarStyle` to header, `tabBarGutter` as gap or CSS variable on the tab list, and centered class on root/header.

- [ ] **Step 6: Implement DOM indicator**

Render a semantic indicator element. Compute inline size from `indicator.size` when number/function is provided, and class for align start/center/end.

- [ ] **Step 7: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS.

### Task 6: Render Tab Bar Hook

**Files:**

- Modify: `packages/components/src/tabs/interface.ts`
- Modify: `packages/components/src/tabs/tabs.tsx`
- Modify: `packages/components/src/tabs/tab-nav-list.tsx`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing renderTabBar test**

Add test:

```tsx
it('supports renderTabBar with default tab bar component', () => {
  const renderTabBar = vi.fn((props, DefaultTabBar) => (
    <div data-testid="custom-bar">
      <DefaultTabBar {...props} />
    </div>
  ))

  const result = render(() => <Tabs items={items} renderTabBar={renderTabBar} />)

  expect(result.getByTestId('custom-bar')).toBeInTheDocument()
  expect(result.getByRole('tab', { name: 'One' })).toBeInTheDocument()
  expect(renderTabBar).toHaveBeenCalled()
})
```

- [ ] **Step 2: Verify failure**

Run targeted Tabs tests and confirm `renderTabBar` is ignored.

- [ ] **Step 3: Add default tab bar props type**

Add `TabsDefaultTabBarProps` and `TabsRenderTabBar` to `interface.ts`.

- [ ] **Step 4: Wire render callback**

In `tabs.tsx`, create `defaultTabBarProps`. Render `local.renderTabBar(defaultTabBarProps, TabNavList)` when provided; otherwise render `<TabNavList {...defaultTabBarProps} />`.

- [ ] **Step 5: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS.

### Task 7: Overflow, More Menu, And Scroll Events

**Files:**

- Modify: `packages/components/src/tabs/interface.ts`
- Modify: `packages/components/src/tabs/tab-nav-list.tsx`
- Modify: `packages/components/src/tabs/tabs-utils.ts`
- Modify: `packages/components/src/tabs/tabs.style.ts`
- Test: `packages/components/src/tabs/__tests__/tabs.test.tsx`

- [ ] **Step 1: Write failing overflow and scroll tests**

Add `screen` to the `@solidjs/testing-library` import, then add tests using deterministic measurement by stubbing element dimensions:

```tsx
it('moves overflowing tabs into more menu and activates hidden tabs', async () => {
  const original = HTMLElement.prototype.getBoundingClientRect
  try {
    HTMLElement.prototype.getBoundingClientRect = function () {
      if ((this as HTMLElement).classList.contains('ads-tabs-nav-list')) {
        return { width: 120, height: 40, x: 0, y: 0, top: 0, left: 0, right: 120, bottom: 40, toJSON: () => ({}) }
      }
      return { width: 80, height: 32, x: 0, y: 0, top: 0, left: 0, right: 80, bottom: 32, toJSON: () => ({}) }
    }

    const result = render(() => (
      <Tabs
        more={{ icon: <span>More tabs</span>, trigger: 'click' }}
        items={[
          { key: 'one', label: 'One', children: <div>Pane one</div> },
          { key: 'two', label: 'Two', children: <div>Pane two</div> },
          { key: 'three', label: 'Three', children: <div>Pane three</div> },
        ]}
      />
    ))

    fireEvent.click(result.getByText('More tabs'))
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Three' }))
    expect(result.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true')
  } finally {
    HTMLElement.prototype.getBoundingClientRect = original
  }
})

it('reports tab scroll direction', () => {
  const onTabScroll = vi.fn()
  const result = render(() => <Tabs items={items} onTabScroll={onTabScroll} />)
  const list = result.container.querySelector('.ads-tabs-nav-list') as HTMLElement

  fireEvent.scroll(list, { target: { scrollLeft: 20 } })
  expect(onTabScroll).toHaveBeenCalledWith({ direction: 'right' })
})
```

- [ ] **Step 2: Verify failure**

Run targeted Tabs tests and confirm overflow and scroll tests fail.

- [ ] **Step 3: Implement measurement helper**

Use `ResizeObserver` when available and a fallback measurement pass after mount. Derive visible and hidden items from container size and item sizes. Keep active item visible by prioritizing it before moving trailing items to overflow.

- [ ] **Step 4: Implement more trigger**

Use existing `Dropdown` with `menu.items` built from hidden tabs. Import `EllipsisOutlined` as the default icon. Apply `classNames.popup` and `styles.popup` to `overlayClass` and `overlayStyle`.

- [ ] **Step 5: Implement hidden tab selection**

Clicking a menu item calls the same activation flow as a visible tab and closes the dropdown through `Dropdown`.

- [ ] **Step 6: Implement scroll direction**

Track previous `scrollLeft` and `scrollTop` values on the nav list and call `onTabScroll` with computed direction.

- [ ] **Step 7: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS.

### Task 8: Documentation

**Files:**

- Modify: `apps/docs/src/pages/components/tabs.mdx`

- [ ] **Step 1: Update demos**

Replace the current narrow docs with demos for:

- Basic items.
- Placement with `tabPlacement`.
- Editable card.
- Extra content.
- Customized indicator.
- Destroy on hidden and force render.
- Semantic `classNames` / `styles`.
- Overflow with many tabs.

- [ ] **Step 2: Update API tables**

Document non-deprecated antd 6 APIs only. Include a note that Solid uses `class`, including item-level `class`, instead of React's `className`.

- [ ] **Step 3: Exclude deprecated APIs from docs**

Do not add API rows for `popupClassName`, `tabPosition`, or `destroyInactiveTabPane`.

- [ ] **Step 4: Run docs-relevant checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tabs
```

Expected: PASS.

### Task 9: Full Verification And Cleanup

**Files:**

- Review: `packages/components/src/tabs/*`
- Review: `packages/components/src/tabs/__tests__/tabs.test.tsx`
- Review: `apps/docs/src/pages/components/tabs.mdx`

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

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

- [ ] **Step 6: Final diff review**

Check:

```bash
git diff -- packages/components/src/tabs apps/docs/src/pages/components/tabs.mdx
```

Expected: no unrelated files, no React-style `className` introduced for Tabs public API, no docs rows for deprecated APIs, and all TypeScript file names under `packages/` remain kebab-case.
