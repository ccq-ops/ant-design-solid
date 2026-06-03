import { For, Show, createMemo, splitProps } from 'solid-js'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { QRCodeProps, QRCodeStatus } from './interface'
import { useQRCodeStyle } from './qrcode.style'

const MATRIX_SIZE = 25
const FINDER_SIZE = 7

interface ModuleRect {
  x: number
  y: number
}

function hashString(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function nextRandom(seed: number): number {
  let value = seed >>> 0
  value ^= value << 13
  value ^= value >>> 17
  value ^= value << 5
  return value >>> 0
}

function isFinderArea(x: number, y: number): boolean {
  const inTop = y < FINDER_SIZE
  const inLeft = x < FINDER_SIZE
  const inRight = x >= MATRIX_SIZE - FINDER_SIZE
  const inBottom = y >= MATRIX_SIZE - FINDER_SIZE
  return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft)
}

function finderModule(localX: number, localY: number): boolean {
  return (
    localX === 0 ||
    localX === FINDER_SIZE - 1 ||
    localY === 0 ||
    localY === FINDER_SIZE - 1 ||
    (localX >= 2 && localX <= 4 && localY >= 2 && localY <= 4)
  )
}

function createMatrix(value: string): ModuleRect[] {
  const modules: ModuleRect[] = []
  let seed = hashString(value || ' ')
  for (let y = 0; y < MATRIX_SIZE; y += 1) {
    for (let x = 0; x < MATRIX_SIZE; x += 1) {
      if (isFinderArea(x, y)) {
        const localX = x >= MATRIX_SIZE - FINDER_SIZE ? x - (MATRIX_SIZE - FINDER_SIZE) : x
        const localY = y >= MATRIX_SIZE - FINDER_SIZE ? y - (MATRIX_SIZE - FINDER_SIZE) : y
        if (finderModule(localX, localY)) modules.push({ x, y })
        continue
      }
      seed = nextRandom(seed + x * 31 + y * 131)
      if ((seed & 1) === 1) modules.push({ x, y })
    }
  }
  return modules
}

function defaultStatusText(status: QRCodeStatus): string | undefined {
  if (status === 'loading') return 'Loading...'
  if (status === 'expired') return 'Expired'
  return undefined
}

export function QRCode(props: QRCodeProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'size',
    'color',
    'bgColor',
    'bordered',
    'icon',
    'iconSize',
    'status',
    'statusRender',
    'prefixCls',
    'class',
    'style',
  ])
  const config = useConfig()
  const token = useToken()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-qrcode`
  const [, hashId] = useQRCodeStyle(prefixCls())
  const size = () => local.size ?? 160
  const moduleSize = () => size() / MATRIX_SIZE
  const color = () => local.color ?? token().colorText
  const bgColor = () => local.bgColor ?? token().colorBgContainer
  const status = () => local.status ?? 'active'
  const iconSize = () => local.iconSize ?? size() / 4
  const iconOffset = () => (size() - iconSize()) / 2
  const modules = createMemo(() => createMatrix(local.value))
  const mergedStyle = () => {
    const base = {
      width: `${size()}px`,
      height: `${size()}px`,
      'background-color': bgColor(),
    }
    if (typeof local.style === 'string') return { ...base, cssText: local.style }
    return { ...base, ...local.style }
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.bordered !== false && `${prefixCls()}-bordered`,
        status() !== 'active' && `${prefixCls()}-${status()}`,
        hashId(),
        local.class,
      )}
      style={mergedStyle()}
    >
      <svg
        class={`${prefixCls()}-svg`}
        width={size()}
        height={size()}
        viewBox={`0 0 ${size()} ${size()}`}
        role="img"
        aria-label={local.value}
      >
        <rect width={size()} height={size()} fill={bgColor()} />
        <For each={modules()}>
          {(module) => (
            <rect
              data-module="true"
              x={module.x * moduleSize()}
              y={module.y * moduleSize()}
              width={moduleSize()}
              height={moduleSize()}
              fill={color()}
            />
          )}
        </For>
        <Show when={local.icon}>
          <image
            href={local.icon}
            x={iconOffset()}
            y={iconOffset()}
            width={iconSize()}
            height={iconSize()}
            preserveAspectRatio="xMidYMid slice"
          />
        </Show>
      </svg>
      <Show when={status() !== 'active'}>
        <div class={`${prefixCls()}-status`}>
          {local.statusRender
            ? local.statusRender({ status: status() })
            : defaultStatusText(status())}
        </div>
      </Show>
    </div>
  )
}
