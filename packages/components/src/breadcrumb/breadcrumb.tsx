import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  splitProps,
  useContext,
} from 'solid-js'
import { DownOutlined } from '@solid-ant-design/icons'
import { Dropdown } from '../dropdown'
import type { DropdownMenuProps } from '../dropdown'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useBreadcrumbStyle } from './breadcrumb.style'
import type {
  BreadcrumbItemProps,
  BreadcrumbItemType,
  BreadcrumbMenuItem,
  BreadcrumbParams,
  BreadcrumbProps,
  BreadcrumbRouteType,
  BreadcrumbSeparatorProps,
} from './interface'
import type { JSX } from 'solid-js'

const DEFAULT_SEPARATOR = '/'
const DEFAULT_DROPDOWN_ICON = <DownOutlined />

type NormalizedItem = BreadcrumbRouteType & {
  key: string | number
  origin: BreadcrumbRouteType
}

interface BreadcrumbContextValue {
  prefixCls: string
  separator: JSX.Element
  dropdownIcon: JSX.Element
  classNames?: BreadcrumbProps['classNames']
  styles?: BreadcrumbProps['styles']
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>()

function isKeyboardActivation(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar'
}

function callHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & { currentTarget: TElement; target: Element },
) {
  if (!handler) return
  if (Array.isArray(handler)) {
    const [fn, data] = handler
    fn(data, event)
    return
  }
  const fn = handler as JSX.EventHandler<TElement, TEvent>
  fn(event)
}

function mergeStyle(
  ...values: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const strings = values.filter((value): value is string => typeof value === 'string')
  const objects = values.filter(
    (value): value is JSX.CSSProperties =>
      Boolean(value) && typeof value === 'object' && !Array.isArray(value),
  )
  if (strings.length && objects.length) {
    return [
      strings.join('; '),
      ...objects.map((style) =>
        Object.entries(style)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; '),
      ),
    ]
      .filter(Boolean)
      .join('; ')
  }
  if (strings.length) return strings.join('; ')
  if (objects.length) return Object.assign({}, ...objects)
  return undefined
}

function pickDataAndAriaAttributes(item: BreadcrumbRouteType): Record<string, string> {
  const attrs: Record<string, string> = {}
  Object.entries(item).forEach(([key, value]) => {
    if (typeof value !== 'string') return
    if (key.startsWith('data-') || key.startsWith('aria-')) attrs[key] = value
  })
  return attrs
}

function replaceParams(value: string, params: BreadcrumbParams): string {
  return value.replace(/:([A-Za-z0-9_]+)/g, (match, key) =>
    params[key] === undefined ? match : String(params[key]),
  )
}

