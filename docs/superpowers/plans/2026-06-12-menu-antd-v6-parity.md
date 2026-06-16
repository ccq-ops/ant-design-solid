# Menu Ant Design v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `Menu` to cover Ant Design v6-style APIs in Solid form, including `items`, compound components, selection behavior, submenu behavior, semantic styles, demos, and docs.

**Architecture:** Normalize both `items` and compound JSX children into a single internal item tree, then render and handle behavior from that tree. Keep Solid naming (`class`, `popupClass`) and avoid React compatibility shims such as `className`.

**Tech Stack:** SolidJS, TypeScript, Vitest, Testing Library, existing CSS-in-JS style registration.

---

## File Structure

- Modify `packages/components/src/menu/interface.ts`: add parity types, semantic names, callbacks, compound component prop types.
- Modify `packages/components/src/menu/menu.tsx`: implement normalization, compound components, selection, submenu triggers, popup rendering, semantic hooks.
- Modify `packages/components/src/menu/menu.style.ts`: add classes for danger, extra, dashed, themes, inline indentation, hidden forced submenus, overflow indicator, semantic-friendly structure.
- Modify `packages/components/src/menu/index.ts`: export updated component and types.
- Modify `packages/components/src/menu/__tests__/menu.test.tsx`: add focused red/green tests for every new behavior.
- Modify `apps/docs/src/pages/components/menu.mdx`: add demos and updated API tables.

## Task 1: Public Types And Compound Component Surface

**Files:**

- Modify: `packages/components/src/menu/interface.ts`
- Modify: `packages/components/src/menu/menu.tsx`
- Modify: `packages/components/src/menu/index.ts`
- Test: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] **Step 1: Write failing tests for compound component rendering and type-facing API**

Append tests that use the desired Solid compound API:

```tsx
it('renders compound Menu children through the same item model', () => {
  const result = render(() => (
    <Menu defaultOpenKeys={['workspace']}>
      <Menu.Item key="home" icon={<span data-testid="home-icon" />}>
        Home
      </Menu.Item>
      <Menu.SubMenu key="workspace" title="Workspace">
        <Menu.Item key="projects">Projects</Menu.Item>
        <Menu.ItemGroup title="Team">
          <Menu.Item key="members">Members</Menu.Item>
        </Menu.ItemGroup>
        <Menu.Divider dashed />
      </Menu.SubMenu>
    </Menu>
  ))

  expect(result.getByText('Home')).toBeInTheDocument()
  expect(result.getByTestId('home-icon')).toBeInTheDocument()
  expect(result.getByText('Workspace')).toBeInTheDocument()
  expect(result.getByText('Projects')).toBeInTheDocument()
  expect(result.getByText('Team')).toBeInTheDocument()
  expect(result.container.querySelector('.ads-menu-item-divider-dashed')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: FAIL because `Menu.Item`, `Menu.SubMenu`, `Menu.ItemGroup`, or `Menu.Divider` do not exist.

- [ ] **Step 3: Expand types**

Update `interface.ts` with:

```ts
import type { Component, JSX } from 'solid-js'

export type MenuMode = 'vertical' | 'horizontal' | 'inline'
export type MenuTheme = 'light' | 'dark'
export type MenuKey = string
export type TriggerSubMenuAction = 'hover' | 'click'
export type MenuSemanticName =
  | 'root'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'itemExtra'
  | 'submenu'
  | 'submenuTitle'
  | 'submenuArrow'
  | 'submenuList'
  | 'submenuPopup'
  | 'group'
  | 'groupTitle'
  | 'groupList'
  | 'divider'

export type MenuSemanticClasses =
  | Partial<Record<MenuSemanticName, string>>
  | ((info: { props: MenuProps }) => Partial<Record<MenuSemanticName, string>>)
export type MenuSemanticStyles =
  | Partial<Record<MenuSemanticName, JSX.CSSProperties>>
  | ((info: { props: MenuProps }) => Partial<Record<MenuSemanticName, JSX.CSSProperties>>)

export interface MenuClickInfo {
  key: MenuKey
  keyPath: MenuKey[]
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: MenuKey[]
}

