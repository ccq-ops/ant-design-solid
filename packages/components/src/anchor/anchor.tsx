import {
  For,
  Show,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'
import { Affix } from '../affix'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { AffixTarget } from '../affix'
import type { AnchorItem, AnchorProps } from './interface'
import { useAnchorStyle } from './anchor.style'

function isWindow(target: AffixTarget): target is Window {
  return target === window
}

function getContainer(container?: () => AffixTarget | undefined | null): AffixTarget | undefined {
  if (typeof window === 'undefined') return undefined
  return container?.() ?? window
}

function flattenItems(items: AnchorItem[] | undefined): AnchorItem[] {
  const result: AnchorItem[] = []
  const walk = (list: AnchorItem[] | undefined) => {
    for (const item of list ?? []) {
      result.push(item)
      walk(item.children)
    }
  }
  walk(items)
  return result
}

function targetIdFromHref(href: string) {
  if (!href.startsWith('#')) return ''
  try {
    return decodeURIComponent(href.slice(1))
  } catch {
    return href.slice(1)
  }
}

function getElementTop(element: HTMLElement, container: AffixTarget): number {
  const rect = element.getBoundingClientRect()
  if (isWindow(container)) return rect.top + window.pageYOffset
  return rect.top - container.getBoundingClientRect().top + container.scrollTop
}

function getElementViewportTop(element: HTMLElement, container: AffixTarget): number {
  const rect = element.getBoundingClientRect()
  if (isWindow(container)) return rect.top
  return rect.top - container.getBoundingClientRect().top
}

function scrollContainerTo(container: AffixTarget, top: number) {
  const options: ScrollToOptions = { top, behavior: 'smooth' }
  if (typeof container.scrollTo === 'function') {
    container.scrollTo(options)
  } else if (!isWindow(container)) {
    container.scrollTop = top
  }
}

function addTargetListener(
  target: AffixTarget,
  eventName: 'scroll' | 'resize',
  listener: () => void,
) {
  target.addEventListener(eventName, listener)
  return () => target.removeEventListener(eventName, listener)
}

export function Anchor(props: AnchorProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'affix',
    'offsetTop',
    'targetOffset',
    'getContainer',
    'bounds',
    'getCurrentAnchor',
    'direction',
    'replace',
    'onClick',
    'onChange',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-anchor`
  const [, hashId] = useAnchorStyle(prefixCls())
  const [activeLink, setActiveLink] = createSignal('')
  const direction = () => local.direction ?? 'vertical'

  const getTargetOffset = (item?: AnchorItem) =>
    item?.targetOffset ?? local.targetOffset ?? local.offsetTop ?? 0

  const updateActiveLink = () => {
    const container = getContainer(local.getContainer)
    if (!container) return
    const threshold = getTargetOffset() + (local.bounds ?? 5)
    let nextActive = ''

    for (const item of flattenItems(local.items)) {
      const target = document.getElementById(targetIdFromHref(item.href))
      if (!target) continue
      if (getElementViewportTop(target, container) <= threshold) nextActive = item.href
    }

    nextActive = local.getCurrentAnchor?.(nextActive) ?? nextActive

    setActiveLink((previous) => {
      if (previous !== nextActive) local.onChange?.(nextActive)
      return nextActive
    })
  }

  onMount(() => {
    const container = getContainer(local.getContainer)
    if (!container) return
    const cleanupScroll = addTargetListener(container, 'scroll', updateActiveLink)
    const cleanupResize = addTargetListener(window, 'resize', updateActiveLink)
    onCleanup(() => {
      cleanupScroll()
      cleanupResize()
    })
  })

  createRenderEffect(() => {
    updateActiveLink()
  })

  const handleClick = (event: MouseEvent, item: AnchorItem) => {
    event.preventDefault()
    local.onClick?.(event, item)
    const container = getContainer(local.getContainer)
    const target = document.getElementById(targetIdFromHref(item.href))
    if (!container || !target) return
    const replace = item.replace ?? local.replace ?? false
    const updateHistory = replace ? window.history.replaceState : window.history.pushState
    updateHistory.call(window.history, null, '', item.href)
    const nextTop = getElementTop(target, container) - getTargetOffset(item)
    scrollContainerTo(container, nextTop)
  }

  const renderItems = (items: AnchorItem[] | undefined) => (
    <ul class={`${prefixCls()}-list`}>
      <For each={items}>
        {(item) => (
          <li class={`${prefixCls()}-link`}>
            <a
              class={classNames(
                `${prefixCls()}-link-title`,
                activeLink() === item.href && `${prefixCls()}-link-title-active`,
              )}
              href={item.href}
              target={item.target}
              aria-current={activeLink() === item.href ? 'true' : undefined}
              onClick={(event) => handleClick(event, item)}
            >
              {item.title}
            </a>
            <Show when={item.children?.length}>{renderItems(item.children)}</Show>
          </li>
        )}
      </For>
    </ul>
  )

  const content = () => (
    <nav
      {...rest}
      class={classNames(prefixCls(), `${prefixCls()}-${direction()}`, hashId(), local.class)}
      classList={local.classList}
      style={local.style}
    >
      {renderItems(local.items)}
    </nav>
  )

  return (
    <Show when={local.affix ?? true} fallback={content()}>
      <Affix offsetTop={local.offsetTop} target={local.getContainer}>
        {content()}
      </Affix>
    </Show>
  )
}