function normalizePath(path: string, params: BreadcrumbParams): string {
  return replaceParams(path, params).replace(/^\//, '')
}

function hrefFromPaths(paths: string[]): string {
  const joined = paths.filter(Boolean).join('/')
  return joined ? `#/${joined}` : '#/'
}

function defaultTitle(item: BreadcrumbRouteType, params: BreadcrumbParams): JSX.Element {
  const title = item.title ?? item.breadcrumbName
  return typeof title === 'string' ? replaceParams(title, params) : title
}

function isBreadcrumbMenuItem(item: unknown): item is BreadcrumbMenuItem {
  return Boolean(item && typeof item === 'object' && ('title' in item || 'path' in item))
}

function normalizeMenu(
  menu: BreadcrumbItemType['menu'] | undefined,
  href: string | undefined,
): DropdownMenuProps | undefined {
  if (!menu) return undefined
  const items = menu.items?.map((item, index) => {
    if (!isBreadcrumbMenuItem(item)) return item
    const { key, title, label, path, ...rest } = item
    const content = label ?? title
    return {
      ...rest,
      key: key ?? String(index),
      label: path && href ? <a href={`${href}${path}`}>{content}</a> : content,
    }
  })
  return { ...menu, items } as DropdownMenuProps
}

function itemMenu(item: BreadcrumbRouteType): BreadcrumbItemType['menu'] | undefined {
  return item.menu ?? (item.children ? { items: item.children } : undefined)
}

interface InternalBreadcrumbItemProps extends BreadcrumbItemProps {
  prefixCls: string
  isLast?: boolean
  separator?: JSX.Element
  showSeparator?: boolean
  itemClass?: string
  itemStyle?: JSX.CSSProperties
  linkClass?: string
  linkStyle?: JSX.CSSProperties
  semanticClass?: string
  semanticStyle?: JSX.CSSProperties
  separatorClass?: string
  separatorStyle?: JSX.CSSProperties
  dropdownIcon?: JSX.Element
}

function InternalBreadcrumbItem(props: InternalBreadcrumbItemProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'isLast',
    'separator',
    'showSeparator',
    'href',
    'menu',
    'dropdownProps',
    'dropdownIcon',
    'onClick',
    'children',
    'class',
    'style',
    'itemClass',
    'itemStyle',
    'linkClass',
    'linkStyle',
    'semanticClass',
    'semanticStyle',
    'separatorClass',
    'separatorStyle',
  ])
  const clickable = () => Boolean(local.onClick)
  const current = () => Boolean(local.isLast)
  const linkClass = () =>
    classNames(
      `${local.prefixCls}-link`,
      clickable() && !local.href && `${local.prefixCls}-link-clickable`,
      local.linkClass,
    )
  const ariaCurrent = () => (current() ? 'page' : undefined)
  const handleClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (event) => {
    callHandler(local.onClick, event)
  }
  const handleKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (event) => {
    if (!clickable() || !isKeyboardActivation(event)) return
    event.preventDefault()
    callHandler(
      local.onClick,
      event as unknown as MouseEvent & { currentTarget: HTMLElement; target: Element },
    )
  }
  const itemClass = () =>
    classNames(`${local.prefixCls}-item`, local.semanticClass, local.itemClass, local.class)
  const itemStyle = () => mergeStyle(local.semanticStyle, local.itemStyle, local.style)
  const separatorNode = () => (
    <span
      class={classNames(`${local.prefixCls}-separator`, local.separatorClass)}
      style={local.separatorStyle}
      aria-hidden="true"
    >
      {local.separator}
    </span>
  )
  const linkNode = () => (
    <Show
      when={local.href}
      fallback={
        <Show
          when={clickable()}
          fallback={
            <span class={linkClass()} style={local.linkStyle} aria-current={ariaCurrent()}>
              {local.children}
            </span>
          }
        >
          <span
            class={linkClass()}
            style={local.linkStyle}
            role="button"
            tabIndex={0}
            aria-current={ariaCurrent()}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
          >
            {local.children}
          </span>
        </Show>
      }
    >
      {(href) => (
        <a
          class={linkClass()}
          style={local.linkStyle}
          href={href()}
          aria-current={ariaCurrent()}
          onClick={local.onClick ? handleClick : undefined}
        >
          {local.children}
        </a>
      )}
    </Show>
  )
  const contentNode = () => {
    const node = linkNode()
    const menu = normalizeMenu(local.menu, local.href)
    if (!menu) return node
    return (
      <Dropdown
        {...local.dropdownProps}
        menu={menu}
        placement={local.dropdownProps?.placement ?? 'bottom'}
      >
        <span class={`${local.prefixCls}-overlay-link`}>
          {node}
          <span class={`${local.prefixCls}-dropdown-icon`}>{local.dropdownIcon}</span>
        </span>
      </Dropdown>
    )
  }

  return (
    <li {...rest} class={itemClass()} style={itemStyle()}>
      {contentNode()}
      <Show when={local.showSeparator}>{separatorNode()}</Show>
    </li>
  )
}

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const context = useContext(BreadcrumbContext)
  const config = useConfig()
  const prefixCls = () =>
    props.prefixCls ?? context?.prefixCls ?? `${config.prefixCls()}-breadcrumb`
  const [, hashId] = useBreadcrumbStyle(prefixCls())

  return (
    <InternalBreadcrumbItem
      {...props}
      prefixCls={prefixCls()}
      separator={props.separator ?? context?.separator ?? DEFAULT_SEPARATOR}
      dropdownIcon={props.dropdownIcon ?? context?.dropdownIcon ?? DEFAULT_DROPDOWN_ICON}
      showSeparator={Boolean(context)}
      semanticClass={context?.classNames?.item}
      semanticStyle={context?.styles?.item}
      separatorClass={context?.classNames?.separator}
      separatorStyle={context?.styles?.separator}
      class={classNames(!context && hashId(), props.class)}
    />
  )
}

export function BreadcrumbSeparator(props: BreadcrumbSeparatorProps) {
  const context = useContext(BreadcrumbContext)
  const config = useConfig()
  const prefixCls = () => context?.prefixCls ?? `${config.prefixCls()}-breadcrumb`
  const [, hashId] = useBreadcrumbStyle(prefixCls())
  const [local, rest] = splitProps(props, ['children', 'class', 'style'])

  return (
    <li
      {...rest}
      class={classNames(
        `${prefixCls()}-separator`,
        context?.classNames?.separator,
        hashId(),
        local.class,
      )}
      style={mergeStyle(context?.styles?.separator, local.style)}
      aria-hidden="true"
    >
      {local.children === undefined ? DEFAULT_SEPARATOR : local.children}
    </li>
  )
}

