import { createEffect, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { canUseDom } from '../shared/portal'
import { WatermarkContext } from './context'
import { useWatermarkStyle } from './watermark.style'
import type { WatermarkContent, WatermarkProps, WatermarkTextAlign } from './interface'

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeContent(content: WatermarkContent | undefined): string[] {
  if (Array.isArray(content)) return content
  if (content === undefined) return []
  return [content]
}

function svgToDataUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function toNumber(value: number | string): number {
  if (typeof value === 'number') return value
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 16
}

function textAnchor(textAlign: WatermarkTextAlign): 'start' | 'middle' | 'end' {
  if (textAlign === 'left' || textAlign === 'start') return 'start'
  if (textAlign === 'right' || textAlign === 'end') return 'end'
  return 'middle'
}

function textX(textAlign: WatermarkTextAlign, width: number): number {
  if (textAlign === 'left' || textAlign === 'start') return 0
  if (textAlign === 'right' || textAlign === 'end') return width
  return width / 2
}

function estimateTextWidth(content: string[], fontSize: number): number {
  const longest = content.reduce((max, line) => Math.max(max, line.length), 0)
  return Math.ceil(longest * fontSize * 0.6)
}

function createImageStatus(src: () => string | undefined) {
  const [failedSrc, setFailedSrc] = createSignal<string>()

  createEffect(() => {
    const imageSrc = src()
    setFailedSrc(undefined)
    if (!imageSrc || !canUseDom()) return

    const image = new Image()
    image.onerror = () => setFailedSrc(imageSrc)
    image.src = imageSrc
  })

  return (imageSrc: string | undefined) => Boolean(imageSrc && failedSrc() === imageSrc)
}

export function Watermark(props: WatermarkProps) {
  const [local, rest] = splitProps(props, [
    'width',
    'height',
    'rotate',
    'zIndex',
    'image',
    'content',
    'font',
    'gap',
    'offset',
    'inherit',
    'onRemove',
    'prefixCls',
    'rootClassName',
    'class',
    'className',
    'style',
    'children',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-watermark`
  const [, hashId] = useWatermarkStyle(prefixCls())
  const contentLines = () => normalizeContent(local.content)
  const rotate = () => local.rotate ?? -22
  const zIndex = () => local.zIndex ?? 999
  const gap = () => local.gap ?? [100, 100]
  const offset = () => local.offset ?? [gap()[0] / 2, gap()[1] / 2]
  const inherit = () => local.inherit ?? true
  const font = () => ({
    color: 'rgba(0, 0, 0, 0.15)',
    fontSize: 16,
    fontWeight: 'normal' as const,
    fontFamily: 'sans-serif',
    fontStyle: 'normal' as const,
    textAlign: 'center' as const,
    ...local.font,
  })
  const numericFontSize = () => toNumber(font().fontSize)
  const width = () =>
    local.width ?? (local.image ? 120 : estimateTextWidth(contentLines(), numericFontSize()))
  const height = () =>
    local.height ??
    (local.image
      ? 64
      : Math.ceil(contentLines().length ? contentLines().length * numericFontSize() * 1.4 : 64))
  const backgroundSize = () => `${width() + gap()[0]}px ${height() + gap()[1]}px`
  const backgroundPosition = () => `${offset()[0]}px ${offset()[1]}px`
  const hasFailedImage = createImageStatus(() => local.image)
  const backgroundImage = createMemo(() => {
    const contents = contentLines()
    const canvasWidth = width()
    const canvasHeight = height()
    const centerX = textX(font().textAlign, canvasWidth)
    const centerY = canvasHeight / 2
    const fontConfig = font()
    const textLines = contents.length ? contents : ['']
    const lineHeight = numericFontSize() * 1.4
    const firstY = centerY - ((textLines.length - 1) * lineHeight) / 2
    const imageSrc = local.image
    const useImage = Boolean(imageSrc && !hasFailedImage(imageSrc))
    const image = useImage
      ? `<image href="${escapeXml(imageSrc!)}" x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" preserveAspectRatio="xMidYMid meet" opacity="0.15" />`
      : ''
    const text = image
      ? ''
      : textLines
          .map(
            (line, index) =>
              `<text x="${centerX}" y="${firstY + index * lineHeight}" dominant-baseline="middle" text-anchor="${textAnchor(fontConfig.textAlign)}" fill="${escapeXml(fontConfig.color)}" font-size="${fontConfig.fontSize}" font-family="${escapeXml(fontConfig.fontFamily)}" font-weight="${fontConfig.fontWeight}" font-style="${escapeXml(fontConfig.fontStyle)}">${escapeXml(line)}</text>`,
          )
          .join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}"><g transform="rotate(${rotate()} ${canvasWidth / 2} ${centerY})">${image}${text}</g></svg>`
    return svgToDataUrl(svg)
  })
  let containerRef: HTMLDivElement | undefined
  const panelElements = new Set<HTMLElement>()
  const observers = new Map<HTMLElement, MutationObserver>()

  const renderWatermark = (container: HTMLElement) => {
    let overlay = container.querySelector<HTMLElement>(`:scope > .${prefixCls()}-watermark`)
    if (!overlay) {
      overlay = document.createElement('div')
      overlay.setAttribute('aria-hidden', 'true')
      overlay.className = `${prefixCls()}-watermark`
      container.append(overlay)
    }
    overlay.style.zIndex = String(zIndex())
    overlay.style.backgroundImage = backgroundImage()
    overlay.style.backgroundSize = backgroundSize()
    overlay.style.backgroundPosition = backgroundPosition()
    overlay.style.backgroundRepeat = 'repeat'
  }

  const targetElements = () =>
    [containerRef, ...Array.from(panelElements)].filter(Boolean) as HTMLElement[]

  const syncWatermark = () => {
    targetElements().forEach(renderWatermark)
  }

  const observeElement = (element: HTMLElement) => {
    if (!canUseDom() || observers.has(element)) return
    const observer = new MutationObserver((mutations) => {
      let removedWatermark = false
      for (const mutation of mutations) {
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.classList.contains(`${prefixCls()}-watermark`)) {
            removedWatermark = true
          }
        })
      }
      if (removedWatermark) {
        local.onRemove?.()
        renderWatermark(element)
      }
    })
    observer.observe(element, { childList: true })
    observers.set(element, observer)
  }

  const unobserveElement = (element: HTMLElement) => {
    observers.get(element)?.disconnect()
    observers.delete(element)
  }

  const watermarkContext = {
    add(element: HTMLElement) {
      if (!inherit()) return
      panelElements.add(element)
      renderWatermark(element)
      observeElement(element)
    },
    remove(element: HTMLElement) {
      panelElements.delete(element)
      unobserveElement(element)
      element.querySelector<HTMLElement>(`:scope > .${prefixCls()}-watermark`)?.remove()
    },
  }

  createEffect(() => {
    syncWatermark()
    targetElements().forEach(observeElement)
  })

  onCleanup(() => {
    observers.forEach((observer) => observer.disconnect())
    observers.clear()
    targetElements().forEach((element) => watermarkContext.remove(element))
  })

  return (
    <WatermarkContext.Provider
      value={
        inherit()
          ? watermarkContext
          : {
              add() {},
              remove() {},
            }
      }
    >
      <div
        {...rest}
        ref={(element) => {
          containerRef = element
        }}
        class={classNames(prefixCls(), hashId(), local.class, local.className, local.rootClassName)}
        style={local.style}
      >
        {local.children}
      </div>
    </WatermarkContext.Provider>
  )
}
