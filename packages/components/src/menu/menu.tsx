import {
  For,
  Show,
  children,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { useMenuStyle } from './menu.style'
import type {
  MenuClickInfo,
  MenuCompoundComponent,
  MenuDividerType,
  MenuDividerComponentProps,
  MenuItem,
  MenuItemComponentProps,
  MenuItemGroupType,
  MenuItemGroupComponentProps,
  MenuItemType,
  MenuKey,
  MenuProps,
  MenuSemanticName,
  SubMenuComponentProps,
  SubMenuType,
} from './interface'

const MENU_COMPONENT_TYPE = Symbol('ads.menu.component')

type CompoundKind = 'item' | 'submenu' | 'divider' | 'group'
type CompoundComponent<P extends object> = ((props: P) => JSX.Element) & {
  [MENU_COMPONENT_TYPE]: CompoundKind
}
type CompoundNode = {
  t: CompoundComponent<Record<string, unknown>>
  props: Record<string, unknown>
}

function createCompoundComponent<P extends object>(kind: CompoundKind): CompoundComponent<P> {
  const component = ((props: P) => ({
    t: component,
    props,
  })) as unknown as CompoundComponent<P>
  component[MENU_COMPONENT_TYPE] = kind
  return component
}

function isCompoundNode(node: unknown): node is CompoundNode {
  if (!node || typeof node !== 'object' || !('t' in node) || !('props' in node)) return false
  const component = (node as { t: unknown }).t
  return typeof component === 'function' && MENU_COMPONENT_TYPE in component
}

function toArray(value: unknown): unknown[] {
  if (typeof value === 'function') return toArray((value as () => unknown)())
  if (Array.isArray(value)) return value.flatMap(toArray)
  if (value === null || value === undefined || typeof value === 'boolean') return []
  return [value]
}

function normalizeCompoundChildren(value: unknown): MenuItem[] {
  const normalized: MenuItem[] = toArray(value).map((node) => {
    if (!isCompoundNode(node)) return null
    const props = node.props
    const kind = node.t[MENU_COMPONENT_TYPE]
    if (kind === 'divider') {
      return {
        type: 'divider',
        key: props.key as MenuKey | undefined,
        dashed: props.dashed as boolean | undefined,
        class: props.class as string | undefined,
        style: props.style as JSX.CSSProperties | undefined,
      } satisfies MenuDividerType
    }
    if (kind === 'group') {
      return {
        type: 'group',
        key: props.key as MenuKey | undefined,
        label: props.title as JSX.Element,
        children: normalizeCompoundChildren(props.children),
        class: props.class as string | undefined,
        style: props.style as JSX.CSSProperties | undefined,
      } satisfies MenuItemGroupType
    }
    if (kind === 'submenu') {
      return {
        type: 'submenu',
        key: props.key as MenuKey,
        label: props.title as JSX.Element,
        icon: props.icon as JSX.Element,
        disabled: props.disabled as boolean | undefined,
        children: normalizeCompoundChildren(props.children),
        class: props.class as string | undefined,
        style: props.style as JSX.CSSProperties | undefined,
      } satisfies SubMenuType
    }
    return {
      type: 'item',
      key: props.key as MenuKey,
      label: props.children as JSX.Element,
      icon: props.icon as JSX.Element,
      disabled: props.disabled as boolean | undefined,
      danger: props.danger as boolean | undefined,
      extra: props.extra as JSX.Element,
      title: props.title as string | undefined,
      class: props.class as string | undefined,
      style: props.style as JSX.CSSProperties | undefined,
    } satisfies MenuItemType
  })
  return normalized.filter((item): item is Exclude<MenuItem, null> => item !== null)
}

function isDivider(item: Exclude<MenuItem, null>): item is MenuDividerType {
  return item.type === 'divider'
}

function isGroup(item: Exclude<MenuItem, null>): item is MenuItemGroupType {
  return item.type === 'group'
}

function isSubMenu(item: Exclude<MenuItem, null>): item is SubMenuType {
  return 'children' in item && item.type !== 'group'
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar'
}

function MenuRoot(props: MenuProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'children',
    'mode',
    'selectedKeys',
    'defaultSelectedKeys',
    'openKeys',
    'defaultOpenKeys',
    'inlineCollapsed',
    'inlineIndent',
    'multiple',
    'selectable',
    'overflowedIndicator',
    'expandIcon',
    'forceSubMenuRender',
    'popupRender',
    'classNames',
    'styles',
    'subMenuCloseDelay',
    'subMenuOpenDelay',
    'tooltip',
    'theme',
    'triggerSubMenuAction',
    'zIndex',
    'getPopupContainer',
    'onClick',
    'onSelect',
    'onDeselect',
    'onOpenChange',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-menu`
  const [, hashId] = useMenuStyle(prefixCls())
  const [popupZIndex] = useZIndex('Menu', local.zIndex)
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<MenuKey[]>(
    local.defaultSelectedKeys ?? [],
  )
  const [innerOpenKeys, setInnerOpenKeys] = createSignal<MenuKey[]>(local.defaultOpenKeys ?? [])
  const [popupPositions, setPopupPositions] = createSignal<Record<MenuKey, JSX.CSSProperties>>({})
  const submenuTitleRefs = new Map<MenuKey, HTMLDivElement>()
  const submenuPopupRefs = new Map<MenuKey, HTMLUListElement>()
  const mode = () => local.mode ?? 'vertical'
  const selectedKeys = createMemo(() => local.selectedKeys ?? innerSelectedKeys())
  const openKeys = createMemo(() => local.openKeys ?? innerOpenKeys())
  const resolvedChildren = children(() => local.children)
  const items = createMemo(() => {
    const source = local.items ?? normalizeCompoundChildren(resolvedChildren.toArray())
    return source.filter((item): item is Exclude<MenuItem, null> => item !== null)
  })
  const selectable = () => local.selectable ?? true
  const triggerSubMenuAction = () => local.triggerSubMenuAction ?? 'hover'
  const openDelayMs = () => (local.subMenuOpenDelay ?? 0) * 1000
  const closeDelayMs = () => (local.subMenuCloseDelay ?? 0.1) * 1000
  const usesPopupSubMenu = () => mode() !== 'inline'
  const semanticClasses = createMemo(() =>
    typeof local.classNames === 'function' ? local.classNames({ props }) : (local.classNames ?? {}),
  )
  const semanticStyles = createMemo(() =>
    typeof local.styles === 'function' ? local.styles({ props }) : (local.styles ?? {}),
  )
  const semanticClass = (name: MenuSemanticName) => semanticClasses()[name]
  const semanticStyle = (name: MenuSemanticName) => semanticStyles()[name]
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

  function containsPopupTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node &&
      (Array.from(submenuTitleRefs.values()).some((element) => element.contains(target)) ||
        Array.from(submenuPopupRefs.values()).some((element) => element.contains(target))),
    )
  }

  const setOpenKeys = (nextOpenKeys: MenuKey[]) => {
    if (local.openKeys === undefined) setInnerOpenKeys(nextOpenKeys)
    local.onOpenChange?.(nextOpenKeys)
  }

  const clickInfo = (
    item: MenuItemType,
    keyPath: MenuKey[],
    event: MouseEvent | KeyboardEvent,
  ): MenuClickInfo => ({ key: item.key, keyPath, domEvent: event })

  const selectItem = (
    item: MenuItemType,
    keyPath: MenuKey[],
    event: MouseEvent | KeyboardEvent,
  ) => {
    if (item.disabled) return
    const info = clickInfo(item, keyPath, event)
    local.onClick?.(info)
    if (!selectable()) return

    const currentSelectedKeys = selectedKeys()
    const alreadySelected = currentSelectedKeys.includes(item.key)
    const nextSelectedKeys = local.multiple
      ? alreadySelected
        ? currentSelectedKeys.filter((key) => key !== item.key)
        : [...currentSelectedKeys, item.key]
      : [item.key]

    if (local.selectedKeys === undefined) setInnerSelectedKeys(nextSelectedKeys)
    const selectInfo = { ...info, selectedKeys: nextSelectedKeys }
    if (local.multiple && alreadySelected) {
      local.onDeselect?.(selectInfo)
    } else {
      local.onSelect?.(selectInfo)
    }
  }

  function updatePopupPosition(key: MenuKey, item?: SubMenuType): void {
    if (!canUseDom()) return
    const title = submenuTitleRefs.get(key)
    if (!title) return
    const rect = title.getBoundingClientRect()
    const [offsetX = 0, offsetY = 0] = item?.popupOffset ?? []
    setPopupPositions((positions) => ({
      ...positions,
      [key]: {
        position: 'fixed',
        top: `${rect.bottom + 4 + offsetY}px`,
        left: `${rect.left + offsetX}px`,
        'z-index': `${popupZIndex}`,
      },
    }))
  }

  function updateOpenPopupPositions(): void {
    if (!usesPopupSubMenu()) return
    openKeys().forEach((key) => updatePopupPosition(key))
  }

  const setSubMenuOpen = (item: SubMenuType, nextOpen: boolean) => {
    if (item.disabled) return
    const currentOpenKeys = openKeys()
    if (currentOpenKeys.includes(item.key) === nextOpen) return
    if (nextOpen) updatePopupPosition(item.key, item)
    const nextOpenKeys = nextOpen
      ? [...currentOpenKeys, item.key]
      : currentOpenKeys.filter((key) => key !== item.key)
    setOpenKeys(nextOpenKeys)
  }

  const toggleSubMenu = (item: SubMenuType) => setSubMenuOpen(item, !openKeys().includes(item.key))

  const scheduleSubMenuOpen = (item: SubMenuType) => {
    if (item.disabled) return
    clearSubMenuTimer(item.key)
    const timer = window.setTimeout(() => setSubMenuOpen(item, true), openDelayMs())
    submenuTimers.set(item.key, timer)
  }

  const scheduleSubMenuClose = (item: SubMenuType) => {
    if (item.disabled) return
    clearSubMenuTimer(item.key)
    const timer = window.setTimeout(() => setSubMenuOpen(item, false), closeDelayMs())
    submenuTimers.set(item.key, timer)
  }

  createEffect(() => {
    if (!usesPopupSubMenu() || openKeys().length === 0) return
    const removeListeners = addPositionUpdateListeners(updateOpenPopupPositions)
    onCleanup(removeListeners)
  })

  createEffect(() => {
    if (!usesPopupSubMenu() || openKeys().length === 0) return
    const removePointerDown = addDocumentPointerDown((event) => {
      if (!containsPopupTarget(event.target)) setOpenKeys([])
    })
    onCleanup(removePointerDown)
  })

  const itemIndentStyle = (depth: number): JSX.CSSProperties =>
    mode() === 'inline' && depth > 0
      ? { 'padding-left': `${depth * (local.inlineIndent ?? 24)}px` }
      : {}

  const mergeStyle = (...styles: (JSX.CSSProperties | undefined)[]): JSX.CSSProperties =>
    Object.assign({}, ...styles.filter(Boolean))

  const menuItemTitle = (item: MenuItemType): string | undefined => {
    if (!local.inlineCollapsed || local.tooltip === false) return undefined
    if (item.title !== undefined) return item.title
    return typeof item.label === 'string' ? item.label : undefined
  }

  const renderChildren = (
    children: MenuItem[] | undefined,
    parentKeyPath: MenuKey[],
    depth: number,
  ) => (
    <For
      each={(children ?? []).filter((child): child is Exclude<MenuItem, null> => child !== null)}
    >
      {(child) => renderItem(child, parentKeyPath, depth)}
    </For>
  )

  const renderSubMenuList = (
    item: SubMenuType,
    keyPath: MenuKey[],
    open: () => boolean,
    depth: number,
  ) => {
    const hidden = () => !open()
    const list = () => (
      <ul
        role="menu"
        ref={(element) => {
          submenuPopupRefs.set(item.key, element)
        }}
        class={classNames(
          `${prefixCls()}-submenu-list`,
          usesPopupSubMenu() && `${prefixCls()}-submenu-popup`,
          usesPopupSubMenu() && item.popupClass,
          hidden() && `${prefixCls()}-submenu-list-hidden`,
          hidden() && local.forceSubMenuRender && `${prefixCls()}-submenu-hidden`,
          semanticClass('submenuList'),
          usesPopupSubMenu() && semanticClass('submenuPopup'),
        )}
        style={mergeStyle(
          semanticStyle('submenuList'),
          usesPopupSubMenu() ? semanticStyle('submenuPopup') : undefined,
          usesPopupSubMenu()
            ? (popupPositions()[item.key] ?? {
                position: 'fixed',
                top: `${4 + (item.popupOffset?.[1] ?? 0)}px`,
                left: `${item.popupOffset?.[0] ?? 0}px`,
                'z-index': `${popupZIndex}`,
              })
            : undefined,
        )}
        onMouseEnter={() => {
          if (usesPopupSubMenu() && triggerSubMenuAction() === 'hover') clearSubMenuTimer(item.key)
        }}
        onMouseLeave={() => {
          if (usesPopupSubMenu() && triggerSubMenuAction() === 'hover') scheduleSubMenuClose(item)
        }}
      >
        {renderChildren(item.children, keyPath, depth)}
      </ul>
    )
    const renderedList = () => {
      const node = list()
      const popupRender = item.popupRender ?? local.popupRender
      return popupRender ? popupRender(node, { item, keys: keyPath }) : node
    }

    if (usesPopupSubMenu()) {
      return (
        <Show when={open() || local.forceSubMenuRender}>
          <InternalPortal
            mount={() =>
              local.getPopupContainer?.(submenuTitleRefs.get(item.key)) ??
              config.getPopupContainer?.(submenuTitleRefs.get(item.key))
            }
          >
            {renderedList()}
          </InternalPortal>
        </Show>
      )
    }

    return <Show when={open() || local.forceSubMenuRender}>{renderedList()}</Show>
  }

  const renderItem = (
    item: Exclude<MenuItem, null>,
    parentKeyPath: MenuKey[] = [],
    depth = 0,
  ): JSX.Element => {
    if (isDivider(item)) {
      return (
        <li
          role="separator"
          class={classNames(
            `${prefixCls()}-item-divider`,
            item.dashed && `${prefixCls()}-item-divider-dashed`,
            semanticClass('divider'),
            item.class,
          )}
          style={mergeStyle(semanticStyle('divider'), item.style)}
        />
      )
    }

    if (isGroup(item)) {
      return (
        <li
          class={classNames(`${prefixCls()}-item-group`, semanticClass('group'), item.class)}
          style={mergeStyle(semanticStyle('group'), item.style)}
        >
          <Show when={item.label}>
            <div
              class={classNames(`${prefixCls()}-item-group-title`, semanticClass('groupTitle'))}
              style={semanticStyle('groupTitle')}
            >
              {item.label}
            </div>
          </Show>
          <ul
            role="group"
            class={classNames(`${prefixCls()}-item-group-list`, semanticClass('groupList'))}
            style={semanticStyle('groupList')}
          >
            <For each={item.children}>
              {(child) => child && renderItem(child, parentKeyPath, depth)}
            </For>
          </ul>
        </li>
      )
    }

    if (isSubMenu(item)) {
      const keyPath = [item.key, ...parentKeyPath]
      const open = () => openKeys().includes(item.key)
      const handleTitleClick = (event: MouseEvent | KeyboardEvent) => {
        item.onTitleClick?.({ key: item.key, domEvent: event })
        if (triggerSubMenuAction() === 'click' || event instanceof KeyboardEvent)
          toggleSubMenu(item)
      }
      return (
        <li
          class={classNames(
            `${prefixCls()}-submenu`,
            open() && `${prefixCls()}-submenu-open`,
            item.disabled && `${prefixCls()}-submenu-disabled`,
            item.theme && `${prefixCls()}-submenu-${item.theme}`,
            semanticClass('submenu'),
            item.class,
          )}
          style={mergeStyle(semanticStyle('submenu'), itemIndentStyle(depth), item.style)}
          onMouseEnter={() => {
            if (triggerSubMenuAction() === 'hover') scheduleSubMenuOpen(item)
          }}
          onMouseLeave={() => {
            if (triggerSubMenuAction() === 'hover') scheduleSubMenuClose(item)
          }}
        >
          <div
            role="menuitem"
            tabindex={item.disabled ? undefined : 0}
            aria-disabled={item.disabled ? 'true' : undefined}
            aria-haspopup="true"
            aria-expanded={open() ? 'true' : 'false'}
            ref={(element) => {
              submenuTitleRefs.set(item.key, element)
            }}
            class={classNames(
              `${prefixCls()}-submenu-title`,
              item.key,
              semanticClass('submenuTitle'),
            )}
            style={semanticStyle('submenuTitle')}
            onClick={handleTitleClick}
            onKeyDown={(event) => {
              if (!isActivationKey(event)) return
              event.preventDefault()
              handleTitleClick(event)
            }}
          >
            <Show when={item.icon}>
              <span
                class={classNames(`${prefixCls()}-item-icon`, semanticClass('itemIcon'))}
                style={semanticStyle('itemIcon')}
              >
                {item.icon}
              </span>
            </Show>
            <span
              class={classNames(`${prefixCls()}-title-content`, semanticClass('itemContent'))}
              style={semanticStyle('itemContent')}
            >
              {item.label}
            </span>
            <span
              class={classNames(`${prefixCls()}-submenu-arrow`, semanticClass('submenuArrow'))}
              style={semanticStyle('submenuArrow')}
              aria-hidden="true"
            >
              {typeof local.expandIcon === 'function'
                ? local.expandIcon({ ...item, isSubMenu: true, open: open() })
                : (local.expandIcon ?? '›')}
            </span>
          </div>
          {renderSubMenuList(item, keyPath, open, depth + 1)}
        </li>
      )
    }

    const menuItem = item as MenuItemType
    const keyPath = [menuItem.key, ...parentKeyPath]
    const selected = () => selectedKeys().includes(menuItem.key)
    const handleActivate = (event: MouseEvent | KeyboardEvent) =>
      selectItem(menuItem, keyPath, event)
    return (
      <li
        role="menuitem"
        data-menu-key={menuItem.key}
        tabindex={menuItem.disabled ? undefined : 0}
        aria-disabled={menuItem.disabled ? 'true' : undefined}
        aria-selected={selected() ? 'true' : 'false'}
        title={menuItemTitle(menuItem)}
        class={classNames(
          `${prefixCls()}-item`,
          selected() && `${prefixCls()}-item-selected`,
          menuItem.disabled && `${prefixCls()}-item-disabled`,
          menuItem.danger && `${prefixCls()}-item-danger`,
          semanticClass('item'),
          menuItem.class,
        )}
        style={mergeStyle(semanticStyle('item'), itemIndentStyle(depth), menuItem.style)}
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (!isActivationKey(event)) return
          event.preventDefault()
          handleActivate(event)
        }}
      >
        <Show when={menuItem.icon}>
          <span
            class={classNames(`${prefixCls()}-item-icon`, semanticClass('itemIcon'))}
            style={semanticStyle('itemIcon')}
          >
            {menuItem.icon}
          </span>
        </Show>
        <span
          class={classNames(`${prefixCls()}-title-content`, semanticClass('itemContent'))}
          style={semanticStyle('itemContent')}
        >
          {menuItem.label}
        </span>
        <Show when={menuItem.extra}>
          <span
            class={classNames(`${prefixCls()}-item-extra`, semanticClass('itemExtra'))}
            style={semanticStyle('itemExtra')}
          >
            {menuItem.extra}
          </span>
        </Show>
      </li>
    )
  }

  return (
    <ul
      {...rest}
      role={rest.role ?? 'menu'}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${mode()}`,
        `${prefixCls()}-${local.theme ?? 'light'}`,
        local.inlineCollapsed && `${prefixCls()}-inline-collapsed`,
        semanticClass('root'),
        hashId(),
        local.class,
      )}
      style={mergeStyle(semanticStyle('root'), rest.style as JSX.CSSProperties | undefined)}
    >
      <For each={items()}>{(item) => renderItem(item)}</For>
      <Show when={mode() === 'horizontal' && local.overflowedIndicator}>
        <li class={`${prefixCls()}-overflowed-indicator`} aria-hidden="true">
          {local.overflowedIndicator}
        </li>
      </Show>
    </ul>
  )
}

export const Menu = MenuRoot as MenuCompoundComponent

Menu.Item = createCompoundComponent<MenuItemComponentProps>('item')
Menu.SubMenu = createCompoundComponent<SubMenuComponentProps>('submenu')
Menu.Divider = createCompoundComponent<MenuDividerComponentProps>('divider')
Menu.ItemGroup = createCompoundComponent<MenuItemGroupComponentProps>('group')
