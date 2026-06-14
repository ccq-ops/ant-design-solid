import { createEffect, createSignal, onCleanup, onMount, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { AffixTarget, AffixProps, AffixRef } from './interface'
import { useAffixStyle } from './affix.style'

const TRIGGER_EVENTS = [
  'resize',
  'scroll',
  'touchstart',
  'touchmove',
  'touchend',
  'pageshow',
  'load',
] as const

function isWindow(target: AffixTarget): target is Window {
  return target === window
}

function toPx(value: number) {
  return `${value}px`
}

function mergeStyle(
  base: AffixProps['style'],
  ...styles: Array<AffixProps['style']>
): Record<string, string> | AffixProps['style'] {
  const stringStyle = [base, ...styles].find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, base, ...styles.filter(Boolean)) as Record<string, string>
}

function getTarget(target?: () => AffixTarget | undefined | null): AffixTarget | undefined {
  if (typeof window === 'undefined') return undefined
  return target?.() ?? window
}

function getTargetRect(target: AffixTarget): DOMRect {
  if (!isWindow(target)) return target.getBoundingClientRect()
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: window.innerWidth || document.documentElement.clientWidth,
    bottom: window.innerHeight || document.documentElement.clientHeight,
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
    toJSON: () => undefined,
  } as DOMRect
}

function getFixedTop(placeholderRect: DOMRect, targetRect: DOMRect, offsetTop?: number) {
  if (
    offsetTop !== undefined &&
    Math.round(targetRect.top) > Math.round(placeholderRect.top) - offsetTop
  ) {
    return offsetTop + targetRect.top
  }
  return undefined
}

function getFixedBottom(placeholderRect: DOMRect, targetRect: DOMRect, offsetBottom?: number) {
  if (
    offsetBottom !== undefined &&
    Math.round(targetRect.bottom) < Math.round(placeholderRect.bottom) + offsetBottom
  ) {
    const targetBottomOffset =
      (window.innerHeight || document.documentElement.clientHeight) - targetRect.bottom
    return offsetBottom + targetBottomOffset
  }
  return undefined
}

function addTargetListener(
  target: AffixTarget,
  eventName: (typeof TRIGGER_EVENTS)[number],
  listener: () => void,
) {
  target.addEventListener(eventName, listener)
  return () => target.removeEventListener(eventName, listener)
}

function setRef(ref: AffixProps['ref'], value: AffixRef) {
  if (typeof ref === 'function') ref(value)
  else if (ref) Object.assign(ref, value)
}

export function Affix(props: AffixProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'offsetTop',
    'offsetBottom',
    'target',
    'onChange',
    'ref',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const componentConfig = () => config.affix()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-affix`
  const [, hashId] = useAffixStyle(prefixCls())
  const [affixed, setAffixed] = createSignal(false)
  const [fixedStyle, setFixedStyle] = createSignal<Record<string, string>>({})
  const [placeholderStyle, setPlaceholderStyle] = createSignal<Record<string, string>>({})
  let placeholderRef: HTMLDivElement | undefined
  let fixedRef: HTMLDivElement | undefined
  let resizeObserver: ResizeObserver | undefined

  const updatePosition = () => {
    const target = getTarget(local.target)
    if (!target || !placeholderRef) return

    const rect = placeholderRef.getBoundingClientRect()
    const targetRect = getTargetRect(target)
    if (rect.top === 0 && rect.left === 0 && rect.width === 0 && rect.height === 0) return

    const offsetTop =
      local.offsetBottom === undefined && local.offsetTop === undefined ? 0 : local.offsetTop
    const fixedTop = getFixedTop(rect, targetRect, offsetTop)
    const fixedBottom = getFixedBottom(rect, targetRect, local.offsetBottom)
    const nextAffixed = fixedTop !== undefined || fixedBottom !== undefined

    const nextFixedStyle: Record<string, string> = nextAffixed
      ? {
          position: 'fixed',
          left: toPx(rect.left),
          width: toPx(rect.width),
          height: toPx(rect.height),
          ...(fixedTop !== undefined ? { top: toPx(fixedTop) } : { bottom: toPx(fixedBottom!) }),
        }
      : {}
    const nextPlaceholderStyle: Record<string, string> = nextAffixed
      ? { width: toPx(rect.width), height: toPx(rect.height) }
      : {}

    setFixedStyle(nextFixedStyle)
    setPlaceholderStyle(nextPlaceholderStyle)
    setAffixed((previous) => {
      if (previous !== nextAffixed) local.onChange?.(nextAffixed)
      return nextAffixed
    })
  }

  setRef(local.ref, { updatePosition })

  onMount(() => {
    const target = getTarget(local.target)
    if (!target) return
    const cleanups = TRIGGER_EVENTS.map((eventName) =>
      addTargetListener(target, eventName, updatePosition),
    )
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updatePosition)
      if (placeholderRef) resizeObserver.observe(placeholderRef)
      if (fixedRef) resizeObserver.observe(fixedRef)
    }
    onCleanup(() => {
      cleanups.forEach((cleanup) => cleanup())
      resizeObserver?.disconnect()
    })
  })

  createEffect(() => {
    local.offsetTop
    local.offsetBottom
    local.target
    updatePosition()
  })

  const wrapperStyle = () => mergeStyle(placeholderStyle(), componentConfig().style, local.style)
  const wrapperClass = () =>
    classNames(`${prefixCls()}-wrapper`, componentConfig().class, local.class)
  const fixedClass = () =>
    classNames(affixed() && prefixCls(), hashId(), affixed() && local.rootClass)

  return (
    <div
      {...rest}
      ref={(element) => {
        placeholderRef = element
      }}
      class={wrapperClass()}
      classList={local.classList}
      style={wrapperStyle()}
    >
      <div
        ref={(element) => {
          fixedRef = element
        }}
        class={fixedClass()}
        style={fixedStyle()}
      >
        {local.children}
      </div>
    </div>
  )
}
