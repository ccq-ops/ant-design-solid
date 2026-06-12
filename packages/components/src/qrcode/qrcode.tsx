import qrcode from 'qrcode-generator'
import { For, Match, Show, Switch, createEffect, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  QRCodeErrorLevel,
  QRCodeIconSize,
  QRCodeLocale,
  QRCodeProps,
  QRCodeStatus,
} from './interface'
import { useQRCodeStyle } from './qrcode.style'

const defaultLocale: QRCodeLocale = {
  expired: 'Expired',
  loading: 'Loading...',
  scanned: 'Scanned',
  refresh: 'Refresh',
}
const errorLevelOrder: QRCodeErrorLevel[] = ['L', 'M', 'Q', 'H']

interface ModuleRect {
  x: number
  y: number
}

interface QRMatrix {
  moduleCount: number
  modules: ModuleRect[]
}

interface IconRect {
  width: number
  height: number
  x: number
  y: number
}

function normalizeValue(value: QRCodeProps['value']): string[] {
  return Array.isArray(value) ? value : [value]
}

function createRawQRCode(value: QRCodeProps['value'], errorLevel: QRCodeErrorLevel) {
  const qr = qrcode(0, errorLevel)
  normalizeValue(value).forEach((item) => qr.addData(item))
  qr.make()
  return qr
}

function createQRCode(
  value: QRCodeProps['value'],
  errorLevel: QRCodeErrorLevel,
  boostLevel: boolean,
): QRMatrix {
  let qr = createRawQRCode(value, errorLevel)
  if (boostLevel) {
    const baseModuleCount = qr.getModuleCount()
    const startIndex = errorLevelOrder.indexOf(errorLevel)

    for (let index = startIndex + 1; index < errorLevelOrder.length; index += 1) {
      const candidate = createRawQRCode(value, errorLevelOrder[index])
      if (candidate.getModuleCount() === baseModuleCount) {
        qr = candidate
      }
    }
  }
  const moduleCount = qr.getModuleCount()
  const modules: ModuleRect[] = []
  for (let y = 0; y < moduleCount; y += 1) {
    for (let x = 0; x < moduleCount; x += 1) {
      if (qr.isDark(y, x)) modules.push({ x, y })
    }
  }

  return { moduleCount, modules }
}

function getIconRect(size: number, iconSize: QRCodeIconSize | undefined): IconRect {
  const resolvedSize = iconSize ?? 40
  const width = typeof resolvedSize === 'number' ? resolvedSize : resolvedSize.width
  const height = typeof resolvedSize === 'number' ? resolvedSize : resolvedSize.height
  return {
    width,
    height,
    x: (size - width) / 2,
    y: (size - height) / 2,
  }
}

function defaultStatusText(status: QRCodeStatus, locale: QRCodeLocale): string | undefined {
  if (status === 'loading') return locale.loading
  if (status === 'expired') return locale.expired
  if (status === 'scanned') return locale.scanned
  return undefined
}

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

function useCanvasRenderer(
  canvasRef: () => HTMLCanvasElement | undefined,
  props: {
    bgColor: () => string
    color: () => string
    icon: () => string | undefined
    iconRect: () => IconRect
    matrix: () => QRMatrix
    marginSize: () => number
    size: () => number
  },
) {
  createEffect(() => {
    const canvas = canvasRef()
    if (!canvas) return

    const size = props.size()
    const marginSize = props.marginSize()
    const matrix = props.matrix()
    const context = canvas.getContext('2d')
    if (!context) return

    canvas.width = size
    canvas.height = size
    context.fillStyle = props.bgColor()
    context.fillRect(0, 0, size, size)

    const moduleSize = size / (matrix.moduleCount + marginSize * 2)
    context.fillStyle = props.color()
    matrix.modules.forEach((module) => {
      context.fillRect(
        (module.x + marginSize) * moduleSize,
        (module.y + marginSize) * moduleSize,
        moduleSize,
        moduleSize,
      )
    })

    const icon = props.icon()
    if (!icon) return

    const image = new Image()
    image.onload = () => {
      const rect = props.iconRect()
      context.drawImage(image, rect.x, rect.y, rect.width, rect.height)
    }
    image.src = icon
  })
}