export interface SubMenuTitleClickInfo {
  key: MenuKey
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuItemBase {
  key: MenuKey
  label: JSX.Element
  icon?: JSX.Element
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
}

export interface MenuItemType extends MenuItemBase {
  type?: 'item'
  danger?: boolean
  extra?: JSX.Element
  title?: string
}

export interface SubMenuType extends MenuItemBase {
  type?: 'submenu'
  children?: MenuItem[]
  popupClass?: string
  popupOffset?: [number, number]
  theme?: MenuTheme
  onTitleClick?: (info: SubMenuTitleClickInfo) => void
  popupRender?: MenuPopupRender
}

export interface MenuItemGroupType {
  type: 'group'
  key?: MenuKey
  label?: JSX.Element
  children?: MenuItem[]
  class?: string
  style?: JSX.CSSProperties
}

export interface MenuDividerType {
  type: 'divider'
  key?: MenuKey
  dashed?: boolean
  class?: string
  style?: JSX.CSSProperties
}

export type MenuItem = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType | null
export type MenuPopupRender = (
  node: JSX.Element,
  props: { item: SubMenuType; keys: MenuKey[] },
) => JSX.Element
export type MenuExpandIcon =
  | JSX.Element
  | ((props: SubMenuType & { isSubMenu: boolean; open: boolean }) => JSX.Element)
export type MenuTooltip = false | { title?: JSX.Element; class?: string; style?: JSX.CSSProperties }

export interface MenuProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  'onClick' | 'onSelect' | 'children'
> {
  items?: MenuItem[]
  children?: JSX.Element
  mode?: MenuMode
  selectedKeys?: MenuKey[]
  defaultSelectedKeys?: MenuKey[]
  openKeys?: MenuKey[]
  defaultOpenKeys?: MenuKey[]
  inlineCollapsed?: boolean
  inlineIndent?: number
  multiple?: boolean
  selectable?: boolean
  overflowedIndicator?: JSX.Element
  expandIcon?: MenuExpandIcon
  forceSubMenuRender?: boolean
  subMenuCloseDelay?: number
  subMenuOpenDelay?: number
  tooltip?: MenuTooltip
  theme?: MenuTheme
  triggerSubMenuAction?: TriggerSubMenuAction
  popupRender?: MenuPopupRender
  classNames?: MenuSemanticClasses
  styles?: MenuSemanticStyles
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  onClick?: (info: MenuClickInfo) => void
  onSelect?: (info: MenuSelectInfo) => void
  onDeselect?: (info: MenuSelectInfo) => void
  onOpenChange?: (openKeys: MenuKey[]) => void
}

export interface MenuItemComponentProps extends Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'onClick'
> {
  key: MenuKey
  icon?: JSX.Element
  disabled?: boolean
  danger?: boolean
  extra?: JSX.Element
  title?: string
  children?: JSX.Element
}

export interface SubMenuComponentProps extends Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'title' | 'onClick'
> {
  key: MenuKey
  title?: JSX.Element
  icon?: JSX.Element
  disabled?: boolean
  popupClass?: string
  popupOffset?: [number, number]
  theme?: MenuTheme
  onTitleClick?: (info: SubMenuTitleClickInfo) => void
  popupRender?: MenuPopupRender
  children?: JSX.Element
}

export interface MenuItemGroupComponentProps extends Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'title'
> {
  key?: MenuKey
  title?: JSX.Element
  children?: JSX.Element
}

export interface MenuDividerComponentProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  key?: MenuKey
  dashed?: boolean
}

export type MenuCompoundComponent = Component<MenuProps> & {
  Item: Component<MenuItemComponentProps>
  SubMenu: Component<SubMenuComponentProps>
  Divider: Component<MenuDividerComponentProps>
  ItemGroup: Component<MenuItemGroupComponentProps>
}
```

- [ ] **Step 4: Add marker-based compound components and normalization**

In `menu.tsx`, create marker components that return no DOM when rendered directly but expose metadata for normalization. Use a local symbol and `children()` to flatten Solid children.

```tsx
const MENU_COMPONENT_TYPE = Symbol('ads.menu.component')