export function Breadcrumb(props: BreadcrumbProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'items',
    'routes',
    'params',
    'separator',
    'dropdownIcon',
    'itemRender',
    'classNames',
    'styles',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-breadcrumb`
  const [, hashId] = useBreadcrumbStyle(prefixCls())
  let listRef: HTMLOListElement | undefined
  const separator = () => local.separator ?? DEFAULT_SEPARATOR
  const dropdownIcon = () => local.dropdownIcon ?? DEFAULT_DROPDOWN_ICON
  const params = () => local.params ?? {}
  const sourceItems = () => local.items ?? local.routes ?? []
  const items = createMemo<NormalizedItem[]>(() =>
    sourceItems().map((item, index) => ({ ...item, key: item.key ?? index, origin: item })),
  )

  createEffect(() => {
    if (items().length > 0) return
    const nodes = listRef?.querySelectorAll<HTMLElement>(
      `:scope > .${prefixCls()}-item > .${prefixCls()}-link, :scope > .${prefixCls()}-item .${prefixCls()}-link`,
    )
    nodes?.forEach((node) => node.removeAttribute('aria-current'))
    nodes?.[nodes.length - 1]?.setAttribute('aria-current', 'page')
    const itemNodes = Array.from(
      listRef?.querySelectorAll<HTMLElement>(`:scope > .${prefixCls()}-item`) ?? [],
    )
    itemNodes.forEach((node, index) => {
      const separatorNode = node.querySelector<HTMLElement>(`:scope > .${prefixCls()}-separator`)
      const nextIsExplicitSeparator = node.nextElementSibling?.classList.contains(
        `${prefixCls()}-separator`,
      )
      if (index === itemNodes.length - 1 || nextIsExplicitSeparator) {
        separatorNode?.remove()
      }
    })
  })

  const renderDataItems = () => {
    const paths: string[] = []
    const routes = sourceItems()

    return (
      <For each={items()}>
        {(item, index) => {
          const isLast = () => index() === items().length - 1
          if (item.type === 'separator') {
            return (
              <li
                class={classNames(
                  `${prefixCls()}-separator`,
                  local.classNames?.separator,
                  item.class,
                )}
                style={mergeStyle(local.styles?.separator, item.style)}
                aria-hidden="true"
              >
                {item.separator === undefined ? DEFAULT_SEPARATOR : item.separator}
              </li>
            )
          }

          const mergedPath =
            item.path === undefined ? undefined : normalizePath(item.path, params())
          if (mergedPath !== undefined) paths.push(mergedPath)
          const itemPaths = [...paths]
          const href = paths.length && mergedPath !== undefined ? hrefFromPaths(paths) : item.href
          const children = () =>
            local.itemRender
              ? local.itemRender(item.origin, params(), routes, itemPaths)
              : defaultTitle(item, params())

          return (
            <InternalBreadcrumbItem
              {...pickDataAndAriaAttributes(item)}
              prefixCls={prefixCls()}
              href={href}
              menu={itemMenu(item)}
              dropdownProps={item.dropdownProps}
              dropdownIcon={dropdownIcon()}
              onClick={item.onClick as JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined}
              isLast={isLast()}
              separator={item.separator ?? separator()}
              showSeparator={!isLast()}
              semanticClass={local.classNames?.item}
              semanticStyle={local.styles?.item}
              separatorClass={local.classNames?.separator}
              separatorStyle={local.styles?.separator}
              itemClass={item.class}
              itemStyle={item.style}
            >
              {children()}
            </InternalBreadcrumbItem>
          )
        }}
      </For>
    )
  }

  return (
    <nav
      {...rest}
      aria-label={rest['aria-label'] ?? 'breadcrumb'}
      class={classNames(
        prefixCls(),
        hashId(),
        local.rootClass,
        local.classNames?.root,
        local.class,
      )}
      style={mergeStyle(local.styles?.root, local.style)}
    >
      <ol
        ref={(element) => {
          listRef = element
        }}
        class={`${prefixCls()}-list`}
      >
        <Show
          when={items().length > 0}
          fallback={
            <BreadcrumbContext.Provider
              value={{
                prefixCls: prefixCls(),
                separator: separator(),
                dropdownIcon: dropdownIcon(),
                classNames: local.classNames,
                styles: local.styles,
              }}
            >
              {local.children}
            </BreadcrumbContext.Provider>
          }
        >
          {renderDataItems()}
        </Show>
      </ol>
    </nav>
  )
}
