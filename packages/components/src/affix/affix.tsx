import { createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { AffixTarget, AffixProps } from './interface'
import { useAffixStyle } from './affix.style'

interface ViewportInfo {
  top: number
  bottom: number
  viewportBottomOffset: number
}

function isWindow(target: AffixTarget): target is Window {
  return target === window
}

function toPx(value: number) {
  return `${value}px`
}

function mergeStyle(
  base: Record<string, string>,
  style: AffixProps['style'],
): Record<string, string> | AffixProps['style'] {
  if (typeof style === 'object' && style !== null) return { ...base, ...style }
  return Object.keys(base).length > 0 ? base : style
}

function getTarget(target?: () => AffixTarget | undefined | null): AffixTarget | undefined {
  if (typeof window === 'undefined') return undefined
  return target?.() ?? window
}

function getViewportInfo(target: AffixTarget): ViewportInfo {
  if (isWindow(target)) {
    const height = window.innerHeight || document.documentElement.clientHeight
    return { top: 0, bottom: height, viewportBottomOffset: 0 }
  }

  const rect = target.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  return {
    top: rect.top,
    bottom: rect.bottom,
    viewportBottomOffset: windowHeight - rect.bottom,
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

export function Affix(props: AffixProps) {
  const [local, rest] = splitProps(props, [
    'offsetTop',
    'offsetBottom',
    'target',
    'onChange',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-affix`
  const [, hashId] = useAffixStyle(prefixCls())
  const [affixed, setAffixed] = createSignal(false)
  const [fixedStyle, setFixedStyle] = createSignal<Record<string, string>>({})
  const [placeholderStyle, setPlaceholderStyle] = createSignal<Record<string, string>>({})
  let placeholderRef: HTMLDivElement | undefined

  const updatePosition = () => {
    const target = getTarget(local.target)
    if (!target || !placeholderRef) return

    const rect = placeholderRef.getBoundingClientRect()
    const viewport = getViewportInfo(target)
    const width = rect.width
    const height = rect.height
    const left = rect.left
    const shouldUseBottom = local.offsetBottom !== undefined
    const offsetTop = local.offsetTop ?? 0
    const offsetBottom = local.offsetBottom ?? 0
    const nextAffixed = shouldUseBottom
      ? rect.bottom >= viewport.bottom - offsetBottom
      : rect.top <= viewport.top + offsetTop

    const nextFixedStyle: Record<string, string> = nextAffixed
      ? {
          position: 'fixed',
          left: toPx(left),
          width: toPx(width),
          ...(shouldUseBottom
            ? { bottom: toPx(viewport.viewportBottomOffset + offsetBottom) }
            : { top: toPx(viewport.top + offsetTop) }),
        }
      : {}
    const nextPlaceholderStyle: Record<string, string> = nextAffixed
      ? { width: toPx(width), height: toPx(height) }
      : {}

    setFixedStyle(nextFixedStyle)
    setPlaceholderStyle(nextPlaceholderStyle)
    setAffixed((previous) => {
      if (previous !== nextAffixed) local.onChange?.(nextAffixed)
      return nextAffixed
    })
  }

  onMount(() => {
    const target = getTarget(local.target)
    if (!target) return
    const cleanupScroll = addTargetListener(target, 'scroll', updatePosition)
    const cleanupResize = addTargetListener(window, 'resize', updatePosition)
    onCleanup(() => {
      cleanupScroll()
      cleanupResize()
    })
  })

  return (
    <div
      {...rest}
      ref={placeholderRef}
      class={classNames(`${prefixCls()}-wrapper`, hashId(), local.class)}
      classList={local.classList}
      style={mergeStyle(placeholderStyle(), local.style)}
    >
      <div class={classNames(affixed() && prefixCls(), hashId())} style={fixedStyle()}>
        {local.children}
      </div>
    </div>
  )
}
