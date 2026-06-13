import {
  For,
  Show,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { Affix } from '../affix'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { AnchorLink } from './anchor-link'
import { AnchorContext } from './context'
import type {
  AnchorComponent,
  AnchorItem,
  AnchorProps,
  AnchorSemanticClassNames,
  AnchorSemanticSlot,
  AnchorSemanticStyles,
} from './interface'
import type { AffixProps, AffixTarget } from '../affix'
import { useAnchorStyle } from './anchor.style'

function isWindow(target: AffixTarget): target is Window {
  return target === window
}

function isExternalLink(href: string) {
  return /^https?:\/\//.test(href)
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
  const sharpIndex = href.lastIndexOf('#')
  if (sharpIndex < 0) return ''
  try {
    return decodeURIComponent(href.slice(sharpIndex + 1))
  } catch {
    return href.slice(sharpIndex + 1)
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

function mergeStyles(
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

function resolveClassNames(value: AnchorProps['classNames'], props: AnchorProps) {
  return (
    typeof value === 'function' ? value({ props }) : (value ?? {})
  ) as AnchorSemanticClassNames
}

function resolveStyles(value: AnchorProps['styles'], props: AnchorProps) {
  return (typeof value === 'function' ? value({ props }) : (value ?? {})) as AnchorSemanticStyles
}

function isAffixEnabled(affix: AnchorProps['affix']) {
  return affix !== false
}

function affixProps(affix: AnchorProps['affix']): Omit<AffixProps, 'children'> {
  return typeof affix === 'object' && affix !== null ? affix : {}
}

function itemKey(item: AnchorItem) {
  return item.key ?? item.href
}

const AnchorRoot = (props: AnchorProps) => {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'rootClassName',
    'items',
    'affix',
    'offsetTop',
    'targetOffset',
    'getContainer',
    'bounds',
    'getCurrentAnchor',
    'direction',
    'replace',
    'showInkInFixed',
    'classNames',
    'styles',
    'onClick',
    'onChange',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const componentConfig = () => config.anchor()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-anchor`
  const [, hashId] = useAnchorStyle(prefixCls())
  const [activeLink, setActiveLink] = createSignal('')
  const [registeredLinks, setRegisteredLinks] = createSignal<AnchorItem[]>([])
  const direction = () => local.direction ?? 'vertical'
  let wrapperRef: HTMLElement | undefined
  let inkRef: HTMLSpanElement | undefined

  const semanticProps = (): AnchorProps => ({
    ...props,
    direction: direction(),
    affix: local.affix ?? true,
  })
  const semanticClassNames = createMemo(() =>
    resolveClassNames(local.classNames ?? componentConfig().classNames, semanticProps()),
  )
  const semanticStyles = createMemo(() =>
    resolveStyles(local.styles ?? componentConfig().styles, semanticProps()),
  )
  const semanticClass = (slot: AnchorSemanticSlot) => semanticClassNames()[slot]
  const semanticStyle = (slot: AnchorSemanticSlot) => semanticStyles()[slot]

  const getTargetOffset = (item?: AnchorItem) =>
    item?.targetOffset ?? local.targetOffset ?? local.offsetTop ?? 0

  const allAnchorItems = () => {
    const itemLinks = flattenItems(local.items)
    const seen = new Set(itemLinks.map((item) => item.href))
    return [...itemLinks, ...registeredLinks().filter((item) => !seen.has(item.href))]
  }

  const updateInk = () => {
    if (!inkRef || !wrapperRef) return
    const linkNode = wrapperRef.querySelector<HTMLElement>(`.${prefixCls()}-link-title-active`)
    if (!linkNode) {
      inkRef.style.opacity = '0'
      return
    }
    inkRef.style.opacity = ''
    if (direction() === 'horizontal') {
      inkRef.style.top = ''
      inkRef.style.height = ''
      inkRef.style.left = `${linkNode.offsetLeft}px`
      inkRef.style.width = `${linkNode.clientWidth}px`
      return
    }
    inkRef.style.left = ''
    inkRef.style.width = ''
    inkRef.style.top = `${linkNode.offsetTop + linkNode.clientHeight / 2}px`
    inkRef.style.height = `${linkNode.clientHeight}px`
  }

  const updateActiveLink = () => {
    const container = getContainer(local.getContainer)
    if (!container) return
    const threshold = getTargetOffset() + (local.bounds ?? 5)
    let nextActive = ''

    for (const item of allAnchorItems()) {
      const target = document.getElementById(targetIdFromHref(item.href))
      if (!target) continue
      const itemThreshold = getTargetOffset(item) + (local.bounds ?? 5)
      if (
        getElementViewportTop(target, container) <=
        (item.targetOffset === undefined ? threshold : itemThreshold)
      ) {
        nextActive = item.href
      }
    }

    nextActive = local.getCurrentAnchor?.(nextActive) ?? nextActive

    setActiveLink((previous) => {
      if (previous !== nextActive) local.onChange?.(nextActive)
      return nextActive
    })
    queueMicrotask(updateInk)
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
    updateInk()
  })

  const handleClick = (event: MouseEvent, item: AnchorItem) => {
    local.onClick?.(event, item)
    if (event.defaultPrevented) return

    const replace = item.replace ?? local.replace ?? false
    if (isExternalLink(item.href)) {
      if (replace) {
        event.preventDefault()
        window.location.replace(item.href)
      }
      return
    }

    event.preventDefault()
    const container = getContainer(local.getContainer)
    const target = document.getElementById(targetIdFromHref(item.href))
    if (!container || !target) return
    const updateHistory = replace ? window.history.replaceState : window.history.pushState
    updateHistory.call(window.history, null, '', item.href)
    const nextTop = getElementTop(target, container) - getTargetOffset(item)
    scrollContainerTo(container, nextTop)
  }

  const registerLink = (item: AnchorItem) => {
    setRegisteredLinks((previous) => [
      ...previous.filter((registered) => registered.href !== item.href),
      item,
    ])
  }

  const unregisterLink = (href: string) => {
    setRegisteredLinks((previous) => previous.filter((item) => item.href !== href))
  }

  const renderItems = (items: AnchorItem[] | undefined) => (
    <ul class={`${prefixCls()}-list`}>
      <For each={items}>
        {(item) => (
          <li>
            <AnchorLink
              data-key={itemKey(item)}
              href={item.href}
              target={item.target}
              title={item.title}
              replace={item.replace}
              targetOffset={item.targetOffset}
            />
            <Show when={direction() !== 'horizontal' && item.children?.length}>
              {renderItems(item.children)}
            </Show>
          </li>
        )}
      </For>
    </ul>
  )

  const shouldShowInk = () => isAffixEnabled(local.affix ?? true) || Boolean(local.showInkInFixed)
  const contextValue = {
    activeLink,
    direction,
    prefixCls,
    semanticClass,
    semanticStyle,
    registerLink,
    unregisterLink,
    onClick: handleClick,
  }
  const rootStyle = () => mergeStyles(semanticStyle('root'), componentConfig().style, local.style)
  const content = () => (
    <AnchorContext.Provider value={contextValue}>
      <nav
        {...rest}
        ref={(element) => {
          wrapperRef = element
        }}
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${direction()}`,
          hashId(),
          componentConfig().class,
          semanticClass('root'),
          local.class,
          local.rootClass,
          local.rootClassName,
        )}
        classList={local.classList}
        style={rootStyle()}
      >
        <Show when={shouldShowInk()}>
          <span
            ref={(element) => {
              inkRef = element
            }}
            class={classNames(`${prefixCls()}-ink`, semanticClass('indicator'))}
            style={semanticStyle('indicator')}
            aria-hidden="true"
          />
        </Show>
        {renderItems(local.items)}
        {local.children}
      </nav>
    </AnchorContext.Provider>
  )

  return (
    <Show when={isAffixEnabled(local.affix ?? true)} fallback={content()}>
      <Affix {...affixProps(local.affix)} offsetTop={local.offsetTop} target={local.getContainer}>
        {content()}
      </Affix>
    </Show>
  )
}

AnchorRoot.Link = AnchorLink

export const Anchor = AnchorRoot as AnchorComponent