type CompoundKind = 'item' | 'submenu' | 'divider' | 'group'
type CompoundComponent<P> = Component<P> & { [MENU_COMPONENT_TYPE]: CompoundKind }

function createCompoundComponent<P>(kind: CompoundKind): CompoundComponent<P> {
  const component = (() => null) as CompoundComponent<P>
  component[MENU_COMPONENT_TYPE] = kind
  return component
}

function isCompoundNode(
  node: unknown,
): node is { t: CompoundComponent<unknown>; props: Record<string, unknown> } {
  return Boolean(
    node &&
    typeof node === 'object' &&
    't' in node &&
    typeof (node as { t?: unknown }).t === 'function' &&
    MENU_COMPONENT_TYPE in (node as { t: object }).t,
  )
}
```

Normalize nodes by reading `node.t[MENU_COMPONENT_TYPE]`, mapping `children` to `label` for items and `title` to `label` for submenus/groups.

- [ ] **Step 5: Attach compound components to `Menu`**

Export `Menu` as `MenuCompoundComponent`:

```tsx
const MenuRoot = (props: MenuProps) => {
  // existing Menu implementation
}

export const Menu = MenuRoot as MenuCompoundComponent
Menu.Item = createCompoundComponent<MenuItemComponentProps>('item')
Menu.SubMenu = createCompoundComponent<SubMenuComponentProps>('submenu')
Menu.Divider = createCompoundComponent<MenuDividerComponentProps>('divider')
Menu.ItemGroup = createCompoundComponent<MenuItemGroupComponentProps>('group')
```

- [ ] **Step 6: Run the test and verify it passes**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS for the compound rendering test and existing Menu tests.

## Task 2: Selection Parity

**Files:**

- Modify: `packages/components/src/menu/menu.tsx`
- Modify: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] **Step 1: Write failing tests for selectable, multiple, and onDeselect**

Add:

```tsx
it('does not select items when selectable is false but still fires onClick', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  const onSelect = vi.fn()
  const result = render(() => (
    <Menu
      selectable={false}
      items={[{ key: 'mail', label: 'Mail' }]}
      onClick={onClick}
      onSelect={onSelect}
    />
  ))

  await user.click(result.getByText('Mail'))

  expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'mail' }))
  expect(onSelect).not.toHaveBeenCalled()
  expect(result.getByRole('menuitem')).not.toHaveClass('ads-menu-item-selected')
})

it('supports multiple selection and deselection', async () => {
  const user = userEvent.setup()
  const onSelect = vi.fn()
  const onDeselect = vi.fn()
  const result = render(() => (
    <Menu
      multiple
      defaultSelectedKeys={['mail']}
      items={[
        { key: 'mail', label: 'Mail' },
        { key: 'team', label: 'Team' },
      ]}
      onSelect={onSelect}
      onDeselect={onDeselect}
    />
  ))

  await user.click(result.getByText('Team'))
  expect(onSelect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      key: 'team',
      selectedKeys: ['mail', 'team'],
    }),
  )

  await user.click(result.getByText('Mail'))
  expect(onDeselect).toHaveBeenLastCalledWith(
    expect.objectContaining({
      key: 'mail',
      selectedKeys: ['team'],
    }),
  )
})
```

- [ ] **Step 2: Run and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: FAIL because `selectable`, `multiple`, and `onDeselect` behavior is not implemented.

- [ ] **Step 3: Implement selection logic**

Replace single-select logic with:

```ts
const selectable = () => local.selectable ?? true

