import { createMemo, onMount, splitProps } from 'solid-js'
import { render } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { canUseDom } from '../shared/portal'
import { useBorderBeamStyle } from './border-beam.style'
import type { BorderBeamProps } from './interface'
import { getBorderBeamGradient } from './util'
import type { JSX } from 'solid-js'

function getInset(width: number | string) {
  if (typeof width === 'number') return `-${width}px`
  if (width === '0px' || width === '0') return '0px'
  const numericPx = width.match(/^(\d+(?:\.\d+)?)px$/)
  if (numericPx) return `-${numericPx[1]}px`
  return `calc(-1 * ${width})`
}

function getBorderWidths(host: HTMLElement): string[] {
  const style = window.getComputedStyle(host)
  return [
    style.borderTopWidth,
    style.borderRightWidth,
    style.borderBottomWidth,
    style.borderLeftWidth,
  ]
}

function getBorderRadius(host: HTMLElement): string {
  return window.getComputedStyle(host).borderRadius
}

function mergeStyle(
  base: JSX.CSSProperties,
  ...styles: Array<BorderBeamProps['style']>
): JSX.CSSProperties | string {
  const merged = { ...base }
  const stringStyles: string[] = []

  styles.forEach((style) => {
    if (!style) return
    if (typeof style === 'string') {
      stringStyles.push(style)
      return
    }
    Object.assign(merged, style)
  })

  if (stringStyles.length) {
    const declarations = Object.entries(merged)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
    return `${declarations}; ${stringStyles.join('; ')}`
  }

  return merged
}

export function BorderBeam(props: BorderBeamProps) {
  const [local] = splitProps(props, [
    'prefixCls',
    'class',
    'classList',
    'style',
    'children',
    'color',
    'outset',
  ])
  const config = useConfig()
  const componentConfig = () => config.borderBeam()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-border-beam`
  const [, hashId] = useBorderBeamStyle(prefixCls())
  let markerRef: HTMLSpanElement | undefined
  let hostRef: HTMLElement | undefined
  let borderWidths = ['0px', '0px', '0px', '0px']
  let borderRadius = '0px'

  const children = createMemo(() => local.children)
  const insetOffset = () => {
    if (local.outset !== undefined && local.outset !== null) return getInset(local.outset)
    return borderWidths.map(getInset).join(' ')
  }
  const beamGradient = () => getBorderBeamGradient(local.color)
  const beamStyle = () => {
    const cssVars: JSX.CSSProperties = {
      '--ads-border-beam-inset-offset': insetOffset(),
      '--ads-border-beam-border-radius': borderRadius,
    }
    const gradient = beamGradient()
    if (gradient) cssVars['--ads-border-beam-beam-gradient'] = gradient
    return mergeStyle(cssVars, componentConfig().style, local.style)
  }

  onMount(() => {
    const marker = markerRef
    const candidate = marker?.firstElementChild
    if (canUseDom() && marker) {
      const parent = marker.parentNode
      while (marker.firstChild) parent?.insertBefore(marker.firstChild, marker)
      parent?.removeChild(marker)
      markerRef = undefined
    }

    if (!(candidate instanceof HTMLElement)) return
    hostRef = candidate
    borderWidths = getBorderWidths(candidate)
    borderRadius = getBorderRadius(candidate)

    const mount = document.createElement('div')
    candidate.appendChild(mount)
    const dispose = render(
      () => (
        <div
          aria-hidden="true"
          class={classNames(prefixCls(), hashId(), componentConfig().class, local.class)}
          classList={local.classList}
          style={beamStyle()}
        />
      ),
      mount,
    )
    const beam = mount.firstElementChild
    if (beam) candidate.insertBefore(beam, mount)
    mount.remove()

    const updateMetrics = () => {
      if (!hostRef) return
      borderWidths = getBorderWidths(hostRef)
      borderRadius = getBorderRadius(hostRef)
      const beamElement = hostRef.querySelector<HTMLElement>(`.${prefixCls()}`)
      if (!beamElement) return
      const style = beamStyle()
      beamElement.style.cssText = ''
      if (typeof style === 'string') beamElement.setAttribute('style', style)
      else
        Object.entries(style).forEach(([name, value]) =>
          beamElement.style.setProperty(name, String(value)),
        )
    }

    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updateMetrics)
      observer.observe(candidate)
    }

    return () => {
      observer?.disconnect()
      dispose()
    }
  })

  return (
    <span
      ref={(element) => {
        markerRef = element
      }}
      style={{ display: 'contents' }}
    >
      {children()}
    </span>
  )
}
