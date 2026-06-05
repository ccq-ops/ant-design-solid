import { For, Show, createEffect, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { useMenuStyle } from './menu.style'
import type {
  MenuClickInfo,
  MenuItem,
  MenuItemGroupType,
  MenuItemType,
  MenuKey,
  MenuProps,
  SubMenuType,
} from './interface'

function isDivider(item: MenuItem): boolean {
  return item.type === 'divider'
}

function isGroup(item: MenuItem): item is MenuItemGroupType {
  return item.type === 'group'
}

function isSubMenu(item: MenuItem): item is SubMenuType {
  return 'children' in item && item.type !== 'group'
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar'
}

export function Menu(props: MenuProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'mode',
    'selectedKeys',
    'defaultSelectedKeys',
    'openKeys',
    'defaultOpenKeys',
    'inlineCollapsed',
    'zIndex',
    'getPopupContainer',
    'onClick',
    'onSelect',
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
  const mode = () => local.mode ?? 'vertical'
  const selectedKeys = createMemo(() => local.selectedKeys ?? innerSelectedKeys())
  const openKeys = createMemo(() => local.openKeys ?? innerOpenKeys())
  const items = () => local.items ?? []
  const usesPopupSubMenu = () => mode() !== 'inline'

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
    const nextSelectedKeys = [item.key]
    const info = clickInfo(item, keyPath, event)
    local.onClick?.(info)
    if (local.selectedKeys === undefined) setInnerSelectedKeys(nextSelectedKeys)
    local.onSelect?.({ ...info, selectedKeys: nextSelectedKeys })
  }

  function updatePopupPosition(key: MenuKey): void {
    if (!canUseDom()) return
    const title = submenuTitleRefs.get(key)
    if (!title) return
    const rect = title.getBoundingClientRect()
    setPopupPositions((positions) => ({
      ...positions,
      [key]: {
        position: 'fixed',
        top: `${rect.bottom + 4}px`,
        left: `${rect.left}px`,
        'z-index': `${popupZIndex}`,
      },
    }))
  }

  function updateOpenPopupPositions(): void {
    if (!usesPopupSubMenu()) return
    openKeys().forEach(updatePopupPosition)
  }

  const toggleSubMenu = (item: SubMenuType) => {
    if (item.disabled) return
    const currentOpenKeys = openKeys()
    const willOpen = !currentOpenKeys.includes(item.key)
    if (willOpen) updatePopupPosition(item.key)
    const nextOpenKeys = willOpen
      ? [...currentOpenKeys, item.key]
      : currentOpenKeys.filter((key) => key !== item.key)
    setOpenKeys(nextOpenKeys)
  }

  createEffect(() => {
    if (!usesPopupSubMenu() || openKeys().length === 0) return
    const removeListeners = addPositionUpdateListeners(updateOpenPopupPositions)
    onCleanup(removeListeners)
  })

  const renderChildren = (children: MenuItem[], parentKeyPath: MenuKey[]) => (
    <For each={children}>{(child) => renderItem(child, parentKeyPath)}</For>
  )

  const renderSubMenuList = (item: SubMenuType, keyPath: MenuKey[], open: () => boolean) => {
    if (usesPopupSubMenu()) {
      return (
        <Show when={open()}>
          <InternalPortal
            mount={() =>
              local.getPopupContainer?.(submenuTitleRefs.get(item.key)) ??
              config.getPopupContainer?.(submenuTitleRefs.get(item.key))
            }
          >
            <ul
              role="menu"
              class={classNames(`${prefixCls()}-submenu-list`, `${prefixCls()}-submenu-popup`)}
              style={popupPositions()[item.key] ?? { 'z-index': `${popupZIndex}` }}
            >
              {renderChildren(item.children, keyPath)}
            </ul>
          </InternalPortal>
        </Show>
      )
    }

    return (
      <ul
        role="menu"
        class={classNames(
          `${prefixCls()}-submenu-list`,
          !open() && `${prefixCls()}-submenu-list-hidden`,
        )}
      >
        {renderChildren(item.children, keyPath)}
      </ul>
    )
  }

  const renderItem = (item: MenuItem, parentKeyPath: MenuKey[] = []): JSX.Element => {
    if (isDivider(item)) {
      return (
        <li
          role="separator"
          class={classNames(`${prefixCls()}-item-divider`, item.class)}
          style={item.style}
        />
      )
    }

    if (isGroup(item)) {
      return (
        <li class={classNames(`${prefixCls()}-item-group`, item.class)} style={item.style}>
          <Show when={item.label}>
            <div class={`${prefixCls()}-item-group-title`}>{item.label}</div>
          </Show>
          <ul role="group" class={`${prefixCls()}-item-group-list`}>
            <For each={item.children}>{(child) => renderItem(child, parentKeyPath)}</For>
          </ul>
        </li>
      )
    }

    if (isSubMenu(item)) {
      const keyPath = [item.key, ...parentKeyPath]
      const open = () => openKeys().includes(item.key)
      const handleActivate = () => toggleSubMenu(item)
      return (
        <li
          class={classNames(
            `${prefixCls()}-submenu`,
            open() && `${prefixCls()}-submenu-open`,
            item.disabled && `${prefixCls()}-submenu-disabled`,
            item.class,
          )}
          style={item.style}
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
            class={classNames(`${prefixCls()}-submenu-title`, item.key)}
            onClick={handleActivate}
            onKeyDown={(event) => {
              if (!isActivationKey(event)) return
              event.preventDefault()
              handleActivate()
            }}
          >
            <Show when={item.icon}>
              <span class={`${prefixCls()}-item-icon`}>{item.icon}</span>
            </Show>
            <span class={`${prefixCls()}-title-content`}>{item.label}</span>
            <span class={`${prefixCls()}-submenu-arrow`} aria-hidden="true">
              ›
            </span>
          </div>
          {renderSubMenuList(item, keyPath, open)}
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
        tabindex={menuItem.disabled ? undefined : 0}
        aria-disabled={menuItem.disabled ? 'true' : undefined}
        aria-selected={selected() ? 'true' : 'false'}
        class={classNames(
          `${prefixCls()}-item`,
          selected() && `${prefixCls()}-item-selected`,
          menuItem.disabled && `${prefixCls()}-item-disabled`,
          menuItem.class,
        )}
        style={menuItem.style}
        onClick={handleActivate}
        onKeyDown={(event) => {
          if (!isActivationKey(event)) return
          event.preventDefault()
          handleActivate(event)
        }}
      >
        <Show when={menuItem.icon}>
          <span class={`${prefixCls()}-item-icon`}>{menuItem.icon}</span>
        </Show>
        <span class={`${prefixCls()}-title-content`}>{menuItem.label}</span>
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
        local.inlineCollapsed && `${prefixCls()}-inline-collapsed`,
        hashId(),
        local.class,
      )}
    >
      <For each={items()}>{(item) => renderItem(item)}</For>
    </ul>
  )
}