const selectItem = (item: MenuItemType, keyPath: MenuKey[], event: MouseEvent | KeyboardEvent) => {
  if (item.disabled) return
  const info = clickInfo(item, keyPath, event)
  local.onClick?.(info)
  if (!selectable()) return

  const current = selectedKeys()
  const alreadySelected = current.includes(item.key)
  const nextSelectedKeys = local.multiple
    ? alreadySelected
      ? current.filter((key) => key !== item.key)
      : [...current, item.key]
    : [item.key]

  if (local.selectedKeys === undefined) setInnerSelectedKeys(nextSelectedKeys)

  const selectInfo = { ...info, selectedKeys: nextSelectedKeys }
  if (local.multiple && alreadySelected) {
    local.onDeselect?.(selectInfo)
  } else {
    local.onSelect?.(selectInfo)
  }
}
```

- [ ] **Step 4: Run and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS.

## Task 3: Submenu Trigger, Delays, Title Callback

**Files:**

- Modify: `packages/components/src/menu/menu.tsx`
- Modify: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] **Step 1: Write failing tests for click and hover trigger behavior**

Add tests:

```tsx
it('uses click trigger when triggerSubMenuAction is click', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  const onTitleClick = vi.fn()
  const result = render(() => (
    <Menu
      triggerSubMenuAction="click"
      items={[
        {
          key: 'settings',
          label: 'Settings',
          onTitleClick,
          children: [{ key: 'profile', label: 'Profile' }],
        },
      ]}
      onOpenChange={onOpenChange}
    />
  ))

  await user.click(result.getByText('Settings'))

  expect(onTitleClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'settings' }))
  expect(onOpenChange).toHaveBeenLastCalledWith(['settings'])
})

it('opens and closes submenu on hover with configured delays', async () => {
  vi.useFakeTimers()
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const result = render(() => (
    <Menu
      subMenuOpenDelay={0.2}
      subMenuCloseDelay={0.3}
      items={[
        { key: 'settings', label: 'Settings', children: [{ key: 'profile', label: 'Profile' }] },
      ]}
    />
  ))

  await user.hover(result.getByText('Settings'))
  vi.advanceTimersByTime(199)
  expect(result.queryByText('Profile')).not.toBeInTheDocument()
  vi.advanceTimersByTime(1)
  expect(result.getByText('Profile')).toBeInTheDocument()

  await user.unhover(result.getByText('Settings'))
  vi.advanceTimersByTime(299)
  expect(result.getByText('Profile')).toBeInTheDocument()
  vi.advanceTimersByTime(1)
  expect(result.queryByText('Profile')).not.toBeInTheDocument()
  vi.useRealTimers()
})
```

- [ ] **Step 2: Run and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: FAIL because hover delays and title callback are missing.

- [ ] **Step 3: Implement submenu trigger state**

Add timer tracking:

```ts
const submenuTimers = new Map<MenuKey, number>()

function clearSubMenuTimer(key: MenuKey) {
  const timer = submenuTimers.get(key)
  if (timer !== undefined) {
    window.clearTimeout(timer)
    submenuTimers.delete(key)
  }
}

onCleanup(() => {
  submenuTimers.forEach((timer) => window.clearTimeout(timer))
  submenuTimers.clear()
})
```

Add:

```ts
const triggerSubMenuAction = () => local.triggerSubMenuAction ?? 'hover'
const openDelayMs = () => (local.subMenuOpenDelay ?? 0) * 1000
const closeDelayMs = () => (local.subMenuCloseDelay ?? 0.1) * 1000
```

Use hover handlers only when `triggerSubMenuAction() === 'hover'`; use click handlers only when action is `click`, while keyboard activation always toggles.

- [ ] **Step 4: Run and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS.

## Task 4: Rendering Enhancements

**Files:**

- Modify: `packages/components/src/menu/menu.tsx`
- Modify: `packages/components/src/menu/menu.style.ts`
- Modify: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] **Step 1: Write failing rendering tests**

Add:

```tsx
it('renders danger, extra, title, dashed divider, custom expand icon, and indentation', () => {
  const result = render(() => (
    <Menu
      mode="inline"
      inlineCollapsed
      inlineIndent={32}
      defaultOpenKeys={['settings']}
      expandIcon={(props) => (
        <span data-testid={`expand-${props.key}`}>{props.open ? '-' : '+'}</span>
      )}
      items={[
        {
          key: 'settings',
          label: 'Settings',
          children: [
            {
              key: 'delete',
              label: 'Delete',
              danger: true,
              extra: <kbd>D</kbd>,
              title: 'Delete item',
            },
            { type: 'divider', dashed: true },
          ],
        },
      ]}
    />
  ))

  expect(result.getByTestId('expand-settings')).toHaveTextContent('-')
  expect(result.getByText('Delete')).toHaveAttribute('title', 'Delete item')
  expect(result.getByText('Delete').closest('li')).toHaveClass('ads-menu-item-danger')
  expect(result.getByText('D')).toHaveClass('ads-menu-item-extra')
  expect(result.container.querySelector('.ads-menu-item-divider-dashed')).toBeInTheDocument()
  expect(result.getByText('Delete').closest('li')).toHaveStyle({ 'padding-left': '32px' })
})

