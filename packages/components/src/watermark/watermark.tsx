import { createMemo, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useWatermarkStyle } from './watermark.style'
import type { WatermarkContent, WatermarkProps } from './interface'

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
    'prefixCls',
    'class',
    'className',
    'style',
    'children',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-watermark`
  const [, hashId] = useWatermarkStyle(prefixCls())
  const width = () => local.width ?? 120
  const height = () => local.height ?? 64
  const rotate = () => local.rotate ?? -22
  const zIndex = () => local.zIndex ?? 9
  const gap = () => local.gap ?? [100, 100]
  const offset = () => local.offset ?? [0, 0]
  const font = () => ({
    color: 'rgba(0, 0, 0, 0.15)',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontStyle: 'normal',
    ...local.font,
  })
  const backgroundSize = () => `${width() + gap()[0]}px ${height() + gap()[1]}px`
  const backgroundPosition = () => `${offset()[0]}px ${offset()[1]}px`
  const backgroundImage = createMemo(() => {
    const contents = normalizeContent(local.content)
    const canvasWidth = width()
    const canvasHeight = height()
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2
    const fontConfig = font()
    const textLines = contents.length ? contents : ['']
    const lineHeight = fontConfig.fontSize * 1.4
    const firstY = centerY - ((textLines.length - 1) * lineHeight) / 2
    const image = local.image
      ? `<image href="${escapeXml(local.image)}" x="0" y="0" width="${canvasWidth}" height="${canvasHeight}" preserveAspectRatio="xMidYMid meet" opacity="0.15" />`
      : ''
    const text = image
      ? ''
      : textLines
          .map(
            (line, index) =>
              `<text x="${centerX}" y="${firstY + index * lineHeight}" dominant-baseline="middle" text-anchor="middle" fill="${escapeXml(fontConfig.color)}" font-size="${fontConfig.fontSize}" font-family="${escapeXml(fontConfig.fontFamily)}" font-weight="${fontConfig.fontWeight}" font-style="${escapeXml(fontConfig.fontStyle)}">${escapeXml(line)}</text>`,
          )
          .join('')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}"><g transform="rotate(${rotate()} ${centerX} ${centerY})">${image}${text}</g></svg>`
    return svgToDataUrl(svg)
  })

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), hashId(), local.class, local.className)}
      style={local.style}
    >
      {local.children}
      <div
        aria-hidden="true"
        class={`${prefixCls()}-watermark`}
        style={{
          'z-index': zIndex(),
          'background-image': backgroundImage(),
          'background-size': backgroundSize(),
          'background-position': backgroundPosition(),
          'background-repeat': 'repeat',
        }}
      />
    </div>
  )
}
