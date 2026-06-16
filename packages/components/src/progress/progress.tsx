import { For, Show, createMemo, splitProps } from 'solid-js'
import { CheckCircleFilled, CloseCircleFilled } from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  GapPlacement,
  ProgressGradient,
  ProgressProps,
  ProgressStatus,
  ProgressStrokeLinecap,
} from './interface'
import { useProgressStyle } from './progress.style'

const CIRCLE_VIEWBOX_SIZE = 120
const CIRCLE_CENTER = CIRCLE_VIEWBOX_SIZE / 2
const CIRCLE_RADIUS = 50

function clampPercent(percent: ProgressProps['percent']): number {
  const value = Number(percent ?? 0)
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function px(value: number): string {
  return `${value}px`
}

function isGradient(value: ProgressProps['strokeColor']): value is ProgressGradient {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function gradientToCss(value: ProgressGradient): string {
  if ('from' in value && 'to' in value) {
    return `linear-gradient(${value.direction ?? 'to right'}, ${value.from}, ${value.to})`
  }
  const direction = value.direction ?? 'to right'
  const stops = Object.entries(value)
    .filter(([key]) => key !== 'direction')
    .map(([offset, color]) => `${color} ${offset}`)
    .join(', ')
  return `linear-gradient(${direction}, ${stops})`
}

function pickStrokeColor(value: ProgressProps['strokeColor']): string | undefined {
  if (Array.isArray(value)) return value[0]
  if (isGradient(value)) {
    if ('from' in value) return value.from
    return Object.values(value).find((color) => typeof color === 'string')
  }
  return value
}

function lineStrokeBackground(value: ProgressProps['strokeColor']): string | undefined {
  if (Array.isArray(value)) return value[0]
  if (isGradient(value)) return gradientToCss(value)
  return value
}

function resolveLineSize(
  size: ProgressProps['size'],
  fallbackWidth: number,
): { width?: string; height: number } {
  if (Array.isArray(size)) {
    return { width: typeof size[0] === 'number' ? px(size[0]) : size[0], height: size[1] }
  }
  if (typeof size === 'number') return { height: size }
  if (size && typeof size === 'object') {
    return {
      width: size.width === undefined ? undefined : px(size.width),
      height: size.height ?? fallbackWidth,
    }
  }
  if (size === 'small') return { height: 6 }
  return { height: fallbackWidth }
}

function resolveCircleSize(size: ProgressProps['size'], width: ProgressProps['width']): number {
  if (typeof size === 'number') return size
  if (size && !Array.isArray(size) && typeof size === 'object' && typeof size.width === 'number') {
    return size.width
  }
  if (typeof width === 'number') return width
  if (size === 'small') return 80
  return CIRCLE_VIEWBOX_SIZE
}

function resolveStepCount(steps: ProgressProps['steps']): number {
  if (typeof steps === 'number') return Math.max(0, Math.floor(steps))
  if (steps && typeof steps === 'object') return Math.max(0, Math.floor(steps.count))
  return 0
}

function gapPlacementToRotation(placement: GapPlacement): number {
  switch (placement) {
    case 'top':
      return -90
    case 'start':
      return 180
    case 'end':
      return 0
    case 'bottom':
    default:
      return 90
  }
}

export function Progress(props: ProgressProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'percent',
    'status',
    'showInfo',
    'strokeWidth',
    'strokeLinecap',
    'strokeColor',
    'trailColor',
    'railColor',
    'format',
    'success',
    'size',
    'steps',
    'percentPosition',
    'gapDegree',
    'gapPlacement',
    'gapPosition',
    'width',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-progress`
  const [, hashId] = useProgressStyle(prefixCls())

  const type = () => local.type ?? 'line'
  const percent = createMemo(() => clampPercent(local.percent))
  const successPercent = createMemo(() => {
    if (!local.success) return undefined
    return clampPercent(local.success.percent)
  })
  const ariaPercent = () => successPercent() ?? percent()
  const status = createMemo<ProgressStatus>(
    () => local.status ?? (ariaPercent() === 100 ? 'success' : 'normal'),
  )
  const showInfo = () => local.showInfo !== false
  const lineSize = () => resolveLineSize(local.size, local.strokeWidth ?? 8)
  const circleSize = () => resolveCircleSize(local.size, local.width)
  const strokeWidth = () => {
    const value = Number(local.strokeWidth)
    if (Number.isFinite(value) && value > 0) return value
    return type() === 'circle' || type() === 'dashboard' ? 6 : lineSize().height
  }
  const strokeLinecap = (): ProgressStrokeLinecap => local.strokeLinecap ?? 'round'
  const strokeColor = () => lineStrokeBackground(local.strokeColor)
  const svgStrokeColor = () => pickStrokeColor(local.strokeColor)
  const railColor = () => local.railColor ?? local.trailColor
  const circumference = 2 * Math.PI * CIRCLE_RADIUS
  const dashboardGapDegree = () => {
    const value = Number(local.gapDegree ?? 75)
    if (!Number.isFinite(value)) return 75
    return Math.min(295, Math.max(0, value))
  }
  const activeCircumference = () =>
    type() === 'dashboard' ? circumference * ((360 - dashboardGapDegree()) / 360) : circumference
  const dashOffset = (value: number) => ((100 - value) / 100) * activeCircumference()
  const gapPlacement = (): GapPlacement => {
    if (local.gapPlacement) return local.gapPlacement
    if (local.gapPosition === 'top') return 'top'
    if (local.gapPosition === 'left') return 'start'
    if (local.gapPosition === 'right') return 'end'
    return 'bottom'
  }
  const rotation = () =>
    type() === 'dashboard' ? gapPlacementToRotation(gapPlacement()) + dashboardGapDegree() / 2 : -90
  const info = () => {
    if (local.format) return local.format(percent(), successPercent())
    if (status() === 'success') return <CheckCircleFilled />
    if (status() === 'exception') return <CloseCircleFilled />
    return `${percent()}%`
  }
  const percentPosition = () => ({
    align: local.percentPosition?.align ?? 'end',
    type: local.percentPosition?.type ?? 'outer',
  })

  const line = () => {
    const steps = resolveStepCount(local.steps)
    if (steps > 0) {
      const activeSteps = Math.round((percent() / 100) * steps)
      return (
        <div class={`${prefixCls()}-steps-outer`} style={{ width: lineSize().width }}>
          <For each={Array.from({ length: steps })}>
            {(_, index) => {
              const active = () => index() < activeSteps
              const stepColor = () =>
                active()
                  ? Array.isArray(local.strokeColor)
                    ? (local.strokeColor[index()] ??
                      local.strokeColor[local.strokeColor.length - 1])
                    : strokeColor()
                  : railColor()
              return (
                <span
                  class={classNames(
                    `${prefixCls()}-steps-item`,
                    active() && `${prefixCls()}-steps-item-active`,
                  )}
                  style={{
                    height: px(lineSize().height),
                    background: stepColor(),
                  }}
                />
              )
            }}
          </For>
        </div>
      )
    }

    return (
      <div class={`${prefixCls()}-outer`} style={{ width: lineSize().width }}>
        <div
          class={`${prefixCls()}-inner`}
          style={{
            height: px(lineSize().height),
            background: railColor(),
          }}
        >
          <Show when={successPercent() !== undefined}>
            <div
              class={`${prefixCls()}-success-bg`}
              style={{
                width: `${successPercent()}%`,
                height: px(lineSize().height),
                background: local.success?.strokeColor,
                'border-radius': strokeLinecap() === 'butt' ? '0' : '100px',
              }}
            />
          </Show>
          <div
            class={`${prefixCls()}-bg`}
            style={{
              width: `${percent()}%`,
              height: px(lineSize().height),
              background: strokeColor(),
              'border-radius': strokeLinecap() === 'butt' ? '0' : '100px',
            }}
          />
          <Show when={showInfo() && percentPosition().type === 'inner'}>
            <span
              class={`${prefixCls()}-text ${prefixCls()}-text-inner ${prefixCls()}-text-${percentPosition().align}`}
            >
              {info()}
            </span>
          </Show>
        </div>
      </div>
    )
  }

  const circle = () => {
    const steps = resolveStepCount(local.steps)
    const dashArray =
      steps > 0
        ? `${activeCircumference() / steps - (typeof local.steps === 'object' ? local.steps.gap : 2)} ${activeCircumference() / steps}`
        : `${activeCircumference()} ${circumference}`
    return (
      <div
        class={`${prefixCls()}-circle-outer`}
        style={{ width: px(circleSize()), height: px(circleSize()) }}
      >
        <svg
          viewBox={`0 0 ${CIRCLE_VIEWBOX_SIZE} ${CIRCLE_VIEWBOX_SIZE}`}
          width={circleSize()}
          height={circleSize()}
        >
          <circle
            class={`${prefixCls()}-circle-trail`}
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={railColor()}
            stroke-width={strokeWidth()}
            stroke-linecap={strokeLinecap()}
            stroke-dasharray={dashArray}
            stroke-dashoffset={0}
            transform={`rotate(${rotation()} ${CIRCLE_CENTER} ${CIRCLE_CENTER})`}
          />
          <circle
            class={`${prefixCls()}-circle-path`}
            cx={CIRCLE_CENTER}
            cy={CIRCLE_CENTER}
            r={CIRCLE_RADIUS}
            fill="none"
            stroke={svgStrokeColor()}
            stroke-width={strokeWidth()}
            stroke-linecap={strokeLinecap()}
            stroke-dasharray={dashArray}
            stroke-dashoffset={dashOffset(percent())}
            transform={`rotate(${rotation()} ${CIRCLE_CENTER} ${CIRCLE_CENTER})`}
          />
          <Show when={successPercent() !== undefined}>
            <circle
              class={`${prefixCls()}-circle-success`}
              cx={CIRCLE_CENTER}
              cy={CIRCLE_CENTER}
              r={CIRCLE_RADIUS}
              fill="none"
              stroke={local.success?.strokeColor}
              stroke-width={strokeWidth()}
              stroke-linecap={strokeLinecap()}
              stroke-dasharray={dashArray}
              stroke-dashoffset={dashOffset(successPercent() ?? 0)}
              transform={`rotate(${rotation()} ${CIRCLE_CENTER} ${CIRCLE_CENTER})`}
            />
          </Show>
        </svg>
      </div>
    )
  }

  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaPercent()}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${type() === 'dashboard' ? 'circle' : type()}`,
        type() === 'dashboard' && `${prefixCls()}-dashboard`,
        resolveStepCount(local.steps) > 0 && `${prefixCls()}-steps`,
        `${prefixCls()}-status-${status()}`,
        showInfo() && `${prefixCls()}-show-info`,
        hashId(),
        local.class,
      )}
      classList={local.classList}
      style={local.style}
    >
      <Show when={type() === 'circle' || type() === 'dashboard'} fallback={line()}>
        {circle()}
      </Show>
      <Show when={showInfo() && !(type() === 'line' && percentPosition().type === 'inner')}>
        <span class={`${prefixCls()}-text`}>{info()}</span>
      </Show>
    </div>
  )
}