it('supports forceSubMenuRender, popupOffset, popupClass, and popupRender', async () => {
  const user = userEvent.setup()
  const result = render(() => (
    <Menu
      forceSubMenuRender
      triggerSubMenuAction="click"
      popupRender={(node) => <div data-testid="popup-wrapper">{node}</div>}
      items={[
        {
          key: 'settings',
          label: 'Settings',
          popupClass: 'custom-popup',
          popupOffset: [10, 20],
          children: [{ key: 'profile', label: 'Profile' }],
        },
      ]}
    />
  ))

  expect(result.getByText('Profile')).toBeInTheDocument()
  await user.click(result.getByText('Settings'))
  expect(result.getByTestId('popup-wrapper')).toBeInTheDocument()
  expect(result.container.ownerDocument.querySelector('.custom-popup')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: FAIL because these render props/classes are missing.

- [ ] **Step 3: Implement render props and style classes**

Add helpers:

```ts
function menuItemTitle(item: MenuItemType): string | undefined {
  if (!local.inlineCollapsed || local.tooltip === false) return undefined
  if (item.title !== undefined) return item.title
  return typeof item.label === 'string' ? item.label : undefined
}
```

Render extra:

```tsx
<Show when={menuItem.extra}>
  <span class={classNames(`${prefixCls()}-item-extra`, semanticClass('itemExtra'))}>
    {menuItem.extra}
  </span>
</Show>
```

Apply depth indentation:

```ts
const itemIndentStyle = (depth: number): JSX.CSSProperties =>
  mode() === 'inline' && depth > 0
    ? { 'padding-left': `${depth * (local.inlineIndent ?? 24)}px` }
    : {}
```

Use `expandIcon` and popup render selection:

```tsx
const arrow = () =>
  typeof local.expandIcon === 'function'
    ? local.expandIcon({ ...item, isSubMenu: true, open: open() })
    : (local.expandIcon ?? '›')
```

const popupRenderer = item.popupRender ?? local.popupRender
const popupNode = <ul ...>{renderChildren(item.children ?? [], keyPath, depth + 1)}</ul>
return popupRenderer ? popupRenderer(popupNode, { item, keys: keyPath }) : popupNode

````

- [ ] **Step 4: Update styles**

Add classes in `menu.style.ts` for:

- `${prefixCls}-dark`
- `${prefixCls}-item-danger`
- `${prefixCls}-item-extra`
- `${prefixCls}-item-divider-dashed`
- `${prefixCls}-submenu-hidden`
- `${prefixCls}-overflowed-indicator`

- [ ] **Step 5: Run and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS.

## Task 5: Semantic Class And Style Hooks

**Files:**
- Modify: `packages/components/src/menu/menu.tsx`
- Modify: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] **Step 1: Write failing semantic customization test**

Add:

```tsx
it('applies semantic classNames and styles to menu structures', () => {
  const result = render(() => (
    <Menu
      defaultOpenKeys={['settings']}
      classNames={{
        root: 'root-semantic',
        item: 'item-semantic',
        submenuTitle: 'title-semantic',
        submenuList: 'list-semantic',
        divider: 'divider-semantic',
      }}
      styles={{
        item: { color: 'rgb(255, 0, 0)' },
      }}
      items={[
        {
          key: 'settings',
          label: 'Settings',
          children: [
            { key: 'profile', label: 'Profile' },
            { type: 'divider' },
          ],
        },
      ]}
    />
  ))

  expect(result.container.firstElementChild).toHaveClass('root-semantic')
  expect(result.getByText('Settings')).toHaveClass('title-semantic')
  expect(result.getByText('Profile').closest('li')).toHaveClass('item-semantic')
  expect(result.getByText('Profile').closest('li')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  expect(result.container.querySelector('.ads-menu-submenu-list')).toHaveClass('list-semantic')
  expect(result.container.querySelector('.ads-menu-item-divider')).toHaveClass('divider-semantic')
})
````

- [ ] **Step 2: Run and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: FAIL because semantic props are not used.

- [ ] **Step 3: Implement semantic lookup**

Add:

```ts
const semanticClasses = createMemo(() =>
  typeof local.classNames === 'function' ? local.classNames({ props }) : (local.classNames ?? {}),
)
const semanticStyles = createMemo(() =>
  typeof local.styles === 'function' ? local.styles({ props }) : (local.styles ?? {}),
)
const semanticClass = (name: MenuSemanticName) => semanticClasses()[name]
const semanticStyle = (name: MenuSemanticName) => semanticStyles()[name]
```

Merge `semanticClass(name)` and `semanticStyle(name)` into each named target.

- [ ] **Step 4: Run and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS.

## Task 6: Theme And Overflow Indicator

**Files:**

- Modify: `packages/components/src/menu/menu.tsx`
- Modify: `packages/components/src/menu/menu.style.ts`
- Modify: `packages/components/src/menu/__tests__/menu.test.tsx`

- [ ] **Step 1: Write failing test**

Add:

```tsx
it('applies menu and submenu themes and renders horizontal overflow indicator hook', () => {
  const result = render(() => (
    <Menu
      mode="horizontal"
      theme="dark"
      overflowedIndicator={<span data-testid="overflow">more</span>}
      items={[
        {
          key: 'settings',
          label: 'Settings',
          theme: 'light',
          children: [{ key: 'profile', label: 'Profile' }],
        },
      ]}
    />
  ))

  expect(result.container.firstElementChild).toHaveClass('ads-menu-dark')
  expect(result.container.querySelector('.ads-menu-submenu-light')).toBeInTheDocument()
  expect(result.getByTestId('overflow')).toHaveClass('ads-menu-overflowed-indicator')
})
```

- [ ] **Step 2: Run and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: FAIL because theme classes and overflow indicator are not rendered.

- [ ] **Step 3: Implement theme classes and overflow indicator**

Add root class `${prefixCls()}-${local.theme ?? 'light'}`. Add submenu class when `item.theme` exists. Render:

```tsx
<Show when={mode() === 'horizontal' && local.overflowedIndicator}>
  <li class={`${prefixCls()}-overflowed-indicator`} aria-hidden="true">
    {local.overflowedIndicator}
  </li>
</Show>
```

- [ ] **Step 4: Run and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS.

## Task 7: Docs And Demos

**Files:**

- Modify: `apps/docs/src/pages/components/menu.mdx`

- [ ] **Step 1: Update demos**

Add demos for:

- Compound components.
- Multiple selection and deselection.
- Submenu trigger modes.
- Danger, extra, title, dashed divider.
- Custom expand icon.
- Popup render and popup class.
- Theme and semantic class/style customization.

- [ ] **Step 2: Update API tables**

Document:

- `Menu` props.
- `MenuItemType`.
- `SubMenuType`.
- `MenuItemGroupType`.
- `MenuDividerType`.
- Compound components.
- Semantic names.

Use Solid names: `class`, `popupClass`, `JSX.Element`.

- [ ] **Step 3: Run docs formatting check**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`

Expected: PASS, or report pre-existing unrelated formatting failures.

## Task 8: Final Verification

**Files:**

- No source edits expected unless verification finds issues.

- [ ] **Step 1: Run focused tests**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/components test -- menu`

Expected: PASS.

- [ ] **Step 2: Run required repository checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS. If any command fails, record the exact failure and whether it is caused by this Menu work or pre-existing unrelated changes.
