import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  splitProps,
  useContext,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useBreadcrumbStyle } from './breadcrumb.style'
import type { BreadcrumbItemProps, BreadcrumbItemType, BreadcrumbProps } from './interface'
import type { JSX } from 'solid-js'

const DEFAULT_SEPARATOR = '/'

type NormalizedItem = BreadcrumbItemType & {
  key: number
}

interface BreadcrumbContextValue {
  prefixCls: string
  separator: JSX.Element
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

interface InternalBreadcrumbItemProps extends BreadcrumbItemProps {
  prefixCls: string
  isLast?: boolean
  separator?: JSX.Element
  showSeparator?: boolean
}

function InternalBreadcrumbItem(props: InternalBreadcrumbItemProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'isLast',
    'separator',
    'showSeparator',
    'href',
    'onClick',
    'children',
    'class',
  ])
  const clickable = () => Boolean(local.onClick)
  const current = () => Boolean(local.isLast)
  const linkClass = () =>
    classNames(
      `${local.prefixCls}-link`,
      clickable() && !local.href && `${local.prefixCls}-link-clickable`,
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

  return (
    <li {...rest} class={classNames(`${local.prefixCls}-item`, local.class)}>
      <Show
        when={local.href}
        fallback={
          <Show
            when={clickable()}
            fallback={
              <span class={linkClass()} aria-current={ariaCurrent()}>
                {local.children}
              </span>
            }
          >
            <span
              class={linkClass()}
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
            href={href()}
            aria-current={ariaCurrent()}
            onClick={local.onClick ? handleClick : undefined}
          >
            {local.children}
          </a>
        )}
      </Show>
      <Show when={local.showSeparator}>
        <span class={`${local.prefixCls}-separator`} aria-hidden="true">
          {local.separator}
        </span>
      </Show>
    </li>
  )
}

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const context = useContext(BreadcrumbContext)
  const config = useConfig()
  const prefixCls = () => context?.prefixCls ?? `${config.prefixCls()}-breadcrumb`
  const [, hashId] = useBreadcrumbStyle(prefixCls())

  return (
    <InternalBreadcrumbItem
      {...props}
      prefixCls={prefixCls()}
      separator={context?.separator ?? DEFAULT_SEPARATOR}
      showSeparator={Boolean(context)}
      class={classNames(!context && hashId(), props.class)}
    />
  )
}

export function Breadcrumb(props: BreadcrumbProps) {
  const [local, rest] = splitProps(props, ['items', 'separator', 'children', 'class'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-breadcrumb`
  const [, hashId] = useBreadcrumbStyle(prefixCls())
  let listRef: HTMLOListElement | undefined
  const separator = () => local.separator ?? DEFAULT_SEPARATOR
  const items = createMemo<NormalizedItem[]>(() =>
    (local.items ?? []).map((item, index) => ({ ...item, key: index })),
  )

  createEffect(() => {
    if (items().length > 0) return
    const nodes = listRef?.querySelectorAll<HTMLElement>(
      `:scope > .${prefixCls()}-item > .${prefixCls()}-link`,
    )
    nodes?.forEach((node) => node.removeAttribute('aria-current'))
    nodes?.[nodes.length - 1]?.setAttribute('aria-current', 'page')
  })

  return (
    <nav
      {...rest}
      aria-label={rest['aria-label'] ?? 'breadcrumb'}
      class={classNames(prefixCls(), hashId(), local.class)}
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
            <BreadcrumbContext.Provider value={{ prefixCls: prefixCls(), separator: separator() }}>
              {local.children}
            </BreadcrumbContext.Provider>
          }
        >
          <For each={items()}>
            {(item, index) => {
              const isLast = () => index() === items().length - 1
              return (
                <InternalBreadcrumbItem
                  prefixCls={prefixCls()}
                  href={item.href}
                  onClick={
                    item.onClick as JSX.EventHandlerUnion<HTMLElement, MouseEvent> | undefined
                  }
                  isLast={isLast()}
                  separator={item.separator ?? separator()}
                  showSeparator={!isLast()}
                >
                  {item.title}
                </InternalBreadcrumbItem>
              )
            }}
          </For>
        </Show>
      </ol>
    </nav>
  )
}