export function QRCode(props: QRCodeProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'size',
    'color',
    'bgColor',
    'bordered',
    'type',
    'icon',
    'iconSize',
    'errorLevel',
    'boostLevel',
    'marginSize',
    'status',
    'statusRender',
    'onRefresh',
    'locale',
    'classNames',
    'classes',
    'styles',
    'prefixCls',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-qrcode`
  const [, hashId] = useQRCodeStyle(prefixCls())
  const size = () => local.size ?? 160
  const type = () => local.type ?? 'svg'
  const color = () => local.color ?? '#000'
  const bgColor = () => local.bgColor ?? 'transparent'
  const status = () => local.status ?? 'active'
  const errorLevel = () => local.errorLevel ?? 'M'
  const boostLevel = () => local.boostLevel ?? true
  const marginSize = () => local.marginSize ?? 0
  const mergedLocale = (): QRCodeLocale => ({ ...defaultLocale, ...local.locale })
  const semanticClassNames = () => ({ ...local.classNames, ...local.classes })
  const semanticStyles = () => local.styles ?? {}
  const matrix = createMemo(() => createQRCode(local.value, errorLevel(), boostLevel()))
  const moduleSize = () => size() / (matrix().moduleCount + marginSize() * 2)
  const iconRect = () => getIconRect(size(), local.iconSize)
  let canvasRef: HTMLCanvasElement | undefined

  useCanvasRenderer(() => canvasRef, {
    bgColor,
    color,
    icon: () => local.icon,
    iconRect,
    matrix,
    marginSize,
    size,
  })

  const mergedStyle = () => {
    const base = {
      width: `${size()}px`,
      height: `${size()}px`,
      'background-color': bgColor(),
    }
    return mergeStyles(base, semanticStyles().root, local.style)
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.bordered !== false && `${prefixCls()}-bordered`,
        status() !== 'active' && `${prefixCls()}-${status()}`,
        hashId(),
        semanticClassNames().root,
        local.class,
      )}
      style={mergedStyle()}
    >
      <Switch>
        <Match when={type() === 'canvas'}>
          <canvas
            ref={(element) => {
              canvasRef = element
            }}
            class={classNames(`${prefixCls()}-canvas`, semanticClassNames().image)}
            width={size()}
            height={size()}
            role="img"
            aria-label={normalizeValue(local.value).join('\n')}
            style={semanticStyles().image}
          />
        </Match>
        <Match when={type() === 'svg'}>
          <svg
            class={classNames(`${prefixCls()}-svg`, semanticClassNames().image)}
            width={size()}
            height={size()}
            viewBox={`0 0 ${size()} ${size()}`}
            role="img"
            aria-label={normalizeValue(local.value).join('\n')}
            style={semanticStyles().image}
          >
            <rect width={size()} height={size()} fill={bgColor()} />
            <For each={matrix().modules}>
              {(module) => (
                <rect
                  data-module="true"
                  x={(module.x + marginSize()) * moduleSize()}
                  y={(module.y + marginSize()) * moduleSize()}
                  width={moduleSize()}
                  height={moduleSize()}
                  fill={color()}
                />
              )}
            </For>
            <Show when={local.icon}>
              <image
                href={local.icon}
                x={iconRect().x}
                y={iconRect().y}
                width={iconRect().width}
                height={iconRect().height}
                preserveAspectRatio="xMidYMid slice"
              />
            </Show>
          </svg>
        </Match>
      </Switch>
      <Show when={status() !== 'active'}>
        <div
          class={classNames(`${prefixCls()}-status`, semanticClassNames().cover)}
          style={semanticStyles().cover}
        >
          {local.statusRender
            ? local.statusRender({
                status: status(),
                locale: mergedLocale(),
                onRefresh: local.onRefresh,
              })
            : defaultStatusText(status(), mergedLocale())}
        </div>
      </Show>
    </div>
  )
}
